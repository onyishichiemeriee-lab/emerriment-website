/* Regression tests for Authentication V3 (js/auth.js) and the dashboard
   auth guard (Dashboard/dashboard-auth.js). These files were NOT changed
   by the security work; the tests pin their current behaviour so later
   RLS changes can be checked against it. Supabase is faked — no network. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const H = require("../email/helpers");

const suite = H.createSuite("auth regression (fake Supabase)");
const { test } = suite;

function fakeClient(overrides = {}) {
    const calls = [];
    const auth = {
        signUp: async (args) => { calls.push(["signUp", args]); return { data: { user: { id: "u1" }, session: null }, error: null }; },
        signInWithPassword: async (args) => { calls.push(["signIn", args]); return { data: { user: { id: "u1" }, session: { access_token: "x" } }, error: null }; },
        signOut: async () => { calls.push(["signOut"]); return { error: null }; },
        resetPasswordForEmail: async (email, opts) => { calls.push(["reset", email, opts]); return { error: null }; },
        updateUser: async (args) => { calls.push(["updateUser", args]); return { data: {}, error: null }; },
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: (cb) => { calls.push(["onAuth"]); return { data: { subscription: { unsubscribe() {} } } }; },
        ...overrides
    };
    return { client: { auth, from: () => { throw new Error("auth code must not query tables directly here"); } }, calls };
}

function loadAuth(overrides) {
    const { client, calls } = fakeClient(overrides);
    const window = { supabaseClient: client, location: { origin: "https://emerriment.com", href: "" } };
    const context = { window, location: window.location, console: { log() {}, error() {}, warn() {} }, setTimeout, Promise, String, Error, Object, JSON };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(H.ROOT, "js", "auth.js"), "utf8"), context);
    return { EMAuth: window.EMAuth, calls, context };
}

test("js/auth.js loads and exposes the EMAuth API", async () => {
    const { EMAuth } = loadAuth();
    for (const fn of ["signup", "login", "logout", "requestPasswordReset"]) {
        assert.strictEqual(typeof EMAuth[fn], "function", fn);
    }
});

test("signup validates input and normalises the email", async () => {
    const { EMAuth, calls } = loadAuth();
    assert.strictEqual((await EMAuth.signup("", "a@b.co", "longpassword")).success, false);
    assert.strictEqual((await EMAuth.signup("Ada", "a@b.co", "short")).success, false);
    const ok = await EMAuth.signup("  Ada  ", "  ADA@Example.COM ", "longpassword");
    assert.strictEqual(ok.success, true);
    assert.strictEqual(ok.requiresConfirmation, true);
    const signUp = calls.find((c) => c[0] === "signUp")[1];
    assert.strictEqual(signUp.email, "ada@example.com");
    assert.strictEqual(signUp.options.data.full_name, "Ada");
    assert(!JSON.stringify(signUp).includes("is_admin"), "signup must not send is_admin");
});

test("login normalises the email and reports failures safely", async () => {
    const { EMAuth, calls } = loadAuth();
    const ok = await EMAuth.login(" ADA@example.com ", "pw");
    assert.strictEqual(ok.success, true);
    assert.strictEqual(calls.find((c) => c[0] === "signIn")[1].email, "ada@example.com");
    const bad = await loadAuth({ signInWithPassword: async () => ({ data: {}, error: { message: "Invalid login credentials" } }) }).EMAuth.login("a@b.co", "x");
    assert.strictEqual(bad.success, false);
    assert.strictEqual(typeof bad.error, "string");
});

test("logout and password reset call Supabase auth", async () => {
    const { EMAuth, calls } = loadAuth();
    assert.strictEqual((await EMAuth.logout()).success, true);
    await EMAuth.requestPasswordReset(" ada@example.com ");
    assert(calls.some((c) => c[0] === "signOut"));
    assert(calls.some((c) => c[0] === "reset"));
});

test("dashboard guard redirects anonymous visitors to login", async () => {
    const window = { location: { href: "" } };
    const context = {
        window, console: { log() {}, error() {} },
        supabaseClient: {
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
                signOut: async () => ({}),
                onAuthStateChange: () => ({})
            }
        },
        document: { addEventListener() {}, getElementById: () => null },
        Promise
    };
    context.window.supabaseClient = context.supabaseClient;
    vm.createContext(context);
    const src = fs.readFileSync(path.join(H.ROOT, "Dashboard", "dashboard-auth.js"), "utf8");
    vm.runInContext(src.replace(/window\.location/g, "location") + "\nthis.checkAuthentication = checkAuthentication;",
        Object.assign(context, { location: window.location }));
    const user = await context.checkAuthentication();
    assert.strictEqual(user, null);
    assert.strictEqual(window.location.href, "login.html");
});

/* ---------- Redirect construction (production domain) ---------- */

function loadAuthAt(origin, overrides) {
    const { client, calls } = fakeClient(overrides);
    const window = { supabaseClient: client, location: { origin, href: "" } };
    const context = { window, location: window.location, console: { log() {}, error() {}, warn() {} }, setTimeout, Promise, String, Error, Object, JSON };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(H.ROOT, "js", "auth.js"), "utf8"), context);
    return { EMAuth: window.EMAuth, calls };
}

test("signup sends no emailRedirectTo: confirmation links go to the Supabase Site URL", async () => {
    const { EMAuth, calls } = loadAuthAt("https://emerriment.com");
    await EMAuth.signup("Ada", "ada@example.com", "longpassword");
    const args = calls.find((c) => c[0] === "signUp")[1];
    assert.strictEqual(args.options.emailRedirectTo, undefined,
        "signup relies on the Site URL (must be https://emerriment.com in Supabase)");
});

test("password reset returns to /reset-password.html on the CURRENT origin", async () => {
    for (const origin of ["https://emerriment.com", "https://emerriment216.netlify.app", "http://localhost:8888"]) {
        const { EMAuth, calls } = loadAuthAt(origin);
        await EMAuth.requestPasswordReset(" ada@example.com ");
        const [, email, opts] = calls.find((c) => c[0] === "reset");
        assert.strictEqual(email, "ada@example.com");
        assert.strictEqual(opts.redirectTo, origin + "/reset-password.html", origin);
    }
});

test("reset redirect cannot be steered by user input (no open redirect)", async () => {
    const { EMAuth, calls } = loadAuthAt("https://emerriment.com");
    await EMAuth.requestPasswordReset("ada@example.com?redirect=https://evil.example");
    const [, , opts] = calls.find((c) => c[0] === "reset");
    assert.strictEqual(opts.redirectTo, "https://emerriment.com/reset-password.html");
    const src = fs.readFileSync(path.join(H.ROOT, "js", "auth.js"), "utf8");
    assert(!/URLSearchParams|searchParams|returnTo/.test(src), "auth.js must not read redirect targets from the URL");
    for (const page of ["login.html", "signup.html", "reset-password.html"]) {
        const html = fs.readFileSync(path.join(H.ROOT, page), "utf8");
        for (const m of html.matchAll(/location\.href\s*=\s*([^;]+);/g)) {
            assert(/^\s*"(dashboard|login)\.html"\s*$/.test(m[1]), `${page}: post-auth redirect must be a fixed page, got ${m[1].trim()}`);
        }
    }
});

test("password update requires a recovery session and an 8+ character password", async () => {
    const noSession = loadAuthAt("https://emerriment.com");
    const r1 = await noSession.EMAuth.updatePassword("longpassword");
    assert.strictEqual(r1.success, false);
    assert(/expired/i.test(r1.error));
    assert(!noSession.calls.some((c) => c[0] === "updateUser"));

    const withSession = loadAuthAt("https://emerriment.com", {
        getSession: async () => ({ data: { session: { access_token: "x" } }, error: null })
    });
    assert.strictEqual((await withSession.EMAuth.updatePassword("short")).success, false);
    const r2 = await withSession.EMAuth.updatePassword("new-long-password");
    assert.strictEqual(r2.success, true);
    // JSON comparison: the object was created inside the VM context (different Object prototype).
    assert.strictEqual(JSON.stringify(withSession.calls.find((c) => c[0] === "updateUser")[1]), JSON.stringify({ password: "new-long-password" }));
});

test("session handling: persisted, auto-refreshed, and recovered from email links in the URL", async () => {
    const src = fs.readFileSync(path.join(H.ROOT, "js", "supabase.js"), "utf8");
    for (const opt of ["persistSession: true", "autoRefreshToken: true", "detectSessionInUrl: true"]) {
        assert(src.includes(opt), opt);
    }
    // Pages that receive Supabase email links must load the client that
    // processes the token in the URL.
    for (const page of ["index.html", "reset-password.html", "dashboard.html", "login.html"]) {
        const html = fs.readFileSync(path.join(H.ROOT, page), "utf8");
        assert(/src="js\/supabase\.js"/.test(html), page + " does not load js/supabase.js");
    }
});

test("authentication files were not modified by the security work", async () => {
    const { execFileSync } = require("child_process");
    const changed = execFileSync("git", ["diff", "--name-only", "9795f887c86b36f1365d5e5ba0a40b52a1cf4bad", "--",
        "js/auth.js", "js/supabase.js", "login.html", "forgot-password.html", "reset-password.html",
        "Dashboard", "dashboard.html", "admin/admin-authCMS.js", "admin/js/login.js"], { cwd: H.ROOT, encoding: "utf8" }).trim();
    assert.strictEqual(changed, "", "changed: " + changed);
});

test("signup.html: only the confirmation message changed; it names the sender, mentions Spam, and does not reveal existing accounts", async () => {
    const html = fs.readFileSync(path.join(H.ROOT, "signup.html"), "utf8");
    // Still the same auth call and fixed post-signup redirect.
    assert(/await\s+EMAuth\.signup\(\s*fullName,\s*email,\s*password\s*\)/.test(html));
    assert(/window\.location\.href\s*=\s*"dashboard\.html"/.test(html));
    const msg = html.split("result.requiresConfirmation ||")[1].split("return;")[0];
    assert(msg.includes("auth@mail.emerriment.com"), "sender address");
    assert(/Spam/.test(msg), "spam hint");
    assert(/Already have an account with this email\? Log in or reset your password/.test(msg));
    assert(!/already (registered|exists)|is taken/i.test(msg), "must not confirm that an account exists");
    // One message for both cases: no branch on identities.
    assert(!/identities/.test(html), "signup page must not distinguish existing accounts");
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
