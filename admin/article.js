const supabase = window.supabaseClient;

const slug = new URLSearchParams(window.location.search).get("slug");

let currentArticle = null;
let allArticles = [];

// ===============================
// Load Article
// ===============================

async function loadArticle() {

    const { data, error } = await supabase
        .from("encyclopedia_articles")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !data) {

        document.getElementById("articleTitle").textContent = "Article Not Found";
        document.getElementById("articleContent").innerHTML =
            "<p>The requested article could not be found.</p>";

        return;
    }

    currentArticle = data;

    document.title = data.title + " | EMerriment";

    document.getElementById("featuredImage").src =
        data.featured_image ||
        "https://placehold.co/1200x600?text=EMerriment";

    document.getElementById("featuredImage").alt = data.title;

    document.getElementById("articleCategory").textContent =
        data.category || "";

    document.getElementById("articleTitle").textContent =
        data.title;

    document.getElementById("readingTime").textContent =
        `📖 ${data.reading_time || 5} min read`;

    document.getElementById("difficulty").textContent =
        `🎓 ${data.difficulty || "Beginner"}`;

    document.getElementById("publishDate").textContent =
        data.created_at
            ? new Date(data.created_at).toLocaleDateString()
            : "";

    document.getElementById("articleSummary").textContent =
        data.summary || "";

    document.getElementById("articleContent").innerHTML =
        data.content || "";

    loadAllArticles();

    loadRecommendedProducts();

    checkSavedStatus();

    saveReadingHistory();

    restoreReadingPosition();

    incrementViews();

    await loadArticleRating();
    
}

// ===============================
// Load All Articles
// ===============================

async function loadAllArticles(){

    const { data } = await supabase
        .from("encyclopedia_articles")
        .select("*")
        .order("created_at",{ascending:false});

    allArticles = data || [];

    loadRelatedArticles();

    setupNavigation();

}

// ===============================
// Related Articles
// ===============================

function loadRelatedArticles(){

    const container =
    document.getElementById("relatedArticles");

    container.innerHTML = "";

    const related = allArticles
        .filter(article =>
            article.id !== currentArticle.id &&
            article.category === currentArticle.category
        )
        .slice(0,3);

    if(!related.length){

        container.innerHTML =
        "<p>No related articles found.</p>";

        return;

    }

    related.forEach(article=>{

        container.innerHTML += `

<div class="article-card">

<img src="${article.featured_image || 'https://placehold.co/600x400'}">

<div class="article-content">

<span class="article-category">

${article.category}

</span>

<h3>

${article.title}

</h3>

<p>

${article.summary || ""}

</p>

<a class="read-btn"

href="article.html?slug=${article.slug}">

Read →

</a>

</div>

</div>

`;

    });

}

// ===============================
// Recommended Products
// ===============================

async function loadRecommendedProducts(){

    const container =
    document.getElementById("recommendedProducts");

    container.innerHTML = "";

    const { data } = await supabase

        .from("article_products")

        .select(`
            product_id,
            products(*)
        `)

        .eq("article_id",currentArticle.id);

    if(!data || !data.length){

        container.innerHTML =
        "<p>No recommended products.</p>";

        return;

    }

    data.forEach(item=>{

        const product = item.products;

        container.innerHTML += `

<div class="article-card">

<img src="${product.image_url || 'https://placehold.co/600x400'}">

<div class="article-content">

<h3>

${product.name}

</h3>

<p>

${product.description || ""}

</p>

<a

class="read-btn"

target="_blank"

href="${product.affiliate_link || '#'}">

View Product

</a>

</div>

</div>

`;

    });

}

// ===============================
// Save / Unsave
// ===============================

async function checkSavedStatus(){

    const {

        data:{user}

    } = await supabase.auth.getUser();

    if(!user) return;

    const { data } = await supabase

        .from("saved_articles")

        .select("*")

        .eq("user_id",user.id)

        .eq("article_id",currentArticle.id)

        .maybeSingle();

    const btn =
    document.getElementById("saveBtn");

    btn.textContent =
        data
        ?
        "❤️ Saved"
        :
        "🤍 Save Article";

}

document
.getElementById("saveBtn")
.addEventListener("click",toggleSave);

async function toggleSave(){

    const {

        data:{user}

    } = await supabase.auth.getUser();

    if(!user){

        location.href="login.html";

        return;

    }

    const { data } = await supabase

        .from("saved_articles")

        .select("*")

        .eq("user_id",user.id)

        .eq("article_id",currentArticle.id)

        .maybeSingle();

    if(data){

        await supabase

            .from("saved_articles")

            .delete()

            .eq("id",data.id);

    }else{

        await supabase

            .from("saved_articles")

            .insert({

                user_id:user.id,

                article_id:currentArticle.id

            });

    }

    checkSavedStatus();

}

// ===============================
// Share
// ===============================

document
.getElementById("shareBtn")
.addEventListener("click",shareArticle);

async function shareArticle(){

    const url = location.href;

    if(navigator.share){

        await navigator.share({

            title:currentArticle.title,

            text:currentArticle.summary,

            url

        });

    }else{

        await navigator.clipboard.writeText(url);

        alert("Article link copied.");

    }

}

// ===============================
// Previous / Next
// ===============================

function setupNavigation(){

    const index =
    allArticles.findIndex(

        a=>a.id===currentArticle.id

    );

    document
    .getElementById("previousArticle")
    .onclick=()=>{

        if(index<allArticles.length-1){

            location.href=
            `article.html?slug=${allArticles[index+1].slug}`;

        }

    };

    document
    .getElementById("nextArticle")
    .onclick=()=>{

        if(index>0){

            location.href=
            `article.html?slug=${allArticles[index-1].slug}`;

        }

    };

}

// ===============================
// Load Article
// ===============================

loadArticle();

// ===============================
// Save Reading History
// ===============================

async function saveReadingHistory() {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user || !currentArticle) return;

    await supabase
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

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) return;

        const scrollTop = window.scrollY;

        const documentHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const progress =
            Math.min(
                100,
                Math.round((scrollTop / documentHeight) * 100)
            );

        await supabase
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

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user || !currentArticle) return;

    const { data } = await supabase
        .from("reading_history")
        .select("last_position")
        .eq("user_id", user.id)
        .eq("article_id", currentArticle.id)
        .maybeSingle();

    if (data && data.last_position > 0) {

        setTimeout(() => {

            window.scrollTo({
                top: data.last_position,
                behavior: "smooth"
            });

        }, 300);

    }

}

// ===============================
// Increment Article Views
// ===============================

async function incrementViews() {

    if (!currentArticle) return;

    const newViews = (currentArticle.views || 0) + 1;

    const { error } = await supabase
        .from("encyclopedia_articles")
        .update({
            views: newViews
        })
        .eq("id", currentArticle.id);

    if (!error) {
        currentArticle.views = newViews;
    }

}

let selectedRating = 0;

document

.querySelectorAll("#ratingStars span")

.forEach(star => {

    star.addEventListener("click", () => {

        selectedRating = Number(star.dataset.rating);

        document

        .querySelectorAll("#ratingStars span")

        .forEach((s, index) => {

            s.style.opacity =

                index < selectedRating ? "1" : ".35";

        });

    });

});

let helpful = null;

document

.getElementById("helpfulYes")

.addEventListener("click", () => {

    helpful = true;

});

document

.getElementById("helpfulNo")

.addEventListener("click", () => {

    helpful = false;

});

document

.getElementById("submitRating")

.addEventListener("click", async () => {

    const {

        data: { user }

    } = await supabase.auth.getUser();

    if (!user || !currentArticle) return;

    const feedback =

        document.getElementById("feedback").value;

    const { error } = await supabase

        .from("article_ratings")

        .upsert({

            user_id: user.id,

            article_id: currentArticle.id,

            rating: selectedRating,

            helpful,

            feedback,

            updated_at: new Date().toISOString()

        });

    if (error) {

        console.error(error);

        return;

    }

    alert("Thanks for your feedback! 🌿");

});

async function loadArticleRating() {

    if (!currentArticle) return;

    const { data } = await supabase

        .from("article_ratings")

        .select("rating")

        .eq("article_id", currentArticle.id);

    if (!data || !data.length) return;

    const average =

        data.reduce(

            (sum, item) => sum + item.rating,

            0

        ) / data.length;

    document.getElementById("averageRating").textContent =

        average.toFixed(1);

    document.getElementById("ratingCount").textContent =

        data.length;

}