/* =========================================
   EMerriment AI Assistant
   API Controller
========================================= */


/*
   This file communicates with your
   secure backend AI endpoint.

   Never put AI API keys here.
*/



const AI_ENDPOINT = "/.netlify/functions/ai-chat";



/* =========================================
   SEND MESSAGE TO AI
========================================= */


async function sendToAI(message){


    try {


        const context =
            await ContextEngine.build(message);

        const response = await fetch(
            AI_ENDPOINT,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message,
                    context
                })
            }
        );



        if(!response.ok){


            throw new Error(

                "AI request failed"

            );


        }



        const data =
        await response.json();



        return (

            data.reply ||

            "I couldn't generate a response right now."

        );



    }

    catch(error){


        console.error(

            "EMerriment AI API Error:",
            error

        );


        return (

            "I'm having trouble connecting right now. Please try again."

        );


    }


}



/* =========================================
   STREAMING RESPONSE PLACEHOLDER
========================================= */


/*
   Future feature:

   This will allow EMerriment AI
   to type responses gradually
   like ChatGPT.
*/


async function streamAIResponse(
    message,
    callback
){


    console.log(

        "Streaming will be added later:",
        message

    );


}



/* =========================================
   SEND USER CONTEXT
========================================= */


/*
   Later Module 4:

   Context Engine will add:

   - skin type
   - concerns
   - quiz results
   - reading history
   - saved articles
   - products

*/

const systemPrompt =
    PersonalizationEngine.buildSystemPrompt(
        context.personalization
    );

    body: JSON.stringify({

    message,

    context,

    systemPrompt

})


async function sendAIContext(
    context
){


    console.log(

        "AI Context:",
        context

    );


}