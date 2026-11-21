const supabaseClient = window.supabaseClient;

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

// Shared administrator check (admin/js/admin-guard.js): the form stays
// disabled, and nothing is saved, unless the user is an administrator.
function setFormEnabled(enabled) {
    if (!form) return;
    form.querySelectorAll("input, textarea, select, button").forEach((el) => { el.disabled = !enabled; });
}

setFormEnabled(false);

window.EMAdminGuard.requireAdmin().then((access) => setFormEnabled(!!access));


async function saveArticle(status){

    if (!(await window.EMAdminGuard.requireAdmin())) return;


    const article = {

        title: document.getElementById("title").value,

        slug: document.getElementById("slug").value,

        category: document.getElementById("category").value,

        featured_image: document.getElementById("featuredImage").value,

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

        // Defence in depth: stored HTML is sanitized again when it is shown.
        content: (window.EMArticleContent ? window.EMArticleContent.sanitizeArticleHTML(document.getElementById("content").value) : document.getElementById("content").value),

        status,

        updated_at: new Date().toISOString()

    };

    const { error } = await supabaseClient

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

    await supabaseClient.auth.signOut();

    window.location.href="loginCMS.html";

});