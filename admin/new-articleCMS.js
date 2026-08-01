const supabase = window.supabaseClient;

// Auto-generate slug
document.getElementById("title").addEventListener("input", (e) => {

    document.getElementById("slug").value = e.target.value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

});

const form = document.getElementById("articleForm");
const message = document.getElementById("message");

async function saveArticle(status){

    const article = {

        title: document.getElementById("title").value,

        slug: document.getElementById("slug").value,

        category: document.getElementById("category").value,

        featured_image: document.getElementById("featured_image").value,

        summary: document.getElementById("summary").value,

        reading_time: Number(document.getElementById("reading_time").value),

        seo_keywords: document.getElementById("seo_keywords").value
            .split(",")
            .map(x => x.trim())
            .filter(Boolean),

        related_conditions: document.getElementById("related_conditions").value
            .split(",")
            .map(x => x.trim())
            .filter(Boolean),

        content: document.getElementById("content").value,

        status,

        updated_at: new Date().toISOString()

    };

    const { error } = await supabase

        .from("encyclopedia_articles")

        .insert(article);

    if(error){

        message.style.color="red";
        message.textContent=error.message;
        return;

    }

    message.style.color="green";
    message.textContent=
        status==="draft"
        ? "Draft saved successfully."
        : "Article published successfully.";

    form.reset();

}

// Publish
form.addEventListener("submit", async(e)=>{

    e.preventDefault();

    await saveArticle("published");

});

// Save Draft
document.getElementById("saveDraft").addEventListener("click", async()=>{

    await saveArticle("draft");

});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async()=>{

    await supabase.auth.signOut();

    window.location.href="loginCMS.html";

});