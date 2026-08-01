const supabase = window.supabaseClient;

const articlesContainer = document.getElementById("articlesContainer");
const featuredContainer = document.getElementById("featuredContainer");
const recommendedContainer = document.getElementById("recommendedContainer");

const searchInput = document.getElementById("searchInput");
const loadMoreBtn = document.getElementById("loadMoreBtn");

const categoryButtons =
document.querySelectorAll(".category-btn");

let allArticles = [];

let filteredArticles = [];

let currentCategory = "All";

let visibleArticles = 6;

// --------------------------------
// Load Encyclopedia
// --------------------------------

async function loadArticles(){

const { data,error } =

await supabase

.from("encyclopedia_articles")

.select("*")

.order("created_at",{ascending:false});

if(error){

console.error(error);

return;

}

allArticles = data || [];

filteredArticles = [...allArticles];

renderFeatured();

renderRecommended();

loadTrendingArticles();

renderArticles();

}

// --------------------------------
// Featured Articles
// --------------------------------

function renderFeatured(){

featuredContainer.innerHTML="";

const featured=

allArticles.filter(

article=>article.is_featured

);

featured.forEach(article=>{

featuredContainer.appendChild(

createCard(article)

);

});

}

// --------------------------------
// Recommended Articles
// --------------------------------

function renderRecommended(){

recommendedContainer.innerHTML="";

const recommendations=

allArticles

.filter(article=>article.is_featured)

.slice(0,3);

recommendations.forEach(article=>{

recommendedContainer.appendChild(

createCard(article)

);

});

}

// --------------------------------
// Render Articles
// --------------------------------

function renderArticles(){

articlesContainer.innerHTML="";

const visible=

filteredArticles.slice(

0,

visibleArticles

);

visible.forEach(article=>{

articlesContainer.appendChild(

createCard(article)

);

});

loadMoreBtn.style.display=

visibleArticles>=filteredArticles.length

?

"none"

:

"inline-block";

if (filteredArticles.length === 0) {

    articlesContainer.innerHTML = `

    <div class="no-results">

        <h2>🔍 No articles found</h2>

        <p>

        Try another keyword or category.

        </p>

    </div>

    `;

    loadMoreBtn.style.display = "none";

    return;

}

}

function highlight(text, keyword) {

    if (!keyword) return text;

    const regex = new RegExp(`(${keyword})`, "gi");

    return text.replace(regex, "<mark>$1</mark>");

}

// --------------------------------
// Create Card
// --------------------------------

function createCard(article){

const card=document.createElement("div");

card.className="article-card";

card.innerHTML=`

<img src="${
article.featured_image ||
'https://placehold.co/600x400?text=EMerriment'
}" alt="${article.title}">

<div class="article-content">

<span class="article-category">

${article.category}

</span>

<h3 class="article-title">

${article.title}

</h3>

<p class="article-summary">

${highlight(article.summary || "", searchInput.value)}

</p>

<div class="article-meta">

<span>

👁 ${article.views || 0} views

</span>

<span>

📖 ${article.reading_time || 5} min

</span>

<span>

${article.difficulty || "Beginner"}

</span>

</div>

<a

class="read-btn"

href="article.html?slug=${article.slug}"

>

Read Article →

</a>

</div>

`;

return card;

const keyword = searchInput.value.trim();

const title =
highlight(article.title, keyword);

const summary =
highlight(article.summary || "", keyword);

}

// --------------------------------
// Search
// --------------------------------

searchInput.addEventListener("input", () => {

    applyFilters();

});

searchInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        e.preventDefault();

        applyFilters();

    }

});

const params = new URLSearchParams(window.location.search);

const searchTopic = params.get("search");

if (searchTopic) {

    searchInput.value = searchTopic;

    applyFilters();

}

// --------------------------------
// Category
// --------------------------------

categoryButtons.forEach(button=>{

button.addEventListener("click",()=>{

categoryButtons.forEach(btn=>

btn.classList.remove("active")

);

button.classList.add("active");

currentCategory=

button.dataset.category;

applyFilters();

});

});

// --------------------------------
// Apply Filters
// --------------------------------

function applyFilters() {

    visibleArticles = 6;

    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    filteredArticles = allArticles.filter(article => {

        // Category Filter
        const matchesCategory =
            currentCategory === "All" ||
            article.category === currentCategory;

        // Search Fields
        const title =
            (article.title || "").toLowerCase();

        const summary =
            (article.summary || "").toLowerCase();

        const content =
            (article.content || "").toLowerCase();

        const category =
            (article.category || "").toLowerCase();

        const author =
            (article.author || "").toLowerCase();

        const difficulty =
            (article.difficulty || "").toLowerCase();

        const slug =
            (article.slug || "").toLowerCase();

        const keywords =
            (article.seo_keywords || [])
                .join(" ")
                .toLowerCase();

        const conditions =
            (article.related_conditions || [])
                .join(" ")
                .toLowerCase();

        const matchesSearch =

            title.includes(keyword) ||

            summary.includes(keyword) ||

            content.includes(keyword) ||

            category.includes(keyword) ||

            author.includes(keyword) ||

            difficulty.includes(keyword) ||

            slug.includes(keyword) ||

            keywords.includes(keyword) ||

            conditions.includes(keyword);

        return matchesCategory && matchesSearch;

    });

    renderArticles();

}

// --------------------------------
// Load More
// --------------------------------

loadMoreBtn.addEventListener(

"click",

()=>{

visibleArticles+=6;

renderArticles();

}

);

// --------------------------------
// Future Save Article
// --------------------------------

async function saveArticle(articleId){

const {

data:{user}

}=await supabase.auth.getUser();

if(!user){

location.href="login.html";

return;

}

await supabase

.from("saved_articles")

.insert({

user_id:user.id,

article_id:articleId

});

}

// --------------------------------
// Future Recommendation Engine
// --------------------------------

async function loadPersonalizedRecommendations(){

// Will use quiz_results

// user profile

// skin concern

// skin type

// related_conditions

}

// --------------------------------

loadArticles();

const { data } = await supabase
    .from("reading_history")
    .select(`
        *,
        encyclopedia_articles(*)
    `)
    .order("read_at", { ascending: false })
    .limit(5);

    // ===============================
// Trending Articles
// ===============================

async function loadTrendingArticles() {

    const { data, error } = await supabase
        .from("encyclopedia_articles")
        .select("*")
        .order("views", { ascending: false })
        .limit(6);

    if (error) {
        console.error(error);
        return;
    }

    const container =
        document.getElementById("trendingContainer");

    if (!container) return;

    container.innerHTML = "";

    data.forEach(article => {

        container.appendChild(
            createCard(article)
        );

    });

}