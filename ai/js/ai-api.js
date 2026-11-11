/* =========================================
   EMerriment AI Assistant
   API Controller
   ========================================= */

"use strict";


/* -----------------------------------------
   AI Endpoints
----------------------------------------- */

const AI_ENDPOINT =
    "/.netlify/functions/ai-chat";

const LOCAL_AI_ENDPOINT =
    "http://127.0.0.1:3030/chat";

/*
   Current development mode.

   mock  → Netlify demo engine
   local → Local AI Bridge + Ollama
   api   → Netlify/OpenAI API
*/

const AI_MODE = "local";


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
           Process Conversation Memory
        ----------------------------------------- */

        if (
            user &&
            window.AIMemory &&
            typeof window.AIMemory.processMessage === "function"
        ) {

            try {

                const memoryResult =
                    await window.AIMemory.processMessage(
                        message.trim()
                    );

                console.log(
                    "🧠 Conversation memory processing:",
                    memoryResult
                );

            } catch (memoryError) {

                console.warn(
                    "⚠️ Conversation memory processing failed:",
                    memoryError
                );

            }

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

            readingHistory: [],

            memories: {}

        };


        if (
            user &&
            window.ContextEngine
        ) {

            context =
                await window.ContextEngine
                    .buildContext(user.id);

            console.log(
                "🧠 AI API conversation history:",
                context.conversationHistory
            );

        }

let safetyResult = null;

if (window.SafetyEngine) {
    try {
        safetyResult = window.SafetyEngine.analyze(message.trim());

        console.log(
            "🛡️ EMerriment Safety Result:",
            safetyResult
        );

    } catch (safetyError) {
        console.warn(
            "⚠️ Safety Engine analysis failed:",
            safetyError
        );
    }
}

        /* -----------------------------------------
           Select AI Endpoint
        ----------------------------------------- */

        const endpoint =
            AI_MODE === "local"
                ? LOCAL_AI_ENDPOINT
                : AI_ENDPOINT;


        console.log(
            "🤖 EMerriment AI MODE:",
            AI_MODE
        );

        console.log(
            "🌐 AI endpoint:",
            endpoint
        );


        /* -----------------------------------------
           Build Request Body
        ----------------------------------------- */

        const requestBody = {

    message:
        message.trim(),

    context:

        AI_MODE === "local"

            ? context

            : context,

    safety:
        safetyResult

};

        /* -----------------------------------------
           Send Request
        ----------------------------------------- */

        const response =
            await fetch(
                endpoint,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )

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


        /* -----------------------------------------
           Handle AI Memory Action
        ----------------------------------------- */

        console.log(
            "🧠 MEMORY ACTION RECEIVED:",
            data.memoryAction
        );

        console.log(
            "🧠 AIMemory AVAILABLE:",
            !!window.AIMemory
        );

const messageForMemoryCheck = String(message || "").trim();

const isQuestionForMemory =
    messageForMemoryCheck.endsWith("?") ||
    /^(what|why|when|where|who|which|how|can|could|should|would|is|are|do|does|did)\b/i
        .test(messageForMemoryCheck);

        if (
            !isQuestionForMemory &&
            data.memoryAction &&
            data.memoryAction.action === "save" &&
            window.AIMemory
        ) {

            try {

                const {
                    key,
                    value,
                    importance
                } = data.memoryAction;


                if (
                    key &&
                    value
                ) {

                 const saved =
    await window.AIMemory.saveExtractedMemory({
        key,
        value,
        importance: importance || 1
    });

                    if (saved) {

                        console.log(
                            "🧠 AI memory saved:",
                            key,
                            value
                        );

                    } else {

                        console.warn(
                            "⚠️ AI memory could not be saved."
                        );

                    }

                }

            } catch (memorySaveError) {

                console.error(
                    "❌ AI memory save error:",
                    memorySaveError
                );

            }

        }


        /* -----------------------------------------
           Return AI Reply
        ----------------------------------------- */

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