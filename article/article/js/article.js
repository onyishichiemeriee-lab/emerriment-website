/* =========================================
   EMerriment — article reader (/article/article.html?slug=…)

   Security (WP4F):
   - Only PUBLISHED articles are shown (status = 'published', also for a
     signed-in administrator; drafts are previewed in the CMS).
   - The article body (content) is rich HTML and is rendered through
     EMArticleContent.renderArticleHTML (DOMPurify, explicit allowlist,
     /js/article-content.js). Every other field is plain text
     (textContent). No database value is written with innerHTML.
   - Image and product URLs are accepted only as https:/http(s) links;
     external links open with rel="noopener noreferrer".

   View counting (documented side effect): each successful render of a
   published article calls emerriment_increment_article_views ONCE per
   page load (a refresh is a new page load and counts again). Nothing is
   counted for a missing slug, a failed or empty lookup, or an
   unpublished article. Opening this page therefore WRITES to the
   database — automated tests must use a mocked client, never live pages.
========================================= */

"use strict";

const supabaseClient = window.supabaseClient;

const slug = new URLSearchParams(window.location.search).get("slug");

const PLACEHOLDER_HERO = "https://placehold.co/1200x600?text=EMerriment";
const PLACEHOLDER_CARD = "https://placehold.co/600x400?text=EMerriment";

let currentArticle = null;
let allArticles = [];
let viewCounted = false;

const AC = window.EMArticleContent;

function safeError(error) {
    if (!error) return { kind: "unknown" };
    return {
        kind: String(error.name || "Error").slice(0, 60),
        code: error.code !== undefined && error.code !== null ? String(error.code).slice(0, 40) : undefined,
        status: Number.isInteger(error.status) ? error.status : undefined
    };
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function showNotFound() {
    document.getElementById("articleTitle").textContent = "Article Not Found";
    const content = document.getElementById("articleContent");
    content.textContent = "";
    content.appendChild(el("p", "", "The requested article could not be found."));
}

// ===============================
// Load Article
// ===============================

async function loadArticle() {

    const wanted = String(slug || "").trim();

    if (!wanted || !supabaseClient) {
        showNotFound();
        return "not-found";
    }

    let data = null;

    try {
        const result = await supabaseClient
            .from("encyclopedia_articles")
            .select("*")
            .eq("slug", wanted)
            .eq("status", "published")
            .maybeSingle();
        if (result.error) {
            console.error("❌ Article could not be loaded:", safeError(result.error));
        } else {
            data = result.data;
        }
    } catch (error) {
        console.error("❌ Article could not be loaded:", safeError(error));
    }

    // Defence in depth: never render or count anything that is not published.
    if (!data || data.status !== "published") {
        showNotFound();
        return "not-found";
    }

    currentArticle = data;

    document.title = String(data.title || "Article") + " | EMerriment";

    const hero = document.getElementById("featuredImage");
    hero.src = AC ? AC.safeImageUrl(data.featured_image, PLACEHOLDER_HERO) : PLACEHOLDER_HERO;
    hero.alt = String(data.title || "");

    document.getElementById("articleCategory").textContent = String(data.category || "");
    document.getElementById("articleTitle").textContent = String(data.title || "");
    document.getElementById("readingTime").textContent = `📖 ${Number(data.reading_time) || 5} min read`;
    document.getElementById("difficulty").textContent = `🎓 ${String(data.difficulty || "Beginner")}`;
    document.getElementById("publishDate").textContent = data.created_at ? new Date(data.created_at).toLocaleDateString() : "";
    document.getElementById("articleSummary").textContent = String(data.summary || "");

    const content = document.getElementById("articleContent");
    if (AC) {
        AC.renderArticleHTML(content, data.content || "");
    } else {
        // The sanitizer script did not load: show the text, never HTML.
        content.textContent = String(data.content || "");
    }

    loadAllArticles();

    loadRecommendedProducts();

    checkSavedStatus();

    saveReadingHistory();

    restoreReadingPosition();

    incrementViews();

    await loadArticleRating();

    return "rendered";

}

// ===============================
// Load All Articles (published only)
// ===============================

async function loadAllArticles() {

    const { data, error } = await window.supabaseClient
        .from("encyclopedia_articles")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

    if (error) console.warn("⚠️ Related articles unavailable:", safeError(error));

    allArticles = (data || []).filter((a) => a && a.status === "published");

    loadRelatedArticles();

    setupNavigation();

}

// ===============================
// Related Articles
// ===============================

function articleCard(article, linkText) {
    const card = el("div", "article-card");
    const img = document.createElement("img");
    img.src = AC ? AC.safeImageUrl(article.featured_image, PLACEHOLDER_CARD) : PLACEHOLDER_CARD;
    img.alt = String(article.title || "");
    img.loading = "lazy";
    card.appendChild(img);
    const body = el("div", "article-content");
    body.appendChild(el("span", "article-category", String(article.category || "")));
    body.appendChild(el("h3", "", String(article.title || "")));
    body.appendChild(el("p", "", String(article.summary || "")));
    const href = AC ? AC.articleHref(article.slug) : "";
    if (href) {
        const link = el("a", "read-btn", linkText);
        link.href = href;
        body.appendChild(link);
    }
    card.appendChild(body);
    return card;
}

function loadRelatedArticles() {

    const container = document.getElementById("relatedArticles");

    container.textContent = "";

    const related = allArticles
        .filter((article) => article.id !== currentArticle.id && article.category === currentArticle.category)
        .slice(0, 3);

    if (!related.length) {
        container.appendChild(el("p", "", "No related articles found."));
        return;
    }

    related.forEach((article) => container.appendChild(articleCard(article, "Read →")));

}

// ===============================
// Recommended Products
// ===============================

async function loadRecommendedProducts() {

    const container = document.getElementById("recommendedProducts");

    container.textContent = "";

    const { data, error } = await window.supabaseClient
        .from("article_products")
        .select(`
            product_id,
            products(*)
        `)
        .eq("article_id", currentArticle.id);

    if (error) console.warn("⚠️ Recommended products unavailable:", safeError(error));

    const products = (data || []).map((item) => item && item.products).filter(Boolean);

    if (!products.length) {
        container.appendChild(el("p", "", "No recommended products."));
        return;
    }

    products.forEach((product) => {
        const card = el("div", "article-card");
        const img = document.createElement("img");
        img.src = AC ? AC.safeImageUrl(product.image_url || product.image, PLACEHOLDER_CARD) : PLACEHOLDER_CARD;
        img.alt = String(product.name || "");
        img.loading = "lazy";
        card.appendChild(img);
        const body = el("div", "article-content");
        body.appendChild(el("h3", "", String(product.name || "")));
        body.appendChild(el("p", "", String(product.description || "")));
        const href = AC ? AC.safeExternalUrl(product.selar_link || product.affiliate_link) : "";
        if (href) {
            const link = el("a", "read-btn", "View Product");
            link.href = href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            body.appendChild(link);
        }
        card.appendChild(body);
        container.appendChild(card);
    });

}

// ===============================
// Save / Unsave
// ===============================

async function checkSavedStatus() {

    const { data: { user } } = await window.supabaseClient.auth.getUser();

    if (!user) return;

    const { data } = await window.supabaseClient
        .from("saved_articles")
        .select("*")
        .eq("user_id", user.id)
        .eq("article_id", currentArticle.id)
        .maybeSingle();

    document.getElementById("saveBtn").textContent = data ? "❤️ Saved" : "🤍 Save Article";

}

document.getElementById("saveBtn").addEventListener("click", toggleSave);

async function toggleSave() {

    const { data: { user } } = await window.supabaseClient.auth.getUser();

    if (!user) {
        location.href = "/login.html";
        return;
    }

    if (!currentArticle) return;

    const { data } = await window.supabaseClient
        .from("saved_articles")
        .select("*")
        .eq("user_id", user.id)
        .eq("article_id", currentArticle.id)
        .maybeSingle();

    if (data) {
        await window.supabaseClient.from("saved_articles").delete().eq("id", data.id);
    } else {
        await window.supabaseClient.from("saved_articles").insert({ user_id: user.id, article_id: currentArticle.id });
    }

    checkSavedStatus();

}

// ===============================
// Share
// ===============================

document.getElementById("shareBtn").addEventListener("click", shareArticle);

async function shareArticle() {

    if (!currentArticle) return;

    const url = location.href;

    if (navigator.share) {
        await navigator.share({ title: currentArticle.title, text: currentArticle.summary, url });
    } else {
        await navigator.clipboard.writeText(url);
        alert("Article link copied.");
    }

}

// ===============================
// Previous / Next
// ===============================

function setupNavigation() {

    const index = allArticles.findIndex((a) => a.id === currentArticle.id);

    const go = (article) => {
        const href = article && AC ? AC.articleHref(article.slug) : "";
        if (href) location.href = href;
    };

    document.getElementById("previousArticle").onclick = () => {
        if (index > -1 && index < allArticles.length - 1) go(allArticles[index + 1]);
    };

    document.getElementById("nextArticle").onclick = () => {
        if (index > 0) go(allArticles[index - 1]);
    };

}

// ===============================
// Save Reading History
// ===============================

async function saveReadingHistory() {

    const { data: { user } } = await window.supabaseClient.auth.getUser();

    if (!user || !currentArticle) return;

    await window.supabaseClient
        .from("reading_history")
        .upsert({
            user_id: user.id,
            article_id: currentArticle.id,
            progress: 0,
            last_position: 0,
            read_at: new Date().toISOString()
        }, {
            onConflict: "user_id,article_id"
        });

}

// ===============================
// Reading Progress
// ===============================

window.addEventListener("scroll", updateReadingProgress);

let saveTimeout;

async function updateReadingProgress() {

    if (!currentArticle) return;

    clearTimeout(saveTimeout);

    saveTimeout = setTimeout(async () => {

        const { data: { user } } = await window.supabaseClient.auth.getUser();

        if (!user) return;

        const scrollTop = window.scrollY;

        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

        const progress = Math.min(100, Math.round((scrollTop / documentHeight) * 100));

        await window.supabaseClient
            .from("reading_history")
            .update({
                progress,
                last_position: scrollTop,
                read_at: new Date().toISOString()
            })
            .eq("user_id", user.id)
            .eq("article_id", currentArticle.id);

    }, 500);

}

// ===============================
// Restore Reading Position
// ===============================

async function restoreReadingPosition() {

    const { data: { user } } = await window.supabaseClient.auth.getUser();

    if (!user || !currentArticle) return;

    const { data } = await window.supabaseClient
        .from("reading_history")
        .select("last_position")
        .eq("user_id", user.id)
        .eq("article_id", currentArticle.id)
        .maybeSingle();

    if (data && data.last_position > 0) {
        setTimeout(() => {
            window.scrollTo({ top: data.last_position, behavior: "smooth" });
        }, 300);
    }

}

// ===============================
// Increment Article Views
// One call per successful render of a published article (see header).
// The former fallback (a direct UPDATE of encyclopedia_articles when the
// function failed) was removed: it raced (read-modify-write) and let
// accounts with update rights bypass the counting function.
// ===============================

async function incrementViews() {

    if (!currentArticle || currentArticle.status !== "published" || viewCounted) return;

    viewCounted = true;

    const { data: rpcViews, error: rpcError } = await window.supabaseClient.rpc(
        "emerriment_increment_article_views",
        { article_id: currentArticle.id }
    );

    if (rpcError) {
        console.warn("⚠️ View not counted:", safeError(rpcError));
        return;
    }

    if (typeof rpcViews === "number") currentArticle.views = rpcViews;

}

// ===============================
// Ratings
// ===============================

let selectedRating = 0;

document.querySelectorAll("#ratingStars span").forEach((star) => {

    star.addEventListener("click", () => {

        selectedRating = Number(star.dataset.rating);

        document.querySelectorAll("#ratingStars span").forEach((s, index) => {
            s.style.opacity = index < selectedRating ? "1" : ".35";
        });

    });

});

let helpful = null;

document.getElementById("helpfulYes").addEventListener("click", () => {
    helpful = true;
});

document.getElementById("helpfulNo").addEventListener("click", () => {
    helpful = false;
});

document.getElementById("submitRating").addEventListener("click", async () => {

    const { data: { user } } = await window.supabaseClient.auth.getUser();

    if (!user || !currentArticle) return;

    const feedback = document.getElementById("feedback").value;

    const { error } = await window.supabaseClient
        .from("article_ratings")
        .upsert({
            user_id: user.id,
            article_id: currentArticle.id,
            rating: selectedRating,
            helpful,
            feedback,
            updated_at: new Date().toISOString()
        }, {
            // One rating per reader per article (unique key);
            // rating again updates it instead of failing.
            onConflict: "user_id,article_id"
        });

    if (error) {
        console.error("❌ Rating not saved:", safeError(error));
        alert("We couldn't save your feedback right now. Please try again.");
        return;
    }

    alert("Thanks for your feedback! 🌿");

});

async function loadArticleRating() {

    if (!currentArticle) return;

    // Average and count only: individual ratings (who rated
    // what, and their comments) are private to each reader.
    // (supabase/migrations/20261113090000_emerriment_production_hardening.sql)
    const { data: summary, error: summaryError } = await window.supabaseClient.rpc(
        "emerriment_article_rating_summary",
        { target_article: currentArticle.id }
    );

    if (summaryError) return;

    const row = Array.isArray(summary) ? summary[0] : summary;

    if (!row || !row.total) return;

    document.getElementById("averageRating").textContent = Number(row.average).toFixed(1);

    document.getElementById("ratingCount").textContent = String(Number(row.total));

}

// ===============================
// Start
// ===============================

window.EMArticleReader = { ready: loadArticle() };
