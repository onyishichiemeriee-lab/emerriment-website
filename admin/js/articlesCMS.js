// Do not declare a top-level `supabase` here: the supabase-js library loaded
// before this script declares the global `var supabase`, and a second
// declaration is a SyntaxError that stops this whole file (WP4I). This module
// uses window.supabaseClient (created by ../js/supabase.js) as `supabaseClient`.

let allArticles = [];

// --------------------------
// Check Admin
// --------------------------

async function checkAdmin() {

    // Shared, fail-closed administrator check (admin/js/admin-guard.js):
    // nothing below runs unless the signed-in user is an administrator.
    const access = await window.EMAdminGuard.requireAdmin();

    if (!access) return;

        loadArticles();

}

// --------------------------
// Load Articles
// --------------------------

async function loadArticles(){

    const { data, error } = await supabaseClient

        .from("encyclopedia_articles")

        .select("*")

        .order("created_at",{ascending:false});

    if(error){

        console.error("❌ articlesCMS request failed:", window.EMAdminGuard.safeError(error));
        return;

    }

    allArticles = data;

    renderArticles(allArticles);

}

// --------------------------
// Render Table
// --------------------------

function renderArticles(articles){

    const tbody = document.getElementById("articlesBody");

    tbody.innerHTML="";

    if(articles.length===0){

        tbody.innerHTML=`
        <tr>
            <td colspan="5" style="padding:20px;text-align:center;">
                No articles found.
            </td>
        </tr>
        `;

        return;

    }

    articles.forEach(article=>{

        tbody.innerHTML += `

        <tr>

            <td style="padding:15px;">${article.title}</td>

            <td style="padding:15px;">${article.category}</td>

            <td style="padding:15px;">
                ${article.status || "Published"}
            </td>

            <td style="padding:15px;">
                ${article.reading_time} min
            </td>

            <td style="padding:15px;">

                <button onclick="editArticle('${article.id}')">
                    ✏️ Edit
                </button>

                <button onclick="deleteArticle('${article.id}')">
                    🗑 Delete
                </button>

            </td>

        </tr>

        `;

    });

}

// --------------------------
// Search
// --------------------------

document.getElementById("searchInput").addEventListener("input",(e)=>{

    const keyword = e.target.value.toLowerCase();

    const filtered = allArticles.filter(article=>{

        return(

            article.title.toLowerCase().includes(keyword)

            ||

            article.category.toLowerCase().includes(keyword)

        );

    });

    renderArticles(filtered);

});

// --------------------------
// Edit
// --------------------------

function editArticle(id){

    window.location.href=`edit-article.html?id=${id}`;

}

// --------------------------
// Delete
// --------------------------

async function deleteArticle(id){

    const confirmed = confirm(
        "Delete this article?"
    );

    if(!confirmed) return;

    const { error } = await supabaseClient

        .from("encyclopedia_articles")

        .delete()

        .eq("id",id);

    if(error){

        alert(error.message);
        return;

    }

    loadArticles();

}

// --------------------------
// Logout
// --------------------------

document.getElementById("logoutBtn").addEventListener("click",async()=>{

    await supabaseClient.auth.signOut();

    window.location.href="loginCMS.html";

});

checkAdmin();