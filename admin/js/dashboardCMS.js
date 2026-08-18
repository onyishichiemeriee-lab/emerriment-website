const supabaseClient = window.supabaseClient;

// Verify admin
async function checkAdmin(){

    const { data:{ user } } = await supabaseClient.auth.getUser();

if (!user) {
        window.location.href = "loginCMS.html"; // Redirect to login if no user
        return;
    }

    const { data:profile } = await supabaseClient

        .from("profiles")

        .select("is_admin")

        .eq("id",user.id)

        .maybeSingle();

    if(!profile?.is_admin){

        window.location.href="admin/../dashboardCMS.html";
        return;

    }

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