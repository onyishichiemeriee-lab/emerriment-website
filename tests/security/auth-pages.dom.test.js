/* Real login.html and dashboard.html in jsdom with a simulated Supabase
   client: fresh login, restored session, signed-out redirect, failing
   sections, missing Supabase library. No network, no real accounts.
   Regression tests for "blank page after login" (2026-11-17). */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { JSDOM, ResourceLoader, VirtualConsole } = require("jsdom");
const H = require("../email/helpers");

const suite = H.createSuite("auth pages in a browser DOM (jsdom)");
const { test } = suite;

const USER = { id: "00000000-0000-4000-8000-00000000000a", email: "user@example.test", email_confirmed_at: "2026-11-16T09:00:00Z" };
const ARTICLE = { id: "a1", title: "Acne basics", slug: "acne", category: "Acne", summary: "Summary", content: "Body", featured_image: "https://example.test/a.jpg", reading_time: 4, status: "published", views: 3, seo_keywords: ["acne", "pimples", "breakouts"], related_conditions: ["acne", "oily skin"], created_at: "2026-11-01T00:00:00Z", published_at: null, difficulty: "Beginner", author: "EMerriment", is_featured: true };
const PRODUCT = { id: "p1", name: "Gentle cleanser", description: "d", category: "Cleanser", price: null, selar_link: "https://selar.com/x", featured: false, quiz_recommended: true, image: null, is_approved: true, ingredients: [], skin_types: [], concerns: ["acne"], benefits: ["gentle", "daily"], related_articles: [] };

function fakeClientSource(opts) {
    return `
    window.supabase = { createClient: function () {
      const user = ${opts.signedIn ? JSON.stringify(USER) : "null"};
      return {
        auth: {
          getUser: async () => ({ data: { user }, error: user ? null : { message: "Auth session missing!" } }),
          getSession: async () => ({ data: { session: user ? { access_token: "x", user } : null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
          signOut: async () => ({ error: null }),
          signInWithPassword: async () => (window.__signin || { data: { user: ${JSON.stringify(USER)}, session: { access_token: "x" } }, error: null }),
          resend: async (args) => { (window.__resendCalls = window.__resendCalls || []).push(args); return window.__resend || { data: {}, error: null }; },
          updateUser: async (args) => { window.__updateUserCalls = (window.__updateUserCalls || 0) + 1; return { data: { user }, error: null }; }
        },
        from: (t) => window.__fakeFrom(t),
        rpc: async () => ({ data: null, error: null })
      };
    } };`;
}

function makeFrom(rows) {
    return (table) => {
        const state = { single: false, maybe: false };
        const b = new Proxy({}, {
            get(_t, prop) {
                if (prop === "then") {
                    return (resolve, reject) => {
                        const d = rows[table] || [];
                        if (d instanceof Error) return Promise.reject(d).then(resolve, reject);
                        let data = d;
                        if (state.single || state.maybe) data = d[0] || null;
                        return Promise.resolve({ data, error: null, count: d.length }).then(resolve, reject);
                    };
                }
                if (prop === "single") return () => { state.single = true; return b; };
                if (prop === "maybeSingle") return () => { state.maybe = true; return b; };
                return () => b;
            }
        });
        return b;
    };
}

// Pages run through the real /js/supabase-config.js guard with a
// staging-style runtime configuration (a fake non-production project and
// a matching anon test token), exactly as on a deploy preview.
const TEST_PROJECT_REF = "stagingtestproject01";
const b64url = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const TEST_RUNTIME_JS = "window.EMERRIMENT_RUNTIME = Object.freeze(" + JSON.stringify({
    context: "deploy-preview",
    supabaseUrl: `https://${TEST_PROJECT_REF}.supabase.co`,
    supabaseAnonKey: `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ iss: "supabase", ref: TEST_PROJECT_REF, role: "anon" })}.test-signature-not-real`,
    reason: null
}) + ");";

function resolveExact(rel) {
    const file = path.join(H.ROOT, rel);
    return fs.existsSync(file) ? file : null;
}

// Loads a page; local files are served with EXACT case (stricter than Netlify).
async function load(page, { signedIn = true, rows = {}, supabaseLoads = true, before, hash = "" } = {}) {
    const events = { errors: [], navigations: 0, missing: [] };
    class Loader extends ResourceLoader {
        fetch(url) {
            if (/supabase-js/.test(url)) return Promise.resolve(Buffer.from(supabaseLoads ? fakeClientSource({ signedIn }) : ""));
            const u = new URL(url);
            if (u.hostname !== "local.test") return Promise.resolve(Buffer.from(""));
            const rel = decodeURIComponent(u.pathname).replace(/^\//, "");
            if (rel === "js/runtime-config.js") return Promise.resolve(Buffer.from(TEST_RUNTIME_JS));
            const file = resolveExact(rel);
            if (!file) events.missing.push(rel);
            return Promise.resolve(file ? fs.readFileSync(file) : Buffer.from(""));
        }
    }
    const vc = new VirtualConsole();
    vc.on("jsdomError", (e) => {
        const m = String(e && e.message || e);
        if (/Not implemented: navigation/.test(m)) events.navigations++;
        else events.errors.push(m.split("\n")[0]);
    });
    const dom = new JSDOM(fs.readFileSync(path.join(H.ROOT, page), "utf8"), {
        url: "https://local.test/" + page + hash, runScripts: "dangerously", resources: new Loader(), virtualConsole: vc, pretendToBeVisual: true,
        beforeParse(window) {
            window.__fakeFrom = makeFrom({ profiles: [{ id: USER.id, full_name: "Test User", email: USER.email, is_admin: false, current_skin_score: 0 }], encyclopedia_articles: [ARTICLE], products: [PRODUCT], ...rows });
            window.addEventListener("error", (e) => events.errors.push("uncaught: " + (e.error && e.error.message || e.message)));
            window.addEventListener("unhandledrejection", (e) => events.errors.push("unhandled rejection: " + (e.reason && e.reason.message || e.reason)));
            window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
            if (before) before(window);
        }
    });
    await new Promise((r) => dom.window.addEventListener("load", r));
    return { dom, window: dom.window, document: dom.window.document, events, settle: (ms = 300) => new Promise((r) => setTimeout(r, ms)) };
}

const visible = (el) => el && !el.hidden && el.style.display !== "none";

test("dashboard.html: every script it loads exists with the exact path (case-sensitive)", async () => {
    const html = fs.readFileSync(path.join(H.ROOT, "dashboard.html"), "utf8");
    const local = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map((m) => m[1]).filter((s) => !/^https?:/.test(s));
    assert(local.length >= 10);
    for (const src of local) assert(resolveExact(src), "missing (exact case): " + src);
    for (const id of ["dashboardLoader", "dashboardNotice", "welcomeMessage", "logoutBtn"]) {
        assert(html.includes(`id="${id}"`), id);
    }
});

test("fresh login: success message, then navigation to the dashboard", async () => {
    const p = await load("login.html");
    p.document.getElementById("email").value = "user@example.test";
    p.document.getElementById("password").value = "placeholder-password";
    p.document.getElementById("loginForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(900);
    assert.match(p.document.getElementById("loginMessage").textContent, /Login successful/);
    assert.strictEqual(p.events.navigations, 1, "navigation to dashboard.html was not attempted");
    assert.deepStrictEqual(p.events.errors, []);
    p.window.close();
});

test("login: unconfirmed email and wrong password show a clear message and no navigation", async () => {
    for (const [message, expected] of [["Email not confirmed", /confirm your email/i], ["Invalid login credentials", /Incorrect email or password/]]) {
        const p = await load("login.html", { before: (w) => { w.__signin = { data: {}, error: { message } }; } });
        p.document.getElementById("email").value = "user@example.test";
        p.document.getElementById("password").value = "placeholder-password";
        p.document.getElementById("loginForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
        await p.settle(400);
        assert.match(p.document.getElementById("loginMessage").textContent, expected);
        assert.strictEqual(p.events.navigations, 0);
        p.window.close();
    }
});

test("dashboard after login / restored session: personalised, loader removed, no error, sections rendered", async () => {
    const p = await load("dashboard.html");
    await p.settle();
    // Personalised greeting replaced the static "Welcome Back!" heading.
    assert.match(p.document.getElementById("welcomeMessage").textContent, /^Welcome back, .+!/);
    assert(!visible(p.document.getElementById("dashboardLoader")), "loader still visible");
    assert(!visible(p.document.getElementById("dashboardNotice")), "unexpected error notice");
    assert(p.document.body.textContent.includes("Acne basics"), "articles not rendered");
    assert.strictEqual(p.events.navigations, 0);
    assert.deepStrictEqual(p.events.errors, []);
    p.window.close();
});

test("dashboard for a brand-new user (no history, empty profile) still renders without errors", async () => {
    const p = await load("dashboard.html", { rows: { profiles: [{ id: USER.id, full_name: "", email: USER.email, is_admin: false }], quiz_results: [], reading_history: [], saved_articles: [], saved_products: [] } });
    await p.settle();
    assert(!visible(p.document.getElementById("dashboardLoader")));
    assert(p.document.getElementById("welcomeMessage").textContent.trim().length > 0);
    assert.deepStrictEqual(p.events.errors, []);
    p.window.close();
});

test("dashboard signed out: redirects to login, no error", async () => {
    const p = await load("dashboard.html", { signedIn: false });
    await p.settle();
    assert.strictEqual(p.events.navigations, 1);
    assert.deepStrictEqual(p.events.errors, []);
    p.window.close();
});

test("dashboard: a failing section is reported and does not stop the other sections", async () => {
    const p = await load("dashboard.html");
    await p.settle();
    p.window.loadPopularTopics = () => { throw new Error("simulated failure"); };
    const failed = await p.window.initializeDashboard(USER);
    // Array created inside the page (other JS realm): compare by value.
    assert.strictEqual(JSON.stringify(failed), JSON.stringify(["popular topics"]));
    assert(p.document.body.textContent.includes("Acne basics"), "other sections must still render");
    p.window.close();
});

test("dashboard: if the Supabase library cannot load, a visible message replaces the blank page", async () => {
    const p = await load("dashboard.html", { supabaseLoads: false });
    await p.settle();
    const notice = p.document.getElementById("dashboardNotice");
    assert(visible(notice), "no visible message");
    assert.match(notice.textContent, /couldn't connect/i);
    assert(!visible(p.document.getElementById("dashboardLoader")), "loader still visible");
    assert(!p.events.errors.some((e) => /uncaught/.test(e)), "uncaught error: " + p.events.errors.join("; "));
    p.window.close();
});

test("dashboard notice renders text only (no HTML injection)", async () => {
    const p = await load("dashboard.html");
    await p.settle();
    p.window.showError("<img src=x onerror=alert(1)>");
    const notice = p.document.getElementById("dashboardNotice");
    assert(!notice.querySelector("img"));
    assert(notice.textContent.includes("<img src=x"));
    p.window.close();
});

/* ---------- Email links: expired / invalid / successful ---------- */

const EXPIRED = "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired";

test("homepage after an EXPIRED confirmation link: visible explanation, error removed from the address bar", async () => {
    const p = await load("index.html", { signedIn: false, hash: EXPIRED });
    await p.settle();
    const notice = p.document.querySelector(".auth-callback-notice");
    assert(notice, "no notice shown");
    assert.match(notice.textContent, /expired or was already used/);
    assert(notice.querySelector('a[href="login.html"]'));
    assert.strictEqual(p.window.location.hash, "", "error details left in the address bar");
    p.window.close();
});

test("homepage after a SUCCESSFUL confirmation link: 'email confirmed' notice; tokens left to supabase-js and never shown", async () => {
    const p = await load("index.html", { hash: "#access_token=secret-token-value&refresh_token=r&type=signup&expires_in=3600" });
    await p.settle();
    const notice = p.document.querySelector(".auth-callback-notice");
    assert(notice && /email address is confirmed/.test(notice.textContent));
    assert(!p.document.body.innerHTML.includes("secret-token-value"), "token rendered in the page");
    assert.strictEqual(p.window.EMAuthCallback.hasTokens, true);
    p.window.close();
});

test("homepage without email-link parameters: no notice", async () => {
    const p = await load("index.html", { signedIn: false });
    await p.settle();
    assert.strictEqual(p.document.querySelector(".auth-callback-notice"), null);
    p.window.close();
});

test("reset page after an EXPIRED reset link: message with a new-link action, form disabled", async () => {
    const p = await load("reset-password.html", { signedIn: false, hash: EXPIRED });
    await p.settle();
    const message = p.document.getElementById("passwordMessage");
    assert.match(message.textContent, /reset link has expired/);
    assert(message.querySelector('a[href="forgot-password.html"]'));
    assert(p.document.getElementById("password").disabled, "form still enabled");
    p.window.close();
});

test("reset page opened without a reset session: explains how to get a valid link", async () => {
    const p = await load("reset-password.html", { signedIn: false });
    await p.settle(500);
    const message = p.document.getElementById("passwordMessage");
    assert.match(message.textContent, /Open this page from the link in your password reset email/);
    assert(message.querySelector('a[href="forgot-password.html"]'));
    p.window.close();
});

test("reset page with a valid reset session: no warning; new password saved, then back to login", async () => {
    const p = await load("reset-password.html");
    await p.settle(500);
    assert.strictEqual(p.document.getElementById("passwordMessage").textContent.trim(), "");
    p.document.getElementById("password").value = "a-new-long-password";
    p.document.getElementById("confirmPassword").value = "a-new-long-password";
    p.document.getElementById("passwordForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(1900);
    assert.match(p.document.getElementById("passwordMessage").textContent, /Password updated successfully/);
    assert.strictEqual(p.window.__updateUserCalls, 1);
    assert.strictEqual(p.events.navigations, 1, "no redirect to login.html");
    p.window.close();
});

test("login with an unconfirmed account: offers to resend the confirmation email (neutral reply)", async () => {
    const p = await load("login.html", { before: (w) => { w.__signin = { data: {}, error: { message: "Email not confirmed" } }; } });
    p.document.getElementById("email").value = " User@Example.test ";
    p.document.getElementById("password").value = "placeholder-password";
    p.document.getElementById("loginForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(400);
    const resend = p.document.getElementById("resendConfirmation");
    assert(resend, "no resend option");
    resend.click();
    await p.settle(300);
    assert.strictEqual(JSON.stringify(p.window.__resendCalls), JSON.stringify([{ type: "signup", email: "user@example.test" }]));
    assert.match(p.document.getElementById("loginMessage").textContent, /If this account still needs confirming/);
    p.window.close();
});

test("resend confirmation: Supabase rate limit is explained in plain words", async () => {
    const p = await load("login.html", { before: (w) => {
        w.__signin = { data: {}, error: { message: "Email not confirmed" } };
        w.__resend = { data: null, error: { message: "For security purposes, you can only request this after 52 seconds." } };
    } });
    p.document.getElementById("email").value = "user@example.test";
    p.document.getElementById("password").value = "placeholder-password";
    p.document.getElementById("loginForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(400);
    p.document.getElementById("resendConfirmation").click();
    await p.settle(300);
    assert.match(p.document.getElementById("loginMessage").textContent, /wait a minute/);
    p.window.close();
});

test("wrong password: no resend option is offered", async () => {
    const p = await load("login.html", { before: (w) => { w.__signin = { data: {}, error: { message: "Invalid login credentials" } }; } });
    p.document.getElementById("email").value = "user@example.test";
    p.document.getElementById("password").value = "placeholder-password";
    p.document.getElementById("loginForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(400);
    assert.strictEqual(p.document.getElementById("resendConfirmation"), null);
    p.window.close();
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
