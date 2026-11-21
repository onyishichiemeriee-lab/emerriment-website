#!/usr/bin/env node
// =====================================================================
// EMerriment — compare STAGING with PRODUCTION (read-only on both)
// ---------------------------------------------------------------------
// Runs the read-only metadata queries in this folder on both projects
// with `db query --read-only` (production is never written; the flag is
// hard-coded) and reports every difference as EXPECTED (with the reason)
// or UNEXPECTED. Exit code 1 if anything is unexpected.
//
// No row data is read except counts. UUID literals are masked in output.
// CLI output is parsed strictly (parseCliOutput / validateRows): only the
// JSON object, the Target line and the known CLI update notice are
// accepted; anything else aborts (exit 2).
//
// Usage (repository root):
//   node supabase/staging/verify/compare-with-production.js --staging=<staging-ref>
//   node supabase/staging/verify/compare-with-production.js --staging=<staging-ref> --emit-acl-revokes
//   node supabase/staging/verify/compare-with-production.js --from-dir=<dir>    (offline: <dir>/<query>-staging.json, <query>-production.json)
// =====================================================================
"use strict";
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PRODUCTION = "ioeulnjrozkbetaongbv";
const EXPECTED_STAGING = process.env.STAGING_REF || "ayxakyyvomlzrsfznpeq";
const HERE = __dirname;
const REPO = path.resolve(HERE, "..", "..", "..");
const QUERIES = ["schema-fingerprint", "schema-detail", "acl-probe", "struct-probe", "history", "comments"];

const fail = (m) => { console.error("ABORT: " + m); process.exit(2); };
const mask = (s) => String(s).replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, "<uuid>");
const short = (s, n = 140) => { s = mask(s); return s.length > n ? s.slice(0, n - 1) + "…" : s; };

// ---------------------------------------------------------------------
// CLI output parsing (strict).
// `supabase db query --output-format json` prints ONE JSON object; the
// CLI may add a "Target: …" line and, since v3.1.0 was superseded, an
// update notice ("A new version of Supabase CLI is available …" +
// "We recommend updating …"). Only those known lines and blank lines are
// tolerated around the object; anything else (a second object, a stray
// warning, truncated JSON, an error payload, rows missing their fields)
// is rejected, so a corrupt comparison can never be reported as a match.
// ---------------------------------------------------------------------
const KNOWN_CLI_LINES = [
    /^Target: project \S.*$/,
    /^A new version of Supabase CLI is available: v\d+\.\d+\.\d+ \(currently installed v\d+\.\d+\.\d+\)$/,
    /^We recommend updating regularly for new features and bug fixes: https:\/\/supabase\.com\/docs\/\S+$/,
];
// Required string fields per query (null allowed only where listed).
const ROW_FIELDS = {
    "schema-fingerprint": { required: ["item", "n"], nullable: ["n"] },
    "schema-detail": { required: ["cat", "k", "v"], nullable: ["v"] },
    "acl-probe": { required: ["cat", "k", "v"], nullable: ["v"] },
    "struct-probe": { required: ["cat", "k", "v"], nullable: ["v"] },
    history: { required: ["cat", "k", "v"], nullable: ["v"] },
    comments: { required: ["k", "v"], nullable: ["v"] },
};

// Index just past the JSON object that starts at `start` (string-aware), or -1.
function endOfJsonObject(text, start) {
    let depth = 0, inString = false, escaped = false;
    for (let i = start; i < text.length; i++) {
        const c = text[i];
        if (inString) {
            if (escaped) escaped = false;
            else if (c === "\\") escaped = true;
            else if (c === '"') inString = false;
            continue;
        }
        if (c === '"') inString = true;
        else if (c === "{") depth++;
        else if (c === "}" && --depth === 0) return i + 1;
    }
    return -1;
}

// Returns { json, target, notices } or throws Error (message has no row data).
function parseCliOutput(text) {
    const s = String(text || "").replace(/^﻿/, "");
    const start = s.indexOf("{");
    if (start < 0) throw new Error("no JSON object in CLI output");
    const end = endOfJsonObject(s, start);
    if (end < 0) throw new Error("truncated or malformed JSON in CLI output");
    let json;
    try {
        json = JSON.parse(s.slice(start, end));
    } catch (e) {
        throw new Error("malformed JSON in CLI output");
    }
    if (!json || typeof json !== "object" || Array.isArray(json)) throw new Error("CLI output is not a JSON object");
    let target = null;
    const notices = [];
    const extra = (s.slice(0, start) + "\n" + s.slice(end)).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of extra) {
        const known = KNOWN_CLI_LINES.findIndex((re) => re.test(line));
        if (known < 0) throw new Error("unexpected CLI output: " + short(line, 80));
        if (known === 0) {
            if (target !== null) throw new Error("more than one CLI target line");
            target = line;
        } else notices.push(line);
    }
    return { json, target, notices };
}

// Returns the rows of `json` for `query`, or throws Error.
function validateRows(query, json) {
    const spec = ROW_FIELDS[query];
    if (!spec) throw new Error("unknown query " + query);
    if (json.error) throw new Error(`${query}: CLI reported an error`);
    if (!Array.isArray(json.rows)) throw new Error(`${query}: no rows array`);
    json.rows.forEach((row, i) => {
        if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error(`${query}: row ${i} is not an object`);
        for (const f of spec.required) {
            if (!(f in row)) throw new Error(`${query}: row ${i} has no "${f}"`);
            const v = row[f];
            if (v === null ? !spec.nullable.includes(f) : !["string", "number", "boolean"].includes(typeof v)) {
                throw new Error(`${query}: row ${i} field "${f}" has an unexpected type`);
            }
        }
    });
    return json.rows;
}

function args() {
    const o = { staging: null, emit: false, fromDir: null };
    for (const a of process.argv.slice(2)) {
        if (a.startsWith("--staging=")) o.staging = a.slice(10);
        else if (a === "--emit-acl-revokes") o.emit = true;
        else if (a.startsWith("--from-dir=")) o.fromDir = path.resolve(a.slice(11));
        else fail("unknown argument " + a);
    }
    if (!o.fromDir) {
        if (!o.staging) fail("--staging=<staging-ref> is required");
        if (o.staging === PRODUCTION) fail("--staging must be the staging ref, not production");
        if (o.staging !== EXPECTED_STAGING) fail(o.staging + " is not the expected staging ref (" + EXPECTED_STAGING + ")");
        if (!/^[a-z]{20}$/.test(o.staging)) fail("malformed project ref");
    }
    return o;
}

function runReadOnly(ref, query) {
    const file = path.join(HERE, query + ".sql");
    // always --read-only; refs are validated [a-z]{20}; file is a fixed name in this folder
    const r = spawnSync(`npx --yes supabase@3.1.0 db query --remote=${ref} --read-only --file "${file}" --output-format json`,
        { shell: true, encoding: "utf8", cwd: REPO, maxBuffer: 1 << 26 });
    if (r.status !== 0) fail(`${query} on ${ref}: CLI exited with status ${r.status}`);
    let parsed;
    try {
        parsed = parseCliOutput((r.stdout || "") + "\n" + (r.stderr || ""));
    } catch (e) {
        fail(`${query} on ${ref}: ${e.message}`);
    }
    const target = parsed.target || "";
    const okTarget = ref === PRODUCTION ? target.startsWith(`Target: project EMerriment (${PRODUCTION})`) : target.startsWith(`Target: project ${ref} (not the linked project)`);
    if (!okTarget) fail(`${query} on ${ref}: unexpected CLI target line: ${target || "(none)"}`);
    try {
        return validateRows(query, parsed.json);
    } catch (e) {
        fail(`${query} on ${ref}: ${e.message}`);
    }
}
function load(o, query, env) {
    if (o.fromDir) {
        const file = path.join(o.fromDir, `${query}-${env}.json`);
        if (!fs.existsSync(file)) fail(`${query}-${env}.json not found in --from-dir`);
        const t = fs.readFileSync(file, "utf8");
        try {
            return validateRows(query, parseCliOutput(t).json);
        } catch (e) {
            fail(`${query}-${env}.json: ${e.message}`);
        }
    }
    return runReadOnly(env === "production" ? PRODUCTION : o.staging, query);
}

// key/value extraction per query
const KV = {
    "schema-fingerprint": (r) => [r.item, r.n === null || r.n === undefined ? "" : String(r.n)],   // counts/lists only; hashes are covered by schema-detail
    "schema-detail": (r) => [r.cat + " :: " + r.k, r.v],
    "acl-probe": (r) => [r.cat + " :: " + r.k, r.v],
    "struct-probe": (r) => [r.cat + " :: " + r.k, r.v],
    history: (r) => [r.cat + " :: " + r.k, r.v],
    comments: (r) => [r.k, r.v],
};

// Known, reviewed differences. Each returns a reason string when the difference is acceptable.
const unparen = (s) => String(s || "").replace(/[()]/g, "").replace(/\s+/g, " ");
const RULES = [
    { q: "schema-fingerprint", k: /^leads rows \(count only\)$/, why: () => "staging holds synthetic leads only" },
    { q: "schema-fingerprint", k: /^emerriment_backup schema present$/, why: (s, p) => s === "false" && p === "true" && "the production backup schema is deliberately not copied" },
    { q: "schema-detail", k: /^constraint :: public\.purchases\.purchases_email_check$/,
      why: (s, p) => s && p && unparen(s) === unparen(p) && "same CHECK; pg_dump re-parse flattens nested AND brackets" },
    { q: "struct-probe", k: /^storage-policy :: /, why: (s, p) => s && p && mask(s) === mask(p) && "identical except the account UUID (staging administrator vs production administrator)" },
    { q: "struct-probe", k: /^storage-objects :: /, why: (s) => s === "0" && "storage files are never copied to staging" },
];

function compare(q, a, b) {
    const ma = new Map(a.map(KV[q])), mb = new Map(b.map(KV[q]));
    const res = [];
    for (const k of [...new Set([...ma.keys(), ...mb.keys()])].sort()) {
        const s = ma.get(k), p = mb.get(k);
        if (s === p) continue;
        const rule = RULES.find((r) => r.q === q && r.k.test(k));
        const why = rule && rule.why(s, p);
        res.push({ q, k, s, p, expected: !!why, why: why || "" });
    }
    return res;
}

function emitRevokes(detailS, detailP) {
    const acl = (rows) => new Map(rows.filter((r) => r.cat === "table-acl").map((r) => [r.k, new Set(r.v.split(",").map((x) => x.split("/")[0]))]));
    const a = acl(detailS), b = acl(detailP);
    const groups = new Map(); const missing = [];
    for (const k of new Set([...a.keys(), ...b.keys()])) {
        const [tbl, role] = k.split(" ");
        const x = a.get(k) || new Set(), y = b.get(k) || new Set();
        for (const p of y) if (!x.has(p)) missing.push(`-- MISSING on staging: grant ${p.replace("*", "")} on table ${tbl} to ${role};`);
        const extra = [...x].filter((p) => !y.has(p)).map((p) => p.replace("*", "")).sort();
        if (!extra.length) continue;
        const g = extra.join(", ") + " :: " + role;
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g).push(tbl);
    }
    console.log("-- Privileges on staging that production does not have (review before use):");
    for (const [g, tables] of groups) {
        const [privs, role] = g.split(" :: ");
        console.log(`revoke ${privs} on table ${tables.sort().map((t) => t.split(".").map((p) => `"${p}"`).join(".")).join(", ")} from "${role}";`);
    }
    missing.forEach((m) => console.log(m));
    if (!groups.size && !missing.length) console.log("-- none: table privileges already match production");
}

function main() {
    const o = args();
    const data = {};
    for (const q of QUERIES) data[q] = { s: load(o, q, "staging"), p: load(o, q, "production") };
    if (o.emit) { emitRevokes(data["schema-detail"].s, data["schema-detail"].p); return; }
    let unexpected = 0, expected = 0;
    for (const q of QUERIES) {
        const diffs = compare(q, data[q].s, data[q].p);
        const u = diffs.filter((d) => !d.expected);
        unexpected += u.length; expected += diffs.length - u.length;
        console.log(`${q.padEnd(20)} rows ${String(data[q].s.length).padStart(4)}/${String(data[q].p.length).padEnd(4)} expected differences ${diffs.length - u.length}, UNEXPECTED ${u.length}`);
        for (const d of diffs) {
            console.log(`   ${d.expected ? "expected  " : "UNEXPECTED"} ${short(d.k, 90)}${d.expected ? " — " + d.why : ""}`);
            if (!d.expected) console.log(`        staging:    ${short(d.s ?? "(absent)")}\n        production: ${short(d.p ?? "(absent)")}`);
        }
    }
    console.log(`\nRESULT: ${unexpected ? "DIFFERENCES FOUND" : "staging matches production"} (${expected} expected, ${unexpected} unexpected)`);
    process.exit(unexpected ? 1 : 0);
}

// Pure helpers are exported for the offline tests (tests/db/cli-output-parser.test.js).
module.exports = { parseCliOutput, validateRows, compare, KNOWN_CLI_LINES, ROW_FIELDS, QUERIES };

if (require.main === module) main();
