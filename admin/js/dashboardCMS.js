const supabaseClient = window.supabaseClient;

// Verify admin
async function checkAdmin() {

    // Shared, fail-closed administrator check (admin/js/admin-guard.js):
    // nothing below runs unless the signed-in user is an administrator.
    const access = await window.EMAdminGuard.requireAdmin();

    if (!access) return;

        loadDashboard();

}

async function loadDashboard(){

    const { count:articles } = await supabaseClient

        .from("encyclopedia_articles")

        .select("*",{count:"exact",head:true});

    const { count:users } = await supabaseClient

        .from("profiles")

        .select("*",{count:"exact",head:true});

    const { count:quizzes } = await supabaseClient

        .from("quiz_results")

        .select("*",{count:"exact",head:true});

    const { count:favorites } = await supabaseClient

        .from("favorite_articles")

        .select("*",{count:"exact",head:true});

    document.getElementById("articleCount").textContent=articles||0;

    document.getElementById("userCount").textContent=users||0;

    document.getElementById("quizCount").textContent=quizzes||0;

    document.getElementById("favoriteCount").textContent=favorites||0;

}

document.getElementById("logoutBtn").addEventListener("click",async()=>{

    await supabaseClient.auth.signOut();

    window.location.href="loginCMS.html";

});

checkAdmin();