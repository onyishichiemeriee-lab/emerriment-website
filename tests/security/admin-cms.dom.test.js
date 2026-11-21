/* Admin CMS authorization, redirects and console privacy (WP4E).
   Real admin pages in jsdom with a recording fake Supabase client.
   Regression tests for the WP4D preview findings:
     - a non-admin on admin/dashboardCMS.html was sent to
       "admin/../dashboardCMS.html" (= the same page) -> endless reloads;
     - admin/js/usersCMS.js logged the signed-in user's id, email and
       profile object.
   No network; synthetic marker values only. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");
const H = require("../email/helpers");
const { load, USER } = require("./dom-harness");

const suite = H.createSuite("admin CMS: authorization, redirects, console privacy (jsdom)");
const { test } = suite;

const CMS_PAGES = ["analyticsCMS", "articlesCMS", "dashboardCMS", "edit-articleCMS", "edit-productCMS", "new-articleCMS", "new-productCMS", "productsCMS", "settingsCMS", "user-detailsCMS", "usersCMS"];
const DATA_TABLES = ["encyclopedia_articles", "quiz_results", "favorite_articles", "products", "website_settings", "leads", "purchases"];
const TARGET_UUID = "5a1e0c3d-7b2f-4e8a-9c41-0d2e6f8a1b3c";

const MARK = {
    email: "marker-admin-person@example.test",
    name: "Marker Admin Fullname",
    otherEmail: "marker-listed-user@example.test",
    otherName: "Marker Listed Person",
    otherId: "6b2f1d4e-8c3a-4f9b-a052-1e3f7a9b2c4d",
    rawError: "permission denied: row quotes marker-raw-error@example.test",
    errorDetail: "secret-error-detail-marker",
    token: "SYNTHETIC-ADMIN-SESSION-TOKEN-91f2"
};

// Records every table query (and its order); per-table {error} injection.
function recordingFrom(rows, errors = {}) {
    const calls = [];
    const from = (table) => {
        calls.push(table);
        const state = { single: false };
        const b = new Proxy({}, {
            get(_t, prop) {
                if (prop === "then") {
                    return (resolve, reject) => {
                        if (errors[table]) return Promise.resolve({ data: null, error: errors[table], count: null }).then(resolve, reject);
                        const d = rows[table] || [];
                        return Promise.resolve({ data: state.single ? (d[0] || null) : d, error: null, count: d.length }).then(resolve, reject);
                    };
                }
                if (prop === "single" || prop === "maybeSingle") return () => { state.single = true; return b; };
                return () => b;
            }
        });
        return b;
    };
    return { calls, from };
}

async function openAdmin(page, { signedIn = true, isAdmin = false, rows = {}, errors = {}, query = "" } = {}) {
    const profiles = rows.profiles || [{ id: USER.id, email: MARK.email, full_name: MARK.name, is_admin: isAdmin }];
    const rec = recordingFrom({ ...rows, profiles }, errors);
    const redirects = [];
    const p = await load("admin/" + page + ".html", { signedIn, hash: query, before: (w) => {
        w.__fakeFrom = rec.from;
        w.addEventListener("emr-admin-redirect", (e) => redirects.push(e.detail.target));
    } });
    if (p.window.EMAdminGuard) await p.window.EMAdminGuard.requireAdmin();
    await p.settle(400);
    return { ...p, rec, redirects, state: () => p.document.documentElement.getAttribute("data-admin-access") };
}

const dataQueries = (calls) => calls.filter((t) => DATA_TABLES.includes(t) || t === "profiles");

/* ---------- Redirects and authorization ---------- */

test("every admin CMS page loads the shared guard before its page script", () => {
    for (const page of CMS_PAGES) {
        const html = fs.readFileSync(path.join(H.ROOT, "admin", page + ".html"), "utf8");
        const g = html.indexOf('src="js/admin-guard.js"');
        const m = html.indexOf(`src="js/${page}.js"`);
        assert(g > 0, page + ": guard not loaded");
        assert(m > g, page + ": guard must load before the page script");
    }
});

test("non-admin on admin/dashboardCMS.html: sent to /dashboard.html once — not the same page, no loop", async () => {
    const p = await openAdmin("dashboardCMS", { isAdmin: false });
    assert.deepStrictEqual(p.redirects, ["/dashboard.html"]);
    assert.strictEqual(p.events.navigations, 1, "exactly one navigation");
    assert.notStrictEqual(p.redirects[0].toLowerCase().replace(/\.html$/, ""), "/admin/dashboardcms");
    assert.strictEqual(p.state(), "forbidden");
    p.window.close();
});

test("non-admin: no admin data is queried or rendered (only the own-profile check)", async () => {
    const p = await openAdmin("dashboardCMS", { isAdmin: false, rows: { encyclopedia_articles: [{ id: 1 }], quiz_results: [{ id: 1 }] } });
    assert.deepStrictEqual(dataQueries(p.rec.calls), ["profiles"]);
    assert.strictEqual(p.document.getElementById("articleCount").textContent.trim(), "0");
    p.window.close();
});

test("anonymous visitor: sent to the CMS login, nothing else queried", async () => {
    const p = await openAdmin("dashboardCMS", { signedIn: false });
    assert.deepStrictEqual(p.redirects, ["/admin/loginCMS.html"]);
    assert.deepStrictEqual(p.rec.calls, []);
    assert.strictEqual(p.state(), "signed-out");
    p.window.close();
});

test("administrator: stays on the dashboard; data is loaded only AFTER the admin check", async () => {
    const p = await openAdmin("dashboardCMS", { isAdmin: true, rows: { encyclopedia_articles: [{ id: 1 }, { id: 2 }], quiz_results: [] } });
    assert.deepStrictEqual(p.redirects, []);
    assert.strictEqual(p.events.navigations, 0);
    assert.strictEqual(p.state(), "granted");
    assert.strictEqual(p.rec.calls[0], "profiles", "the admin check must run first");
    assert(p.rec.calls.includes("encyclopedia_articles"), "dashboard data not loaded for an administrator");
    assert.strictEqual(p.document.getElementById("articleCount").textContent.trim(), "2");
    p.window.close();
});

test("every CMS page: non-admins are redirected to /dashboard.html and no admin data is queried", async () => {
    for (const page of CMS_PAGES) {
        const query = page === "user-detailsCMS" ? "?id=" + TARGET_UUID : page === "edit-productCMS" || page === "edit-articleCMS" ? "?id=1" : "";
        const p = await openAdmin(page, { isAdmin: false, query, rows: { products: [{ id: 1, name: "x" }], encyclopedia_articles: [{ id: 1 }] } });
        assert.deepStrictEqual(p.redirects, ["/dashboard.html"], page);
        assert.deepStrictEqual(dataQueries(p.rec.calls), ["profiles"], page + " queried: " + p.rec.calls.join(","));
        p.window.close();
    }
});

test("new article / new product forms stay disabled for non-admins and enabled for admins", async () => {
    for (const page of ["new-articleCMS", "new-productCMS"]) {
        const deny = await openAdmin(page, { isAdmin: false });
        const fields = [...deny.document.querySelectorAll("form input, form textarea, form select, form button")];
        assert(fields.length > 0 && fields.every((el) => el.disabled), page + ": form enabled for a non-admin");
        deny.window.close();
        const ok = await openAdmin(page, { isAdmin: true });
        assert(![...ok.document.querySelectorAll("form input, form button")].some((el) => el.disabled), page + ": form disabled for an admin");
        ok.window.close();
    }
});

test("a failed admin check fails closed: no redirect loop, no data, a visible notice", async () => {
    const p = await openAdmin("usersCMS", { errors: { profiles: { name: "PostgrestError", code: "PGRST301", status: 401, message: MARK.rawError, details: MARK.errorDetail } } });
    assert.deepStrictEqual(p.redirects, []);
    assert.strictEqual(p.state(), "error");
    assert.deepStrictEqual(p.rec.calls, ["profiles"]);
    const notice = p.document.getElementById("adminAccessNotice");
    assert(notice && /couldn't verify administrator access/.test(notice.textContent));
    assert.strictEqual(notice.getAttribute("role"), "alert");
    p.window.close();
});

/* ---------- The guard itself: same-page, cross-host and production redirects ---------- */

function guardOnly(url, profile) {
    const vc = new VirtualConsole();
    const dom = new JSDOM("<!doctype html><body></body>", { url, runScripts: "outside-only", virtualConsole: vc });
    const w = dom.window;
    const redirects = [];
    let navigations = 0;
    vc.on("jsdomError", (e) => { if (/navigation/.test(String(e && e.message))) navigations++; });
    w.addEventListener("emr-admin-redirect", (e) => redirects.push(e.detail.target));
    w.supabaseClient = {
        auth: { getUser: async () => ({ data: { user: profile === null ? null : { id: "u1" } }, error: null }) },
        from: () => { const b = new Proxy({}, { get: (_t, prop) => prop === "then" ? (r) => r({ data: profile, error: null }) : () => b }); return b; }
    };
    w.eval(fs.readFileSync(path.join(H.ROOT, "admin/js/admin-guard.js"), "utf8"));
    return { w, redirects, navigations: () => navigations };
}

test("guard refuses to redirect to the page that is already open (no loop possible)", async () => {
    // A non-admin who somehow runs the guard on /dashboard.html itself.
    const g = guardOnly("https://deploy-preview-2--emerriment216.netlify.app/dashboard.html", { is_admin: false });
    assert.strictEqual(await g.w.EMAdminGuard.requireAdmin(), null);
    assert.deepStrictEqual(g.redirects, []);
    assert.strictEqual(g.navigations(), 0);
    assert(g.w.document.getElementById("adminAccessNotice"));
});

test("guard: redirect destinations are fixed paths on the current host (never emerriment.com, never from the URL)", async () => {
    for (const host of ["https://deploy-preview-2--emerriment216.netlify.app", "http://localhost:8888", "https://emerriment.com"]) {
        const g = guardOnly(host + "/admin/dashboardCMS.html?next=https://evil.example/&redirect=//evil.example", { is_admin: false });
        await g.w.EMAdminGuard.requireAdmin();
        assert.deepStrictEqual(g.redirects, ["/dashboard.html"], host);
    }
    const src = fs.readFileSync(path.join(H.ROOT, "admin/js/admin-guard.js"), "utf8");
    assert(!/emerriment\.com/.test(src.replace(/\/\*[\s\S]*?\*\//g, "")), "absolute production URL in the guard");
    assert(!/URLSearchParams|location\.search|location\.hash/.test(src), "redirect target must not come from the URL");
    assert.strictEqual(g_constants().ADMIN_LOGIN, "/admin/loginCMS.html");
    assert.strictEqual(g_constants().USER_DASHBOARD, "/dashboard.html");
    function g_constants() { return guardOnly("http://localhost/admin/x.html", null).w.EMAdminGuard; }
});

test("guard: the old destination 'admin/../dashboardCMS.html' would be caught as the same page", async () => {
    const g = guardOnly("https://deploy-preview-2--emerriment216.netlify.app/admin/dashboardCMS.html", { is_admin: false });
    // Resolution check used by redirect(): the old string resolves back to the current page.
    const resolved = new g.w.URL("admin/../dashboardCMS.html", g.w.location.href).pathname;
    assert.strictEqual(resolved, "/admin/dashboardCMS.html");
});

test("source: no admin CMS module still redirects to a relative dashboardCMS.html or blocks on alert() before redirecting", () => {
    for (const page of CMS_PAGES) {
        const src = fs.readFileSync(path.join(H.ROOT, "admin/js", page + ".js"), "utf8");
        assert(!/admin\/\.\.\/dashboardCMS\.html/.test(src), page);
        assert(!/location\.href\s*=\s*["'](\.\.\/)?dashboardCMS\.html["']/.test(src), page + " still redirects to a dashboardCMS.html");
        assert(!/You do not have permission to access the CMS/.test(src), page + " still has its own permission alert");
    }
});

/* ---------- CMS login ---------- */

test("CMS login form: wrong password shows a text message; success goes to the CMS dashboard", async () => {
    const p = await load("admin/loginCMS.html", { signedIn: false, before: (w) => { w.__signin = { data: {}, error: { name: "AuthApiError", status: 400, message: "Invalid login credentials" } }; } });
    p.document.getElementById("email").value = "user@example.test";
    p.document.getElementById("password").value = "placeholder-password";
    p.document.getElementById("adminLoginForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(200);
    const msg = p.document.getElementById("message");
    assert.strictEqual(msg.textContent, "Incorrect email or password.");
    assert.strictEqual(msg.getAttribute("role"), "alert");
    assert.strictEqual(p.events.navigations, 0);
    p.window.__signin = null;
    p.document.getElementById("adminLoginForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(200);
    assert.strictEqual(p.events.navigations, 1, "no navigation after a successful sign-in");
    assert(!p.events.console.join("\n").includes("placeholder-password"));
    p.window.close();
});

/* ---------- Console privacy ---------- */

function assertConsoleClean(p, extra = []) {
    const out = p.events.console.join("\n");
    for (const v of [USER.id, USER.email, MARK.email, MARK.name, MARK.otherEmail, MARK.otherName, MARK.otherId, MARK.rawError, MARK.errorDetail, MARK.token, TARGET_UUID, ...extra]) {
        assert(!out.includes(v), "console contains a marker: " + p.events.console.filter((l) => l.includes(v)).map((l) => l.slice(0, 120)).join(" | "));
    }
}

test("usersCMS (admin): no user id, email, name or profile object in the console", async () => {
    const p = await openAdmin("usersCMS", { isAdmin: true, rows: { profiles: [
        { id: USER.id, email: MARK.email, full_name: MARK.name, is_admin: true, created_at: "2026-11-01T00:00:00Z" },
        { id: MARK.otherId, email: MARK.otherEmail, full_name: MARK.otherName, is_admin: false, created_at: "2026-11-02T00:00:00Z" }
    ] } });
    assert.strictEqual(p.state(), "granted");
    assert(p.document.getElementById("usersBody").textContent.includes(MARK.otherEmail), "users list not rendered for the admin");
    assert(p.events.console.length > 0, "harness captured no console output");
    assertConsoleClean(p);
    p.window.close();
});

test("user-detailsCMS (admin): the viewed user's id and record are not logged", async () => {
    // First profiles query = the admin check (signed-in admin); later ones = the viewed user.
    const admin = recordingFrom({ profiles: [{ id: USER.id, email: MARK.email, full_name: MARK.name, is_admin: true }] });
    const viewed = recordingFrom({ profiles: [{ id: TARGET_UUID, email: MARK.otherEmail, full_name: MARK.otherName, is_admin: false, current_skin_type: "Oily" }], quiz_results: [] });
    let profileCalls = 0;
    const from = (t) => (t === "profiles" && profileCalls++ === 0 ? admin.from(t) : viewed.from(t));
    const p = await load("admin/user-detailsCMS.html", { hash: "?id=" + TARGET_UUID, before: (w) => { w.__fakeFrom = from; } });
    assert.strictEqual(await p.window.EMAdminGuard.requireAdmin() !== null, true, "admin not granted");
    await p.settle(400);
    assert(p.document.body.textContent.includes(MARK.otherEmail), "viewed user not rendered");
    assertConsoleClean(p);
    p.window.close();
});

test("admin data errors are logged only as {kind, code, status}", async () => {
    const err = { name: "PostgrestError", code: "42501", status: 403, message: MARK.rawError, details: MARK.errorDetail };
    for (const [page, table, query] of [["usersCMS", "profiles", ""], ["productsCMS", "products", ""], ["articlesCMS", "encyclopedia_articles", ""]]) {
        const rows = { profiles: [{ id: USER.id, is_admin: true }] };
        // The admin check reads profiles first; inject the error on the data query only.
        let first = true;
        const rec = recordingFrom(rows, {});
        const from = (t) => {
            if (t === table && !(t === "profiles" && first)) return recordingFrom({}, { [t]: err }).from(t);
            if (t === "profiles") first = false;
            return rec.from(t);
        };
        const p = await load("admin/" + page + ".html", { hash: query, before: (w) => { w.__fakeFrom = from; } });
        await p.window.EMAdminGuard.requireAdmin();
        await p.settle(400);
        assertConsoleClean(p);
        assert(p.events.console.some((l) => /PostgrestError/.test(l) && /42501/.test(l)), page + ": safe error category missing");
        p.window.close();
    }
});

test("source: admin CMS modules never pass raw errors, users, profiles or ids to console calls", () => {
    for (const page of [...CMS_PAGES, "admin-guard", "login"]) {
        const src = fs.readFileSync(path.join(H.ROOT, "admin/js", page + ".js"), "utf8");
        const bad = [...src.matchAll(/console\.\w+\(([\s\S]*?)\);/g)]
            .map((m) => m[1].replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`/g, '""').replace(/\s+/g, " ").trim())
            .filter((args) => /(^|,\s*)(error|updateError|profileError|authError|userError|user|profile|data|userId|session)\s*$/.test(args) || /user\.(id|email)|profile\b(?!Error)/.test(args));
        assert.deepStrictEqual(bad, [], page);
    }
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
