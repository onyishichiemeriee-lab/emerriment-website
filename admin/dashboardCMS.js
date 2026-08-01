const supabase = window.supabaseClient;

// Verify admin
async function checkAdmin(){

    const { data:{ user } } = await supabase.auth.getUser();

    if(!user){

        window.location.href="loginCMS.html";
        return;

    }

    const { data:profile } = await supabase

        .from("profiles")

        .select("is_admin")

        .eq("id",user.id)

        .single();

    if(!profile?.is_admin){

        window.location.href="../dashboardCMS.html";
        return;

    }

    loadDashboard();

}

async function loadDashboard(){

    const { count:articles } = await supabase

        .from("encyclopedia_articles")

        .select("*",{count:"exact",head:true});

    const { count:users } = await supabase

        .from("profiles")

        .select("*",{count:"exact",head:true});

    const { count:quizzes } = await supabase

        .from("quiz_results")

        .select("*",{count:"exact",head:true});

    const { count:favorites } = await supabase

        .from("favorite_articles")

        .select("*",{count:"exact",head:true});

    document.getElementById("articleCount").textContent=articles||0;

    document.getElementById("userCount").textContent=users||0;

    document.getElementById("quizCount").textContent=quizzes||0;

    document.getElementById("favoriteCount").textContent=favorites||0;

}

document.getElementById("logoutBtn").addEventListener("click",async()=>{

    await supabase.auth.signOut();

    window.location.href="loginCMS.html";

});

checkAdmin();