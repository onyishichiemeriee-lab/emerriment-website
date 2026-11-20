// EMerriment — read-only inspection of a schema-only dump (local file; no network).
// Prints size, SHA-256, statement kinds, schemas, data statements (must be 0), excluded
// schemas, a credential/secret scan and email-like strings (masked). Counts and names only.
// Usage: node supabase/staging/verify/inspect-dump.js <dump.sql>
// Expected for the 2026-11-19 export: 0 data statements, schemas public + emerriment_private
// only, 0 emerriment_backup mentions, 0 auth/storage objects defined, 0 secrets, 0 emails.
"use strict";
const fs = require("fs");
const crypto = require("crypto");
const file = process.argv[2];
const buf = fs.readFileSync(file);
const sql = buf.toString("utf8");
const out = (k, v) => console.log(k.padEnd(44) + " " + (typeof v === "string" ? v : JSON.stringify(v)));

out("bytes", String(buf.length));
out("sha256", crypto.createHash("sha256").update(buf).digest("hex"));
out("lines", String(sql.split("\n").length));

// Split into top-level statements, respecting quotes, dollar quotes and comments.
const stmts = [];
{
    let i = 0, start = 0, n = sql.length;
    while (i < n) {
        const c = sql[i];
        if (c === "-" && sql[i + 1] === "-") { i = sql.indexOf("\n", i); if (i < 0) i = n; continue; }
        if (c === "/" && sql[i + 1] === "*") { i = sql.indexOf("*/", i + 2) + 2; continue; }
        if (c === "'" || c === '"') { let j = i + 1; while (j < n) { if (sql[j] === c) { if (sql[j + 1] === c) { j += 2; continue; } break; } j++; } i = j + 1; continue; }
        if (c === "$") { const m = /^\$[A-Za-z_]*\$/.exec(sql.slice(i, i + 64)); if (m) { const e = sql.indexOf(m[0], i + m[0].length); i = e + m[0].length; continue; } }
        if (c === ";") { stmts.push(sql.slice(start, i + 1).trim()); start = i + 1; }
        i++;
    }
    const rest = sql.slice(start).trim(); if (rest) stmts.push(rest);
}
out("top-level statements", String(stmts.length));

const kinds = {};
for (const s of stmts) {
    const k = s.replace(/\s+/g, " ").match(/^(CREATE OR REPLACE \w+|CREATE (?:UNIQUE )?\w+(?: \w+)?|ALTER TABLE ONLY|ALTER TABLE|ALTER \w+|GRANT|REVOKE|COMMENT ON \w+|SET|SELECT|INSERT|COPY|UPDATE|DELETE|\w+)/i);
    let key = k ? k[0].toUpperCase() : "?";
    if (/^ALTER TABLE/.test(key)) key += /ADD CONSTRAINT/i.test(s) ? " … ADD CONSTRAINT" : /ENABLE ROW LEVEL SECURITY/i.test(s) ? " … ENABLE RLS" : /FORCE ROW LEVEL SECURITY/i.test(s) ? " … FORCE RLS" : /OWNER TO/i.test(s) ? " … OWNER TO" : /ALTER COLUMN/i.test(s) ? " … ALTER COLUMN" : " … other";
    if (/^CREATE (UNIQUE )?INDEX/.test(key)) key = "CREATE INDEX";
    if (/^CREATE TABLE/.test(key)) key = "CREATE TABLE";
    kinds[key] = (kinds[key] || 0) + 1;
}
console.log("\n# statement kinds");
for (const [k, v] of Object.entries(kinds).sort()) out("  " + k, String(v));

// Data statements at top level.
const data = stmts.filter((s) => /^(INSERT|COPY|UPDATE|DELETE|TRUNCATE|MERGE)\b/i.test(s));
out("\ntop-level INSERT/COPY/UPDATE/DELETE", String(data.length));
out("'FROM stdin' anywhere", String((sql.match(/FROM stdin/gi) || []).length));
out("pg_catalog.setval calls", String((sql.match(/setval\(/gi) || []).length));

// Schemas of created / altered objects.
const objSchemas = {};
const re = /(?:CREATE (?:OR REPLACE )?(?:UNIQUE )?(?:TABLE(?: IF NOT EXISTS)?|FUNCTION|VIEW|SEQUENCE(?: IF NOT EXISTS)?|TYPE|DOMAIN|INDEX [^;]*? ON(?: ONLY)?|TRIGGER [^;]*? ON|POLICY [^;]*? ON)|ALTER TABLE(?: ONLY)?|GRANT [^;]*? ON (?:TABLE|FUNCTION|SEQUENCE|SCHEMA)?) "([^"]+)"/g;
for (const s of stmts) { let m; re.lastIndex = 0; while ((m = re.exec(s))) objSchemas[m[1]] = (objSchemas[m[1]] || 0) + 1; }
console.log("\n# schemas of created/altered/granted objects");
for (const [k, v] of Object.entries(objSchemas).sort()) out("  " + k, String(v));
out("CREATE SCHEMA statements", stmts.filter((s) => /^CREATE SCHEMA/i.test(s)).map((s) => s.match(/"([^"]+)"/)[1]));
out("CREATE EXTENSION statements", stmts.filter((s) => /^CREATE EXTENSION/i.test(s)).map((s) => s.replace(/\s+/g, " ")));

// Excluded schemas.
console.log("\n# excluded schemas");
out("mentions of emerriment_backup", String((sql.match(/emerriment_backup/gi) || []).length));
for (const sc of ["auth", "storage", "extensions", "graphql", "realtime", "vault", "cron", "net", "supabase_functions"]) {
    const created = stmts.filter((s) => new RegExp(`^(CREATE|ALTER|GRANT|REVOKE|COMMENT)[^;]*?"${sc}"\\."[^"]+"`, "i").test(s) && !new RegExp(`ON (?:TABLE )?"(public|emerriment_private)"`, "i").test(s) && !/^ALTER TABLE/i.test(s) && !/^CREATE (OR REPLACE )?(FUNCTION|TRIGGER|POLICY|INDEX)/i.test(s));
    const refs = (sql.match(new RegExp(`"?${sc}"?\\.`, "g")) || []).length;
    out(`  ${sc}: objects defined in it / references`, `${created.length} / ${refs}`);
}
const authRefs = {};
for (const m of sql.matchAll(/"?auth"?\."?([a-z_]+)"?/g)) authRefs[m[1]] = (authRefs[m[1]] || 0) + 1;
out("  auth.* names referenced", authRefs);
const storRefs = {};
for (const m of sql.matchAll(/"?storage"?\."?([a-z_]+)"?/g)) storRefs[m[1]] = (storRefs[m[1]] || 0) + 1;
out("  storage.* names referenced", storRefs);

// Secrets.
console.log("\n# secret / credential scan");
const pats = {
    "JWT (eyJ…)": /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
    "sb_secret_/sb_publishable_": /sb_(secret|publishable)_[A-Za-z0-9_-]{8,}/g,
    "OpenAI sk-": /\bsk-[A-Za-z0-9_-]{16,}/g,
    "Resend re_": /\bre_[A-Za-z0-9]{16,}/g,
    "connection URI": /postgres(?:ql)?:\/\/[^\s'"]+/g,
    "PGPASSWORD": /PGPASSWORD/g,
    "cli_login_postgres": /cli_login_postgres/g,
    "PASSWORD '…' clause": /PASSWORD\s+'[^']*'/gi,
    "pooler host": /pooler\.supabase\.com/g,
    "long hex (>=40)": /\b[0-9a-f]{40,}\b/gi,
    "long base64 (>=40)": /[A-Za-z0-9+/]{40,}={0,2}/g,
};
for (const [k, r] of Object.entries(pats)) out("  " + k, String((sql.match(r) || []).length));
const pwWords = (sql.match(/[^\n]*\b(password|secret|api[_-]?key|token)\b[^\n]*/gi) || []);
out("  lines mentioning password/secret/api key/token", String(pwWords.length));
for (const l of pwWords.slice(0, 40)) console.log("     | " + l.trim().slice(0, 150));

// Emails (masked).
console.log("\n# email-like strings (masked)");
const emails = [...new Set(sql.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [])];
out("  distinct", String(emails.length));
for (const e of emails) { const [u, d] = e.split("@"); console.log("     " + (u.length <= 2 ? u[0] + "*" : u[0] + "*".repeat(u.length - 2) + u.slice(-1)) + "@" + d); }
out("phone-like (+234…/0[789]0…)", String((sql.match(/(\+234\d{10}|\b0[789][01]\d{8}\b)/g) || []).length));

// Key EMerriment objects.
console.log("\n# EMerriment objects");
const tables = stmts.filter((s) => /^CREATE TABLE/i.test(s)).map((s) => s.match(/"([^"]+)"\."([^"]+)"/).slice(1).join("."));
out("tables", tables);
out("functions", stmts.filter((s) => /^CREATE (OR REPLACE )?FUNCTION/i.test(s)).map((s) => s.match(/"([^"]+)"\."([^"]+)"/).slice(1).join(".")));
out("triggers", stmts.filter((s) => /^CREATE (OR REPLACE )?TRIGGER/i.test(s)).map((s) => s.match(/TRIGGER "([^"]+)"[^;]*? ON "([^"]+)"\."([^"]+)"/).slice(1).join(" on ")));
out("policies per table", stmts.filter((s) => /^CREATE POLICY/i.test(s)).reduce((a, s) => { const m = s.match(/ ON "([^"]+)"\."([^"]+)"/); const k = m[1] + "." + m[2]; a[k] = (a[k] || 0) + 1; return a; }, {}));
out("RLS enabled on", stmts.filter((s) => /ENABLE ROW LEVEL SECURITY/i.test(s)).map((s) => s.match(/"([^"]+)"\."([^"]+)"/).slice(1).join(".")));
out("first statement", stmts[0].slice(0, 80));
out("ends with newline", String(sql.endsWith("\n")));
