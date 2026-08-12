// =========================================
// EMerriment Dashboard
// =========================================

const supabaseClient = window.supabaseClient;
// -----------------------------
// Check Authentication
// -----------------------------
async function checkUser() {

    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    if (error || !user) {
        window.location.href = "login.html";
        return;
    }

    loadUserProfile(user);
}

// -----------------------------
// Load User Profile
// -----------------------------
async function loadUserProfile(user) {

    // Welcome Message
    const welcomeMessage = document.getElementById("welcomeMessage");

    const fullName =
        user.user_metadata?.full_name ||
        user.email.split("@")[0];

    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome back, ${fullName}! 👋`;
    }

    // Load Profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    console.log("Profile:", profile);

    // Load Dashboard Statistics
    loadDashboardStats(user.id);
}

// -----------------------------
// Dashboard Statistics
// -----------------------------
async function loadDashboardStats(userId) {

    try {

        // Quiz Results
        const { count: quizCount } = await supabase
            .from("quiz_results")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("user_id", userId);

        // Saved Articles
        const { count: articleCount } = await supabase
            .from("favorite_articles")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("user_id", userId);

        // Recommended Products
        const { count: productCount } = await supabase
            .from("saved_products")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("user_id", userId);

        document.getElementById("quizCount").textContent =
            quizCount || 0;

        document.getElementById("savedArticles").textContent =
            articleCount || 0;

        document.getElementById("recommendedProducts").textContent =
            productCount || 0;

        const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

if (profile) {
    document.getElementById("skinScore").textContent =
        profile.current_skin_score ?? "--";
}

    } catch (err) {

        console.error(err);

    }

}

// -----------------------------
// Logout
// -----------------------------
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        const confirmed = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmed) return;

        await supabase.auth.signOut();

        window.location.href = "login.html";

    });

}

// -----------------------------
// Listen for Auth Changes
// -----------------------------
supabase.auth.onAuthStateChange((event) => {

    if (event === "SIGNED_OUT") {

        window.location.href = "login.html";

    }

});

// -----------------------------
// Initialize Dashboard
// -----------------------------
checkUser();

async function loadSkinProfile(userId) {

    const { data } = await supabase

        .from("quiz_results")

        .select("*")

        .eq("user_id", userId)

        .order("created_at", { ascending: false })

        .limit(1)

        .maybeSingle();

    return data;

}

async function loadRecommendedArticles(profile) {

    if (!profile) return;

    const profile = await loadSkinProfile(user.id);

const readingHistory =
await loadReadingHistory(user.id);

const savedArticles =
await loadSavedArticleData(user.id);

const { data: articles } =
await supabase

.from("encyclopedia_articles")

.select("*");

const rankedArticles = articles

.map(article => {

    const score = recommender.calculateArticleScore(

        article,

        profile,

        readingHistory,

        savedArticles

    );

    console.log(article.title, score);

    return {

        article,

        score

    };

})

.sort((a,b)=>b.score-a.score)

.map(item=>item.article)

.slice(0,6);
renderCards(

    "recommendedArticles",

    rankedArticles

);

calculateProductScore(product, profile)

    let score = 0;

    if(!profile) return score;

    if(product.skin_concern === profile.concern){

        score += 50;

    }

    if(product.skin_type === profile.skin_type){

        score += 30;

    }

    if(product.is_featured){

        score += 20;

    }

    return score;

}

async function loadTrendingArticles() {

    const { data } = await supabase

        .from("encyclopedia_articles")

        .select("*")

        .order("views", { ascending: false })

        .limit(6);

    renderCards(
        "trendingArticles",
        data || []
    );

}

async function loadSavedArticles(userId) {

    const { data } = await supabase

        .from("saved_articles")

        .select(`
            encyclopedia_articles(*)
        `)

        .eq("user_id", userId);

    const articles = (data || []).map(
        item => item.encyclopedia_articles
    );

    renderCards(
        "savedArticles",
        articles
    );

}

async function loadLatestArticles() {

    const { data } = await supabase

        .from("encyclopedia_articles")

        .select("*")

        .order("created_at", {
            ascending: false
        })

        .limit(6);

    renderCards(
        "latestArticles",
        data || []
    );

}

async function loadRecommendedProducts(profile) {

    if (!profile) return;

    const { data } = await supabase

        .from("products")

        .select("*")

        .eq("skin_concern", profile.concern)

        .limit(6);

    renderProductCards(
        "recommendedProducts",
        data || []
    );

}

const profile = await loadContinueReading(user.id);

await loadRecentlyViewed(user.id);

await loadPopularTopics();

await loadRecommendedArticles(profile);

await loadTrendingArticles();

await loadSavedArticles(user.id);

await loadRecommendedProducts(profile);

await loadLatestArticles();

function renderCards(containerId, articles) {

    const container = document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = "";

    if (!articles.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No articles available</h3>
                <p>Check back later for more skincare content.</p>
            </div>
        `;

        return;

    }

    articles.forEach(article => {

        const card = document.createElement("div");

        card.className = "article-card";

        card.innerHTML = `

            <img src="${article.featured_image || 'https://placehold.co/600x400?text=EMerriment'}"
                 alt="${article.title}">

            <div class="article-content">

                <span class="article-category">

                    ${article.category || "General"}

                </span>

                <h3 class="article-title">

                    ${article.title}

                </h3>

                <p class="article-summary">

                    ${article.summary || ""}

                </p>

                <div class="article-meta">

                    <span>👁 ${article.views || 0}</span>

                    <span>📖 ${article.reading_time || 5} min</span>

                </div>

                <a class="read-btn"

                   href="article.html?slug=${article.slug}">

                    Read Article →

                </a>

            </div>

        `;

        container.appendChild(card);

    });

}

function renderProductCards(containerId, products) {

    const container = document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = "";

    if (!products.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No products available</h3>
                <p>Products matching your skin profile will appear here.</p>
            </div>
        `;

        return;

    }

    products.forEach(product => {

        const card = document.createElement("div");

        card.className = "article-card";

        card.innerHTML = `

            <img src="${product.image_url || 'https://placehold.co/600x400?text=EMerriment'}"
                 alt="${product.name}">

            <div class="article-content">

                <h3 class="article-title">

                    ${product.name}

                </h3>

                <p class="article-summary">

                    ${product.description || ""}

                </p>

                <div class="article-meta">

                    <span>

                        ${product.skin_concern || "All Skin Types"}

                    </span>

                </div>

                <a

                    class="read-btn"

                    href="${product.affiliate_link || '#'}"

                    target="_blank">

                    View Product →

                </a>

            </div>

        `;

        container.appendChild(card);

    });

}

const recommender =
new RecommendationEngine();

async function loadReadingHistory(userId) {

    const { data } = await supabase

        .from("reading_history")

        .select(`
            *,
            encyclopedia_articles(
                id,
                title,
                category,
                seo_keywords,
                related_conditions
            )
        `)

        .eq("user_id", userId)

        .order("read_at", {
            ascending: false
        })

        .limit(10);

    return data || [];

}

async function loadSavedArticleData(userId){

    const { data } = await supabase

        .from("saved_articles")

        .select(`
            encyclopedia_articles(*)
        `)

        .eq("user_id", userId);

    return (data || [])

        .map(item => item.encyclopedia_articles)

        .filter(Boolean);

}

async function loadContinueReading(userId) {

    const { data, error } = await supabase

        .from("reading_history")

        .select(`
            progress,
            last_position,
            read_at,
            encyclopedia_articles(*)
        `)

        .eq("user_id", userId)

        .lt("progress", 100)

        .order("read_at", {
            ascending: false
        })

        .limit(6);

    if (error) {

        console.error(error);

        return;

    }

    renderContinueReading(data || []);

}

function renderContinueReading(items) {

    const container = document.getElementById("continueReadingContainer");

    if (!container) return;

    container.innerHTML = "";

    if (!items.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>You're all caught up! 🎉</h3>
                <p>Start reading an article to see it here.</p>
            </div>
        `;

        return;

    }

    items.forEach(item => {

        const article = item.encyclopedia_articles;

        const card = document.createElement("div");

        card.className = "article-card";

        card.innerHTML = `

            <img src="${article.featured_image || 'https://placehold.co/600x400?text=EMerriment'}"
                 alt="${article.title}">

            <div class="article-content">

                <span class="article-category">

                    ${article.category}

                </span>

                <h3>

                    ${article.title}

                </h3>

                <div class="progress-bar">

                    <div
                        class="progress-fill"
                        style="width:${item.progress}%">
                    </div>

                </div>

                <p>

                    ${item.progress}% completed

                </p>

                <a
                    class="read-btn"
                    href="article.html?slug=${article.slug}">

                    Continue Reading →

                </a>

            </div>

        `;

        container.appendChild(card);

    });

}

async function loadRecentlyViewed(userId) {

    const { data, error } = await supabase

        .from("reading_history")

        .select(`
            read_at,
            progress,
            encyclopedia_articles(*)
        `)

        .eq("user_id", userId)

        .order("read_at", {
            ascending: false
        })

        .limit(8);

    if (error) {

        console.error(error);

        return;

    }

    renderRecentlyViewed(data || []);

}

function renderRecentlyViewed(items) {

    const container = document.getElementById("recentlyViewedContainer");

    if (!container) return;

    container.innerHTML = "";

    if (!items.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No recently viewed articles</h3>
                <p>Your reading history will appear here.</p>
            </div>
        `;

        return;

    }

    items.forEach(item => {

        const article = item.encyclopedia_articles;

        if (!article) return;

        const viewedDate = new Date(item.read_at).toLocaleDateString();

        const card = document.createElement("div");

        card.className = "article-card";

        card.innerHTML = `

            <img src="${article.featured_image || 'https://placehold.co/600x400?text=EMerriment'}"
                 alt="${article.title}">

            <div class="article-content">

                <span class="article-category">

                    ${article.category || "General"}

                </span>

                <h3>

                    ${article.title}

                </h3>

                <p>

                    Last viewed: ${viewedDate}

                </p>

                <p>

                    Progress: ${item.progress || 0}%

                </p>

                <a
                    class="read-btn"
                    href="article.html?slug=${article.slug}">

                    Open Again →

                </a>

            </div>

        `;

        container.appendChild(card);

    });

}

async function clearReadingHistory(userId) {

    const { error } = await supabase

        .from("reading_history")

        .delete()

        .eq("user_id", userId);

    if (error) {

        console.error(error);

        return;

    }

    loadRecentlyViewed(userId);

}

document
.getElementById("clearHistoryBtn")
.addEventListener("click", async () => {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (user) {

        await clearReadingHistory(user.id);

    }

});

async function loadPopularTopics() {

    const { data, error } = await supabase

        .from("encyclopedia_articles")

        .select(`
            category,
            related_conditions,
            views
        `);

    if (error) {

        console.error(error);

        return;

    }

    const topicScores = {};

    data.forEach(article => {

        // Category

        if (article.category) {

            topicScores[article.category] =
                (topicScores[article.category] || 0)
                + (article.views || 0);

        }

        // Related Conditions

        (article.related_conditions || []).forEach(condition => {

            topicScores[condition] =
                (topicScores[condition] || 0)
                + (article.views || 0);

        });

    });

    const topics = Object.entries(topicScores)

        .sort((a, b) => b[1] - a[1])

        .slice(0, 10);

    renderPopularTopics(topics);

}

function renderPopularTopics(topics) {

    const container =

        document.getElementById("popularTopicsContainer");

    if (!container) return;

    container.innerHTML = "";

    topics.forEach(([topic, views]) => {

        const card = document.createElement("div");

        card.className = "topic-card";

        card.innerHTML = `

            <h3>${topic}</h3>

            <p>${views} views</p>

        `;

        card.addEventListener("click", () => {

            window.location.href =
                "encyclopedia.html?search=" +
                encodeURIComponent(topic);

        });

        container.appendChild(card);

    });

}