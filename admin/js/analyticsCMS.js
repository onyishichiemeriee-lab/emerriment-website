const supabaseClient = window.supabaseClient;

async function checkAdmin(){

const { data:{ user } } =
await supabaseClient.auth.getUser();

if(!user){

location.href="loginCMS.html";

return;

}

const { data:profile } =
await supabaseClient

.from("profiles")

.select("is_admin")

.eq("id",user.id)

.maybeSingle();

if(!profile?.is_admin){

location.href="../dashboardCMS.html";

return;

}

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