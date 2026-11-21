/* Authentication pages: console privacy and visible, accessible messages.
   Real login / signup / forgot-password / reset-password pages in jsdom with
   a simulated Supabase client that returns SYNTHETIC marker tokens, emails
   and user ids. Every console call is captured and must never contain them.
   Regression tests for the WP4B preview findings (login logged the full
   auth result; auth messages were set but never shown). No network. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const H = require("../email/helpers");
const { load } = require("./dom-harness");

const suite = H.createSuite("auth pages: console privacy and visible messages (jsdom)");
const { test } = suite;

const M = {
    access: "SYNTHETIC-ACCESS-TOKEN-7f3a91",
    refresh: "SYNTHETIC-REFRESH-TOKEN-c82e44",
    email: "marker-person@example.test",
    id: "11111111-2222-4333-8444-marker000001",
    password: "Synthetic-Password-For-Tests-1",
    name: "Marker Fullname"
};
const SESSION = { access_token: M.access, refresh_token: M.refresh, token_type: "bearer", expires_in: 3600, user: { id: M.id, email: M.email } };
const MARKER_USER = { id: M.id, email: M.email, user_metadata: { full_name: M.name } };
// Auth errors whose own text quotes the account (as Supabase/PostgREST errors can).
const LEAKY_ERROR = (message) => ({ name: "AuthApiError", status: 400, code: "invalid_credentials", message, details: "account " + M.email + " / " + M.id });

function assertNoMarkers(events) {
    const out = events.console.join("\n");
    for (const [k, v] of Object.entries(M)) {
        assert(!out.includes(v), `console output contains the synthetic ${k}: ` + events.console.filter((l) => l.includes(v)).join(" | ").slice(0, 300));
    }
}

const visibleMessage = (el) => el.classList.contains("show") && el.textContent.trim().length > 0;

async function submitLogin(p, email = M.email, password = M.password) {
    p.document.getElementById("email").value = email;
    p.document.getElementById("password").value = password;
    p.document.getElementById("loginForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(400);
}

/* ---------- Console privacy ---------- */

test("login success: the synthetic session tokens, email, user id and password never reach the console", async () => {
    const p = await load("login.html", { before: (w) => { w.__signin = { data: { user: MARKER_USER, session: SESSION }, error: null }; } });
    await submitLogin(p);
    assert(p.events.console.length > 0, "harness captured no console output at all");
    assert(p.events.console.some((l) => /Login result/.test(l)), "expected a status-only login log line");
    assertNoMarkers(p.events);
    p.window.close();
});

test("login failure: an auth error quoting the account is logged only as {kind, code, status}", async () => {
    const p = await load("login.html", { before: (w) => { w.__signin = { data: {}, error: LEAKY_ERROR("Invalid login credentials for " + M.email) }; } });
    await submitLogin(p);
    assertNoMarkers(p.events);
    assert(p.events.console.some((l) => /AuthApiError/.test(l) && /invalid_credentials/.test(l)), "safe error category missing");
    p.window.close();
});

test("login: an exception thrown by the auth library is not logged raw", async () => {
    const p = await load("login.html", { before: (w) => { w.__signinThrows = true; } });
    p.window.EMAuth.login = async () => { const e = new Error("boom for " + M.email + " token " + M.access); e.name = "TypeError"; throw e; };
    await submitLogin(p);
    assertNoMarkers(p.events);
    assert.match(p.document.getElementById("loginMessage").textContent, /Unable to log in right now/);
    p.window.close();
});

test("signup success with a session: tokens, email, id and name never reach the console", async () => {
    const p = await load("signup.html", { signedIn: false, before: (w) => { w.__signup = { data: { user: MARKER_USER, session: SESSION }, error: null }; } });
    p.document.getElementById("fullName").value = M.name;
    p.document.getElementById("email").value = M.email;
    p.document.getElementById("password").value = M.password;
    p.document.getElementById("signupForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(400);
    assertNoMarkers(p.events);
    p.window.close();
});

test("signup error quoting the account: logged only as a category", async () => {
    const p = await load("signup.html", { signedIn: false, before: (w) => { w.__signup = { data: {}, error: LEAKY_ERROR("User already registered: " + M.email) }; } });
    p.document.getElementById("fullName").value = M.name;
    p.document.getElementById("email").value = M.email;
    p.document.getElementById("password").value = M.password;
    p.document.getElementById("signupForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(400);
    assertNoMarkers(p.events);
    p.window.close();
});

test("forgot password: the email address entered is not logged", async () => {
    const p = await load("forgot-password.html", { signedIn: false });
    p.document.getElementById("email").value = M.email;
    p.document.getElementById("resetRequestForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(400);
    assertNoMarkers(p.events);
    p.window.close();
});

test("reset password: the updated user record and session are not logged", async () => {
    const p = await load("reset-password.html", { before: (w) => { w.__updateUser = { data: { user: MARKER_USER, session: SESSION }, error: null }; } });
    await p.settle(500);
    p.document.getElementById("password").value = M.password;
    p.document.getElementById("confirmPassword").value = M.password;
    p.document.getElementById("passwordForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(400);
    assertNoMarkers(p.events);
    p.window.close();
});

test("source: auth pages never pass results, sessions, users, emails or raw errors to console calls", () => {
    const files = ["login.html", "signup.html", "forgot-password.html", "reset-password.html", "js/auth.js", "js/auth-callback.js", "Dashboard/dashboard-auth.js"];
    const unsafe = /console\.(log|info|warn|error|debug)\(([^;]*?),\s*(result|session|data|data\.user|data\.session|result\.user|result\.session|user|email|password|error|error\.message|sent)\s*\)/g;
    for (const f of files) {
        const src = fs.readFileSync(path.join(H.ROOT, f), "utf8");
        const hits = [...src.matchAll(unsafe)].map((m) => m[0].replace(/\s+/g, " ").slice(0, 120));
        assert.deepStrictEqual(hits, [], f + " logs an unsafe value");
        assert(!/console\.\w+\(\s*error\s*\)/.test(src), f + " logs a raw error object");
    }
});

/* ---------- Visible, accessible messages ---------- */

test("login: a failed login SHOWS the error (visible class, alert role) and re-enables the button", async () => {
    const p = await load("login.html", { before: (w) => { w.__signin = { data: {}, error: { message: "Invalid login credentials" } }; } });
    await submitLogin(p, "user@example.test", "placeholder-password");
    const msg = p.document.getElementById("loginMessage");
    assert(visibleMessage(msg), "error text set but not shown (missing .show)");
    assert(msg.classList.contains("error"));
    assert.strictEqual(msg.getAttribute("role"), "alert");
    assert.match(msg.textContent, /Incorrect email or password/);
    const button = p.document.getElementById("loginButton");
    assert.strictEqual(button.disabled, false);
    assert.strictEqual(button.textContent.trim(), "Log In");
    assert.strictEqual(button.getAttribute("aria-busy"), null);
    p.window.close();
});

test("login: the message box starts hidden and is a polite live region", async () => {
    const p = await load("login.html");
    const msg = p.document.getElementById("loginMessage");
    assert(!msg.classList.contains("show"));
    assert.strictEqual(msg.getAttribute("aria-live"), "polite");
    assert.strictEqual(msg.getAttribute("role"), "status");
    p.window.close();
});

test("login: empty fields show a visible error and do not call Supabase", async () => {
    const p = await load("login.html");
    let calls = 0;
    const orig = p.window.EMAuth.login;
    p.window.EMAuth.login = async (...a) => { calls++; return orig(...a); };
    await submitLogin(p, "", "");
    const msg = p.document.getElementById("loginMessage");
    assert(visibleMessage(msg) && msg.classList.contains("error"));
    assert.strictEqual(calls, 0);
    p.window.close();
});

test("login: while signing in the button is disabled and busy, with a visible status", async () => {
    const p = await load("login.html");
    let release;
    p.window.EMAuth.login = () => new Promise((r) => { release = r; });
    p.document.getElementById("email").value = "user@example.test";
    p.document.getElementById("password").value = "placeholder-password";
    p.document.getElementById("loginForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(50);
    const button = p.document.getElementById("loginButton");
    const msg = p.document.getElementById("loginMessage");
    assert.strictEqual(button.disabled, true);
    assert.strictEqual(button.getAttribute("aria-busy"), "true");
    assert(visibleMessage(msg) && msg.classList.contains("info"));
    release({ success: false, error: "Incorrect email or password." });
    await p.settle(50);
    assert.strictEqual(button.disabled, false);
    p.window.close();
});

test("login: success after a failure clears the error styling", async () => {
    const p = await load("login.html", { before: (w) => { w.__signin = { data: {}, error: { message: "Invalid login credentials" } }; } });
    await submitLogin(p, "user@example.test", "placeholder-password");
    const msg = p.document.getElementById("loginMessage");
    assert(msg.classList.contains("error"));
    p.window.__signin = null;   // default fake: successful sign-in
    await submitLogin(p, "user@example.test", "placeholder-password");
    assert(!msg.classList.contains("error"), "old error styling left behind");
    assert(msg.classList.contains("success") && visibleMessage(msg));
    assert.match(msg.textContent, /Login successful/);
    assert.notStrictEqual(msg.getAttribute("role"), "alert");
    p.window.close();
});

test("login: a network failure gets a plain-language message, not 'Failed to fetch'", async () => {
    const p = await load("login.html", { before: (w) => { w.__signin = { data: {}, error: { name: "AuthRetryableFetchError", status: 0, message: "Failed to fetch" } }; } });
    await submitLogin(p, "user@example.test", "placeholder-password");
    const msg = p.document.getElementById("loginMessage");
    assert(visibleMessage(msg) && msg.classList.contains("error"));
    assert.match(msg.textContent, /couldn't reach the sign-in service/);
    assert(!/Failed to fetch/.test(msg.textContent));
    p.window.close();
});

test("login: error text is rendered as text, never HTML", async () => {
    const p = await load("login.html", { before: (w) => { w.__signin = { data: {}, error: { message: "<img src=x onerror=alert(1)>" } }; } });
    await submitLogin(p, "user@example.test", "placeholder-password");
    const msg = p.document.getElementById("loginMessage");
    assert.strictEqual(msg.querySelector("img"), null);
    assert(msg.textContent.includes("<img src=x"));
    p.window.close();
});

test("signup: the 'check your email' confirmation and errors are visible", async () => {
    for (const [signup, kind, text] of [
        [{ data: { user: { id: "u" }, session: null }, error: null }, "success", /Almost done/],
        [{ data: {}, error: { message: "User already registered" } }, "error", /already exists/]
    ]) {
        const p = await load("signup.html", { signedIn: false, before: (w) => { w.__signup = signup; } });
        p.document.getElementById("fullName").value = "Test User";
        p.document.getElementById("email").value = "new@example.test";
        p.document.getElementById("password").value = "placeholder-password";
        p.document.getElementById("signupForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
        await p.settle(400);
        const msg = p.document.getElementById("signupMessage");
        assert(visibleMessage(msg), "signup message not shown");
        assert(msg.classList.contains(kind), "expected " + kind);
        assert.match(msg.textContent, text);
        p.window.close();
    }
});

test("forgot password: the neutral 'link sent' reply and the empty-email error are visible", async () => {
    const p = await load("forgot-password.html", { signedIn: false });
    const form = p.document.getElementById("resetRequestForm");
    const msg = p.document.getElementById("resetMessage");
    form.dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(100);
    assert(visibleMessage(msg) && msg.classList.contains("error"));
    p.document.getElementById("email").value = "user@example.test";
    form.dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(400);
    assert(visibleMessage(msg) && msg.classList.contains("success"));
    assert.match(msg.textContent, /If an account exists/);
    p.window.close();
});

test("reset password: mismatch error, 'no reset session' and expired-link notices are visible", async () => {
    let p = await load("reset-password.html");
    await p.settle(500);
    p.document.getElementById("password").value = "a-new-long-password";
    p.document.getElementById("confirmPassword").value = "different-password";
    p.document.getElementById("passwordForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(100);
    let msg = p.document.getElementById("passwordMessage");
    assert(visibleMessage(msg) && /do not match/.test(msg.textContent));
    p.window.close();

    p = await load("reset-password.html", { signedIn: false });
    await p.settle(500);
    msg = p.document.getElementById("passwordMessage");
    assert(visibleMessage(msg), "'no reset session' notice not shown");

    p.window.close();
    p = await load("reset-password.html", { signedIn: false, hash: "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired" });
    await p.settle(500);
    msg = p.document.getElementById("passwordMessage");
    assert(visibleMessage(msg), "expired-link notice not shown");
    p.window.close();
});

test("css: .auth-message is hidden until .show is added (no empty boxes on load)", () => {
    const css = fs.readFileSync(path.join(H.ROOT, "css/auth.css"), "utf8");
    assert(/\.auth-message\s*\{[^}]*display:\s*none/.test(css));
    assert(/\.auth-message\.show\s*\{[^}]*display:\s*block/.test(css));
    assert(/\.auth-message\.info\s*\{/.test(css), "no style for the info state");
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
