/* =========================================
   EMerriment AI Admin Dashboard
========================================= */
// Initialize Supabase Client

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeAIDashboard();

    }
);



/* =========================================
   INITIALIZE DASHBOARD
========================================= */


async function initializeAIDashboard(){


    await loadAnalytics();

    await loadConversations();

    await loadAISettings();


    setupRefreshButton();


}



/* =========================================
   LOAD ANALYTICS
========================================= */


async function loadAnalytics(){


    try {


        const conversations =
        await getTotalConversations();



        const messages =
        await getTotalMessages();



        const ratings =
        await getAverageRating();



        const unanswered =
        await getUnansweredQuestions();



        document
        .getElementById(
            "totalConversations"
        )
        .textContent =
        conversations;



        document
        .getElementById(
            "totalMessages"
        )
        .textContent =
        messages;



        document
        .getElementById(
            "averageRating"
        )
        .textContent =
        ratings;



        document
        .getElementById(
            "unansweredQuestions"
        )
        .textContent =
        unanswered;


    }


    catch(error){


        console.error(
            "Analytics Error:",
            error
        );


    }


}

/* =========================================
   COUNT CONVERSATIONS
========================================= */

async function getTotalConversations(){


    const { count, error } =

    await supabaseClient

    .from("ai_conversations")

    .select(
        "*",
        {
            count:"exact",
            head:true
        }
    );


    if(error){

        console.error(error);

        return 0;

    }


    return count || 0;


}





/* =========================================
   COUNT MESSAGES
========================================= */


async function getTotalMessages(){


    const { count, error } =

    await supabaseClient

    .from("ai_messages")

    .select(
        "*",
        {
            count:"exact",
            head:true
        }
    );


    if(error){

        return 0;

    }


    return count || 0;


}





/* =========================================
   AVERAGE RATING
========================================= */


async function getAverageRating(){


    const { data, error } =

    await supabaseClient

    .from("ai_feedback")

    .select("rating");



    if(error || !data.length){

        return "0 ⭐";

    }



    const total =
    data.reduce(

        (sum,item)=>
        sum + item.rating,

        0

    );



    return (

        total / data.length

    ).toFixed(1)
    + " ⭐";


}





/* =========================================
   UNANSWERED QUESTIONS
========================================= */


async function getUnansweredQuestions(){


    const { count, error } =

    await supabaseClient

    .from("ai_feedback")

    .select(
        "*",
        {
            count:"exact",
            head:true
        }
    )

    .eq(
        "rating",
        1
    );



    if(error){

        return 0;

    }


    return count || 0;


}





/* =========================================
   LOAD CONVERSATIONS
========================================= */


async function loadConversations(){


    const container =

    document.getElementById(
        "conversationMonitor"
    );



    if(!container)
    return;



    const { data, error } =

    await supabaseClient

    .from("ai_conversations")

    .select("*")

    .order(
        "updated_at",
        {
            ascending:false
        }
    )

    .limit(10);



    if(error){

        console.error(error);

        return;

    }



    container.innerHTML = "";



    data.forEach(chat=>{


        const card =
        document.createElement(
            "div"
        );



        card.className =
        "ai-conversation-card";



        card.innerHTML = `

            <h3>
                ${chat.title}
            </h3>


            <p>
                ${chat.last_message ||
                "No message preview"}
            </p>


            <small>
                ${formatDate(chat.updated_at)}
            </small>

        `;



        container.appendChild(card);



    });



}





/* =========================================
   LOAD AI SETTINGS
========================================= */


async function loadAISettings(){


    const container =

    document.getElementById(
        "aiSettings"
    );



    if(!container)
    return;



    const { data, error } =

    await supabaseClient

    .from("ai_settings")

    .select("*");



    if(error){

        console.error(error);

        return;

    }



    container.innerHTML = "";



    data.forEach(setting=>{


        container.innerHTML += `

        <div class="setting-item">

            <label>
                ${setting.setting_key}
            </label>


            <textarea
            data-id="${setting.id}"
            >

            ${setting.setting_value}

            </textarea>


            <button
            onclick="
            updateAISetting(
            '${setting.id}',
            this.previousElementSibling.value
            )
            ">

                Save

            </button>


        </div>

        `;


    });


}





/* =========================================
   UPDATE SETTINGS
========================================= */


async function updateAISetting(
    id,
    value
){


    const { error } =

    await supabaseClient

    .from("ai_settings")

    .update({

        setting_value:value,

        updated_at:
        new Date()
        .toISOString()

    })

    .eq(
        "id",
        id
    );



    if(error){

        console.error(error);

        return;

    }


    alert(
        "AI Settings Updated"
    );


}





/* =========================================
   REFRESH BUTTON
========================================= */


function setupRefreshButton(){


    document

    .getElementById(
        "refreshAI"
    )

    ?.addEventListener(
        "click",
        initializeAIDashboard
    );


}





/* =========================================
   DATE FORMAT
========================================= */


function formatDate(date){


    if(!date)
    return "";



    return new Date(date)

    .toLocaleDateString(
        [],
        {

            month:"short",

            day:"numeric"

        }

    );


}

async function loadUnansweredQuestions(){


const container =
document.getElementById(
"unansweredList"
);


const {data,error} =
await supabaseClient

.from("ai_questions")

.select("*")

.eq(
"answered",
false
)

.order(
"created_at",
{
ascending:false
}
);



if(error) return;



container.innerHTML="";



data.forEach(item=>{


container.innerHTML += `

<div class="question-card">

<p>
${item.question}
</p>


<button onclick="
markAnswered('${item.id}')
">

Mark solved

</button>


</div>

`;

});


}

async function markAnswered(id){


await supabaseClient

.from("ai_questions")

.update({

answered:true

})

.eq(
"id",
id
);


loadUnansweredQuestions();


}

async function loadPrompt(){


const {data}=

await supabaseClient

.from("ai_settings")

.select("*")

.eq(
"setting_key",
"system_prompt"
)

.maybeSingle();



if(data){

document
.getElementById(
"aiPromptEditor"
)
.value =
data.setting_value;

}


}

document
.getElementById(
"savePrompt"
)
?.addEventListener(
"click",
async()=>{


const value =
document
.getElementById(
"aiPromptEditor"
)
.value;



await supabaseClient

.from("ai_settings")

.update({

setting_value:value,

updated_at:
new Date()
.toISOString()

})

.eq(
"setting_key",
"system_prompt"
);



alert(
"AI Prompt Updated"
);


});

async function loadFeedbackReview(){


const container =
document.getElementById(
"feedbackReview"
);



const {data}=

await supabaseClient

.from("ai_feedback")

.select("*")

.order(
"created_at",
{
ascending:false
}
)

.limit(10);



container.innerHTML="";



data.forEach(item=>{


container.innerHTML += `

<div class="feedback-card">

<p>
Rating:
${item.rating} ⭐
</p>


<p>
${item.feedback || 
"No comment"}
</p>


</div>

`;

});


}

async function initializeAIDashboard(){

await loadAnalytics();

await loadConversations();

await loadAISettings();

await loadUnansweredQuestions();

await loadPrompt();

await loadFeedbackReview();

setupRefreshButton();

}