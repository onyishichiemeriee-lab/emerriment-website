/* =========================================
   Offline test helpers for the email system.
   Replaces "resend" and "@supabase/supabase-js"
   with in-memory fakes. No network access, no
   real credentials, no real emails.
========================================= */
"use strict";

const path = require("path");
const Module = require("module");

const ROOT = path.resolve(__dirname, "..", "..");


/* ---------------- Fake database ---------------- */

const db = {
    tables: { leads: [], product_clicks: [] },
    // Tables that do not exist (like before the
    // migration). Queries on them fail as in PostgREST.
    missingTables: new Set(["email_deliveries"]),
    // { table: [[col, col, ...], ...] } unique keys
    unique: { email_deliveries: [["lead_id", "kind", "sequence_day"]] },
    nextRowId: 1,
    // { column: [values the database refuses] }
    rejectValues: {},
    // (query) => true to make that query fail
    failWhen: null,
    ops: []
};

function likeToRegex(pattern) {
    let out = "";
    for (let i = 0; i < pattern.length; i++) {
        const c = pattern[i];
        if (c === "\\" && i + 1 < pattern.length) {
            out += pattern[++i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        } else if (c === "%" || c === "*") {
            out += ".*";
        } else if (c === "_") {
            out += ".";
        } else {
            out += c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
    }
    return new RegExp("^" + out + "$", "is");
}

function cmpTime(v) {
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : v;
}

function matches(row, filters) {
    return filters.every(([op, col, val]) => {
        const v = row[col];
        switch (op) {
            case "eq": return v === val || (v != null && val != null && String(v) === String(val));
            case "neq": return v !== val;
            case "in": return val.some((x) => x === v || String(x) === String(v));
            case "is": return val === null ? v === null || v === undefined : v === val;
            case "gte": return v != null && cmpTime(v) >= cmpTime(val);
            case "lte": return v != null && cmpTime(v) <= cmpTime(val);
            case "lt": return v != null && cmpTime(v) < cmpTime(val);
            case "ilike": return typeof v === "string" && likeToRegex(val).test(v);
            default: throw new Error("unsupported op " + op);
        }
    });
}

class Query {
    constructor(table) {
        this.table = table;
        this.filters = [];
        this.mode = "select";
        this.returning = false;
        this.lim = null;
        this.ord = null;
    }
    select() { if (this.mode === "select") this.returning = true; else this.returning = true; return this; }
    insert(rows) { this.mode = "insert"; this.rows = Array.isArray(rows) ? rows : [rows]; return this; }
    update(changes) { this.mode = "update"; this.changes = changes; return this; }
    delete() { this.mode = "delete"; return this; }
    eq(c, v) { this.filters.push(["eq", c, v]); return this; }
    neq(c, v) { this.filters.push(["neq", c, v]); return this; }
    in(c, v) { this.filters.push(["in", c, v]); return this; }
    is(c, v) { this.filters.push(["is", c, v]); return this; }
    gte(c, v) { this.filters.push(["gte", c, v]); return this; }
    lte(c, v) { this.filters.push(["lte", c, v]); return this; }
    lt(c, v) { this.filters.push(["lt", c, v]); return this; }
    ilike(c, v) { this.filters.push(["ilike", c, v]); return this; }
    order(c, o) { this.ord = [c, o || {}]; return this; }
    limit(n) { this.lim = n; return this; }
    then(resolve, reject) {
        // Yield so concurrent requests interleave,
        // then run each statement atomically (like a
        // single Postgres statement).
        setImmediate(() => {
            try { resolve(this.run()); } catch (e) { reject(e); }
        });
    }
    rejected() {
        const values = [];
        if (this.changes) for (const [c, v] of Object.entries(this.changes)) values.push([c, v]);
        for (const [, c, v] of this.filters) values.push([c, v]);
        if (this.rows) for (const r of this.rows) for (const [c, v] of Object.entries(r)) values.push([c, v]);
        return values.some(([c, v]) => (db.rejectValues[c] || []).includes(v));
    }
    run() {
        db.ops.push({ table: this.table, mode: this.mode, filters: this.filters, changes: this.changes });
        if (db.failWhen && db.failWhen(this)) {
            return { data: null, error: { code: "XX000", message: "SECRET-DB-DETAIL internal failure" } };
        }
        if (db.missingTables.has(this.table)) {
            return { data: null, error: { code: "PGRST205", message: `Could not find the table 'public.${this.table}' in the schema cache` } };
        }
        if (this.rejected()) {
            return { data: null, error: { code: "22P02", message: "SECRET-DB-DETAIL invalid input value for enum" } };
        }
        const table = db.tables[this.table] || (db.tables[this.table] = []);
        if (this.mode === "insert") {
            const keys = db.unique[this.table] || [];
            const added = [];
            for (const r of this.rows) {
                const row = { id: r.id !== undefined ? r.id : "row-" + db.nextRowId++, created_at: new Date().toISOString(), ...r };
                const clash = keys.some((cols) => table.concat(added).some((o) => cols.every((c) => o[c] === row[c])));
                if (clash) {
                    return { data: null, error: { code: "23505", message: "SECRET-DB-DETAIL duplicate key value violates unique constraint" } };
                }
                added.push(row);
            }
            table.push(...added);
            return { data: this.returning ? added.map((r) => ({ id: r.id })) : null, error: null };
        }
        let rows = table.filter((r) => matches(r, this.filters));
        if (this.mode === "delete") {
            db.tables[this.table] = table.filter((r) => !rows.includes(r));
            return { data: null, error: null };
        }
        if (this.mode === "update") {
            rows.forEach((r) => Object.assign(r, this.changes));
            return { data: this.returning ? rows.map((r) => ({ id: r.id })) : null, error: null };
        }
        if (this.ord) {
            const [c, o] = this.ord;
            const nullsFirst = o.nullsFirst === true;
            rows = rows.slice().sort((a, b) => {
                const x = a[c] == null ? null : new Date(a[c]).getTime();
                const y = b[c] == null ? null : new Date(b[c]).getTime();
                if (x === null && y === null) return 0;
                if (x === null) return nullsFirst ? -1 : 1;
                if (y === null) return nullsFirst ? 1 : -1;
                return o.ascending === false ? y - x : x - y;
            });
        }
        if (this.lim != null) rows = rows.slice(0, this.lim);
        return { data: rows.map((r) => ({ ...r })), error: null };
    }
}

const fakeSupabase = {
    createClient: () => ({ from: (t) => new Query(t) })
};


/* ---------------- Fake Resend ---------------- */

const mail = {
    sent: [],
    attempts: [],
    mode: "ok",       // ok | error | throw
    delayMs: 0,
    seenKeys: new Map()
};

class FakeResend {
    constructor() {
        this.emails = {
            send: async (payload, options) => {
                mail.attempts.push({ payload, options });
                if (mail.delayMs) await new Promise((r) => setTimeout(r, mail.delayMs));
                if (mail.mode === "throw") throw new Error("SECRET-PROVIDER-DETAIL network down for " + payload.to);
                if (mail.mode === "error") {
                    return { data: null, error: { name: "validation_error", message: "SECRET-PROVIDER-DETAIL rejected " + payload.to } };
                }
                const key = options && options.idempotencyKey;
                if (key && mail.seenKeys.has(key)) {
                    // Resend returns the original result for a repeated key.
                    return { data: { id: mail.seenKeys.get(key) }, error: null };
                }
                mail.sent.push({ payload, options });
                const id = "email_" + mail.sent.length;
                if (key) mail.seenKeys.set(key, id);
                return { data: { id }, error: null };
            }
        };
    }
}


/* ---------------- Module mocking ---------------- */

let installed = false;

function install() {
    if (installed) return;
    installed = true;
    const origLoad = Module._load;
    Module._load = function (request) {
        if (request === "resend") return { Resend: FakeResend };
        if (request === "@supabase/supabase-js") return fakeSupabase;
        return origLoad.apply(this, arguments);
    };
}

const TEST_ENV = {
    RESEND_API_KEY: "test-resend-key-not-real",
    SUPABASE_URL: "https://example.invalid",
    SUPABASE_SERVICE_ROLE_KEY: "test-service-role-not-real",
    URL: "https://emerriment216.netlify.app",
    // Existing sequence tests assume sending is switched on; tests of the
    // disabled state override this.
    EMAIL_SEQUENCE_ENABLED: "true"
};

function setEnv(overrides = {}) {
    for (const k of ["RESEND_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "URL",
        "EMAIL_FROM", "EMAIL_LINK_SECRET", "EMAIL_CLAIM_COMPAT_MODE", "EMAIL_OPEN_ALLOW_LEGACY",
        "EMAIL_SEQUENCE_ENABLED", "EMAIL_SEQUENCE_START_AFTER", "EMAIL_SEQUENCE_MAX_OVERDUE_DAYS",
        "EMAIL_LINK_SECRET_PREVIOUS", "EMAIL_LINK_ACCEPT_DERIVED"]) {
        delete process.env[k];
    }
    Object.assign(process.env, TEST_ENV, overrides);
    for (const [k, v] of Object.entries(overrides)) {
        if (v === undefined) delete process.env[k];
    }
}

// Fresh copy of a project module (so module-level
// configuration is re-read).
function load(relPath) {
    install();
    const full = path.join(ROOT, relPath);
    for (const key of Object.keys(require.cache)) {
        if (key.startsWith(path.join(ROOT, "netlify")) || key.startsWith(path.join(ROOT, "emails"))) {
            delete require.cache[key];
        }
    }
    return require(full);
}


/* ---------------- Logs ---------------- */

const logs = [];

function captureLogs() {
    for (const k of ["log", "warn", "error"]) {
        const orig = console[k];
        console[k] = (...args) => {
            logs.push(args.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" "));
            if (process.env.VERBOSE) orig(...args);
        };
    }
}


/* ---------------- Fixtures ---------------- */

let nextId = 1;

function addLead(over = {}) {
    const lead = {
        id: "lead-" + nextId++,
        name: "Ada",
        email: "ada@example.com",
        skin_type: "Oily",
        concern: "Acne",
        oil_level: "High",
        sensitivity: "Low",
        score: 50,
        recommendation: "Your skin needs hydration and consistency.",
        submitted_at: new Date().toISOString(),
        quiz_version: "2.0",
        source: "Skin Quiz",
        status: "New Lead",
        email_status: "Pending",
        last_email_sent: null,
        email_sequence_day: 1,
        last_sequence_email_sent: new Date().toISOString(),
        next_email_due: new Date(Date.now() + 864e5).toISOString(),
        emails_opened: 0,
        emails_clicked: 0,
        tags: ["quiz"],
        notes: null,
        ...over
    };
    db.tables.leads.push(lead);
    return lead;
}

function reset() {
    db.tables = { leads: [], product_clicks: [] };
    db.missingTables = new Set(["email_deliveries"]);
    db.nextRowId = 1;
    db.rejectValues = {};
    db.failWhen = null;
    db.ops = [];
    mail.sent = [];
    mail.attempts = [];
    mail.mode = "ok";
    mail.delayMs = 0;
    mail.seenKeys = new Map();
    logs.length = 0;
}

const SECRET_MARKERS = ["test-resend-key", "test-service-role", "SECRET-PROVIDER-DETAIL", "SECRET-DB-DETAIL"];

function assertNoLeak(assert, text, label) {
    for (const marker of SECRET_MARKERS) {
        assert(!String(text).includes(marker), `${label} leaks "${marker}"`);
    }
}

function assertLogsClean(assert, extraForbidden = []) {
    const all = logs.join("\n");
    assertNoLeak(assert, all, "logs");
    for (const s of extraForbidden) {
        assert(!all.includes(s), `logs contain "${s}"`);
    }
}


/* ---------------- Runner ---------------- */

function createSuite(name) {
    const tests = [];
    return {
        name,
        test: (title, fn) => tests.push({ title, fn }),
        run: async () => {
            let pass = 0;
            let fail = 0;
            process.stdout.write(`\n# ${name}\n`);
            for (const t of tests) {
                reset();
                setEnv();
                try {
                    await t.fn();
                    pass++;
                    process.stdout.write(`PASS  ${t.title}\n`);
                } catch (e) {
                    fail++;
                    process.stdout.write(`FAIL  ${t.title}\n      ${e && e.message}\n`);
                }
            }
            process.stdout.write(`${name}: ${pass} passed, ${fail} failed\n`);
            return { pass, fail };
        }
    };
}

captureLogs();

module.exports = {
    ROOT,
    db,
    mail,
    load,
    setEnv,
    addLead,
    reset,
    logs,
    assertNoLeak,
    assertLogsClean,
    createSuite
};
