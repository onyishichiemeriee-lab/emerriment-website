/* Shared jsdom harness for the page tests: loads a real page with a
   simulated Supabase client and a staging-style runtime configuration, and
   records navigations, errors and EVERY console call (deeply serialised, so
   tests can prove that tokens, emails or user ids never reach the console).
   No network, no real accounts. */
"use strict";

const fs = require("fs");
const path = require("path");
const util = require("util");
const { JSDOM, ResourceLoader, VirtualConsole } = require("jsdom");
const H = require("../email/helpers");

const USER = { id: "00000000-0000-4000-8000-00000000000a", email: "user@example.test", email_confirmed_at: "2026-11-16T09:00:00Z" };
const ARTICLE = { id: "a1", title: "Acne basics", slug: "acne", category: "Acne", summary: "Summary", content: "Body", featured_image: "https://example.test/a.jpg", reading_time: 4, status: "published", views: 3, seo_keywords: ["acne", "pimples", "breakouts"], related_conditions: ["acne", "oily skin"], created_at: "2026-11-01T00:00:00Z", published_at: null, difficulty: "Beginner", author: "EMerriment", is_featured: true };
const PRODUCT = { id: "p1", name: "Gentle cleanser", description: "d", category: "Cleanser", price: null, selar_link: "https://selar.com/x", featured: false, quiz_recommended: true, image: null, is_approved: true, ingredients: [], skin_types: [], concerns: ["acne"], benefits: ["gentle", "daily"], related_articles: [] };

// The REAL supabase-js UMD bundle (node_modules) is served wherever a page
// loads the library from the CDN, so its genuine global `var supabase`
// declaration exists exactly as in a browser (WP4I: a page script that also
// declared `const supabase` died with a SyntaxError in real browsers, and the
// old plain-object fake hid it). Only createClient is replaced by the offline
// fake below; nothing contacts the network.
const REAL_SUPABASE_UMD = fs.readFileSync(require.resolve("@supabase/supabase-js/dist/umd/supabase.js"), "utf8");
const CHART_STUB = "window.Chart = function () { this.destroy = function () {}; this.update = function () {}; };";

function supabaseLibrarySource(opts) {
    return [REAL_SUPABASE_UMD, fakeClientSource(opts), "window.supabase.createClient = window.__emrFakeCreateClient;"].join("\n;\n");
}

function fakeClientSource(opts) {
    return `
    window.__emrFakeCreateClient = function () {
      const user = ${opts.signedIn ? JSON.stringify(USER) : "null"};
      return {
        auth: {
          getUser: async () => ({ data: { user }, error: user ? null : { message: "Auth session missing!" } }),
          getSession: async () => ({ data: { session: user ? { access_token: "x", user } : null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
          signOut: async () => ({ error: null }),
          signInWithPassword: async () => (window.__signin || { data: { user: ${JSON.stringify(USER)}, session: { access_token: "x" } }, error: null }),
          resend: async (args) => { (window.__resendCalls = window.__resendCalls || []).push(args); return window.__resend || { data: {}, error: null }; },
          updateUser: async (args) => { window.__updateUserCalls = (window.__updateUserCalls || 0) + 1; return window.__updateUser || { data: { user }, error: null }; },
          signUp: async (args) => { window.__signupCalls = (window.__signupCalls || 0) + 1; return window.__signup || { data: { user: ${JSON.stringify(USER)}, session: null }, error: null }; },
          resetPasswordForEmail: async () => (window.__resetEmail || { data: {}, error: null })
        },
        from: (t) => window.__fakeFrom(t),
        rpc: async (fn, args) => (window.__fakeRpc ? window.__fakeRpc(fn, args) : { data: null, error: null })
      };
    };`;
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
            if (/supabase-js/.test(url)) return Promise.resolve(Buffer.from(supabaseLoads ? supabaseLibrarySource({ signedIn }) : ""));
            if (url.includes("/npm/chart.js")) return Promise.resolve(Buffer.from(CHART_STUB));
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
    events.console = [];
    for (const level of ["log", "info", "warn", "error", "debug", "trace", "dir"]) {
        vc.on(level, (...args) => events.console.push(level + ": " + args.map((x) => typeof x === "string" ? x : util.inspect(x, { depth: 8 })).join(" ")));
    }
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

module.exports = { REAL_SUPABASE_UMD, USER, ARTICLE, PRODUCT, TEST_PROJECT_REF, TEST_RUNTIME_JS, fakeClientSource, makeFrom, resolveExact, load, visible };
