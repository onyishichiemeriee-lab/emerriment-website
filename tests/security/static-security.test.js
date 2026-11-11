/* =========================================
   EMerriment static security checks
   -----------------------------------------
   These tests read the repository files only.
   They do NOT connect to Supabase and do NOT
   execute SQL: they verify that the prepared
   migrations and the browser code are
   consistent with the intended access model.
   Real enforcement must be confirmed after the
   migrations are applied (see supabase/README.md).
========================================= */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const H = require("../email/helpers");

const suite = H.createSuite("static security (repository only)");
const { test } = suite;

const ROOT = H.ROOT;
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const MIGRATIONS_DIR = "supabase/migrations";
const migrationFiles = fs.readdirSync(path.join(ROOT, MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
const migrations = migrationFiles.map((f) => ({ file: f, sql: read(`${MIGRATIONS_DIR}/${f}`) }));
const allSql = migrations.map((m) => m.sql).join("\n");
const sqlCode = (sql) => sql.replace(/--[^\n]*/g, "");

const SKIP_DIRS = new Set(["node_modules", ".git", ".netlify", "tests", "supabase",
    "EMerriment Authentication V2", "EMerriment Authentication V3 — VERIFIED BACKUP", "ROOT AUTH BACKUP BEFORE V2"]);

function browserFiles() {
    const out = [];
    (function walk(dir) {
        for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
            if (SKIP_DIRS.has(e.name)) continue;
            const rel = dir ? `${dir}/${e.name}` : e.name;
            if (e.isDirectory()) {
                if (rel === "netlify" || rel === "local-ai") continue;
                walk(rel);
            } else if (/\.(js|html)$/.test(e.name) && !/^test-.*\.js$/.test(e.name)) {
                out.push(rel);
            }
        }
    })("");
    return out;
}

const BROWSER = browserFiles().map((f) => ({ file: f, src: read(f) }));

function calls(table, op) {
    // No "g" flag: a global regex keeps lastIndex between .test() calls.
    const re = new RegExp(`\\.from\\(\\s*["'\`]${table}["'\`]\\s*\\)\\s*\\.${op}\\s*\\(`);
    return BROWSER.filter((b) => re.test(b.src)).map((b) => b.file);
}

test("sanity: the browser-code scanner finds known calls", async () => {
    assert(calls("leads", "insert").includes("js/script.js"));
    assert(calls("leads", "select").includes("admin/subscribers.js"));
    assert(calls("profiles", "update").includes("admin/js/user-detailsCMS.js"));
    assert(BROWSER.length > 100, "scanned " + BROWSER.length + " files");
});


/* =============== Migrations =============== */

test("migrations exist, are timestamp-ordered and marked as not applied", async () => {
    assert(migrationFiles.length >= 5, "expected 5 migrations");
    for (const m of migrations) {
        assert(/^\d{14}_emerriment_[a-z_]+\.sql$/.test(m.file), m.file);
        assert(m.sql.includes("STATUS: PREPARED, NOT APPLIED"), m.file + " not marked as prepared");
        assert(m.sql.includes("Rollback:"), m.file + " has no rollback note");
    }
});

test("migrations are non-destructive: no DROP TABLE, DELETE, TRUNCATE, DROP COLUMN, or dropping others' policies", async () => {
    for (const m of migrations) {
        const code = sqlCode(m.sql).toLowerCase();
        assert(!/\bdrop\s+table\b/.test(code), m.file + ": drop table");
        assert(!/\bdelete\s+from\b/.test(code), m.file + ": delete from");
        assert(!/\btruncate\b/.test(code), m.file + ": truncate");
        assert(!/\bdrop\s+column\b/.test(code), m.file + ": drop column");
        assert(!/\bdisable\s+row\s+level\s+security\b/.test(code), m.file + ": disables RLS");
        for (const match of code.matchAll(/drop policy if exists\s+(%i|[a-z0-9_]+)/g)) {
            if (match[1] === "%i") continue; // dynamic names: checked below
            assert(match[1].startsWith("emerriment_"), m.file + ": drops non-EMerriment policy " + match[1]);
        }
        for (const match of code.matchAll(/format\('drop policy if exists %i on public\.%i', ([^,]+),/g)) {
            assert(match[1].includes("'emerriment_'"), m.file + ": dynamic drop of non-EMerriment policy");
        }
    }
});

test("every SECURITY DEFINER function pins search_path", async () => {
    const code = sqlCode(allSql);
    const definers = [...code.matchAll(/create or replace function\s+public\.([a-z_]+)[\s\S]*?\$(body|\$)/gi)];
    assert(definers.length >= 3);
    for (const fn of code.split(/create or replace function/i).slice(1)) {
        const header = fn.split(/\bas \$/i)[0];
        if (/security definer/i.test(header)) {
            assert(/set search_path = ''/i.test(header), "definer without pinned search_path: " + header.slice(0, 80));
        }
    }
});

test("helper is uniquely named (does not overwrite an existing public.is_admin)", async () => {
    assert(!/public\.is_admin\s*\(/.test(sqlCode(allSql)));
    assert(/create or replace function public\.emerriment_is_admin\(\)/.test(allSql));
});

test("admin lock-out protection: aborts without an admin, and the last admin cannot be removed", async () => {
    const m1 = migrations[0].sql;
    assert(/if not exists \(select 1 from public\.profiles where is_admin is true\) then\s+raise exception/.test(m1));
    assert(m1.includes("Cannot remove the last administrator."));
});

test("privilege escalation: only an admin (or trusted server roles) can change profiles.is_admin", async () => {
    const m1 = migrations[0].sql;
    assert(/before insert or update on public\.profiles/.test(m1));
    assert(/security invoker/.test(m1.split("emerriment_guard_profile_privileges()")[1]),
        "guard must run as the caller so current_user identifies API requests");
    assert(m1.includes("is_api_user boolean := current_user in ('anon', 'authenticated')"));
    assert(m1.includes("if is_api_user and not public.emerriment_is_admin() then"));
    assert(m1.includes("Not allowed to create an administrator profile."));
});

test("lead insert guard identifies the caller from the JWT role (definer function)", async () => {
    const m2 = migrations.find((m) => m.file.includes("leads_rls")).sql;
    const fn = m2.split("create or replace function public.emerriment_guard_lead_insert()")[1].split("$$;")[0];
    assert(/security definer/.test(fn));
    assert(fn.includes("auth.role()"), "must not rely on current_user inside a definer function");
    assert(!/current_user/.test(sqlCode(fn)));
    for (const s of ["new.submitted_at := now()", "new.last_email_sent := null", "interval '10 minutes'", "interval '24 hours'", "interval '1 minute'"]) {
        assert(fn.includes(s), "missing " + s);
    }
});

test("leads: visitors can insert only; select/update/delete are admin-only (restrictive)", async () => {
    const m2 = sqlCode(migrations.find((m) => m.file.includes("leads_rls")).sql);
    for (const cmd of ["select", "update", "delete"]) {
        const re = new RegExp(`emerriment_leads_restrict_${cmd}\\s+on public\\.leads as restrictive for ${cmd}\\s+to anon, authenticated\\s+using \\(\\(select public\\.emerriment_is_admin\\(\\)\\)\\)`);
        assert(re.test(m2), "restrictive " + cmd);
    }
    assert(/emerriment_leads_quiz_insert\s+on public\.leads for insert\s+to anon, authenticated\s+with check \(true\)/.test(m2));
    assert(/emerriment_leads_restrict_insert[\s\S]*char_length\(email\) between 3 and 254/.test(m2));
});

test("restrictive policies only target API roles (service role, auth trigger and SQL editor unaffected)", async () => {
    const code = sqlCode(allSql);
    const all = [...code.matchAll(/as restrictive for (?:select|insert|update|delete|all)\s+to\s+([a-z_, ]+?)\s+(?:using|with)/g)];
    assert(all.length >= 20, "found only " + all.length + " restrictive policies");
    assert.strictEqual(all.length, (code.match(/as restrictive/g) || []).length, "some restrictive policy was not checked");
    for (const m of all) {
        assert.strictEqual(m[1].trim(), "anon, authenticated", "restrictive policy for " + m[1]);
    }
});

test("every table used by the code is covered by a migration (or deliberately read-only)", async () => {
    const used = new Set();
    for (const b of BROWSER) for (const m of b.src.matchAll(/\.from\(\s*["'`]([a-z_]+)["'`]\s*\)/g)) used.add(m[1]);
    for (const f of fs.readdirSync(path.join(ROOT, "netlify/functions"))) {
        for (const m of read("netlify/functions/" + f).matchAll(/\.from\(\s*["'`]([a-z_]+)["'`]\s*\)/g)) used.add(m[1]);
    }
    const missing = [...used].filter((t) => !allSql.includes(`'${t}'`) && !allSql.includes(`public.${t}`));
    assert.deepStrictEqual(missing, [], "tables without a policy migration: " + missing.join(", "));
});

test("public read of ratings is preserved; personal tables have no public read", async () => {
    const m3 = migrations.find((m) => m.file.includes("user_data")).sql;
    assert(m3.includes("public_read text[] := array['article_ratings']"));
    const usingTrue = [...sqlCode(allSql).matchAll(/using \(true\)/g)].length;
    assert.strictEqual(usingTrue, 1, "only the article_ratings public select may use (true)");
});

test("content reads untouched; writes admin-only; view counter via a narrow function", async () => {
    const m4 = migrations.find((m) => m.file.includes("content_admin")).sql;
    assert(!/restrictive for select/.test(m4.split("Admin-only tables")[0].split("begin;")[1] || ""), "content reads must not be restricted");
    assert(m4.includes("create or replace function public.increment_article_views(article_id %s)"));
    assert(m4.includes("set views = coalesce(views, 0) + 1"));
    assert(m4.includes("grant execute on function public.increment_article_views(%s) to anon, authenticated"));
});

test("email_deliveries: service role only, unique per email, cascades with the lead", async () => {
    const m5 = migrations.find((m) => m.file.includes("email_delivery")).sql;
    assert(m5.includes("constraint email_deliveries_one_per_email unique (lead_id, kind, sequence_day)"));
    assert(m5.includes("revoke all on table public.email_deliveries from anon, authenticated"));
    assert(m5.includes("enable row level security"));
    assert(m5.includes("references public.leads (id) on delete cascade"));
    assert(!/create policy[\s\S]*email_deliveries/.test(sqlCode(m5)), "no API policy on email_deliveries");
});

test("rollback only removes EMerriment objects", async () => {
    const rb = sqlCode(read("supabase/rollback/emerriment_security_rollback.sql"));
    assert(rb.includes("policyname like 'emerriment\\_%'"));
    assert(!/drop policy if exists (?!%I)[a-z_]+/i.test(rb.replace(/drop policy if exists %I/g, "")));
});

test("read-only audit file contains no data-changing statements", async () => {
    const audit = sqlCode(read("supabase/audit/01_read_only_security_audit.sql")).toLowerCase();
    for (const kw of ["insert ", "update ", "delete ", "drop ", "alter ", "create ", "grant ", "revoke ", "truncate"]) {
        assert(!audit.includes(kw), "audit contains " + kw.trim());
    }
});


/* =============== Browser code =============== */

test("browser code never reads leads except admin pages", async () => {
    const readers = calls("leads", "select");
    assert(readers.every((f) => f.startsWith("admin/")), readers.join(", "));
});

test("browser code never updates or deletes leads except admin pages", async () => {
    const writers = [...calls("leads", "update"), ...calls("leads", "delete"), ...calls("leads", "upsert")];
    assert(writers.every((f) => f.startsWith("admin/")), writers.join(", "));
});

test("no quiz implementation reads the lead back after inserting it", async () => {
    for (const b of BROWSER) {
        for (const m of b.src.matchAll(/\.from\(\s*"leads"\s*\)\s*\.insert\(([\s\S]{0,900}?)\)\s*;/g)) {
            assert(!/\.select\(/.test(m[1]), b.file + " reads the lead back");
        }
    }
});

test("only the admin user-details page writes is_admin; no browser code inserts admin profiles", async () => {
    const writers = BROWSER.filter((b) => /is_admin\s*:/.test(b.src)).map((b) => b.file);
    assert.deepStrictEqual(writers, ["admin/js/user-detailsCMS.js"]);
    const profileInserts = [...calls("profiles", "insert"), ...calls("profiles", "upsert")];
    for (const f of profileInserts) assert(!/is_admin/.test(read(f).split(".from(\"profiles\")")[1].slice(0, 300)), f);
});

test("public pages do not update articles except the view-counter fallback", async () => {
    const writers = calls("encyclopedia_articles", "update").filter((f) => !f.startsWith("admin/"));
    assert.deepStrictEqual(writers, ["article/article/js/article.js"]);
    assert(read("article/article/js/article.js").includes('rpc(\n            "increment_article_views"') ||
           read("article/article/js/article.js").includes('"increment_article_views"'));
});

test("quiz code uses the configured client, never the library object", async () => {
    for (const f of ["js/script.js", "article/js/script.js", "encyclopediaCMS/js/script.js", "skinquiz/js/script.js"]) {
        const src = read(f);
        const start = src.indexOf("async function submitQuiz()");
        const body = src.slice(start, src.indexOf("\nfunction ", start + 10));
        assert(!/\bsupabase\.(from|auth)\b/.test(body), f + " uses window.supabase");
    }
});

test("browser code contains no service-role key or secret names", async () => {
    for (const b of BROWSER) {
        assert(!/SERVICE_ROLE|service_role|RESEND_API_KEY|EMAIL_LINK_SECRET|sk-[A-Za-z0-9]{20}|re_[A-Za-z0-9_]{20}/.test(b.src), b.file);
    }
});


/* =============== Deployment =============== */

test("internal folders and files are blocked from public download; functions are not", async () => {
    const toml = read("netlify.toml");
    for (const p of ["/netlify/*", "/emails/*", "/tests/*", "/supabase/*", "/local-ai/*", "/node_modules/*",
        "/package.json", "/package-lock.json", "/deno.lock", "/netlify.toml", "/test-emails.js", "/test-special-emails.js"]) {
        const block = toml.split("[[redirects]]").find((b) => b.includes(`from = "${p}"`));
        assert(block, "not blocked: " + p);
        assert(/status = 404/.test(block) && /force = true/.test(block), p);
    }
    assert(!/from = "\/\.netlify/.test(toml), "functions path must not be blocked");
});

test("_headers has no stray rule lines", async () => {
    const lines = read("_headers").split(/\r?\n/).filter((l) => l.trim() && !/^\s/.test(l));
    assert.deepStrictEqual(lines, ["/*"]);
});

test("email-sequence schedule declaration is unchanged (activation is a deployment decision)", async () => {
    assert(read("netlify/functions/email-sequence.js").includes('schedule: "@daily"'));
    assert(!/\[functions\."email-sequence"\]/.test(read("netlify.toml")), "schedule must not be activated without approval");
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
