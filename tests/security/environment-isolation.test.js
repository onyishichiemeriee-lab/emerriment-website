/* Environment isolation: production vs deploy previews / branch deploys / local.
   - scripts/write-runtime-config.js (build): which Supabase project each
     context gets in the browser; fail-closed without staging.
   - js/supabase-config.js (browser guard) and every real page that creates
     a Supabase client.
   - netlify/lib/environment.js (functions): no production credentials, no
     email and no marketing switches outside production.
   Fake Supabase/Resend and synthetic values only. No network, no real keys. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { JSDOM } = require("jsdom");
const H = require("../email/helpers");
const build = require("../../scripts/write-runtime-config.js");

const suite = H.createSuite("environment isolation (production vs previews)");
const { test } = suite;

const read = (p) => fs.readFileSync(path.join(H.ROOT, p), "utf8");
const PROD_REF = "ioeulnjrozkbetaongbv";
const PROD_URL = `https://${PROD_REF}.supabase.co`;
const STAGING_REF = "stagingtestproject01";
const STAGING_URL = `https://${STAGING_REF}.supabase.co`;
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const jwt = (claims) => `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ iss: "supabase", ...claims })}.synthetic-signature`;
const STAGING_ANON = jwt({ ref: STAGING_REF, role: "anon" });
const STAGING_SERVICE = jwt({ ref: STAGING_REF, role: "service_role" });
const PROD_SERVICE_LIKE = jwt({ ref: PROD_REF, role: "service_role" });
const PROD_ANON = build.resolve({ CONTEXT: "production" }).supabaseAnonKey;
const PREVIEW_HOST = "deploy-preview-7--emerriment216.netlify.app";
const tracked = execFileSync("git", ["ls-files"], { cwd: H.ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
const browserFiles = tracked.filter((f) => /\.(js|html)$/.test(f) && !/^(tests|supabase|docs|scripts|netlify)\//.test(f));
const libPages = tracked.filter((f) => f.endsWith(".html") && /supabase-js@/.test(read(f)));

const STAGING_BUILD_ENV = { STAGING_PUBLIC_SUPABASE_URL: STAGING_URL, STAGING_PUBLIC_SUPABASE_ANON_KEY: STAGING_ANON };
const runtimeFor = (env) => build.render(build.resolve(env), env).runtimeJs;
const PROD_RUNTIME = runtimeFor({ CONTEXT: "production" });
const PREVIEW_RUNTIME = runtimeFor({ CONTEXT: "deploy-preview", ...STAGING_BUILD_ENV });
const COMMITTED_RUNTIME = read("js/runtime-config.js");

/* ---------------- Build script ---------------- */

test("[1] production build → the production project (public anon key only)", () => {
    const c = build.resolve({ CONTEXT: "production" });
    assert.strictEqual(c.supabaseUrl, PROD_URL);
    const claims = JSON.parse(Buffer.from(c.supabaseAnonKey.split(".")[1], "base64url").toString());
    assert.strictEqual(claims.role, "anon");
    assert.strictEqual(claims.ref, PROD_REF);
});

test("[2] deploy-preview build → staging project", () => {
    const c = build.resolve({ CONTEXT: "deploy-preview", ...STAGING_BUILD_ENV });
    assert.deepStrictEqual([c.supabaseUrl, c.supabaseAnonKey, c.reason], [STAGING_URL, STAGING_ANON, null]);
});

test("[3] branch-deploy build → staging project", () => {
    const c = build.resolve({ CONTEXT: "branch-deploy", ...STAGING_BUILD_ENV });
    assert.strictEqual(c.supabaseUrl, STAGING_URL);
});

test("[4] previews without staging configuration fail closed — never production", () => {
    for (const context of ["deploy-preview", "branch-deploy", "dev"]) {
        const c = build.resolve({ CONTEXT: context });
        assert.strictEqual(c.supabaseUrl, null, context);
        assert(/staging Supabase is not configured/.test(c.reason), context);
        const js = build.render(c, {}).runtimeJs;
        assert(!js.includes(PROD_REF) && !js.includes(PROD_ANON), context + " output mentions production");
    }
    for (const env of [{}, { CONTEXT: "production-ish" }, { CONTEXT: "staging" }]) {
        const c = build.resolve(env);
        assert.strictEqual(c.supabaseUrl, null, JSON.stringify(env));
    }
});

test("[4] staging variables that point at production, or carry non-public keys, are refused", () => {
    const bad = [
        { STAGING_PUBLIC_SUPABASE_URL: PROD_URL, STAGING_PUBLIC_SUPABASE_ANON_KEY: PROD_ANON },
        { STAGING_PUBLIC_SUPABASE_URL: STAGING_URL, STAGING_PUBLIC_SUPABASE_ANON_KEY: PROD_ANON },
        { STAGING_PUBLIC_SUPABASE_URL: STAGING_URL, STAGING_PUBLIC_SUPABASE_ANON_KEY: STAGING_SERVICE },
        { STAGING_PUBLIC_SUPABASE_URL: STAGING_URL, STAGING_PUBLIC_SUPABASE_ANON_KEY: "sb_secret_synthetic" },
        { STAGING_PUBLIC_SUPABASE_URL: STAGING_URL, STAGING_PUBLIC_SUPABASE_ANON_KEY: jwt({ ref: "otherprojectref00000", role: "anon" }) },
        { STAGING_PUBLIC_SUPABASE_URL: "https://evil.example/supabase", STAGING_PUBLIC_SUPABASE_ANON_KEY: STAGING_ANON },
        { STAGING_PUBLIC_SUPABASE_URL: "http://localhost:54321", STAGING_PUBLIC_SUPABASE_ANON_KEY: STAGING_ANON }
    ];
    for (const env of bad) {
        const c = build.resolve({ CONTEXT: "deploy-preview", ...env });
        assert.strictEqual(c.supabaseUrl, null, JSON.stringify(env).slice(0, 90));
    }
    assert.strictEqual(build.resolve({ CONTEXT: "deploy-preview", STAGING_PUBLIC_SUPABASE_URL: STAGING_URL, STAGING_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_synthetic" }).supabaseUrl, STAGING_URL);
    assert.strictEqual(build.resolve({ CONTEXT: "dev", STAGING_PUBLIC_SUPABASE_URL: "http://localhost:54321", STAGING_PUBLIC_SUPABASE_ANON_KEY: STAGING_ANON }).supabaseUrl, "http://localhost:54321");
});

test("[6] the build never writes server secrets into either file", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "emr-cfg-"));
    const env = { CONTEXT: "deploy-preview", ...STAGING_BUILD_ENV, SUPABASE_SERVICE_ROLE_KEY: "SECRET-SERVICE-ROLE-synthetic", RESEND_API_KEY: "SECRET-RESEND-synthetic",
                  DEPLOY_PRIME_URL: "https://deploy-preview-7--emerriment216.netlify.app", URL: "https://emerriment.com" };
    build.write(env, dir);
    const out = fs.readFileSync(path.join(dir, "js/runtime-config.js"), "utf8") + fs.readFileSync(path.join(dir, "netlify/lib/deploy-context.json"), "utf8");
    assert(!/SECRET-/.test(out), "a secret was written");
    assert.strictEqual(JSON.parse(fs.readFileSync(path.join(dir, "netlify/lib/deploy-context.json"), "utf8")).context, "deploy-preview");
    fs.rmSync(dir, { recursive: true, force: true });
});

test("committed defaults are fail-closed; netlify.toml runs the build and hides /scripts", () => {
    assert(/"supabaseUrl":null/.test(COMMITTED_RUNTIME) && /"context":"unconfigured"/.test(COMMITTED_RUNTIME));
    assert.strictEqual(JSON.parse(read("netlify/lib/deploy-context.json")).context, "unconfigured");
    const toml = read("netlify.toml");
    assert(/\[build\][\s\S]*?command = "node scripts\/write-runtime-config\.js"/.test(toml));
    assert(/from = "\/scripts\/\*"\s*\r?\nto = "\/404"/.test(toml));
});

/* ---------------- Browser guard ---------------- */

function guardOn(host, runtimeJs) {
    const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: `https://${host}/`, runScripts: "outside-only" });
    const calls = [];
    dom.window.supabase = { createClient: (url) => { calls.push(url); return {}; } };
    if (runtimeJs) dom.window.eval(runtimeJs);
    dom.window.eval(read("js/supabase-config.js"));
    return { w: dom.window, calls, resolve: () => dom.window.EmerrimentSupabase.resolve() };
}

test("[1] production runtime is accepted on the exact production hosts only", () => {
    for (const host of ["emerriment.com", "www.emerriment.com", "emerriment216.netlify.app"]) {
        const g = guardOn(host, PROD_RUNTIME);
        assert.strictEqual(g.resolve().url, PROD_URL, host);
    }
    for (const host of [PREVIEW_HOST, "6743f0a1--emerriment216.netlify.app", "emerriment.com.evil.example", "localhost", "127.0.0.1"]) {
        const g = guardOn(host, PROD_RUNTIME);
        assert.strictEqual(g.resolve().ok, false, host);
        assert.strictEqual(g.w.EmerrimentSupabase.createClient({}), null, host);
        assert.strictEqual(g.calls.length, 0, host + " created a production client");
    }
});

test("[2][3] preview / branch runtime resolves to staging", () => {
    const g = guardOn(PREVIEW_HOST, PREVIEW_RUNTIME);
    assert.strictEqual(g.resolve().url, STAGING_URL);
    g.w.EmerrimentSupabase.createClient({});
    assert.deepStrictEqual(g.calls, [STAGING_URL]);
    const b = guardOn("feature-x--emerriment216.netlify.app", runtimeFor({ CONTEXT: "branch-deploy", ...STAGING_BUILD_ENV }));
    assert.strictEqual(b.resolve().url, STAGING_URL);
});

test("[4] missing or committed-default runtime: no client, visible notice", async () => {
    for (const rt of [null, COMMITTED_RUNTIME, runtimeFor({ CONTEXT: "deploy-preview" })]) {
        const g = guardOn(PREVIEW_HOST, rt);
        assert.strictEqual(g.w.EmerrimentSupabase.createClient({}), null);
        assert.strictEqual(g.calls.length, 0);
        await new Promise((r) => setTimeout(r, 20));   // the notice is added once the DOM is ready
        assert(g.w.document.querySelector("[data-emerriment-config-error]"), "notice shown");
    }
});

test("[5][6] tampered runtimes are refused: production URL in a preview, staging in production, non-public keys", () => {
    const rt = (o) => "window.EMERRIMENT_RUNTIME = Object.freeze(" + JSON.stringify({ reason: null, ...o }) + ");";
    const cases = [
        [PREVIEW_HOST, { context: "deploy-preview", supabaseUrl: PROD_URL, supabaseAnonKey: PROD_ANON }],
        ["emerriment.com", { context: "production", supabaseUrl: STAGING_URL, supabaseAnonKey: STAGING_ANON }],
        [PREVIEW_HOST, { context: "deploy-preview", supabaseUrl: STAGING_URL, supabaseAnonKey: STAGING_SERVICE }],
        [PREVIEW_HOST, { context: "deploy-preview", supabaseUrl: STAGING_URL, supabaseAnonKey: "sb_secret_synthetic" }],
        [PREVIEW_HOST, { context: "deploy-preview", supabaseUrl: STAGING_URL, supabaseAnonKey: PROD_ANON }],
        ["emerriment.com", { context: "production", supabaseUrl: PROD_URL, supabaseAnonKey: PROD_SERVICE_LIKE }],
        [PREVIEW_HOST, { context: "dev", supabaseUrl: "http://localhost:54321", supabaseAnonKey: STAGING_ANON }]
    ];
    for (const [host, o] of cases) {
        const g = guardOn(host, rt(o));
        assert.strictEqual(g.w.EmerrimentSupabase.createClient({}), null, JSON.stringify(o).slice(0, 80));
        assert.strictEqual(g.calls.length, 0);
    }
});

test("every page that loads Supabase loads the runtime config and guard first", () => {
    assert.strictEqual(libPages.length, 63, "expected 63 pages that load supabase-js, found " + libPages.length);
    for (const p of libPages) {
        const html = read(p);
        const rc = html.indexOf('src="/js/runtime-config.js"');
        const gc = html.indexOf('src="/js/supabase-config.js"');
        const client = html.search(/src="[^"]*js\/supabase\.js"|EmerrimentSupabase\.createClient|src="(login|analytics|products|subscribers)\.js"/);
        assert(rc > 0 && gc > rc && client > gc, p + ": runtime-config → supabase-config → client order broken");
    }
});

test("[5][6] no browser file carries a project URL, any Supabase key or a secret", () => {
    for (const f of browserFiles) {
        const s = read(f);
        assert(!/https:\/\/[a-z0-9]{20}\.supabase\.co/.test(s), f + " hard-codes a Supabase project URL");
        assert(!/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/.test(s), f + " contains a JWT");
        assert(!/sb_secret_[A-Za-z0-9]/.test(s), f + " contains a secret key");
        assert(!/SUPABASE_SERVICE_ROLE_KEY|service_role_key/i.test(s), f + " mentions a service-role key");
    }
});

/* Executes each real page's client chain (runtime config, guard, client
   scripts, inline config and the scripts that create clients) with a
   recording Supabase library. */
function runPage(rel, host, runtimeJs) {
    const dom = new JSDOM(read(rel), { url: `https://${host}/${rel}`, runScripts: "outside-only" });
    const w = dom.window;
    const created = [];
    const stub = new Proxy(function () {}, { get: (t, p) => (p === "then" ? undefined : stub), apply: () => stub });
    w.supabase = { createClient: (url) => { created.push(String(url)); return stub; } };
    w.console.log = w.console.error = w.console.warn = () => {};
    for (const s of [...w.document.querySelectorAll("script")]) {
        const src = s.getAttribute("src");
        let code = null;
        if (!src) {
            if (/EmerrimentSupabase/.test(s.textContent)) code = s.textContent;
        } else if (!/^https?:/.test(src)) {
            // Resolve exactly like a browser ("../" stops at the site root),
            // and never read anything outside the repository.
            const abs = decodeURIComponent(new URL(src, `https://${host}/${rel}`).pathname).replace(/^\//, "");
            assert(!abs.split("/").includes(".."), rel + ": script path escapes the site root");
            if (abs === "js/runtime-config.js") code = runtimeJs;
            else if (abs === "js/supabase-config.js" || /(^|\/)js\/supabase\.js$/.test(abs)) code = read(abs);
            else if (fs.existsSync(path.join(H.ROOT, abs)) && /EmerrimentSupabase\.createClient/.test(read(abs))) code = read(abs);
        }
        if (code) { try { w.eval(code); } catch (e) { /* page logic after client creation may need a full browser */ } }
    }
    return created;
}

test("[5][9][10] real pages: preview → staging only; misbuilt preview → none; production → production", async () => {
    // Page scripts that start async work with no client (fail-closed runs)
    // reject inside the page; that is expected and not a test failure.
    const swallow = () => {};
    process.on("unhandledRejection", swallow);
    let previewClients = 0, prodClients = 0;
    try {
    for (const p of libPages) {
        const preview = runPage(p, PREVIEW_HOST, PREVIEW_RUNTIME);
        assert(preview.length >= 1, p + ": no client created in a correctly configured preview");
        assert(preview.every((u) => u === STAGING_URL), p + ": preview client not on staging: " + preview);
        previewClients += preview.length;
        assert.deepStrictEqual(runPage(p, PREVIEW_HOST, PROD_RUNTIME), [], p + ": production config accepted on a preview host");
        assert.deepStrictEqual(runPage(p, PREVIEW_HOST, COMMITTED_RUNTIME), [], p + ": client without configuration");
        const prod = runPage(p, "emerriment.com", PROD_RUNTIME);
        assert(prod.length >= 1 && prod.every((u) => u === PROD_URL), p + ": production unchanged");
        prodClients += prod.length;
    }
    assert(previewClients >= 63 && prodClients === previewClients);
    await new Promise((r) => setTimeout(r, 50));
    } finally {
        process.removeListener("unhandledRejection", swallow);
    }
});

/* ---------------- Server functions ---------------- */

const previewEnv = (over = {}) => H.setEnv({ EMERRIMENT_CONTEXT: "deploy-preview", DEPLOY_PRIME_URL: "https://" + PREVIEW_HOST, ...over });
const WITH_PROD_CREDS = { SUPABASE_URL: PROD_URL, SUPABASE_SERVICE_ROLE_KEY: PROD_SERVICE_LIKE };
const WITH_STAGING_CREDS = { SUPABASE_URL: STAGING_URL, SUPABASE_SERVICE_ROLE_KEY: STAGING_SERVICE, STAGING_SUPABASE_PROJECT_REF: STAGING_REF };
const ALL_SWITCHES_ON = { EMAIL_CONFIRMATION_ENABLED: "true", EMAIL_SEQUENCE_ENABLED: "true", CUSTOMER_ONBOARDING_ENABLED: "true" };
const QUIZ = { name: "Ada", email: "ada@example.com", skinType: "Oily", concern: "Acne", oilLevel: "High", sensitivity: "Low", score: 50, recommendation: "Hydrate." };
const LINK_SECRET = { EMAIL_LINK_SECRET: "synthetic-link-secret-0123456789abcdef0123" };

async function everyFunction(lead) {
    const c = H.load("netlify/lib/email-common.js");
    const results = {};
    results["send-email"] = (await H.load("netlify/functions/send-email.js").handler({ httpMethod: "POST", body: JSON.stringify(QUIZ) })).statusCode;
    results["confirm-subscription"] = (await H.load("netlify/functions/confirm-subscription.js").handler({ httpMethod: "POST", body: "t=" + "A".repeat(43) + "&confirm=yes" })).statusCode;
    results.unsubscribe = (await H.load("netlify/functions/unsubscribe.js").handler({ httpMethod: "POST", queryStringParameters: { l: lead.id, t: c.signLink("unsubscribe", lead.id) } })).statusCode;
    results["email-open"] = (await H.load("netlify/functions/email-open.js").handler({ httpMethod: "GET", queryStringParameters: { l: lead.id, t: c.signLink("open", lead.id) } })).statusCode;
    const url = "https://emerriment.com/";
    results["track-click"] = (await H.load("netlify/functions/track-click.js").handler({ httpMethod: "GET", queryStringParameters: { l: lead.id, url, t: c.signLink("click:" + url, lead.id) } })).statusCode;
    results["email-sequence"] = (await H.load("netlify/functions/email-sequence.js").handler({})).statusCode;
    results["customer-onboarding"] = (await H.load("netlify/functions/customer-onboarding.js").handler({})).statusCode;
    return results;
}

test("[7] preview with inherited PRODUCTION credentials: no function creates a production client, nothing is sent", async () => {
    previewEnv({ ...WITH_PROD_CREDS, ...ALL_SWITCHES_ON, ...LINK_SECRET });
    const lead = H.addLead({ email: "ada@example.com" });
    const r = await everyFunction(lead);
    assert.deepStrictEqual(H.db.clientUrls, [], "clients created: " + H.db.clientUrls.join(","));
    assert.strictEqual(H.mail.attempts.length, 0, "provider called");
    // Email is switched off outside production: a controlled 503 (WP4C), not a crash.
    assert.strictEqual(r["send-email"], 503);
    assert.strictEqual(r["confirm-subscription"], 500);
    assert.strictEqual(lead.status, "New Lead", "no write reached any database");
});

test("[7] staging credentials that do not match STAGING_SUPABASE_PROJECT_REF are refused", async () => {
    for (const over of [
        { ...WITH_STAGING_CREDS, STAGING_SUPABASE_PROJECT_REF: "" },
        { ...WITH_STAGING_CREDS, STAGING_SUPABASE_PROJECT_REF: PROD_REF },
        { ...WITH_STAGING_CREDS, SUPABASE_URL: PROD_URL },
        { ...WITH_STAGING_CREDS, SUPABASE_SERVICE_ROLE_KEY: PROD_SERVICE_LIKE },
        { ...WITH_STAGING_CREDS, SUPABASE_URL: "https://otherprojectref00000.supabase.co" }
    ]) {
        H.reset(); previewEnv(over);
        const env = H.load("netlify/lib/environment.js");
        assert.strictEqual(env.getServerSupabaseConfig().ok, false, JSON.stringify(over).slice(0, 120));
        assert.strictEqual(env.createServiceClient("test"), null);
        assert.deepStrictEqual(H.db.clientUrls, []);
    }
});

test("[7][8] preview with staging credentials: staging only; report, confirmation, lessons and onboarding send NOTHING even with every switch on and a Resend key present", async () => {
    previewEnv({ ...WITH_STAGING_CREDS, ...ALL_SWITCHES_ON, ...LINK_SECRET });
    H.db.missingTables.delete("email_deliveries");
    H.db.tables.email_deliveries = [];
    const lead = H.addLead({ email: "ada@example.com", marketing_consent: false, marketing_consent_requested_at: new Date().toISOString(),
                             marketing_consent_source: "quiz_page", marketing_consent_version: "quiz-optin-2026-11-17" });
    H.addLead({ email: "due@example.com", email_status: "Sent", last_email_sent: new Date(Date.now() - 25 * 3600e3).toISOString(),
                next_email_due: new Date(Date.now() - 3600e3).toISOString(), marketing_consent: true });
    (H.db.tables.purchases = []).push({ id: "p-1", email: "buyer@example.com", lead_id: null, product_code: "21-days-to-glow", provider: "manual",
        provider_order_ref: "SYN-1", verified_at: new Date().toISOString(), verified_by: "synthetic", refunded_at: null });
    const r = await everyFunction(lead);
    assert(H.db.clientUrls.length > 0 && H.db.clientUrls.every((u) => u === STAGING_URL), "clients: " + H.db.clientUrls.join(","));
    assert.strictEqual(H.mail.attempts.length, 0, "the email provider was called");
    assert.notStrictEqual(r["send-email"], 200, "a report was reported as sent");
    assert(!H.db.ops.some((o) => o.changes && o.changes.marketing_consent_token_hash),
        "a confirmation token was issued (the switch must be forced off in previews)");
    const features = await H.load("netlify/functions/email-features.js").handler({ httpMethod: "GET" });
    assert.deepStrictEqual(JSON.parse(features.body), { consentConfirmation: false });
});

test("[8] the shared send helper blocks before any provider call outside production", async () => {
    previewEnv({ ...WITH_STAGING_CREDS });
    const c = H.load("netlify/lib/email-common.js");
    const provider = { emails: { send: async () => { throw new Error("provider must not be called"); } } };
    const out = await c.sendWithResend(provider, { to: "x@example.com", subject: "s", html: "h" }, "k");
    assert.deepStrictEqual(out, { ok: false, blocked: true });
    const env = H.load("netlify/lib/environment.js");
    assert.strictEqual(env.createMailer("re_synthetic_key"), null);
    for (const s of ["EMAIL_CONFIRMATION_ENABLED", "EMAIL_SEQUENCE_ENABLED", "CUSTOMER_ONBOARDING_ENABLED"]) {
        process.env[s] = "true";
        assert.strictEqual(env.marketingSwitch(s), false, s);
    }
});

test("[7] a build-time preview context cannot be overridden at run time; unknown context = non-production", async () => {
    H.setEnv({ EMERRIMENT_CONTEXT: "production", CONTEXT: "production", ...WITH_PROD_CREDS });
    const env = H.load("netlify/lib/environment.js");
    const ctxPath = require.resolve(path.join(H.ROOT, "netlify/lib/deploy-context.json"));
    require.cache[ctxPath] = { id: ctxPath, filename: ctxPath, loaded: true, exports: { context: "deploy-preview", deployPrimeUrl: "https://" + PREVIEW_HOST } };
    try {
        assert.strictEqual(env.getDeployContext(), "deploy-preview");
        assert.strictEqual(env.getServerSupabaseConfig().ok, false);
        assert.strictEqual(env.emailDeliveryAllowed(), false);
        assert.strictEqual(env.getSiteUrl(), "https://" + PREVIEW_HOST);
    } finally {
        delete require.cache[ctxPath];
    }
    H.setEnv({ EMERRIMENT_CONTEXT: undefined, ...WITH_PROD_CREDS });
    const env2 = H.load("netlify/lib/environment.js");
    assert.strictEqual(env2.getDeployContext(), "unconfigured");
    assert.strictEqual(env2.getServerSupabaseConfig().ok, false);
    assert.strictEqual(env2.emailDeliveryAllowed(), false);
});

test("[7] preview links never point at the production domain; no production-derived link signatures", async () => {
    previewEnv({ URL: "https://emerriment.com", ...WITH_PROD_CREDS });
    let c = H.load("netlify/lib/email-common.js");
    assert.strictEqual(c.getSiteUrl(), "https://" + PREVIEW_HOST);
    assert.strictEqual(c.signLink("unsubscribe", 1), null, "signed with a key derived from production credentials");
    H.setEnv({ EMERRIMENT_CONTEXT: "deploy-preview", URL: "https://emerriment.com" });
    c = H.load("netlify/lib/email-common.js");
    assert.strictEqual(c.getSiteUrl(), "https://preview.invalid");
});

test("[9] production behaviour unchanged: production credentials, links and sending", async () => {
    H.setEnv({ EMERRIMENT_CONTEXT: "production", SUPABASE_URL: PROD_URL, SUPABASE_SERVICE_ROLE_KEY: PROD_SERVICE_LIKE });
    H.addLead({ email: "ada@example.com" });
    const r = await H.load("netlify/functions/send-email.js").handler({ httpMethod: "POST", body: JSON.stringify(QUIZ) });
    assert.strictEqual(r.statusCode, 200, r.body);
    assert.deepStrictEqual(H.db.clientUrls, [PROD_URL]);
    assert.strictEqual(H.mail.sent.length, 1);
    assert.strictEqual(H.load("netlify/lib/email-common.js").getSiteUrl(), "https://emerriment216.netlify.app");
});

test("no function reads Supabase credentials, builds clients or Resend itself (all through environment.js)", () => {
    for (const f of tracked.filter((x) => /^netlify\/(functions|lib)\/.*\.js$/.test(x) && x !== "netlify/lib/environment.js")) {
        const s = read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
        assert(!/process\.env\.(SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)/.test(s), f + " reads Supabase credentials directly");
        assert(!/createClient\(|new Resend\(|require\("resend"\)|require\("@supabase\/supabase-js"\)/.test(s), f + " builds its own client");
    }
    assert(/createServiceClient\("ai-chat"\)/.test(read("netlify/functions/ai-chat.js")));
});

module.exports = suite;
