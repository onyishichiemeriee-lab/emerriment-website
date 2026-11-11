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

test("authentication files were not modified by the security work", async () => {
    const { execFileSync } = require("child_process");
    const changed = execFileSync("git", ["diff", "--name-only", "9795f887c86b36f1365d5e5ba0a40b52a1cf4bad", "--",
        "js/auth.js", "js/supabase.js", "login.html", "signup.html", "forgot-password.html", "reset-password.html",
        "Dashboard", "dashboard.html", "admin/admin-authCMS.js", "admin/js/login.js"], { cwd: H.ROOT, encoding: "utf8" }).trim();
    assert.strictEqual(changed, "", "changed: " + changed);
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
