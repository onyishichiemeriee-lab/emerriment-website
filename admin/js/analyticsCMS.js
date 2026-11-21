// Do not declare a top-level `supabase` here: the supabase-js library loaded
// before this script declares the global `var supabase`, and a second
// declaration is a SyntaxError that stops this whole file (WP4I). This module
// uses window.supabaseClient (created by ../js/supabase.js) as `supabaseClient`.

async function checkAdmin() {

    // Shared, fail-closed administrator check (admin/js/admin-guard.js):
    // nothing below runs unless the signed-in user is an administrator.
    const access = await window.EMAdminGuard.requireAdmin();

    if (!access) return;

        loadAnalytics();

}

async function loadAnalytics(){

const { count:users } =
await supabaseClient

.from("profiles")

.select("*",{count:"exact",head:true});

document.getElementById("totalUsers").textContent=
users||0;

const { count:articles } =
await supabaseClient

.from("encyclopedia_articles")

.select("*",{count:"exact",head:true});

document.getElementById("totalArticles").textContent=
articles||0;

const { data:quizResults } =
await supabaseClient

.from("quiz_results")

.select("*");

document.getElementById("totalQuizzes").textContent=
quizResults.length;

const average=
quizResults.reduce(
(a,b)=>a+b.score,0
)
/quizResults.length||0;

document.getElementById("averageScore").textContent=
Math.round(average);

// User Growth Chart

new Chart(

document.getElementById("userGrowthChart"),

{

type:"line",

data:{

labels:["Jan","Feb","Mar","Apr","May","Jun","Jul"],

datasets:[{

label:"Users",

data:[5,12,20,35,52,70,users],

borderWidth:3

}]

}

});

// Quiz Performance

new Chart(

document.getElementById("quizChart"),

{

type:"bar",

data:{

labels:["Excellent","Good","Fair","Poor"],

datasets:[{

data:[12,30,18,5]

}]

}

});

// Article Performance

new Chart(

document.getElementById("articleChart"),

{

type:"doughnut",

data:{

labels:["Published","Draft"],

datasets:[{

data:[articles-2,2]

}]

}

});

}

document

.getElementById("logoutBtn")

.addEventListener("click",

async()=>{

await supabaseClient.auth.signOut();

location.href="loginCMS.html";

});

checkAdmin();