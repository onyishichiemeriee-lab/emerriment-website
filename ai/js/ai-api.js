/* =========================================
   EMerriment AI Assistant
   API Controller
   ========================================= */

"use strict";


/* -----------------------------------------
   AI Endpoint
----------------------------------------- */

const AI_ENDPOINT =
    "/.netlify/functions/ai-chat";


/* -----------------------------------------
   Send Message To AI
----------------------------------------- */

async function sendToAI(message) {

    try {

        if (!message || !message.trim()) {

            throw new Error(
                "AI message cannot be empty."
            );

        }


        /* -----------------------------------------
           Check Supabase
        ----------------------------------------- */

        const supabase =
            window.supabaseClient;


        if (!supabase) {

            throw new Error(
                "Supabase client is not available."
            );

        }


        /* -----------------------------------------
           Get Current User
        ----------------------------------------- */

        const {
            data: {
                user
            },
            error: authError

        } = await supabase.auth.getUser();


        if (authError) {

            console.warn(
                "AI authentication warning:",
                authError
            );

        }


        /* -----------------------------------------
           Build User Context
        ----------------------------------------- */

        let context = {

            userId: null,

            profile: null,

            skinProfile: null,

            quizResults: [],

            savedArticles: [],

            readingHistory: []

        };


        if (
            user &&
            window.ContextEngine
        ) {

            context =
                await window.ContextEngine
                    .buildContext(user.id);

        }


        /* -----------------------------------------
           Send Request To Netlify Function
        ----------------------------------------- */

        const response =
            await fetch(
                AI_ENDPOINT,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        message: message.trim(),

                        context: context

                    })

                }
            );


        /* -----------------------------------------
           Handle HTTP Errors
        ----------------------------------------- */

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "AI server response:",
                errorText
            );

            throw new Error(
                `AI request failed (${response.status})`
            );

        }


        /* -----------------------------------------
           Parse Response
        ----------------------------------------- */

        const data =
            await response.json();


        console.log(
            "🤖 EMerriment AI response:",
            data
        );


        return (

            data.reply ||

            data.message ||

            "I couldn't generate a response right now."

        );


    } catch (error) {

        console.error(
            "EMerriment AI API Error:",
            error
        );


        return (
            "I'm having trouble connecting right now. Please try again."
        );

    }

}


/* -----------------------------------------
   Optional Streaming Placeholder
----------------------------------------- */

async function streamAIResponse(
    message,
    callback
) {

    console.log(
        "Streaming will be added later:",
        message
    );

}


/* -----------------------------------------
   Export Functions
----------------------------------------- */

window.sendToAI =
    sendToAI;

window.streamAIResponse =
    streamAIResponse;


console.log(
    "✅ EMerriment AI API initialized."
);