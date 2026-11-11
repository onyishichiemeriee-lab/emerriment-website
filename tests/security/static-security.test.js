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

test("last-admin protection covers DELETE and is serialised against concurrent demotions", async () => {
    const m1 = migrations[0].sql;
    assert(/before insert or update or delete on public\.profiles/.test(m1), "DELETE not guarded");
    const guard = m1.split("create or replace function public.emerriment_guard_profile_privileges()")[1].split("$$;")[0];
    assert(guard.includes("pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('emerriment_admin_change'))"), "no lock");
    const lockAt = guard.indexOf("pg_advisory_xact_lock");
    const countAt = guard.indexOf("where p.is_admin is true and p.id <> old.id");
    assert(lockAt > 0 && countAt > lockAt, "the admin count must run AFTER the lock is taken");
    assert(/tg_op = 'DELETE' or not coalesce\(new\.is_admin, false\)/.test(guard), "deleting an admin not covered");
    assert(guard.includes("return old;"), "DELETE must return old");
});

test("privilege escalation: only an admin (or trusted server roles) can change profiles.is_admin", async () => {
    const m1 = migrations[0].sql;
    const guard = m1.split("create or replace function public.emerriment_guard_profile_privileges()")[1].split("$$;")[0];
    assert(/security invoker/.test(guard), "guard must run as the caller so current_user identifies API requests");
    assert(!/security definer/.test(guard));
    assert(guard.includes("is_api_user boolean := current_user in ('anon', 'authenticated')"));
    assert(/new\.is_admin is distinct from old\.is_admin\s+and is_api_user and not public\.emerriment_is_admin\(\)/.test(guard), "promotion check missing");
    assert(guard.includes("Not allowed to create an administrator profile."));
    assert(guard.includes("Not allowed to change a profile id."));
});

test("lead insert guard identifies the caller from the JWT role (definer function), not auth.role()", async () => {
    const m2 = migrations.find((m) => m.file.includes("leads_rls")).sql;
    const fn = m2.split("create or replace function public.emerriment_guard_lead_insert()")[1].split("$$;")[0];
    assert(/security definer/.test(fn));
    assert(fn.includes("caller text := emerriment_private.request_role();"));
    assert(!/auth\.role\(\)/.test(sqlCode(fn)), "deprecated auth.role() used");
    assert(!/current_user/.test(sqlCode(fn)), "must not rely on current_user inside a definer function");
    for (const s of ["new.submitted_at := now()", "new.last_email_sent := null", "interval '10 minutes'", "interval '24 hours'", "interval '1 minute'"]) {
        assert(fn.includes(s), "missing " + s);
    }
});

test("lead rate limit is serialised per address (lock taken before counting)", async () => {
    const m2 = migrations.find((m) => m.file.includes("leads_rls")).sql;
    const fn = m2.split("create or replace function public.emerriment_guard_lead_insert()")[1].split("$$;")[0];
    const lockAt = fn.indexOf("pg_catalog.pg_advisory_xact_lock(");
    const countAt = fn.indexOf("interval '10 minutes'");
    assert(lockAt > 0 && countAt > lockAt);
    assert(fn.includes("hashtextextended('emerriment_lead:' || address, 0)"));
});

test("request_role reads the JWT claims (both PostgREST setting formats)", async () => {
    const m1 = migrations[0].sql;
    const fn = m1.split("create or replace function emerriment_private.request_role()")[1].split("$$;")[0];
    assert(fn.includes("current_setting('request.jwt.claim.role', true)"));
    assert(fn.includes("current_setting('request.jwt.claims', true)), '')::jsonb ->> 'role'") ||
           fn.includes("nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'"));
});

test("migrations 2-4 refuse to run before migration 1", async () => {
    for (const key of ["leads_rls", "user_data", "content_admin"]) {
        const sql = migrations.find((m) => m.file.includes(key)).sql;
        assert(sql.includes("to_regprocedure('public.emerriment_is_admin()') is null"), key);
        assert(sql.includes("apply migration 20261110090000 first."), key);
    }
});

test("every RLS change records the previous state first (rollback can restore it)", async () => {
    const direct = [];
    for (const m of migrations) {
        for (const match of sqlCode(m.sql).matchAll(/alter table ([^\s;]+) enable row level security/g)) {
            direct.push(m.file + ": " + match[1]);
        }
    }
    // Only the helper itself (format-built) and the brand-new email_deliveries
    // table may enable RLS directly.
    // The helper builds its statement with format('... %s ...'), and the new
    // email_deliveries table has no previous state to restore.
    assert.deepStrictEqual(direct.filter((d) => !d.endsWith(": %s") && !d.endsWith(": public.email_deliveries")), []);
    assert.strictEqual(direct.length, 2, "unexpected direct RLS changes: " + direct.join(", "));
    const helper = migrations[0].sql.split("create or replace function emerriment_private.enable_rls(target regclass)")[1].split("$$;")[0];
    assert(helper.indexOf("insert into emerriment_private.rls_baseline") < helper.indexOf("enable row level security"));
    assert(helper.includes("on conflict (table_name) do nothing"), "re-runs must keep the ORIGINAL state");
    const enableCalls = (allSql.match(/emerriment_private\.enable_rls\(/g) || []).length;
    assert(enableCalls >= 6, "enable_rls used " + enableCalls + " times");
});

test("baseline names are schema-qualified independently of search_path", async () => {
    const m1 = migrations[0].sql;
    assert(m1.includes("pg_catalog.format('%I.%I', n.nspname, c.relname)"));
    assert(!/regclass::text/.test(sqlCode(allSql)), "regclass::text depends on search_path");
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

test("ratings reads are left exactly as they are; no new public read is created", async () => {
    const m3 = migrations.find((m) => m.file.includes("user_data")).sql;
    assert(m3.includes("reads_unchanged text[] := array['article_ratings']"));
    assert(!/_public_select/.test(m3), "must not add a new public-read policy");
    assert(/if not \(t = any \(reads_unchanged\)\) then\s+execute format\('drop policy if exists %I on public\.%I', 'emerriment_' \|\| t \|\| '_restrict_select'/.test(m3),
        "ratings must be exempt from the restrictive SELECT");
});

test("open reads are only re-created where RLS was previously OFF (no new exposure)", async () => {
    const code = sqlCode(allSql);
    const usingTrue = [...code.matchAll(/using \(true\)/g)].length;
    const keepOpen = [...code.matchAll(/'_keep_open_read', t\);?/g)].length;
    // Every `using (true)` must be a _keep_open_read policy guarded by the baseline.
    const guarded = [...code.matchAll(/not emerriment_private\.rls_was_enabled\(format\('public\.%I', t\)::regclass\)/g)].length;
    assert.strictEqual(usingTrue, 2, "expected exactly the two keep-open-read policies (ratings, content)");
    assert.strictEqual(guarded, 2, "each keep-open-read must be guarded by the RLS baseline");
    assert(keepOpen >= 2);
});

test("content reads untouched; writes admin-only; view counter via a narrow, uniquely named function", async () => {
    const m4 = migrations.find((m) => m.file.includes("content_admin")).sql;
    const contentPart = m4.split("-- Admin-only tables: no public access at all.")[0];
    assert(!/restrictive for select/.test(contentPart), "content reads must not be restricted");
    assert(m4.includes("create or replace function public.emerriment_increment_article_views(article_id %s)"));
    assert(!/function public\.increment_article_views/.test(m4), "generic name could replace an existing function");
    assert(m4.includes("set views = coalesce(views, 0) + 1"));
    assert(m4.includes("where id = $1"));
    assert(m4.includes("grant execute on function public.emerriment_increment_article_views(%s) to anon, authenticated"));
});

test("new API objects are announced to PostgREST (schema cache reload)", async () => {
    for (const key of ["content_admin", "email_delivery"]) {
        assert(migrations.find((m) => m.file.includes(key)).sql.includes("notify pgrst, 'reload schema';"), key);
    }
});

test("ai_messages ownership via conversation is fully qualified", async () => {
    const m3 = migrations.find((m) => m.file.includes("user_data")).sql;
    assert(m3.includes("c.id = ai_messages.conversation_id"));
    assert(!/c\.id = conversation_id/.test(m3));
});

test("email_deliveries: service role only, unique per email, cascades with the lead", async () => {
    const m5 = migrations.find((m) => m.file.includes("email_delivery")).sql;
    assert(m5.includes("constraint email_deliveries_one_per_email unique (lead_id, kind, sequence_day)"));
    assert(m5.includes("revoke all on table public.email_deliveries from anon, authenticated"));
    assert(m5.includes("enable row level security"));
    assert(m5.includes("references public.leads (id) on delete cascade"));
    assert(!/create policy[\s\S]*email_deliveries/.test(sqlCode(m5)), "no API policy on email_deliveries");
});

test("rollback only removes EMerriment objects and restores the recorded RLS state", async () => {
    const rb = sqlCode(read("supabase/rollback/emerriment_security_rollback.sql"));
    assert(rb.includes("policyname like 'emerriment\\_%'"));
    assert(!/drop policy if exists (?!%I)[a-z_]+/i.test(rb.replace(/drop policy if exists %I/g, "")));
    assert(rb.includes("from emerriment_private.rls_baseline"));
    assert(rb.includes("if not b.rls_enabled then"));
    assert(rb.includes("disable row level security"));
    assert(rb.indexOf("rls_baseline") < rb.indexOf("drop schema if exists emerriment_private"), "baseline used before the schema is dropped");
    for (const f of rb.matchAll(/drop function if exists public\.([a-z_]+)/g)) {
        assert(f[1].startsWith("emerriment_"), "rollback drops non-EMerriment function " + f[1]);
    }
    assert(!/delete from|truncate/.test(rb.toLowerCase()), "rollback must not touch data rows");
});

test("read-only audit and verification files contain no data-changing statements", async () => {
    for (const file of ["supabase/audit/01_read_only_security_audit.sql", "supabase/audit/02_post_migration_verification.sql"]) {
        const audit = sqlCode(read(file)).toLowerCase();
        for (const kw of ["insert ", "update ", "delete ", "drop ", "alter ", "create ", "grant ", "revoke ", "truncate", "notify "]) {
            assert(!audit.includes(kw), file + " contains " + kw.trim());
        }
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
    const src = read("article/article/js/article.js");
    assert(src.includes('"emerriment_increment_article_views"'), "RPC name must match the migration");
    assert(src.indexOf('"emerriment_increment_article_views"') < src.indexOf('.from("encyclopedia_articles")\n        .update') ||
           src.indexOf('"emerriment_increment_article_views"') < src.indexOf('.update({\n            views'),
        "RPC must be tried before the fallback update");
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
    for (const p of ["/EMerriment Authentication V2/*", "/EMerriment Authentication V3 — VERIFIED BACKUP/*", "/ROOT AUTH BACKUP BEFORE V2/*"]) {
        assert(toml.includes(`from = "${p}"`), "backup folder not blocked (literal name; the matcher decodes paths): " + p);
    }
});

test("_headers has no stray rule lines", async () => {
    const lines = read("_headers").split(/\r?\n/).filter((l) => l.trim() && !/^\s/.test(l));
    assert.deepStrictEqual(lines, ["/*"]);
});

test("email-sequence: schedule registered in netlify.toml, but sending requires an explicit switch", async () => {
    // The schedule must be registered in a format Netlify recognises
    // (verified locally with zip-it-and-ship-it: exports.config is ignored
    // for exports.handler functions). Activation of SENDING stays a separate,
    // deliberate decision via EMAIL_SEQUENCE_ENABLED=true.
    const toml = read("netlify.toml");
    assert(/\[functions\."email-sequence"\]\s*\r?\nschedule = "@daily"/.test(toml));
    const fn = read("netlify/functions/email-sequence.js");
    const code = fn.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
    assert(!/exports\.config\s*=/.test(code), "ineffective exports.config left in place");
    assert(fn.includes('return process.env.EMAIL_SEQUENCE_ENABLED === "true";'), "sending must require EMAIL_SEQUENCE_ENABLED=true");
    const handler = fn.split("exports.handler")[1];
    assert(handler.indexOf("if (!isSequenceEnabled())") < handler.indexOf("processLead("), "gate must come before any send");
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
