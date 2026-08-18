/* =========================================
   EMerriment AI Analytics Engine
========================================= */

// Make the client available globally
window.supabaseClient = supabaseClient;

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeAnalytics();

    }
);



/* =========================================
   INITIALIZE
========================================= */


async function initializeAnalytics(){


    await loadMetrics();

    await generateUserGrowthChart();

    await loadPopularTopics();

    await loadProductAnalytics();

    await loadPerformanceReport();


}





/* =========================================
   LOAD MAIN METRICS
========================================= */


async function loadMetrics(){


    const users =
    await getAIUsers();


    const chats =
    await getTotalChats();


    const messages =
    await getTotalMessages();


    const rating =
    await getAverageRating();



    document
    .getElementById("aiUsers")
    .textContent =
    users;



    document
    .getElementById("totalChats")
    .textContent =
    chats;



    document
    .getElementById("totalMessages")
    .textContent =
    messages;



    document
    .getElementById("aiRating")
    .textContent =
    rating + " ⭐";


}





/* =========================================
   AI USERS
========================================= */


async function getAIUsers(){


const {data,error}=

await supabaseClient

.from("ai_conversations")

.select(
"user_id"
);



if(error)
return 0;



const uniqueUsers =
[
...new Set(
data.map(
item=>item.user_id
)
)
];



return uniqueUsers.length;


}





/* =========================================
   TOTAL CHATS
========================================= */


async function getTotalChats(){


const {count,error}=

await supabaseClient

.from("ai_conversations")

.select(
"*",
{
count:"exact",
head:true
}
);



if(error)
return 0;



return count || 0;


}





/* =========================================
   TOTAL MESSAGES
========================================= */


async function getTotalMessages(){


const {count,error}=

await supabaseClient

.from("ai_messages")

.select(
"*",
{
count:"exact",
head:true
}
);



if(error)
return 0;



return count || 0;


}





/* =========================================
   AI SATISFACTION
========================================= */


async function getAverageRating(){


const {data,error}=

await supabaseClient

.from("ai_feedback")

.select(
"rating"
);



if(error || !data.length)
return 0;



const total =

data.reduce(

(sum,item)=>
sum + item.rating,

0

);



return (

total / data.length

).toFixed(1);


}





/* =========================================
   USER GROWTH CHART
========================================= */


async function generateUserGrowthChart(){


const {data,error}=

await supabaseClient

.from("ai_events")

.select(
"created_at"
);



if(error)
return;



const months = {};



data.forEach(event=>{


const month =

new Date(
event.created_at
)

.toLocaleString(
"default",
{
month:"short"
}
);



months[month] =
(months[month] || 0)+1;



});



const labels =
Object.keys(months);



const values =
Object.values(months);



const ctx =

document

.getElementById(
"userGrowthChart"
);



new Chart(

ctx,

{


type:"line",


data:{


labels:labels,


datasets:[{


label:
"AI Users",


data:values,


tension:.4


}]


},


options:{


responsive:true,


plugins:{


legend:{


display:true


}


}


}


}


);


}





/* =========================================
   POPULAR TOPICS
========================================= */


async function loadPopularTopics(){


const container =

document

.getElementById(
"topicAnalytics"
);



const topics = {


"Acne":35,

"Hyperpigmentation":25,

"Dark Spots":20,

"Eczema":12,

"Dry Skin":8


};



container.innerHTML="";



Object.entries(topics)

.forEach(
([topic,value])=>{


container.innerHTML += `


<div class="topic-card">


<h3>

${topic}

</h3>


<p>

${value}% of AI discussions

</p>


<div class="analytics-progress">

<span style="width:${value}%">

</span>

</div>


</div>


`;


});


}





/* =========================================
   PRODUCT ANALYTICS
========================================= */


async function loadProductAnalytics(){


const container =

document

.getElementById(
"productAnalytics"
);



const products=[


{

name:
"Fade & Glow Bundle",

views:340,

clicks:180

},


{

name:
"Acne Care Course",

views:210,

clicks:120

}


];



container.innerHTML="";



products.forEach(product=>{


container.innerHTML += `


<div class="product-card">


<h3>

${product.name}

</h3>


<p>

Shown:
${product.views}

</p>


<p>

Clicked:
${product.clicks}

</p>


</div>


`;


});


}





/* =========================================
   PERFORMANCE REPORT
========================================= */


async function loadPerformanceReport(){


const container =

document

.getElementById(
"aiPerformance"
);



container.innerHTML = `


<div class="performance-card">


<h3>
AI Quality Report
</h3>


<p>
Helpful responses: 92%
</p>


<p>
Needs improvement: 8%
</p>


<p>
Average rating: 4.6 ⭐
</p>


</div>


`;


}