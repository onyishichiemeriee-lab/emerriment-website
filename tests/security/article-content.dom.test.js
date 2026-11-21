/* Article content security, article routes and the view counter (WP4F).
   The real article reader (article/article.html + DOMPurify 3.4.17 served
   from /js/vendor + /js/article-content.js), the dashboard, the AI cards
   and the CMS editor in jsdom with a recording fake Supabase client.
   Synthetic malicious content only; no network; no live article page is
   opened (a live visit would increment a real view counter). */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const H = require("../email/helpers");
const { load, USER } = require("./dom-harness");

const suite = H.createSuite("article content: sanitizing, routes, view counter (jsdom)");
const { test } = suite;

/* ---------- fixtures ---------- */

const PAYLOADS = [
    "<script>window.__xss = 'script'</script>",
    "<img src=x onerror=\"window.__xss='img-onerror'\">",
    "<img src=\"https://example.test/a.png\" onload=\"window.__xss='img-onload'\">",
    "<svg onload=\"window.__xss='svg'\"><circle r=5></circle></svg>",
    "<svg><script>window.__xss='svg-script'</script></svg>",
    "<a href=\"javascript:window.__xss='js-link'\">js link</a>",
    "<a href=\"JaVaScRiPt:alert(1)\">mixed case</a>",
    "<a href=\"jav&#x09;ascript:alert(1)\">encoded tab</a>",
    "<a href=\"&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)\">entity encoded</a>",
    "<a href=\"data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==\">data link</a>",
    "<img src=\"data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+\">",
    "<iframe src=\"https://evil.example/\"></iframe>",
    "<iframe srcdoc=\"<script>window.__xss='srcdoc'</script>\"></iframe>",
    "<object data=\"https://evil.example/x.swf\"></object>",
    "<embed src=\"https://evil.example/x.swf\">",
    "<p onclick=\"window.__xss='onclick'\" style=\"background:url(javascript:alert(1))\">styled</p>",
    "<form action=\"https://evil.example\"><input name=q><button>go</button></form>",
    "<math><mi xlink:href=\"javascript:alert(1)\">m</mi></math>",
    "<div><p>unclosed <b>bold <i>nested",
    "<<script>script>window.__xss='broken'<</script>/script>",
    "<a href=\"https://external.example/page\" target=\"_self\">external</a>",
    "<a href=\"//evil.example/protocol-relative\">proto-relative</a>",
    "<base href=\"https://evil.example/\"><meta http-equiv=\"refresh\" content=\"0;url=https://evil.example\">",
    "<template><img src=x onerror=\"window.__xss='template'\"></template>",
    "<noscript><p title=\"</noscript><img src=x onerror=window.__xss='mxss'>\"></p></noscript>"
].join("\n");

const LEGIT = [
    "<h2>What is acne?</h2>",
    "<p>Acne is <strong>common</strong> and <em>treatable</em>.</p>",
    "<ul><li>Cleanse gently</li><li>Moisturise</li></ul>",
    "<ol><li>Step one</li><li>Step two</li></ol>",
    "<blockquote>See a dermatologist if it persists.</blockquote>",
    "<p><a href=\"https://www.aad.org/acne\">AAD guidance</a> and <a href=\"/encyclopedia.html\">our encyclopedia</a> and <a href=\"#tips\">tips</a>.</p>",
    "<img src=\"https://example.test/diagram.png\" alt=\"Diagram\">"
].join("\n");

const ARTICLE = (over = {}) => ({
    id: "a1", slug: "acne-basics", status: "published", title: "Acne basics", category: "Acne",
    summary: "Summary", content: LEGIT, featured_image: "https://example.test/hero.jpg",
    reading_time: 4, difficulty: "Beginner", created_at: "2026-11-01T00:00:00Z", views: 0, ...over
});

// Fake: applies eq filters like PostgREST, records rpc / write calls.
function fakeDb(rows, { errorFor = {}, ignoreFilters = false } = {}) {
    const calls = [];
    const from = (table) => {
        const q = { table, ops: [] };
        calls.push(q);
        const b = new Proxy({}, {
            get(_t, prop) {
                if (prop === "then") {
                    return (resolve, reject) => {
                        if (errorFor[table]) return Promise.resolve({ data: null, error: errorFor[table] }).then(resolve, reject);
                        let d = (rows[table] || []).slice();
                        if (!ignoreFilters) for (const [op, a] of q.ops) if (op === "eq") d = d.filter((r) => r[a[0]] === a[1]);
                        const single = q.ops.some(([op]) => op === "maybeSingle" || op === "single");
                        return Promise.resolve({ data: single ? (d[0] || null) : d, error: null }).then(resolve, reject);
                    };
                }
                return (...a) => { q.ops.push([prop, a]); return b; };
            }
        });
        return b;
    };
    const rpcCalls = [];
    const rpc = async (fn, args) => { rpcCalls.push({ fn, args }); return (rows.__rpc && rows.__rpc[fn]) || { data: 1, error: null }; };
    return { from, rpc, calls, rpcCalls };
}

async function openReader(query, rows, opts = {}) {
    const db = fakeDb(rows, opts);
    const p = await load("article/article.html", { signedIn: !!opts.signedIn, hash: query, before: (w) => { w.__fakeFrom = db.from; w.__fakeRpc = db.rpc; } });
    if (p.window.EMArticleReader) await p.window.EMArticleReader.ready;
    await p.settle(150);
    return { ...p, db, content: () => p.document.getElementById("articleContent") };
}

const viewCalls = (db) => db.rpcCalls.filter((c) => c.fn === "emerriment_increment_article_views");
const directUpdates = (db) => db.calls.filter((c) => c.table === "encyclopedia_articles" && c.ops.some(([op]) => op === "update"));

function assertSafe(root, window) {
    for (const tag of ["script", "iframe", "object", "embed", "svg", "math", "form", "input", "button", "base", "meta", "template", "style", "noscript"]) {
        assert.strictEqual(root.querySelectorAll(tag).length, 0, "<" + tag + "> survived");
    }
    for (const el of root.querySelectorAll("*")) {
        for (const attr of el.attributes) {
            assert(!/^on/i.test(attr.name), `event handler ${attr.name} survived on <${el.tagName.toLowerCase()}>`);
            assert(!["style", "srcdoc", "srcset", "formaction", "xlink:href"].includes(attr.name.toLowerCase()), `${attr.name} survived`);
        }
    }
    for (const a of root.querySelectorAll("a[href]")) {
        const href = a.getAttribute("href");
        assert(!/^\s*(javascript|data|vbscript):/i.test(href) && !/^\s*\/\//.test(href), "unsafe link survived: " + href);
        if (/^https?:/i.test(href) && new window.URL(href).origin !== window.location.origin) {
            assert.strictEqual(a.getAttribute("target"), "_blank");
            assert.strictEqual(a.getAttribute("rel"), "noopener noreferrer");
        }
    }
    for (const img of root.querySelectorAll("img")) {
        assert(/^https:\/\//.test(img.getAttribute("src") || ""), "unsafe image src survived: " + img.getAttribute("src"));
    }
    assert.strictEqual(window.__xss, undefined, "a payload executed: " + window.__xss);
}

/* ---------- Stored XSS in the article body ---------- */

test("sanitizer is the pinned, locally served DOMPurify 3.4.17 (no CDN)", async () => {
    const p = await openReader("?slug=acne-basics", { encyclopedia_articles: [ARTICLE()] });
    assert.strictEqual(p.window.EMArticleContent.sanitizerVersion(), "3.4.17");
    const html = fs.readFileSync(path.join(H.ROOT, "article/article.html"), "utf8");
    assert(html.includes('src="/js/vendor/dompurify-3.4.17.min.js"') && html.includes('src="/js/article-content.js"'));
    assert(!/cdn[^"]*purify|unpkg[^"]*purify/i.test(html), "sanitizer loaded from a CDN");
    const pkg = JSON.parse(fs.readFileSync(path.join(H.ROOT, "package.json"), "utf8"));
    assert.strictEqual(pkg.devDependencies.dompurify, "3.4.17", "dompurify must be pinned exactly");
    const vendored = fs.readFileSync(path.join(H.ROOT, "js/vendor/dompurify-3.4.17.min.js"), "utf8");
    const fromPkg = fs.readFileSync(path.join(H.ROOT, "node_modules/dompurify/dist/purify.min.js"), "utf8");
    assert.strictEqual(vendored, fromPkg, "vendored file differs from the pinned package");
    p.window.close();
});

test("a STORED malicious article renders with every payload neutralised", async () => {
    const p = await openReader("?slug=evil", { encyclopedia_articles: [ARTICLE({ slug: "evil", content: PAYLOADS })] });
    assertSafe(p.content(), p.window);
    assert(p.content().textContent.includes("external"), "harmless text was lost");
    p.window.close();
});

test("each payload on its own is neutralised (no element, handler or URL survives)", async () => {
    for (const payload of PAYLOADS.split("\n")) {
        const p = await openReader("?slug=x", { encyclopedia_articles: [ARTICLE({ slug: "x", content: payload })] });
        assertSafe(p.content(), p.window);
        p.window.close();
    }
});

test("legitimate formatting is preserved", async () => {
    const p = await openReader("?slug=acne-basics", { encyclopedia_articles: [ARTICLE()] });
    const c = p.content();
    assert.strictEqual(c.querySelector("h2").textContent, "What is acne?");
    assert.strictEqual(c.querySelectorAll("ul li").length, 2);
    assert.strictEqual(c.querySelectorAll("ol li").length, 2);
    assert(c.querySelector("strong") && c.querySelector("em") && c.querySelector("blockquote"));
    const links = [...c.querySelectorAll("a")].map((a) => [a.getAttribute("href"), a.getAttribute("target"), a.getAttribute("rel")]);
    assert.deepStrictEqual(links, [
        ["https://www.aad.org/acne", "_blank", "noopener noreferrer"],
        ["/encyclopedia.html", null, null],
        ["#tips", null, null]
    ]);
    const img = c.querySelector("img");
    assert.strictEqual(img.getAttribute("src"), "https://example.test/diagram.png");
    assert.strictEqual(img.getAttribute("alt"), "Diagram");
    assertSafe(c, p.window);
    p.window.close();
});

test("plain-text fields are never interpreted as HTML", async () => {
    const evil = "<img src=x onerror=\"window.__xss='title'\">";
    const p = await openReader("?slug=t", { encyclopedia_articles: [ARTICLE({ slug: "t", title: evil, summary: evil, category: evil, featured_image: "javascript:alert(1)" })] });
    for (const id of ["articleTitle", "articleSummary", "articleCategory"]) {
        const el = p.document.getElementById(id);
        assert.strictEqual(el.querySelector("img"), null, id + " parsed as HTML");
        assert(el.textContent.includes("<img"), id + " text lost");
    }
    assert(/^https:\/\/placehold\.co\//.test(p.document.getElementById("featuredImage").getAttribute("src")), "unsafe featured_image used");
    assert.strictEqual(p.window.__xss, undefined);
    p.window.close();
});

test("related-article and product cards: text fields escaped, unsafe links dropped, external links safe", async () => {
    const evil = "<img src=x onerror=\"window.__xss='card'\">";
    const rows = {
        encyclopedia_articles: [ARTICLE(), ARTICLE({ id: "a2", slug: "rel \"x\"&y", title: evil, summary: evil, featured_image: "data:image/png;base64,AA" })],
        article_products: [
            { product_id: "p1", article_id: "a1", products: { name: evil, description: evil, selar_link: "javascript:alert(1)", image: "javascript:alert(1)" } },
            { product_id: "p2", article_id: "a1", products: { name: "Cleanser", description: "Gentle", selar_link: "https://selar.com/x" } }
        ]
    };
    const p = await openReader("?slug=acne-basics", rows);
    await p.settle(200);
    for (const id of ["relatedArticles", "recommendedProducts"]) {
        const box = p.document.getElementById(id);
        assert.strictEqual(box.querySelectorAll("img[src='x']").length, 0, id);
        assert(box.textContent.includes("<img"), id + ": text not shown literally");
        for (const img of box.querySelectorAll("img")) assert(/^https:\/\//.test(img.getAttribute("src")), id + " image " + img.getAttribute("src"));
    }
    const related = p.document.querySelector("#relatedArticles a.read-btn");
    assert.strictEqual(related.getAttribute("href"), "/article/article.html?slug=rel+%22x%22%26y");
    const productLinks = [...p.document.querySelectorAll("#recommendedProducts a")].map((a) => [a.getAttribute("href"), a.getAttribute("rel")]);
    assert.deepStrictEqual(productLinks, [["https://selar.com/x", "noopener noreferrer"]]);
    assert.strictEqual(p.window.__xss, undefined);
    p.window.close();
});

test("if the sanitizer fails to load, content is shown as text (fail safe), never as HTML", async () => {
    const db = fakeDb({ encyclopedia_articles: [ARTICLE({ content: "<img src=x onerror=\"window.__xss=1\"><b>bold</b>" })] });
    const p = await load("article/article.html", { signedIn: false, hash: "?slug=acne-basics", before: (w) => {
        w.__fakeFrom = db.from; w.__fakeRpc = db.rpc;
        Object.defineProperty(w, "DOMPurify", { configurable: false, get: () => undefined, set: () => {} });
    } });
    await p.window.EMArticleReader.ready;
    const c = p.document.getElementById("articleContent");
    assert.strictEqual(c.querySelector("img"), null);
    assert.strictEqual(c.querySelector("b"), null);
    assert(c.textContent.includes("<b>bold</b>"));
    p.window.close();
});

/* ---------- View counter ---------- */

test("view counter: missing slug → not found, nothing counted, no query", async () => {
    const p = await openReader("", { encyclopedia_articles: [ARTICLE()] });
    assert.strictEqual(p.document.getElementById("articleTitle").textContent, "Article Not Found");
    assert.strictEqual(viewCalls(p.db).length, 0);
    assert.strictEqual(p.db.calls.length, 0);
    p.window.close();
});

test("view counter: failed lookup (database error) → nothing counted, no fallback write", async () => {
    const p = await openReader("?slug=acne-basics", { encyclopedia_articles: [ARTICLE()] }, { errorFor: { encyclopedia_articles: { name: "PostgrestError", code: "XX000", message: "boom" } } });
    assert.strictEqual(p.document.getElementById("articleTitle").textContent, "Article Not Found");
    assert.strictEqual(viewCalls(p.db).length, 0);
    assert.deepStrictEqual(directUpdates(p.db), []);
    p.window.close();
});

test("view counter: nonexistent slug → nothing counted", async () => {
    const p = await openReader("?slug=nope", { encyclopedia_articles: [ARTICLE()] });
    assert.strictEqual(viewCalls(p.db).length, 0);
    p.window.close();
});

test("view counter: unpublished article is not shown and not counted, even if the database returns it", async () => {
    // ignoreFilters simulates an administrator session for which RLS would return a draft.
    const p = await openReader("?slug=acne-basics", { encyclopedia_articles: [ARTICLE({ status: "draft", title: "Secret draft" })] }, { ignoreFilters: true });
    assert.strictEqual(p.document.getElementById("articleTitle").textContent, "Article Not Found");
    assert(!p.document.body.textContent.includes("Secret draft"));
    assert.strictEqual(viewCalls(p.db).length, 0);
    const q = p.db.calls.find((c) => c.table === "encyclopedia_articles");
    assert(q.ops.some(([op, a]) => op === "eq" && a[0] === "status" && a[1] === "published"), "query must ask for published articles");
    p.window.close();
});

test("view counter: a rendered published article is counted exactly once, via the counting function only", async () => {
    const p = await openReader("?slug=acne-basics", { encyclopedia_articles: [ARTICLE()] });
    await p.settle(300);
    assert.strictEqual(JSON.stringify(viewCalls(p.db).map((c) => c.args)), JSON.stringify([{ article_id: "a1" }]));
    assert.deepStrictEqual(directUpdates(p.db), []);
    // Scrolling / other events must not count again.
    p.window.dispatchEvent(new p.window.Event("scroll"));
    await p.settle(700);
    assert.strictEqual(viewCalls(p.db).length, 1);
    p.window.close();
});

test("view counter: when the counting function fails, there is no direct UPDATE fallback", async () => {
    const p = await openReader("?slug=acne-basics", { encyclopedia_articles: [ARTICLE()], __rpc: { emerriment_increment_article_views: { data: null, error: { name: "PostgrestError", code: "42883" } } } });
    await p.settle(200);
    assert.strictEqual(viewCalls(p.db).length, 1);
    assert.deepStrictEqual(directUpdates(p.db), []);
    p.window.close();
});

/* ---------- Article routes ---------- */

test("articleHref: canonical route, encoded slug, same host, empty slug gives no link", async () => {
    const p = await openReader("?slug=acne-basics", { encyclopedia_articles: [ARTICLE()] });
    const AC = p.window.EMArticleContent;
    assert.strictEqual(AC.articleHref("acne-basics"), "/article/article.html?slug=acne-basics");
    assert.strictEqual(AC.articleHref("a b&c=d/é"), "/article/article.html?slug=a+b%26c%3Dd%2F%C3%A9");
    assert.strictEqual(AC.articleHref("javascript:alert(1)"), "/article/article.html?slug=javascript%3Aalert%281%29");
    for (const v of ["", "   ", null, undefined]) assert.strictEqual(AC.articleHref(v), "");
    const url = new p.window.URL(AC.articleHref("x"), "https://deploy-preview-2--emerriment216.netlify.app/dashboard.html");
    assert.strictEqual(url.host, "deploy-preview-2--emerriment216.netlify.app");
    assert.strictEqual(url.pathname, "/article/article.html");
    p.window.close();
});

test("dashboard: article links use the canonical route and card text is escaped", async () => {
    const evil = "<img src=x onerror=\"window.__xss='dash'\">";
    const articles = [{ id: "a1", title: evil, slug: "acne & oil", category: evil, summary: evil, featured_image: "javascript:alert(1)", status: "published", views: 3, is_featured: true, created_at: "2026-11-01T00:00:00Z", seo_keywords: [], related_conditions: [] }];
    const p = await load("dashboard.html", { rows: {
        encyclopedia_articles: articles,
        reading_history: [{ id: "r1", progress: "50\" onmouseover=\"window.__xss=1", read_at: "2026-11-10T00:00:00Z", encyclopedia_articles: articles[0] }]
    } });
    await p.settle(600);
    const links = [...p.document.querySelectorAll("a")].map((a) => a.getAttribute("href")).filter((h) => h && h.includes("slug="));
    assert(links.length >= 2, "no article links rendered: " + links.length);
    for (const h of links) assert.strictEqual(h, "/article/article.html?slug=acne+%26+oil");
    const where = (el) => { const chain = []; while (el && el !== p.document.body) { chain.push(el.id || el.className || el.tagName); el = el.parentElement; } return chain.join(" < "); };
    assert.strictEqual(p.document.querySelectorAll("img[src='x']").length, 0, "card markup injected at " + [...p.document.querySelectorAll("img[src='x']")].map(where).join(" | "));
    assert(!p.document.querySelector("[onmouseover]"), "attribute injection through progress");
    for (const img of p.document.querySelectorAll(".article-card img")) assert(!/^javascript:/i.test(img.getAttribute("src")));
    assert.strictEqual(p.window.__xss, undefined);
    p.window.close();
});

test("source: no active module still links to the obsolete root article.html", () => {
    const files = ["Dashboard/dashboard-history.js", "Dashboard/dashboard-reading.js", "Dashboard/dashboard-topics.js", "Dashboard/dashboard-ui.js", "ai/js/ai-ui.js", "article/article/js/article.js", "js/encyclopediaCMS.js"];
    for (const f of files) {
        const s = fs.readFileSync(path.join(H.ROOT, f), "utf8");
        assert(!/["'`]article\.html\?slug=/.test(s), f + " still links to article.html?slug=");
    }
});

test("AI resource cards: canonical link, escaped text, safe product links", async () => {
    const p = await load("ai/index.html", { signedIn: false, before: (w) => { w.fetch = async () => ({ ok: true, status: 200, json: async () => ({}) }); } });
    const card = p.window.createArticleCard({ title: "<b>t</b>", summary: "<i>s</i>", slug: "a/b" });
    const box = p.document.createElement("div");
    box.innerHTML = card;
    assert.strictEqual(box.querySelector("a").getAttribute("href"), "/article/article.html?slug=a%2Fb");
    assert.strictEqual(box.querySelector("b"), null);
    assert.strictEqual(box.querySelector("i"), null);
    if (typeof p.window.createProductCard === "function") {
        box.innerHTML = p.window.createProductCard({ name: "<b>n</b>", description: "d", link: "javascript:alert(1)" });
        assert.strictEqual(box.querySelector("a").getAttribute("href"), "#");
        assert.strictEqual(box.querySelector("b"), null);
    }
    p.window.close();
});

/* ---------- CMS authoring (defence in depth) ---------- */

test("CMS new article: content is sanitized before it is saved", async () => {
    const inserts = [];
    const p = await load("admin/new-articleCMS.html", { before: (w) => {
        w.__fakeFrom = (table) => {
            const b = new Proxy({}, { get: (_t, prop) => {
                if (prop === "then") return (r) => r({ data: table === "profiles" ? { is_admin: true } : null, error: null });
                if (prop === "insert") return (payload) => { inserts.push(payload); return b; };
                return () => b;
            } });
            return b;
        };
    } });
    await p.window.EMAdminGuard.requireAdmin();
    await p.settle(100);
    for (const [id, v] of [["title", "T"], ["slug", "t"], ["summary", "S"], ["content", "<p>ok</p><script>x()</script><img src=x onerror=alert(1)>"]]) {
        const el = p.document.getElementById(id);
        if (el) el.value = v;
    }
    p.document.getElementById("articleForm").dispatchEvent(new p.window.Event("submit", { cancelable: true }));
    await p.settle(300);
    assert.strictEqual(inserts.length, 1, "article not saved");
    assert.strictEqual(inserts[0].content, "<p>ok</p>");
    p.window.close();
});

/* ---------- Dashboard privacy ---------- */

test("dashboard: section failures are logged without raw error text or user data", async () => {
    const marker = "row for marker-dashboard@example.test quiz answers";
    const fail = () => Object.assign(new Error(marker), { name: "PostgrestError", code: "42501" });
    const p = await load("dashboard.html", { rows: { quiz_results: fail(), reading_history: fail(), saved_articles: fail(), saved_products: fail(), encyclopedia_articles: fail() } });
    await p.settle(600);
    const out = p.events.console.join("\n");
    for (const v of [marker, USER.id, USER.email]) assert(!out.includes(v), "console contains " + v);
    assert(/PostgrestError/.test(out) && /42501/.test(out), "safe error category missing");
    p.window.close();
});

test("source: dashboard modules never pass raw error objects to console calls", () => {
    for (const f of fs.readdirSync(path.join(H.ROOT, "Dashboard")).filter((x) => x.endsWith(".js"))) {
        const s = fs.readFileSync(path.join(H.ROOT, "Dashboard", f), "utf8");
        assert(!/console\.\w+\(([^;]*,\s*)?error\s*\)/.test(s), f + " logs a raw error object");
    }
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
