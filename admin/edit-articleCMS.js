const supabase = window.supabaseClient;

const articleId = new URLSearchParams(window.location.search).get("id");

const form = document.getElementById("editArticleForm");
const message = document.getElementById("message");

async function checkAdmin() {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = "loginCMS.html";
        return;
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) {
        window.location.href = "../dashboardCMS.html";
        return;
    }

    loadArticle();
}

async function loadArticle() {

    const { data, error } = await supabase
        .from("encyclopedia_articles")
        .select("*")
        .eq("id", articleId)
        .single();

    if (error) {
        alert(error.message);
        return;
    }

    document.getElementById("title").value = data.title || "";
    document.getElementById("slug").value = data.slug || "";
    document.getElementById("category").value = data.category || "";
    document.getElementById("featured_image").value = data.featured_image || "";
    document.getElementById("summary").value = data.summary || "";
    document.getElementById("reading_time").value = data.reading_time || 5;
    document.getElementById("seo_keywords").value =
        (data.seo_keywords || []).join(", ");
    document.getElementById("related_conditions").value =
        (data.related_conditions || []).join(", ");
    document.getElementById("content").value = data.content || "";
}

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const { error } = await supabase
        .from("encyclopedia_articles")
        .update({

            title: title.value,
            slug: slug.value,
            category: category.value,
            featured_image: featured_image.value,
            summary: summary.value,
            reading_time: Number(reading_time.value),
            seo_keywords: seo_keywords.value
                .split(",")
                .map(item => item.trim())
                .filter(Boolean),
            related_conditions: related_conditions.value
                .split(",")
                .map(item => item.trim())
                .filter(Boolean),
            content: content.value,
            updated_at: new Date().toISOString()

        })
        .eq("id", articleId);

    if (error) {
        message.style.color = "red";
        message.textContent = error.message;
        return;
    }

    message.style.color = "green";
    message.textContent = "✅ Article updated successfully.";

});

document.getElementById("deleteBtn").addEventListener("click", async () => {

    if (!confirm("Delete this article permanently?")) return;

    const { error } = await supabase
        .from("encyclopedia_articles")
        .delete()
        .eq("id", articleId);

    if (error) {
        alert(error.message);
        return;
    }

    window.location.href = "articlesCMS.html";

});

document.getElementById("logoutBtn").addEventListener("click", async () => {

    await supabase.auth.signOut();

    window.location.href = "loginCMS.html";

});

checkAdmin();