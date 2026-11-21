#!/usr/bin/env node
// =====================================================================
// EMerriment STAGING — step 07: create the three synthetic test accounts
// ---------------------------------------------------------------------
//   staging-admin@example.test, staging-user-a@example.test, staging-user-b@example.test
// through the Supabase Auth Admin API (never by inserting into auth.users).
//
// * Target: only the staging ref given with --remote=<ref>; the production
//   ref is refused, and so is any ref other than the expected staging ref
//   (STAGING_REF=<ref> overrides the expectation for a rebuilt project).
// * Key: staging's service_role key is fetched with the Supabase CLI for
//   that ref, held in memory only, never printed; its JWT "ref" claim must
//   be the staging ref.
// * email_confirm: true -> confirmed at creation; no confirmation email.
// * Passwords: random (32 chars), written ONLY to a credentials file
//   outside the repository, ACL restricted to the current Windows user;
//   never printed. Default: %USERPROFILE%\.emerriment-staging\staging-test-accounts.json
// * Refuses if staging already has auth users or the file exists
//   (no overwrite, no password reset).
//
// Usage (repository root):
//   node supabase/staging/07_create_test_accounts.js --remote=<staging-ref> preflight
//   node supabase/staging/07_create_test_accounts.js --remote=<staging-ref> create [--credentials=<path>]
// =====================================================================
"use strict";
const { spawnSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PRODUCTION = "ioeulnjrozkbetaongbv";
const EXPECTED = process.env.STAGING_REF || "ayxakyyvomlzrsfznpeq";
const ACCOUNTS = [
    { email: "staging-admin@example.test", full_name: "Staging Admin" },
    { email: "staging-user-a@example.test", full_name: "Staging User A" },
    { email: "staging-user-b@example.test", full_name: "Staging User B" },
];
const REPO = path.resolve(__dirname, "..", "..");

function fail(msg) { console.error("ABORT: " + msg); process.exit(2); }

function parseArgs(argv) {
    const o = { ref: null, mode: null, credentials: path.join(os.homedir(), ".emerriment-staging", "staging-test-accounts.json") };
    for (const a of argv) {
        if (a === "--remote") fail("a bare --remote targets the linked PRODUCTION project; use --remote=<staging-ref>");
        else if (a.startsWith("--remote=")) o.ref = a.slice(9);
        else if (a.startsWith("--credentials=")) o.credentials = path.resolve(a.slice(14));
        else if (a === "preflight" || a === "create") o.mode = a;
        else fail("unknown argument " + a);
    }
    if (!o.ref) fail("--remote=<staging-ref> is required");
    if (o.ref === PRODUCTION) fail(PRODUCTION + " is PRODUCTION; test accounts are created on staging only");
    if (o.ref !== EXPECTED) fail(o.ref + " is not the expected staging ref (" + EXPECTED + ")");
    if (!/^[a-z]{20}$/.test(o.ref)) fail("malformed project ref");
    if (!o.mode) fail("say preflight or create");
    const rel = path.relative(REPO, o.credentials);
    if (!rel.startsWith("..") && !path.isAbsolute(rel)) fail("the credentials file must be outside the repository");
    return o;
}

function fetchKeys(ref) {
    // ref is validated as [a-z]{20}; the command string has no user-controlled text otherwise
    const r = spawnSync(`npx --yes supabase@3.1.0 projects api-keys --remote=${ref} --reveal --output-format json`,
        { shell: true, encoding: "utf8", cwd: REPO, maxBuffer: 1 << 24 });
    const err = (r.stderr || "").split("\n").filter((l) => l.trim() && !/key|secret|eyJ|sb_/i.test(l)).join("\n");
    if (err) console.log("CLI: " + err.trim());
    if (r.status !== 0) fail("api-keys exited " + r.status);
    if (r.stdout.includes(PRODUCTION)) fail("production ref appeared in the key listing");
    const j = JSON.parse(r.stdout.slice(r.stdout.search(/[[{]/)));
    return Array.isArray(j) ? j : (j.keys || j.api_keys || j.data || Object.values(j).find(Array.isArray) || []);
}
const jwtRef = (t) => { try { return JSON.parse(Buffer.from(t.split(".")[1], "base64url").toString()).ref; } catch { return null; } };
function serviceKey(list, ref) {
    const k = list.find((x) => x.name === "service_role" && String(x.api_key || "").startsWith("eyJ"));
    if (!k) fail("no legacy service_role key in the staging listing");
    if (jwtRef(k.api_key) !== ref) fail("service_role key is not for " + ref);
    return k.api_key;
}

function restrictToCurrentUser(p) {
    const user = `${process.env.USERDOMAIN ? process.env.USERDOMAIN + "\\" : ""}${process.env.USERNAME}`;
    // remove inheritance, grant only the current user, drop Administrators (S-1-5-32-544) and SYSTEM (S-1-5-18)
    for (const args of [[p, "/inheritance:r", "/grant:r", `${user}:F`], [p, "/remove:g", "*S-1-5-32-544", "*S-1-5-18"]]) {
        const r = spawnSync("icacls", args, { encoding: "utf8" });
        if (r.status !== 0) fail("icacls failed on " + p);
    }
    const show = spawnSync("icacls", [p], { encoding: "utf8" }).stdout;
    const aces = show.split(/\r?\n/).map((l) => l.replace(p, "").trim()).filter((l) => /\(.*\)/.test(l));
    if (aces.length !== 1 || !aces[0].toLowerCase().startsWith(user.toLowerCase())) fail("ACL of " + p + " is not restricted to " + user + ": " + aces.join("; "));
}

async function api(base, key, method, route, body) {
    const res = await fetch(base + route, { method, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    let json = null; try { json = await res.json(); } catch { /* empty */ }
    return { status: res.status, json };
}

(async () => {
    const o = parseArgs(process.argv.slice(2));
    if (process.platform !== "win32") fail("this tool restricts the credentials file with icacls (Windows only)");
    const base = `https://${o.ref}.supabase.co`;
    const list = fetchKeys(o.ref);
    console.log("staging keys available: " + list.map((k) => `${k.name}/${k.type}`).join(", "));
    const key = serviceKey(list, o.ref);
    const existing = await api(base, key, "GET", "/auth/v1/admin/users?page=1&per_page=50");
    if (existing.status !== 200) fail("listing users returned HTTP " + existing.status);
    const n = (existing.json.users || []).length;
    console.log(`target ${base}; auth users now: ${n}; credentials file: ${o.credentials} (${fs.existsSync(o.credentials) ? "exists" : "absent"})`);
    if (o.mode === "preflight") return;

    if (n) fail("staging already has auth users (no overwrite)");
    if (fs.existsSync(o.credentials)) fail("credentials file already exists (no overwrite)");
    fs.mkdirSync(path.dirname(o.credentials), { recursive: true });
    restrictToCurrentUser(path.dirname(o.credentials));
    const rec = {
        project_ref: o.ref, created: new Date().toISOString(),
        note: "EMerriment STAGING test accounts only. Synthetic. Never use in production.",
        accounts: ACCOUNTS.map((a) => ({ email: a.email, password: crypto.randomBytes(24).toString("base64url"), id: null })),
    };
    fs.writeFileSync(o.credentials, JSON.stringify(rec, null, 2), { flag: "wx" });
    restrictToCurrentUser(o.credentials);
    console.log("credentials file written and restricted to the current user");

    for (const a of rec.accounts) {
        const meta = ACCOUNTS.find((x) => x.email === a.email);
        const r = await api(base, key, "POST", "/auth/v1/admin/users",
            { email: a.email, password: a.password, email_confirm: true, user_metadata: { full_name: meta.full_name } });
        if (r.status !== 200 && r.status !== 201) fail(`${a.email}: HTTP ${r.status} ${(r.json && (r.json.error_code || r.json.msg)) || ""}`);
        a.id = r.json.id;
        fs.writeFileSync(o.credentials, JSON.stringify(rec, null, 2));
        console.log(`${a.email}: id=${a.id} email_confirmed=${!!r.json.email_confirmed_at} confirmation_sent=${!!r.json.confirmation_sent_at}`);
    }
    restrictToCurrentUser(o.credentials);
    console.log("done — next: step 08 (promote the administrator, point storage policies at it)");
})().catch((e) => fail(e.message));
