/* =========================================
   EMerriment Encyclopedia (public list page)
   Used by /encyclopedia.html and /encyclopediaCMS.html.

   One authoritative loader (loadArticles) runs once the DOM is ready and
   the Supabase client from js/supabase.js exists. It asks only for
   PUBLISHED articles (status = 'published', the same rule as the public
   RLS policy, so drafts stay hidden even when an administrator is signed
   in on this public page). Featured, recommended and trending lists are
   derived from that one result; nothing else is queried for visitors.

   States are distinct and announced: loading, loaded, empty (nothing
   published yet), no matches (search / category) and error.
   Cards are built with DOM nodes and textContent only (no HTML from the
   database or the search box is ever inserted). Errors are logged only
   as {kind, code, status}.

   "Continue reading" is personal: shown only with a signed-in session and
   read from reading_history (RLS: own rows only). Guests get a sign-in hint.
========================================= */

"use strict";

(function () {

    const PAGE_SIZE = 6;
    const MAX_ARTICLES = 200;   // no unbounded download; paging is client-side
    const PLACEHOLDER_IMAGE = "https://placehold.co/600x400?text=EMerriment";
    const ARTICLE_PAGE = "article/article.html";

    const state = {
        status: "idle",          // idle | loading | loaded | empty | error
        all: [],
        filtered: [],
        category: "All",
        visible: PAGE_SIZE,
        loads: 0
    };

    let els = {};

    function safeError(error) {
        if (!error) return { kind: "unknown" };
        return {
            kind: String(error.name || "Error").slice(0, 60),
            code: error.code !== undefined && error.code !== null ? String(error.code).slice(0, 40) : undefined,
            status: Number.isInteger(error.status) ? error.status : undefined
        };
    }

    function client() {
        const c = window.supabaseClient;
        return c && typeof c.from === "function" ? c : null;
    }

    /* ---------- Status line (loading / empty / no matches / error) ---------- */

    function ensureStatusElement() {
        if (!els.articles) return null;
        let el = document.getElementById("articlesStatus");
        if (!el) {
            el = document.createElement("p");
            el.id = "articlesStatus";
            el.className = "articles-status";
            el.setAttribute("role", "status");
            el.setAttribute("aria-live", "polite");
            els.articles.parentNode.insertBefore(el, els.articles);
        }
        return el;
    }

    function setStatus(kind, text) {
        const el = ensureStatusElement();
        if (!el) return;
        el.dataset.state = kind;
        el.textContent = text || "";
        el.hidden = !text;
        if (els.articles) els.articles.setAttribute("aria-busy", kind === "loading" ? "true" : "false");
    }

    /* ---------- Cards ---------- */

    // Appends `text` to `parent`, wrapping case-insensitive matches of
    // `keyword` in <mark>. Plain string search: no RegExp from user input.
    function appendHighlighted(parent, text, keyword) {
        const value = String(text || "");
        const needle = String(keyword || "").trim().toLowerCase();
        if (!needle) {
            parent.appendChild(document.createTextNode(value));
            return;
        }
        const lower = value.toLowerCase();
        let from = 0;
        let at = lower.indexOf(needle, from);
        while (at !== -1) {
            if (at > from) parent.appendChild(document.createTextNode(value.slice(from, at)));
            const mark = document.createElement("mark");
            mark.textContent = value.slice(at, at + needle.length);
            parent.appendChild(mark);
            from = at + needle.length;
            at = lower.indexOf(needle, from);
        }
        if (from < value.length) parent.appendChild(document.createTextNode(value.slice(from)));
    }

    function imageUrl(value) {
        const s = String(value || "").trim();
        return /^https:\/\//i.test(s) ? s : PLACEHOLDER_IMAGE;
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function createCard(article, keyword) {
        const card = el("div", "article-card");

        const img = document.createElement("img");
        img.src = imageUrl(article.featured_image);
        img.alt = String(article.title || "Encyclopedia article");
        img.loading = "lazy";
        card.appendChild(img);

        const content = el("div", "article-content");
        content.appendChild(el("span", "article-category", String(article.category || "")));

        const title = el("h3", "article-title");
        appendHighlighted(title, article.title, keyword);
        content.appendChild(title);

        const summary = el("p", "article-summary");
        appendHighlighted(summary, article.summary, keyword);
        content.appendChild(summary);

        const meta = el("div", "article-meta");
        meta.appendChild(el("span", "", "👁 " + (Number(article.views) || 0) + " views"));
        meta.appendChild(el("span", "", "📖 " + (Number(article.reading_time) || 5) + " min"));
        meta.appendChild(el("span", "", String(article.difficulty || "Beginner")));
        content.appendChild(meta);

        const link = el("a", "read-btn", "Read Article →");
        link.href = ARTICLE_PAGE + "?slug=" + encodeURIComponent(String(article.slug || ""));
        content.appendChild(link);

        card.appendChild(content);
        return card;
    }

    // Fills a side list; hides its whole section when there is nothing to show.
    function fillList(container, articles) {
        if (!container) return;
        container.textContent = "";
        articles.forEach((a) => container.appendChild(createCard(a, "")));
        const section = container.closest("section");
        if (section) section.hidden = articles.length === 0;
    }

    /* ---------- Rendering ---------- */

    function renderSideLists() {
        const featured = state.all.filter((a) => a.is_featured);
        fillList(els.featured, featured);
        fillList(els.recommended, featured.slice(0, 3));
        fillList(els.trending, [...state.all].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0)).slice(0, PAGE_SIZE));
    }

    function renderArticles() {
        if (!els.articles) return;
        els.articles.textContent = "";
        const keyword = els.search ? els.search.value : "";

        if (state.status !== "loaded") {
            if (els.loadMore) els.loadMore.style.display = "none";
            return;
        }

        if (state.filtered.length === 0) {
            const box = el("div", "no-results");
            box.appendChild(el("h2", "", "🔍 No articles found"));
            box.appendChild(el("p", "", "Try another keyword or category."));
            els.articles.appendChild(box);
            setStatus("no-matches", "No articles match your search.");
            if (els.loadMore) els.loadMore.style.display = "none";
            return;
        }

        state.filtered.slice(0, state.visible).forEach((a) => els.articles.appendChild(createCard(a, keyword)));
        setStatus("loaded", "");
        if (els.loadMore) {
            els.loadMore.style.display = state.visible >= state.filtered.length ? "none" : "inline-block";
        }
    }

    function applyFilters() {
        state.visible = PAGE_SIZE;
        const keyword = (els.search ? els.search.value : "").trim().toLowerCase();
        state.filtered = state.all.filter((article) => {
            const matchesCategory = state.category === "All" || article.category === state.category;
            if (!matchesCategory) return false;
            if (!keyword) return true;
            const haystack = [
                article.title, article.summary, article.content, article.category,
                article.author, article.difficulty, article.slug,
                (article.seo_keywords || []).join(" "),
                (article.related_conditions || []).join(" ")
            ].map((v) => String(v || "").toLowerCase()).join("\n");
            return haystack.includes(keyword);
        });
        renderArticles();
    }

    /* ---------- Loading ---------- */

    async function loadArticles() {
        state.loads++;
        const supabase = client();
        if (!supabase) {
            state.status = "error";
            setStatus("error", "We couldn't load the encyclopedia right now. Please check your connection and reload the page.");
            renderArticles();
            return state.status;
        }

        state.status = "loading";
        setStatus("loading", "Loading articles…");

        try {
            const { data, error } = await supabase
                .from("encyclopedia_articles")
                .select("*")
                .eq("status", "published")
                .order("created_at", { ascending: false })
                .limit(MAX_ARTICLES);

            if (error) throw error;

            // Defence in depth: never render anything that is not published.
            state.all = (Array.isArray(data) ? data : []).filter((a) => a && a.status === "published");
        } catch (error) {
            console.error("❌ Encyclopedia articles could not be loaded:", safeError(error));
            state.status = "error";
            state.all = [];
            setStatus("error", "We couldn't load the encyclopedia right now. Please try again later.");
            renderSideLists();
            renderArticles();
            return state.status;
        }

        if (state.all.length === 0) {
            state.status = "empty";
            setStatus("empty", "No articles have been published yet. Please check back soon.");
            renderSideLists();
            renderArticles();
            return state.status;
        }

        state.status = "loaded";
        renderSideLists();
        applyFilters();
        return state.status;
    }

    async function loadContinueReading() {
        const container = document.getElementById("continueReadingContainer");
        if (!container) return "absent";
        const section = container.closest("section");
        const supabase = client();
        container.textContent = "";

        let session = null;
        try {
            const result = supabase && supabase.auth ? await supabase.auth.getSession() : null;
            session = result && result.data ? result.data.session : null;
        } catch (error) {
            session = null;
        }

        if (!session) {
            const hint = el("p", "continue-reading-hint");
            hint.appendChild(document.createTextNode("Sign in to pick up the articles you've started. "));
            const link = el("a", "", "Log in");
            link.href = "login.html";
            hint.appendChild(link);
            container.appendChild(hint);
            if (section) section.hidden = false;
            return "guest";
        }

        try {
            const { data, error } = await supabase
                .from("reading_history")
                .select("read_at, encyclopedia_articles(*)")
                .order("read_at", { ascending: false })
                .limit(5);
            if (error) throw error;
            const articles = (data || [])
                .map((row) => row && row.encyclopedia_articles)
                .filter((a) => a && a.status === "published");
            articles.forEach((a) => container.appendChild(createCard(a, "")));
            if (section) section.hidden = articles.length === 0;
            return articles.length ? "shown" : "none";
        } catch (error) {
            console.warn("⚠️ Continue reading unavailable:", safeError(error));
            if (section) section.hidden = true;
            return "error";
        }
    }

    /* ---------- Wiring ---------- */

    function init() {
        els = {
            articles: document.getElementById("articlesContainer"),
            featured: document.getElementById("featuredContainer"),
            recommended: document.getElementById("recommendedContainer"),
            trending: document.getElementById("trendingContainer"),
            search: document.getElementById("searchInput"),
            loadMore: document.getElementById("loadMoreBtn")
        };

        if (!els.articles) return;

        if (els.search) {
            els.search.addEventListener("input", applyFilters);
            els.search.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    applyFilters();
                }
            });
            const params = new URLSearchParams(window.location.search);
            const topic = params.get("search");
            if (topic) els.search.value = topic.slice(0, 100);
        }

        const buttons = document.querySelectorAll(".category-btn");
        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                buttons.forEach((b) => {
                    b.classList.remove("active");
                    b.setAttribute("aria-pressed", "false");
                });
                button.classList.add("active");
                button.setAttribute("aria-pressed", "true");
                state.category = button.dataset.category || "All";
                applyFilters();
            });
        });

        if (els.loadMore) {
            els.loadMore.style.display = "none";
            els.loadMore.addEventListener("click", () => {
                state.visible += PAGE_SIZE;
                renderArticles();
            });
        }

        window.EMEncyclopedia.ready = Promise.all([loadArticles(), loadContinueReading()]);
    }

    window.EMEncyclopedia = { state, loadArticles, loadContinueReading, applyFilters, ready: null };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
