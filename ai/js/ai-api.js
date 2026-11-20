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
   Endpoint mode.

   local → Local AI Bridge + Ollama (only when the page itself is
           served from this computer: localhost / 127.0.0.1)
   api   → Netlify function (production). The function decides
           between its demo engine and OpenAI (EMERRIMENT_AI_MODE).

   Visitors' browsers must never be sent to 127.0.0.1: on their
   machine nothing listens there, so the assistant would fail.
*/

const AI_LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];

const AI_MODE =
    AI_LOCAL_HOSTS.includes(window.location.hostname)
        ? "local"
        : "api";


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
                emrSafeError(authError)
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

                // Never the memory content: whether something was processed only.
                console.log(
                    "🧠 Conversation memory processed:",
                    { processed: !!memoryResult }
                );

            } catch (memoryError) {

                console.warn(
                    "⚠️ Conversation memory processing failed:",
                    emrSafeError(memoryError)
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
                "🧠 AI context built:",
                {
                    conversationHistory: Array.isArray(context && context.conversationHistory) ? context.conversationHistory.length : 0,
                    skinProfile: !!(context && context.skinProfile)
                }
            );

        }

let safetyResult = null;

if (window.SafetyEngine) {
    try {
        safetyResult = window.SafetyEngine.analyze(message.trim());

        // Risk level and flag count only — the analysis can quote the message.
        console.log(
            "🛡️ EMerriment safety check:",
            {
                level: (safetyResult && (safetyResult.riskLevel || safetyResult.level)) || null,
                flags: safetyResult && Array.isArray(safetyResult.flags) ? safetyResult.flags.length : 0
            }
        );

    } catch (safetyError) {
        console.warn(
            "⚠️ Safety Engine analysis failed:",
            emrSafeError(safetyError)
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

            console.error(
                "AI server response:",
                { status: response.status }
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


        // Never the reply itself.
        console.log(
            "🤖 EMerriment AI response:",
            { success: !!(data && data.success), mode: data && data.mode }
        );


        /* -----------------------------------------
           Handle AI Memory Action
        ----------------------------------------- */

        console.log(
            "🧠 Memory action received:",
            { action: data && data.memoryAction ? data.memoryAction.action || null : null }
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

                        // The memory category only — never its value.
                        console.log(
                            "🧠 AI memory saved:",
                            { key }
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
                    emrSafeError(memorySaveError)
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
            emrSafeError(error)
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
        "Streaming will be added later."
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

/* -----------------------------------------
   Log privacy: an error reduced to its category.
   Supabase/PostgREST and Auth errors can carry row values,
   user ids or memory text in message/details/hint, so only
   name, code and HTTP status are logged — never the payload.
----------------------------------------- */

function emrSafeError(error) {
    if (!error) return { kind: "unknown" };
    return {
        kind: String(error.name || "Error").slice(0, 60),
        code: error.code !== undefined && error.code !== null ? String(error.code).slice(0, 40) : undefined,
        status: Number.isInteger(error.status) ? error.status : undefined
    };
}
