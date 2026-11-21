/* Frontend dependency integrity and legacy routes (WP4J).
   - Chart.js is pinned (4.6.1), served from /js/vendor/ with its licence,
     byte-identical to the pinned npm package; no page loads it from a CDN.
   - The admin analytics page renders its three charts with the real
     vendored Chart.js (jsdom + a no-op 2D context), only after the admin
     check.
   - Every local <script src> / stylesheet referenced by a served page exists
     with the exact case (Netlify hosting is case-sensitive).
   - No new inline event handlers (CSP hardening guard).
   No network. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const H = require("../email/helpers");
const { load, USER } = require("./dom-harness");

const suite = H.createSuite("frontend dependencies, routes and inline-handler guard");
const { test } = suite;

const CHART_VERSION = "4.6.1";
const CHART_FILE = `js/vendor/chart-${CHART_VERSION}.umd.min.js`;
const CHART_PAGES = ["admin/analyticsCMS.html", "admin/dashboard.html", "admin/ai/analytics.html"];

const SKIP_DIRS = /^(node_modules|\.git|\.netlify|\.claude|tests|supabase|netlify|emails|scripts|docs|backups|local-ai)(\/|$)/;
// Folders netlify.toml answers with 404 (force = true) are not served.
const BLOCKED = [...fs.readFileSync(path.join(H.ROOT, "netlify.toml"), "utf8")
    .matchAll(/from = "\/([^"*]+)\/\*"[\s\S]{0,60}?status = 404/g)].map((m) => m[1]);

function servedFiles(ext) {
    const out = [];
    (function walk(dir) {
        for (const e of fs.readdirSync(path.join(H.ROOT, dir), { withFileTypes: true })) {
            const rel = dir ? dir + "/" + e.name : e.name;
            if (SKIP_DIRS.test(rel) || BLOCKED.some((b) => rel === b || rel.startsWith(b + "/"))) continue;
            if (e.isDirectory()) walk(rel);
            else if (rel.endsWith(ext)) out.push(rel);
        }
    })("");
    return out;
}

// Exact-case existence check (Windows/macOS file systems are case-insensitive).
function existsExact(rel) {
    let dir = H.ROOT;
    for (const part of rel.split("/")) {
        if (!fs.existsSync(dir) || !fs.readdirSync(dir).includes(part)) return false;
        dir = path.join(dir, part);
    }
    return true;
}

/* ---------- Chart.js ---------- */

test("Chart.js is pinned exactly and served locally with its licence (no CDN)", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(H.ROOT, "package.json"), "utf8"));
    assert.strictEqual(pkg.devDependencies["chart.js"], CHART_VERSION);
    const lock = JSON.parse(fs.readFileSync(path.join(H.ROOT, "package-lock.json"), "utf8"));
    assert.strictEqual(lock.packages["node_modules/chart.js"].version, CHART_VERSION);
    const vendored = fs.readFileSync(path.join(H.ROOT, CHART_FILE), "utf8");
    assert.strictEqual(vendored, fs.readFileSync(path.join(H.ROOT, "node_modules/chart.js/dist/chart.umd.min.js"), "utf8"), "vendored copy differs from the pinned package");
    assert(vendored.startsWith("/*!\n * Chart.js v" + CHART_VERSION), "unexpected banner");
    const licence = fs.readFileSync(path.join(H.ROOT, `js/vendor/chart-${CHART_VERSION}.LICENSE.md`), "utf8");
    assert(/MIT License/.test(licence));
    for (const page of servedFiles(".html")) {
        const html = fs.readFileSync(path.join(H.ROOT, page), "utf8");
        assert(!/cdn\.jsdelivr\.net\/npm\/chart\.js|unpkg\.com\/chart\.js|cdnjs[^"]*chart/i.test(html), page + " loads Chart.js from a CDN");
    }
    for (const page of CHART_PAGES) {
        assert(fs.readFileSync(path.join(H.ROOT, page), "utf8").includes(`<script src="/${CHART_FILE}"></script>`), page);
    }
});

function withCanvas(w) {
    // jsdom has no canvas: a no-op 2D context lets the real Chart.js run.
    const store = new WeakMap();
    w.HTMLCanvasElement.prototype.getContext = function () {
        const canvas = this;
        if (!store.has(canvas)) {
            const values = {};
            store.set(canvas, new Proxy({}, {
                get(_t, prop) {
                    if (prop === "canvas") return canvas;
                    if (prop === "measureText") return (text) => ({ width: String(text).length * 6, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 });
                    if (prop === "getImageData" || prop === "createImageData") return () => ({ data: new Uint8ClampedArray(4) });
                    if (prop === "createLinearGradient" || prop === "createRadialGradient" || prop === "createPattern") return () => ({ addColorStop() {} });
                    if (prop === "getLineDash") return () => [];
                    if (prop === "isPointInPath") return () => false;
                    if (prop in values) return values[prop];
                    return () => {};
                },
                set(_t, prop, value) { values[prop] = value; return true; }
            }));
        }
        return store.get(canvas);
    };
    w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
}

test("admin analytics: the real Chart.js 4.6.1 renders the three charts after the admin check", async () => {
    const tables = [];
    const p = await load("admin/analyticsCMS.html", { before: (w) => {
        withCanvas(w);
        const base = w.__fakeFrom;
        let first = true;
        w.__fakeFrom = (t) => {
            tables.push(t);
            if (t === "profiles" && first) { first = false; return base(t); }
            return base(t);
        };
    }, rows: { profiles: [{ id: USER.id, is_admin: true }], quiz_results: [{ score: 60, created_at: "2026-11-01T00:00:00Z", skin_type: "Oily" }], encyclopedia_articles: [] } });
    await p.window.EMAdminGuard.requireAdmin();
    await p.settle(800);
    const w = p.window;
    assert.strictEqual(w.Chart && w.Chart.version, CHART_VERSION, "vendored Chart.js not loaded");
    const charts = ["userGrowthChart", "quizChart", "articleChart"].map((id) => w.Chart.getChart(p.document.getElementById(id)));
    assert(charts.every(Boolean), "a chart was not created: " + charts.map((c) => !!c).join(","));
    assert.deepStrictEqual(charts.map((c) => c.config.type), ["line", "bar", "doughnut"]);
    assert(charts.every((c) => c.options.responsive !== false), "charts must stay responsive (mobile)");
    assert.strictEqual(tables[0], "profiles", "data loaded before the admin check");
    assert(!p.events.errors.some((e) => /SyntaxError|uncaught|already been declared/i.test(e)), p.events.errors.join(" | "));
    p.window.close();
});

test("admin analytics: an ordinary user gets no chart and no data (redirected first)", async () => {
    const tables = [];
    const redirects = [];
    const p = await load("admin/analyticsCMS.html", { before: (w) => {
        withCanvas(w);
        const base = w.__fakeFrom;
        w.__fakeFrom = (t) => { tables.push(t); return base(t); };
        w.addEventListener("emr-admin-redirect", (e) => redirects.push(e.detail.target));
    }, rows: { profiles: [{ id: USER.id, is_admin: false }] } });
    await p.settle(800);
    assert.deepStrictEqual(redirects, ["/dashboard.html"]);
    assert.deepStrictEqual(tables, ["profiles"]);
    assert.strictEqual(p.window.Chart.getChart(p.document.getElementById("userGrowthChart")), undefined);
    p.window.close();
});

/* ---------- AOS (homepage scroll animations) ---------- */

test("AOS is pinned (3.0.0-beta.6, what unpkg's moving @next tag served) and loaded locally by the homepage", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(H.ROOT, "package.json"), "utf8"));
    assert.strictEqual(pkg.devDependencies.aos, "3.0.0-beta.6");
    const vendored = fs.readFileSync(path.join(H.ROOT, "js/vendor/aos-3.0.0-beta.6.js"), "utf8");
    assert.strictEqual(vendored, fs.readFileSync(path.join(H.ROOT, "node_modules/aos/dist/aos.js"), "utf8"));
    assert(/MIT License/.test(fs.readFileSync(path.join(H.ROOT, "js/vendor/aos-3.0.0-beta.6.LICENSE.txt"), "utf8")));
    const home = fs.readFileSync(path.join(H.ROOT, "index.html"), "utf8");
    assert(home.includes('<script src="/js/vendor/aos-3.0.0-beta.6.js"></script>'));
    assert(!/unpkg\.com\/aos/.test(home), "homepage still loads AOS from unpkg");
});

test("homepage: the vendored AOS loads and initialises without script errors", async () => {
    const p = await load("index.html", { signedIn: false });
    await p.settle(300);
    assert.strictEqual(typeof p.window.AOS, "object");
    assert.strictEqual(typeof p.window.AOS.init, "function");
    assert(!p.events.errors.some((e) => /AOS|uncaught|SyntaxError/i.test(e)), p.events.errors.join(" | "));
    p.window.close();
});

/* ---------- Case-sensitive routes ---------- */

test("every local script and stylesheet referenced by a served page exists with the exact case", () => {
    const missing = [];
    for (const page of servedFiles(".html")) {
        const html = fs.readFileSync(path.join(H.ROOT, page), "utf8");
        for (const m of html.matchAll(/<(?:script[^>]*\ssrc|link[^>]*\shref)="([^"#?]+)"/g)) {
            const ref = m[1];
            if (/^(https?:|data:|mailto:|\/\/)/.test(ref) || ref === "/js/runtime-config.js") continue;
            if (!/\.(js|css)$/.test(ref)) continue;
            // Resolve exactly as a browser does (e.g. "../js/x.js" from "/products.html" is "/js/x.js").
            const base = "https://site.test/" + page.split("/").map(encodeURIComponent).join("/");
            const rel = decodeURIComponent(new URL(ref, base).pathname).slice(1);
            if (!existsExact(rel)) missing.push(page + " -> " + ref);
        }
    }
    assert.deepStrictEqual(missing, []);
});

test("legacy root dashboardCMS.html redirects to /dashboard.html (no scripts, no lower-case dashboard/ paths)", () => {
    const html = fs.readFileSync(path.join(H.ROOT, "dashboardCMS.html"), "utf8");
    assert(/<meta http-equiv="refresh" content="0; url=\/dashboard\.html">/.test(html));
    assert(/<a href="\/dashboard\.html">/.test(html), "visible fallback link missing");
    assert(!/<script/i.test(html), "the redirect page must not load scripts");
    assert(!/src="dashboard\//.test(html), "lower-case dashboard/ path");
});

test("'Dashboard' links on the root pages point to /dashboard.html", () => {
    for (const page of ["encyclopedia.html", "encyclopediaCMS.html", "products.html"]) {
        const html = fs.readFileSync(path.join(H.ROOT, page), "utf8");
        assert(!/href="dashboardCMS\.html"/.test(html), page + " still links to dashboardCMS.html");
        assert(/href="\/dashboard\.html"/.test(html), page);
    }
});

test("article reader navigation uses root-absolute links (never the legacy /article/ copies)", () => {
    const html = fs.readFileSync(path.join(H.ROOT, "article/article.html"), "utf8");
    const nav = html.slice(html.indexOf("<nav>"), html.indexOf("</nav>"));
    assert.deepStrictEqual([...nav.matchAll(/href="([^"]+)"/g)].map((m) => m[1]), ["/index.html", "/quiz.html", "/dashboard.html", "/encyclopedia.html"]);
});

test("acne.html and skin-conditions.html have a stylesheet that exists and a mobile viewport", () => {
    for (const page of ["acne.html", "skin-conditions.html"]) {
        const html = fs.readFileSync(path.join(H.ROOT, page), "utf8");
        assert(/<link rel="stylesheet" href="css\/legal\.css">/.test(html), page);
        assert(/<meta name="viewport" content="width=device-width, initial-scale=1.0">/.test(html), page);
        assert(/<meta charset="UTF-8">/.test(html), page);
    }
});

test("dashboard images are contained (no horizontal overflow on 375-414px phones)", () => {
    const css = fs.readFileSync(path.join(H.ROOT, "css/dashboard.css"), "utf8");
    assert(/\.dashboard img\s*\{[^}]*max-width:\s*100%[^}]*height:\s*auto/.test(css));
});

/* ---------- CSP guard: no new inline event handlers ---------- */

// Known inline handlers in HTML at WP4J (2026-11-21), per page. The count may
// go down (migration to addEventListener) but never up, and no new page may add one.
const INLINE_HANDLER_BASELINE = {
    "article/index.html": 16, "encyclopediaCMS/index.html": 16, "index.html": 16, "skinquiz/index.html": 16
};

test("CSP guard: no new inline on*= handlers in served HTML (baseline may only shrink)", () => {
    const over = [];
    for (const page of servedFiles(".html")) {
        const html = fs.readFileSync(path.join(H.ROOT, page), "utf8");
        const n = (html.match(/\son[a-z]+\s*=\s*["']/gi) || []).length;
        const allowed = INLINE_HANDLER_BASELINE[page] || 0;
        if (n > allowed) over.push(`${page}: ${n} (allowed ${allowed})`);
    }
    assert.deepStrictEqual(over, []);
});

test("CSP guard: the WP4C–WP4I modules contain no inline handler markup or javascript: URLs", () => {
    const files = ["js/article-content.js", "article/article/js/article.js", "js/encyclopediaCMS.js", "admin/js/admin-guard.js", "admin/js/login.js",
        "Dashboard/dashboard-history.js", "Dashboard/dashboard-reading.js", "Dashboard/dashboard-topics.js", "Dashboard/dashboard-ui.js", "Dashboard/dashboard-products.js", "ai/js/ai-ui.js"];
    for (const f of files) {
        const s = fs.readFileSync(path.join(H.ROOT, f), "utf8");
        assert(!/\son(click|load|error|change|submit|input|mouseover|keydown|keyup)\s*=\s*["'\\]/i.test(s), f + " generates an inline handler");
        assert(!/href\s*=\s*["']javascript:/i.test(s), f + " uses a javascript: URL");
    }
});

test("CSP itself is unchanged (unsafe-inline still present until migration; no report endpoint added)", () => {
    const toml = fs.readFileSync(path.join(H.ROOT, "netlify.toml"), "utf8");
    const csp = (toml.match(/Content-Security-Policy\s*=\s*"([^"]+)"/) || [])[1] || "";
    assert(/script-src 'self' 'unsafe-inline'/.test(csp), "script-src changed");
    assert(/default-src 'self'/.test(csp) && /object-src 'none'/.test(csp) && /frame-ancestors 'none'/.test(csp));
    assert(!/report-uri|report-to/.test(csp), "a report endpoint was added");
    assert(!/cdn\.jsdelivr\.net\/npm\/chart/.test(csp));
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
