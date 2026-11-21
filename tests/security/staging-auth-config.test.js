/* Staging Auth configuration (docs/STAGING_AND_PREVIEWS.md §4.8) — offline checks.
   * The documented redirect patterns, evaluated with Supabase's documented glob
     rules (`*` = any characters except the separators "." and "/", `**` = any
     characters, `?` = one non-separator character), accept every Netlify deploy
     preview of emerriment216 and Netlify Dev, and reject production hosts,
     production deploy permalinks, other sites and look-alike domains.
   * The documented Site URL is not a production host.
   * js/auth.js builds password-reset links that these patterns accept on a
     preview / localhost, never pointing at the production domain from there.
   No network, no Supabase. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const H = require("../email/helpers");

const suite = H.createSuite("staging Auth configuration (docs §4.8, offline)");
const { test } = suite;

const DOC = fs.readFileSync(path.join(H.ROOT, "docs", "STAGING_AND_PREVIEWS.md"), "utf8");
const SECTION = DOC.slice(DOC.indexOf("### 4.8 Staging Auth configuration"), DOC.indexOf("## 5. Local development"));

const SITE_URL = "http://localhost:8888";
const PATTERNS = ["https://deploy-preview-*--emerriment216.netlify.app/**", "http://localhost:8888/**"];
const PRODUCTION_HOSTS = ["emerriment.com", "www.emerriment.com", "emerriment216.netlify.app"];

// Supabase redirect-URL glob (docs: supabase.com/docs/guides/auth/redirect-urls).
function globToRegExp(pattern) {
    let re = "";
    for (let i = 0; i < pattern.length; i++) {
        const c = pattern[i];
        if (c === "*" && pattern[i + 1] === "*") { re += ".*"; i++; }
        else if (c === "*") re += "[^./]*";
        else if (c === "?") re += "[^./]";
        else re += c.replace(/[\\^$.|+()[\]{}]/g, "\\$&");
    }
    return new RegExp("^" + re + "$");
}
const allowed = (url) => PATTERNS.some((p) => globToRegExp(p).test(url));

test("docs §4.8 documents exactly the prepared staging values", () => {
    assert.ok(SECTION.length > 500, "section 4.8 present");
    assert.ok(SECTION.includes("`ayxakyyvomlzrsfznpeq`"), "names the staging ref");
    assert.ok(new RegExp("Site URL \\| [^|]+\\| `" + SITE_URL.replace(/[.]/g, "\\.") + "` \\|").test(SECTION), "Site URL row");
    for (const p of PATTERNS) assert.ok(SECTION.includes("`" + p + "`"), "redirect pattern " + p);
    assert.ok(/Confirm email \| [^|]+\| \*\*off\*\* \|/.test(SECTION), "Confirm email off");
    assert.ok(/Custom SMTP \| [^|]+\| \*\*unset\*\*/.test(SECTION), "custom SMTP unset");
    assert.ok(/Do \*\*not\*\* use `supabase config push`/.test(SECTION), "warns against config push");
    // the obsolete, unsafe suggestions must be gone from the whole document
    assert.ok(!/Site URL\s+`https:\/\/emerriment216\.netlify\.app`/.test(DOC), "no production host as staging Site URL");
    assert.ok(!DOC.includes("`https://*--emerriment216.netlify.app/**`"), "no pattern that also matches production permalinks");
});

test("the staging Site URL is not a production host and not https production", () => {
    const host = new URL(SITE_URL).hostname;
    assert.ok(!PRODUCTION_HOSTS.includes(host));
    assert.strictEqual(host, "localhost");
});

test("redirect patterns accept every deploy preview and Netlify Dev, any path", () => {
    for (const n of [1, 7, 42, 1234]) {
        for (const p of ["/", "/reset-password.html", "/login.html", "/dashboard.html?x=1", "/a/b/c"]) {
            const u = `https://deploy-preview-${n}--emerriment216.netlify.app${p}`;
            assert.ok(allowed(u), u);
        }
    }
    for (const p of ["/", "/reset-password.html", "/admin/dashboard.html"]) assert.ok(allowed("http://localhost:8888" + p));
});

test("redirect patterns reject production hosts, permalinks, other sites and look-alikes", () => {
    const rejected = [
        "https://emerriment.com/reset-password.html",
        "https://www.emerriment.com/reset-password.html",
        "https://emerriment216.netlify.app/reset-password.html",
        "https://0123456789abcdef01234567--emerriment216.netlify.app/reset-password.html",   // a production deploy permalink (synthetic id)
        "https://main--emerriment216.netlify.app/reset-password.html",                        // branch alias
        "https://deploy-preview-1--other-site.netlify.app/reset-password.html",
        "https://deploy-preview-1--emerriment216.netlify.app.evil.example/reset-password.html",
        "https://deploy-preview-1.evil--emerriment216.netlify.app/",                            // '*' does not cross '.'
        "https://deploy-preview-1--emerriment216.netlify.app",                                  // no path at all
        "http://deploy-preview-1--emerriment216.netlify.app/reset-password.html",              // wrong scheme
        "https://localhost:8888/reset-password.html",
        "http://localhost:8888.evil.example/",
        "http://localhost:3000/reset-password.html",
        "http://127.0.0.1:8888/reset-password.html",
    ];
    for (const u of rejected) assert.ok(!allowed(u), "must be rejected: " + u);
});

function resetRedirectAt(origin) {
    const calls = [];
    const auth = {
        resetPasswordForEmail: async (email, opts) => { calls.push(opts); return { error: null }; },
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    };
    const window = { supabaseClient: { auth }, location: { origin, href: "" } };
    const context = { window, location: window.location, console: { log() {}, error() {}, warn() {} }, setTimeout, Promise, String, Error, Object, JSON };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(H.ROOT, "js", "auth.js"), "utf8"), context);
    return window.EMAuth.requestPasswordReset("a@example.test").then(() => calls[0].redirectTo);
}

test("password-reset links built on a preview / Netlify Dev are accepted and stay on that host", async () => {
    for (const origin of ["https://deploy-preview-12--emerriment216.netlify.app", "http://localhost:8888"]) {
        const target = await resetRedirectAt(origin);
        assert.strictEqual(target, origin + "/reset-password.html");
        assert.ok(allowed(target), target);
        assert.ok(!PRODUCTION_HOSTS.includes(new URL(target).hostname));
    }
});

test("no auth flow navigates to an absolute production URL; signup relies on the Site URL", () => {
    const auth = fs.readFileSync(path.join(H.ROOT, "js", "auth.js"), "utf8");
    assert.ok(!/emailRedirectTo/.test(auth), "signup sends no emailRedirectTo");
    for (const f of ["js/auth.js", "login.html", "signup.html", "forgot-password.html", "reset-password.html", "dashboard.html"]) {
        const src = fs.readFileSync(path.join(H.ROOT, f), "utf8");
        assert.ok(!/location\.(href|replace|assign)\s*(=|\()\s*["'`]https?:\/\//.test(src), f + " navigates to an absolute URL");
    }
    const signup = fs.readFileSync(path.join(H.ROOT, "signup.html"), "utf8");
    assert.ok(/requiresConfirmation/.test(signup) && /"dashboard\.html"/.test(signup), "signup handles both: confirmation pending and immediate session");
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
