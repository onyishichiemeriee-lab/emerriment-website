/* Public encyclopedia (encyclopedia.html + js/encyclopediaCMS.js) in jsdom
   with a recording fake Supabase client. Regression tests for the WP4B
   preview finding "encyclopedia lists render empty" (loadArticles defined
   twice, never called, used the library namespace instead of the client).
   Synthetic rows only; no network. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const H = require("../email/helpers");
const { load } = require("./dom-harness");

const suite = H.createSuite("encyclopedia page loads published articles (jsdom)");
const { test } = suite;

const article = (n, extra = {}) => ({
    id: "a" + n, title: "Article " + n, slug: "article-" + n, category: n % 2 ? "Skin Concerns" : "Ingredients",
    summary: "Summary for article " + n, content: "Body " + n, featured_image: "https://example.test/" + n + ".jpg",
    reading_time: 4, views: n * 10, difficulty: "Beginner", author: "EMerriment", is_featured: n <= 2,
    seo_keywords: ["k" + n], related_conditions: [], created_at: "2026-11-0" + (n % 9 + 1) + "T00:00:00Z", status: "published", ...extra
});
const PUBLISHED = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => article(n));
const DRAFT = article(99, { title: "Secret Draft Title", slug: "secret-draft", status: "draft", is_featured: true, views: 9999 });

// Recording fake: applies eq/limit like PostgREST would, records every call.
function recorder(rows, { errors = {} } = {}) {
    const calls = [];
    const from = (table) => {
        const q = { table, ops: [] };
        calls.push(q);
        const b = new Proxy({}, {
            get(_t, prop) {
                if (prop === "then") {
                    return (resolve, reject) => {
                        if (errors[table]) return Promise.resolve({ data: null, error: errors[table] }).then(resolve, reject);
                        let d = (rows[table] || []).slice();
                        for (const [op, args] of q.ops) {
                            if (op === "eq") d = d.filter((r) => r[args[0]] === args[1]);
                            if (op === "limit") d = d.slice(0, args[0]);
                        }
                        return Promise.resolve({ data: d, error: null }).then(resolve, reject);
                    };
                }
                return (...args) => { q.ops.push([prop, args]); return b; };
            }
        });
        return b;
    };
    return { calls, from };
}

async function open({ rows = { encyclopedia_articles: [...PUBLISHED, DRAFT] }, errors, signedIn = false, hash = "", supabaseLoads = true } = {}) {
    const rec = recorder(rows, { errors });
    const p = await load("encyclopedia.html", { signedIn, hash, supabaseLoads, before: (w) => { w.__fakeFrom = rec.from; } });
    if (p.window.EMEncyclopedia && p.window.EMEncyclopedia.ready) await p.window.EMEncyclopedia.ready;
    await p.settle(50);
    const $ = (id) => p.document.getElementById(id);
    const titles = (id) => [...$(id).querySelectorAll(".article-title")].map((n) => n.textContent.trim());
    return { ...p, rec, $, titles, status: () => $("articlesStatus") };
}

test("published articles actually load into the main list (first page of 6) with no errors", async () => {
    const p = await open();
    assert.strictEqual(p.window.EMEncyclopedia.state.status, "loaded");
    assert.strictEqual(p.titles("articlesContainer").length, 6);
    assert(p.titles("articlesContainer").includes("Article 1"));
    assert.strictEqual(p.status().hidden, true, "status line should be hidden once loaded");
    assert.notStrictEqual(p.$("loadMoreBtn").style.display, "none", "load more should be offered (8 > 6)");
    assert.deepStrictEqual(p.events.errors, []);
    p.window.close();
});

test("the query asks for status = 'published' explicitly, with a limit, and runs exactly once", async () => {
    const p = await open();
    const q = p.rec.calls.filter((c) => c.table === "encyclopedia_articles");
    assert.strictEqual(q.length, 1, "expected exactly one article query");
    assert(q[0].ops.some(([op, a]) => op === "eq" && a[0] === "status" && a[1] === "published"), "no status filter");
    assert(q[0].ops.some(([op]) => op === "limit"), "no limit");
    assert.strictEqual(p.window.EMEncyclopedia.state.loads, 1);
    p.window.close();
});

test("drafts never appear anywhere on the page, even if the database returns one", async () => {
    // Simulate an administrator session where RLS would return drafts and the
    // filter were ignored: the page must still not render it.
    const rec = recorder({});
    rec.from = (table) => {
        const thenable = { then: (r) => r({ data: table === "encyclopedia_articles" ? [...PUBLISHED, DRAFT] : [], error: null }) };
        const b = new Proxy(thenable, { get: (t, prop) => prop === "then" ? t.then : () => b });
        return b;
    };
    const p = await load("encyclopedia.html", { signedIn: false, before: (w) => { w.__fakeFrom = rec.from; } });
    await p.window.EMEncyclopedia.ready;
    assert(!p.document.body.textContent.includes("Secret Draft Title"), "draft rendered");
    p.window.close();
});

test("featured, recommended and trending lists are filled from the published set", async () => {
    const p = await open();
    assert.deepStrictEqual(p.titles("featuredContainer").sort(), ["Article 1", "Article 2"]);
    assert(p.titles("recommendedContainer").length >= 1);
    assert.strictEqual(p.titles("trendingContainer")[0], "Article 8", "trending should be ordered by views");
    assert(!p.titles("trendingContainer").includes("Secret Draft Title"));
    p.window.close();
});

test("cards link to the real article reader with an encoded slug", async () => {
    const p = await open({ rows: { encyclopedia_articles: [article(1, { slug: "acne & oil" })] } });
    const href = p.$("articlesContainer").querySelector("a.read-btn").getAttribute("href");
    assert.strictEqual(href, "article/article.html?slug=acne%20%26%20oil");
    assert(fs.existsSync(path.join(H.ROOT, "article/article.html")), "article reader page missing");
    p.window.close();
});

test("load more shows the next page and then hides itself", async () => {
    const p = await open();
    p.$("loadMoreBtn").click();
    assert.strictEqual(p.titles("articlesContainer").length, 8);
    assert.strictEqual(p.$("loadMoreBtn").style.display, "none");
    p.window.close();
});

test("search filters, highlights with <mark>, and 'no matches' is distinct from 'empty'", async () => {
    const p = await open();
    const input = p.$("searchInput");
    input.value = "article 7";
    input.dispatchEvent(new p.window.Event("input"));
    assert.deepStrictEqual(p.titles("articlesContainer"), ["Article 7"]);
    assert(p.$("articlesContainer").querySelector("mark"), "no highlight");
    input.value = "zzz-nothing";
    input.dispatchEvent(new p.window.Event("input"));
    assert.strictEqual(p.status().dataset.state, "no-matches");
    assert.strictEqual(p.status().hidden, false);
    assert(p.$("articlesContainer").querySelector(".no-results"));
    p.window.close();
});

test("search with regex characters does not throw", async () => {
    const p = await open();
    const input = p.$("searchInput");
    for (const v of ["(", "[a-", "*", "\\"]) {
        input.value = v;
        input.dispatchEvent(new p.window.Event("input"));
    }
    assert.deepStrictEqual(p.events.errors, []);
    p.window.close();
});

test("category buttons filter the list", async () => {
    const p = await open();
    p.document.querySelector('.category-btn[data-category="Ingredients"]').click();
    const t = p.titles("articlesContainer");
    assert(t.length > 0 && t.every((x) => Number(x.split(" ")[1]) % 2 === 0), "non-matching category shown: " + t);
    assert.strictEqual(p.document.querySelector('.category-btn[data-category="Ingredients"]').getAttribute("aria-pressed"), "true");
    p.window.close();
});

test("?search= in the address is applied after loading (bounded length)", async () => {
    const p = await open({ hash: "?search=Article%203" });
    assert.deepStrictEqual(p.titles("articlesContainer"), ["Article 3"]);
    p.window.close();
});

test("empty state: nothing published shows a clear message (not a blank page, not an error)", async () => {
    const p = await open({ rows: { encyclopedia_articles: [] } });
    assert.strictEqual(p.window.EMEncyclopedia.state.status, "empty");
    assert.strictEqual(p.status().dataset.state, "empty");
    assert.match(p.status().textContent, /No articles have been published yet/);
    assert.strictEqual(p.$("loadMoreBtn").style.display, "none");
    assert.strictEqual(p.$("featuredContainer").closest("section").hidden, true, "empty featured section left visible");
    p.window.close();
});

test("error state: a database error shows a message and is logged only as a category", async () => {
    const err = { name: "PostgrestError", code: "42501", status: 401, message: "permission denied for row with email marker-person@example.test", details: "secret-detail-marker" };
    const p = await open({ errors: { encyclopedia_articles: err } });
    assert.strictEqual(p.window.EMEncyclopedia.state.status, "error");
    assert.strictEqual(p.status().dataset.state, "error");
    assert.match(p.status().textContent, /couldn't load the encyclopedia/);
    const out = p.events.console.join("\n");
    assert(!out.includes("marker-person@example.test") && !out.includes("secret-detail-marker"), "raw error logged");
    assert(/PostgrestError/.test(out) && /42501/.test(out));
    p.window.close();
});

test("error state: the Supabase library failing to load gives a visible message, no uncaught error", async () => {
    const p = await open({ supabaseLoads: false });
    assert.strictEqual(p.status().dataset.state, "error");
    assert.strictEqual(p.status().hidden, false);
    assert(!p.events.errors.some((e) => /uncaught/.test(e)), p.events.errors.join("; "));
    p.window.close();
});

test("loading state is announced while the query is in flight", async () => {
    let release;
    const p = await load("encyclopedia.html", { signedIn: false, before: (w) => {
        w.__fakeFrom = () => {
            const b = new Proxy({}, { get: (_t, prop) => prop === "then" ? (r) => { release = () => r({ data: PUBLISHED, error: null }); } : () => b });
            return b;
        };
    } });
    const status = p.document.getElementById("articlesStatus");
    assert.strictEqual(status.dataset.state, "loading");
    assert.strictEqual(status.getAttribute("aria-live"), "polite");
    assert.strictEqual(p.document.getElementById("articlesContainer").getAttribute("aria-busy"), "true");
    release();
    await p.window.EMEncyclopedia.ready;
    assert.strictEqual(status.hidden, true);
    p.window.close();
});

test("article content is rendered as text: no HTML or unsafe image URLs from the database", async () => {
    const p = await open({ rows: { encyclopedia_articles: [article(1, { title: "<img src=x onerror=alert(1)>", summary: "<script>bad()</script>", featured_image: "javascript:alert(1)" })] } });
    const card = p.$("articlesContainer").querySelector(".article-card");
    assert.strictEqual(card.querySelectorAll("img").length, 1, "injected element present");
    assert.strictEqual(card.querySelector("script"), null);
    assert(card.querySelector(".article-title").textContent.includes("<img src=x"));
    assert(/^https:\/\/placehold\.co\//.test(card.querySelector("img").getAttribute("src")));
    p.window.close();
});

test("continue reading: guests get a sign-in hint and reading_history is NOT queried", async () => {
    const p = await open({ signedIn: false });
    const box = p.$("continueReadingContainer");
    assert.match(box.textContent, /Sign in to pick up/);
    assert(box.querySelector('a[href="login.html"]'));
    assert(!p.rec.calls.some((c) => c.table === "reading_history"), "private table queried for a guest");
    p.window.close();
});

test("continue reading: a signed-in reader sees their own published history only", async () => {
    const p = await open({ signedIn: true, rows: { encyclopedia_articles: PUBLISHED, reading_history: [{ read_at: "2026-11-10", encyclopedia_articles: PUBLISHED[2] }, { read_at: "2026-11-09", encyclopedia_articles: DRAFT }] } });
    assert.deepStrictEqual(p.titles("continueReadingContainer"), ["Article 3"]);
    p.window.close();
});

test("source: exactly one loadArticles, uses the configured client, no innerHTML", () => {
    const src = fs.readFileSync(path.join(H.ROOT, "js/encyclopediaCMS.js"), "utf8");
    assert.strictEqual((src.match(/function loadArticles\b/g) || []).length, 1);
    assert(/window\.supabaseClient/.test(src), "must use the configured client from js/supabase.js");
    assert(!/window\.supabase\s*\.\s*from|^\s*await supabase\s*$/m.test(src), "uses the library namespace instead of the client");
    assert(!/innerHTML/.test(src), "innerHTML used");
    assert(!/new RegExp/.test(src), "RegExp built from input");
    assert(!/console\.\w+\([^)]*,\s*error\s*\)/.test(src), "raw error logged");
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
