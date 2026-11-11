/* =========================================
   EMerriment AI
   Netlify AI Chat Function
========================================= */

"use strict";

const { createClient } = require("@supabase/supabase-js");

function getSupabaseAdmin() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Product verification: Supabase configuration is missing.");
        return null;
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
}

async function getApprovedProducts(productIds) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
        return [];
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
        return [];
    }

    const ids = [...new Set(
        productIds.filter(id => typeof id === "string")
    )];

    if (ids.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from("products")
        .select("id, name, description, category, price, benefits, ingredients, skin_types, concerns, selar_link, image, is_approved")
        .in("id", ids)
        .eq("is_approved", true);

    if (error) {
        console.error("Approved product lookup failed:", error.message);
        return [];
    }

    return data || [];
}

const OPENAI_API_URL =
    "https://api.openai.com/v1/responses";


/* =========================================
   EMERRIMENT AI MODE
=========================================
   mock = development mode (NO OpenAI API calls)
   live = real OpenAI API
========================================= */

const AI_MODE =
    (process.env.EMERRIMENT_AI_MODE || "mock")
        .toLowerCase();

console.log(
    "🤖 EMerriment AI MODE:",
    AI_MODE
);

/* =========================================
   EMERRIMENT AI SYSTEM PROMPT
========================================= */

const SYSTEM_PROMPT = `
You are EMerriment AI, the intelligent skincare
assistant for EMerriment.

EMerriment is a beauty and skincare education
brand focused on helping people understand,
care for, and improve their skin through
evidence-informed, practical skincare education.

Your personality:

- Warm
- Calm
- Helpful
- Educational
- Encouraging
- Professional
- Never judgmental
- Easy to understand

Your role:

1. Answer skincare questions clearly.
2. Explain skincare ingredients and routines.
3. Help users understand common skin concerns.
4. Use the user's available skin profile when relevant.
5. Personalize recommendations using the supplied context.
6. Encourage realistic and consistent skincare habits.
7. Never pretend to diagnose a medical condition.
8. When a concern may require professional medical
   assessment, clearly recommend seeing a qualified
   dermatologist or healthcare professional.
9. Do not recommend unsafe combinations or
   unnecessarily aggressive skincare routines.
10. Do not invent information about the user's
    profile, quiz results, articles, or history.

Important:

The user's context is supplied separately.
Only use information that is actually present
in that context.

Keep responses conversational and useful.

For simple questions, keep the response concise.

For complicated skincare questions, structure
the answer with short headings or bullet points
where helpful.

You are EMerriment AI.
`;


/* =========================================
   CORS
========================================= */

function corsHeaders() {

    return {

        "Access-Control-Allow-Origin": "*",

        "Access-Control-Allow-Headers":
            "Content-Type",

        "Access-Control-Allow-Methods":
            "POST, OPTIONS",

        "Content-Type":
            "application/json"

    };

}


/* =========================================
   RESPONSE HELPER
========================================= */

function jsonResponse(
    statusCode,
    body
) {

    return {

        statusCode,

        headers:
            corsHeaders(),

        body:
            JSON.stringify(body)

    };

}


/* =========================================
   MAIN HANDLER
========================================= */

exports.handler = async (event) => {

    /* -----------------------------------------
       OPTIONS / CORS
    ----------------------------------------- */

    if (event.httpMethod === "OPTIONS") {

        return {

            statusCode: 204,

            headers:
                corsHeaders(),

            body: ""

        };

    }


    /* -----------------------------------------
       METHOD CHECK
    ----------------------------------------- */

    if (event.httpMethod !== "POST") {

        return jsonResponse(
            405,
            {
                success: false,
                error: "Method not allowed."
            }
        );

    }


    try {

        /* -----------------------------------------
           AI MODE
        ----------------------------------------- */

        const key =
            process.env.EMERRIMENT_OPENAI_KEY;

        console.log(
            "🤖 EMerriment AI MODE:",
            AI_MODE
        );


        /*
         * IMPORTANT:
         *
         * Mock mode does NOT require an OpenAI key.
         *
         * This allows us to develop EMerriment AI
         * without spending API credits.
         */

        if (AI_MODE === "live") {

            console.log(
                "OPENAI KEY CHECK:",
                {
                    exists: !!key,

                    length:
                        key?.length,

                    prefix:
                        key
                            ? key.slice(0, 8)
                            : undefined,

                    looksLikeJWT:
                        key
                            ? key.split(".").length === 3
                            : false
                }
            );


            if (!key) {

                console.error(
                    "❌ EMERRIMENT_OPENAI_KEY is missing."
                );

                return jsonResponse(
                    500,
                    {
                        success: false,
                        error:
                            "AI service is not configured."
                    }
                );

            }

        }


        /* -----------------------------------------
           PARSE REQUEST
        ----------------------------------------- */

        let body;

        try {

            body =
                JSON.parse(
                    event.body || "{}"
                );

        }

        catch (error) {

            return jsonResponse(
                400,
                {
                    success: false,
                    error:
                        "Invalid JSON request."
                }
            );

        }


        const message =
            typeof body.message === "string"
                ? body.message.trim()
                : "";


        const context =
            body.context || {};


        console.log(
            "🧠 AI RECEIVED CONTEXT:",
            JSON.stringify(context, null, 2)
        );


        console.log(
            "🧠 AI RECEIVED SKIN PROFILE:",
            context.skinProfile
        );


        console.log(
            "🧠 AI RECEIVED MEMORIES:",
            context.memory
        );


        /* -----------------------------------------
           VALIDATE MESSAGE
        ----------------------------------------- */

        if (!message) {

            return jsonResponse(
                400,
                {
                    success: false,
                    error:
                        "Message cannot be empty."
                }
            );

        }


        /* -----------------------------------------
           LIMIT MESSAGE SIZE
        ----------------------------------------- */

        if (message.length > 5000) {

            return jsonResponse(
                400,
                {
                    success: false,
                    error:
                        "Message is too long."
                }
            );

        }


        console.log(
            "🤖 EMerriment AI request received."
        );


        /* =========================================
           DEMO / MOCK MODE
           NO OPENAI API CALL
        ========================================= */

        if (AI_MODE === "mock") {

            console.log(
                "🧪 DEMO MODE — OpenAI API call skipped."
            );


            const memoryAction =
                detectMemoryAction(message);


            const demoReply =
    await generateDemoResponse(
        message,
        context
    );


            return jsonResponse(
                200,
                {

                    success:
                        true,

                    reply:
                        demoReply,

                    mode:
                        "mock",

                    memoryAction:
                        memoryAction

                }
            );

        }

       /* =========================================
   LOCAL AI MODE
   Ollama + Llama 3.2
========================================= */

if (AI_MODE === "local") {

    console.log("LOCAL FUNCTION ENVIRONMENT:", {
    nodeVersion: process.version,
    platform: process.platform,
    ollamaUrl: "http://127.0.0.1:11434/api/generate"
});

    console.log(
        "🧠 LOCAL AI MODE — Ollama selected."
    );

    try {

        const OLLAMA_URL =
            "http://127.0.0.1:11434/api/generate";

        console.log("⏱️ Starting Ollama fetch:", new Date().toISOString());

const ollamaResponse =
    await fetch(
        OLLAMA_URL,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                model: "llama3.2",
                prompt: message,
                stream: false
            })
        }
    );

console.log("⏱️ Ollama fetch finished:", new Date().toISOString());

if (!ollamaResponse.ok) {

            const errorText =
                await ollamaResponse.text();

            console.error(
                "❌ Ollama response error:",
                errorText
            );

            throw new Error(
                `Ollama request failed (${ollamaResponse.status})`
            );
        }

        const ollamaData =
            await ollamaResponse.json();

        console.log(
            "🧠 Ollama response received."
        );

        return jsonResponse(
            200,
            {
                success: true,

                reply:
                    ollamaData.response ||
                    "The local model did not return a response.",

                mode: "local",

                memoryAction:
                    detectMemoryAction(message)
            }
        );

    } catch (localError) {

        console.error(
            "❌ Local AI / Ollama error:",
            localError
        );

        return jsonResponse(
            500,
            {
                success: false,

                reply:
                    "EMerriment local AI could not connect to the local model.",

                mode: "local",

                error:
                    localError.message
            }
        );
    }
}

        /* -----------------------------------------
           BUILD CONTEXT
        ----------------------------------------- */

        const verifiedProducts = await getApprovedProducts(
    Array.isArray(context.recommendedProducts)
        ? context.recommendedProducts
            .map(product => product?.id)
            .filter(id => typeof id === "string")
        : []
);

        const contextText =
            JSON.stringify(
                {

                    userId:
                        context.userId || null,

                    profile:
                        context.profile || null,

                    skinProfile:
                        context.skinProfile || null,

                    quizResults:
                        context.quizResults || [],

                    savedArticles:
                        context.savedArticles || [],

                    readingHistory:
                        context.readingHistory || [],

                    conversationHistory:
                        context.conversationHistory || [],

                    encyclopediaArticles:
                        context.encyclopediaArticles || [],

                    recentlyViewed:
                        context.recentlyViewed || [],

                        recommendedProducts:
    verifiedProducts,

                    memories:
                        context.memory|| {}

                },

                null,

                2

            );


        /* -----------------------------------------
           BUILD AI INPUT
        ----------------------------------------- */

        const input = `

USER CONTEXT:

${contextText}


USER MESSAGE:

${message}

`;


        /* -----------------------------------------
           CALL OPENAI
        ----------------------------------------- */

        const response =
            await fetch(
                OPENAI_API_URL,
                {

                    method:
                        "POST",

                    headers:
                        {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${key}`

                        },

                    body:
                        JSON.stringify(
                            {

                                model:
                                    process.env.OPENAI_MODEL
                                    || "gpt-5.6-luna",

                                instructions:
                                    SYSTEM_PROMPT,

                                input:
                                    input

                            }
                        )

                }
            );


        /* -----------------------------------------
           READ RESPONSE
        ----------------------------------------- */

        const responseText =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }

        catch (error) {

            console.error(
                "❌ Invalid AI response:",
                responseText
            );


            return jsonResponse(
                502,
                {
                    success:
                        false,

                    error:
                        "Invalid response from AI service."
                }
            );

        }


        /* -----------------------------------------
           AI API ERROR
        ----------------------------------------- */

        if (!response.ok) {

            console.error(
                "❌ AI API error:",
                data
            );


            return jsonResponse(
                response.status,
                {

                    success:
                        false,

                    error:
                        data?.error?.message ||
                        "AI request failed."

                }
            );

        }


        /* -----------------------------------------
           EXTRACT RESPONSE
        ----------------------------------------- */

        const reply =
            data.output_text ||
            extractOutputText(data);


        if (!reply) {

            console.error(
                "❌ AI returned no text.",
                data
            );


            return jsonResponse(
                502,
                {

                    success:
                        false,

                    error:
                        "AI returned an empty response."

                }
            );

        }


        /* -----------------------------------------
           SUCCESS
        ----------------------------------------- */

        console.log(
            "✅ EMerriment AI response generated."
        );


        return jsonResponse(
            200,
            {

                success:
                    true,

                reply:
                    reply,

                mode:
                    "live"

            }
        );


    }

    catch (error) {

        console.error(
            "❌ EMERRIMENT AI FUNCTION ERROR:",
            error
        );


        return jsonResponse(
            500,
            {

                success:
                    false,

                error:
                    "Unable to connect to the AI service."

            }
        );

    }

};


/* =========================================
   LOCAL DEVELOPMENT ENGINE
========================================= */


/* -----------------------------------------
   SKIN PROFILE
----------------------------------------- */

function getSkinProfile(context) {

    const skinProfile =
        context?.skinProfile || {};


    const profile =
        context?.profile || {};


    return {

        skinType:
            skinProfile.skinType ||
            profile.skinType ||
            null,

        concern:
            skinProfile.concern ||
            profile.concern ||
            null,

        oilLevel:
            skinProfile.oilLevel ||
            profile.oilLevel ||
            null,

        sensitivity:
            skinProfile.sensitivity ||
            profile.sensitivity ||
            null,

        score:
            skinProfile.score ||
            profile.current_skin_score ||
            null,

        recommendation:
            skinProfile.recommendation ||
            profile.current_recommendation ||
            null

    };

}


/* -----------------------------------------
   MEMORY
----------------------------------------- */

function getRecentMemory(context) {

    const memories =
        context?.memory || {};


    const history =
        Array.isArray(
            context?.conversationHistory
        )
            ? context.conversationHistory
            : [];


    const memoryItems =
        Object.entries(memories)
            .map(
                ([key, value]) =>
                    `${key}: ${value}`
            )
            .filter(Boolean);


    const historyItems =
        history
            .slice(-6)
            .map(item => {

                if (
                    typeof item === "string"
                ) {

                    return item;

                }


                return (
                    item?.content ||
                    item?.message ||
                    item?.text ||
                    ""
                );

            })
            .filter(Boolean);


    return {

        memories:
            memoryItems,

        conversationHistory:
            historyItems

    };

}


/* -----------------------------------------
   PERSONALIZATION
----------------------------------------- */

function buildPersonalization(context) {

    const skin =
        getSkinProfile(context);

    const memories =
        context?.memory || {};

    const details = [];


    /* -----------------------------------------
       SKIN PROFILE
    ----------------------------------------- */

    if (skin.skinType) {

        details.push(
            `skin type: ${skin.skinType}`
        );

    }

    if (skin.concern) {

        details.push(
            `main concern: ${skin.concern}`
        );

    }

    if (skin.oilLevel) {

        details.push(
            `oil level: ${skin.oilLevel}`
        );

    }

    if (skin.sensitivity) {

        details.push(
            `sensitivity: ${skin.sensitivity}`
        );

    }

    if (skin.score !== null) {

        details.push(
            `skin score: ${skin.score}`
        );

    }


    function cleanMemoryText(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .trim()
            .replace(/[.!?]+$/, "");

    }


    /* -----------------------------------------
       AI MEMORY
    ----------------------------------------- */

    if (memories.preference) {

        details.push(
            `preference: ${cleanMemoryText(memories.preference)}`
        );

    }

    if (memories.goal) {

        details.push(
            `goal: ${cleanMemoryText(memories.goal)}`
        );

    }

    if (memories.routine) {

        details.push(
            `routine preference: ${cleanMemoryText(memories.routine)}`
        );

    }

    if (memories.ingredients) {

        details.push(
            `preferred ingredients: ${cleanMemoryText(memories.ingredients)}`
        );

    }


    /* -----------------------------------------
       RECENTLY VIEWED ARTICLES
    ----------------------------------------- */

    const recentlyViewed =
        Array.isArray(context?.recentlyViewed)
            ? context.recentlyViewed
            : [];

    const recentTitles =
        recentlyViewed
            .map(item => item?.article?.title)
            .filter(Boolean)
            .map(title => cleanMemoryText(title));

    if (recentTitles.length) {

        details.push(
            `recently viewed: ${recentTitles.join(", ")}`
        );

    }


    /* -----------------------------------------
       NO PERSONALIZATION AVAILABLE
    ----------------------------------------- */

    if (!details.length) {

        return (
            "I don't have enough personal skin-profile information yet."
        );

    }


    /* -----------------------------------------
       PERSONALIZED CONTEXT
    ----------------------------------------- */

    return (
        "Based on your EMerriment profile, " +
        details.join(", ") +
        "."
    );

}

/* -----------------------------------------
   ENCYCLOPEDIA SEARCH
----------------------------------------- */

function findRelevantArticles(
    message,
    context
) {

    const articles =
        Array.isArray(
            context?.encyclopediaArticles
        )
            ? context.encyclopediaArticles
            : [];


    if (!articles.length) {

        return [];

    }


    const text =
        message
            .toLowerCase()
            .trim();


    const terms =
        text
            .split(/\W+/)
            .filter(
                word =>
                    word.length > 2
            );


    /*
     * Score articles instead of simply checking
     * whether one random term appears.
     *
     * This makes queries such as:
     *
     * "What is panthenol?"
     *
     * match:
     *
     * title
     * slug
     * category
     * summary
     * content
     * SEO keywords
     * related conditions
     */

    const scored =
        articles
            .map(article => {

                const searchable = [

                    article?.title,
                    article?.slug,
                    article?.category,
                    article?.summary,
                    article?.content,

                    ...(Array.isArray(
                        article?.seo_keywords
                    )
                        ? article.seo_keywords
                        : []),

                    ...(Array.isArray(
                        article?.related_conditions
                    )
                        ? article.related_conditions
                        : [])

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                let score = 0;


                for (const term of terms) {

                    if (!searchable.includes(term)) {
                        continue;
                    }


                    score += 1;


                    const title =
                        String(
                            article?.title || ""
                        ).toLowerCase();


                    const slug =
                        String(
                            article?.slug || ""
                        ).toLowerCase();


                    if (
                        title.includes(term) ||
                        slug.includes(term)
                    ) {

                        score += 5;

                    }

                }


                return {
                    article,
                    score
                };

            })


            .filter(
                item =>
                    item.score > 0
            )


            .sort(
                (a, b) =>
                    b.score - a.score
            )


            .slice(0, 3);


    return scored.map(
        item =>
            item.article
    );

}

/* -----------------------------------------
   PRODUCT RECOMMENDATION LOGIC
----------------------------------------- */

async function getProductRecommendations(message, context = {}) {
    const text = String(message || "").toLowerCase();

    // Identify the skin concern relevant to this request.
    const concernAliases = {
        acne: ["acne", "pimple", "pimples", "breakout", "blackhead", "whitehead"],
        eczema: ["eczema"],
        hyperpigmentation: ["hyperpigmentation", "dark spots", "uneven skin tone"],
        melasma: ["melasma"]
    };

    const matchedConcern = Object.entries(concernAliases)
        .find(([, aliases]) => aliases.some(alias => text.includes(alias)));

    // Only use product IDs supplied by context as an additional source.
    const suppliedProducts = Array.isArray(context.recommendedProducts)
        ? context.recommendedProducts
        : [];

    const productIds = suppliedProducts
        .map(product => product?.id)
        .filter(id => typeof id === "string");

    let approvedProducts = await getApprovedProducts(productIds);

    // Search approved products directly when no supplied product matches.
    if (!approvedProducts.length) {
        const supabase = getSupabaseAdmin();

        if (!supabase) {
            return [];
        }

        let query = supabase
            .from("products")
            .select(
                "id, name, description, category, price, benefits, ingredients, skin_types, concerns, selar_link, image, is_approved"
            )
            .eq("is_approved", true);

        if (matchedConcern) {
            query = query.contains("concerns", [matchedConcern[0]]);
        }

        const { data, error } = await query.limit(20);

        if (error) {
            console.error("Approved product search failed:", error.message);
            return [];
        }

        approvedProducts = data || [];
    }

    // Require a concern match when the request identifies one.
    if (matchedConcern) {
        approvedProducts = approvedProducts.filter(product =>
            Array.isArray(product.concerns) &&
            product.concerns.some(concern =>
                concernAliases[matchedConcern[0]].includes(
                    String(concern).toLowerCase()
                )
            )
        );
    }

    return approvedProducts.slice(0, 3);
}

/* =========================================
   MEMORY ACTION ENGINE
========================================= */

function detectMemoryAction(message) {

    const text =
        message
            .trim();


    /*
     * Only respond to explicit memory requests.
     *
     * Example:
     * "Remember that I prefer lightweight moisturizers."
     */

    const match =
        text.match(
            /^remember(?: that)?\s+(.+)$/i
        );


    if (!match) {

        return null;

    }


    const memoryText =
        match[1]
            .trim();


    if (!memoryText) {

        return null;

    }


    /*
     * Detect common preference statements.
     */

    const preferenceMatch =
        memoryText.match(
            /^i\s+(?:prefer|like|love|use|want)\s+(.+)$/i
        );


    if (preferenceMatch) {

        return {

            action:
                "save",

            key:
                "preference",

            value:
                cleanMemoryValue(
                    preferenceMatch[1]
                ),

            importance:
                4

        };

    }


    /*
     * Detect skincare routine preferences.
     */

    const routineMatch =
        memoryText.match(
            /^i\s+(?:prefer|like|love|want)\s+(?:a\s+)?(.+?)\s+(?:routine|skincare routine)$/i
        );


    if (routineMatch) {

        return {

            action:
                "save",

            key:
                "routine",

            value:
                cleanMemoryValue(
                    routineMatch[1]
                ),

            importance:
                4

        };

    }


    /*
     * Detect skin goals.
     */

    const goalMatch =
        memoryText.match(
            /^i\s+(?:want|want to|hope to)\s+(.+)$/i
        );


    if (goalMatch) {

        return {

            action:
                "save",

            key:
                "goal",

            value:
                cleanMemoryValue(
                    goalMatch[1]
                ),

            importance:
                5

        };

    }


    /*
     * Generic explicit memory.
     *
     * This allows the system to remember
     * information even when it does not match
     * one of the categories above.
     */

    return {

        action:
            "save",

        key:
            "user_note",

        value:
            cleanMemoryValue(
                memoryText
            ),

        importance:
            3

    };

}


/* -----------------------------------------
   MEMORY VALUE CLEANUP
----------------------------------------- */

function cleanMemoryValue(value) {

    if (
        typeof value !== "string"
    ) {

        return value;

    }


    return value
        .trim()
        .replace(/[.!?]+$/, "");

}


/* =========================================
   LOCAL INTENT ENGINE
========================================= */

function detectIntent(message) {

    const text =
        message
            .toLowerCase()
            .trim();


    /* -----------------------------------------
       GREETING
    ----------------------------------------- */

    if (
        /^(hello|hi|hey|good morning|good afternoon|good evening)\b/
            .test(text)
    ) {

        return "greeting";

    }


    /* -----------------------------------------
       MEMORY
    ----------------------------------------- */

    if (
        text.includes("remember") ||
        text.includes("memory") ||
        text.includes("what did i say") ||
        text.includes("what do you know about me") ||
        text.includes("my information")
    ) {

        return "memory";

    }


    /* -----------------------------------------
       SKIN PROFILE
    ----------------------------------------- */

    /*
     * Keep direct personal-profile questions
     * above general encyclopedia detection.
     */

    if (
        text.includes("my skin type") ||
        text.includes("what is my skin type") ||
        text.includes("my skin profile") ||
        text.includes("my skin") ||
        text.includes("my concern") ||
        text.includes("my oil level") ||
        text.includes("my sensitivity")
    ) {

        return "skin_profile";

    }

    /* -----------------------------------------
       PRODUCT RECOMMENDATION
    ----------------------------------------- */

    if (
        text.includes("product") ||
        text.includes("recommend") ||
        text.includes("recommendation") ||
        text.includes("what should i use") ||
        text.includes("what can i use") ||
        text.includes("buy")
    ) {

        return "product";

    }

    /* -----------------------------------------
       ACNE / SKIN CONCERN
    ----------------------------------------- */

    if (
        text.includes("acne") ||
        text.includes("pimple") ||
        text.includes("pimples") ||
        text.includes("breakout") ||
        text.includes("blackhead") ||
        text.includes("whitehead")
    ) {

        return "acne";

    }


    /* -----------------------------------------
       ENCYCLOPEDIA
    ----------------------------------------- */

    /*
     * Encyclopedia detection must happen before
     * generic ingredient/product responses.
     *
     * This allows questions such as:
     *
     * "What is panthenol?"
     * "What is niacinamide?"
     * "Tell me about eczema."
     * "Explain vitamin C."
     */

    if (

    text.includes("article") ||

    text.includes("encyclopedia") ||

    text.includes("learn about") ||

    text.includes("teach me about") ||

    text.includes("explain") ||

    text.startsWith("what is ") ||

    text.startsWith("what does ") ||

    text.startsWith("what do ") ||

    text.startsWith("what are ") ||

    text.startsWith("who is ") ||

    text.startsWith("tell me about ") ||

    text.startsWith("how does ") ||

    text.startsWith("how do ") ||

    text.startsWith("how should ") ||

    text.startsWith("what causes ") ||
text.includes("causes of ") ||
text.startsWith("what can help ") ||
text.startsWith("what can i use for ") ||
text.includes("contagious") ||
text.includes("spread from person") ||
text.includes("cause infection") ||
text.includes("causes infection") ||
    text.includes("good for") ||

    text.includes("help with") ||

    text.includes("suitable for") ||

    text.includes("safe for")

) {

    return "encyclopedia";

}

    /* -----------------------------------------
       INGREDIENTS
    ----------------------------------------- */

    if (
        text.includes("ingredient") ||
        text.includes("niacinamide") ||
        text.includes("retinol") ||
        text.includes("salicylic acid") ||
        text.includes("hyaluronic acid") ||
        text.includes("vitamin c") ||
        text.includes("azelaic acid") ||
        text.includes("glycolic acid")
    ) {

        return "ingredient";

    }

    /* -----------------------------------------
       DEFAULT
    ----------------------------------------- */

    return "general";

}


/* =========================================
   DEMO RESPONSE ENGINE
========================================= */

async function generateDemoResponse(
    message,
    context
) {

    const text =
        message
            .toLowerCase()
            .trim();


    const intent =
        detectIntent(message);
        console.log("🧭 AI INTENT:", intent);
console.log("🧭 AI QUESTION:", message);


    console.log(
        "🧠 EMerriment detected intent:",
        intent
    );


    const skin =
        getSkinProfile(
            context
        );


    const memory =
        getRecentMemory(
            context
        );


    const articles =
        findRelevantArticles(
            message,
            context
        );


    const products =
    await getProductRecommendations(
        message,
        context
    );


    const personalization =
        buildPersonalization(
            context
        );


    /* =========================================
       GREETING
    ========================================= */

    if (
        intent === "greeting"
    ) {

        return `

Hi! 👋❤️

I'm EMerriment AI.

I'm currently running in development mode,
so this response was generated locally without
using OpenAI credits.

${personalization}

As we build the full system, I'll use your skin
profile, quiz results, memory, Encyclopedia
content, and relevant products to personalize
your experience.

What would you like to learn about your skin?

        `.trim();

    }

    /* =========================================
       QUESTION-AWARE ENCYCLOPEDIA
    ========================================= */

    if (
        intent === "encyclopedia"
    ) {

        if (!articles.length) {

            return `
I couldn't find a matching article in the
EMerriment Encyclopedia yet. ❤️

Try asking about a specific skincare ingredient,
condition, or topic.

For example:

• What is panthenol?
• What does panthenol do?
• Is panthenol good for dry skin?
• Tell me about eczema.

${personalization}

🧪 Development mode:
No OpenAI API call was made.
            `.trim();

        }


        const article =
            articles[0];


        const articleTitle =
            article?.title ||
            "EMerriment Encyclopedia Article";


        const articleSummary =
            article?.summary ||
            "";


        const articleContent =
            article?.content ||
            "";


        const category =
            article?.category ||
            "";


        const readingTime =
            article?.reading_time;


        const relatedConditions =
            Array.isArray(
                article?.related_conditions
            )
                ? article.related_conditions
                : [];


        /*
 * -----------------------------------------
 * QUESTION CLASSIFICATION
 * -----------------------------------------
 */

let questionType = "overview";

const normalizedText = text
    .replace(/[?!.,]+$/g, "")
    .trim();


/*
 * DEFINITION
 */

if (
    normalizedText.startsWith("what is ") ||
    normalizedText.startsWith("what are ") ||
    normalizedText.startsWith("tell me about ") ||
    normalizedText.startsWith("define ")
) {

    questionType = "definition";

}


/*
 * FUNCTION
 */

else if (
    normalizedText.startsWith("what does ") ||
    normalizedText.startsWith("what do ") ||
    normalizedText.includes(" what does ") ||
    normalizedText.includes(" what do ") ||
    normalizedText.includes("what does ") ||
    normalizedText.includes("what do ")
) {

    questionType = "function";

}


/*
 * HOW IT WORKS
 */

else if (
    normalizedText.startsWith("how does ") ||
    normalizedText.startsWith("how do ") ||
    normalizedText.includes("how does ") ||
    normalizedText.includes("how do ")
) {

    questionType = "how";

}

else if (
    normalizedText.startsWith("what causes ") ||
    normalizedText.includes("causes of ") ||
    normalizedText.includes("cause of ") ||
    normalizedText.includes("why does ") ||
    normalizedText.includes("why do ") ||
    normalizedText.includes("cause infection") ||
    normalizedText.includes("causes infection")
) {
    questionType = "causes";
}

/*
 * USAGE
 */

else if (
    normalizedText.startsWith("how to ") ||
    normalizedText.startsWith("how should ") ||
    normalizedText.startsWith("how can ") ||
    normalizedText.includes("how should i use") ||
    normalizedText.includes("how can i use") ||
    normalizedText.includes("how do i use") ||
    normalizedText.includes("how to use")
) {

    questionType = "usage";

}


/*
 * CONDITION / BENEFIT
 */

else if (
    normalizedText.includes("good for") ||
    normalizedText.includes("help with") ||
    normalizedText.includes("help my") ||
    normalizedText.includes("help ") ||
    normalizedText.includes("benefit") ||
    normalizedText.includes("benefits") ||
    normalizedText.includes("suitable for") ||
    normalizedText.includes("for eczema") ||
    normalizedText.includes("for dry skin")
) {

    questionType = "benefits";

}


/*
 * SAFETY
 */

else if (
    normalizedText.includes("side effect") ||
    normalizedText.includes("side effects") ||
    normalizedText.includes("risk") ||
    normalizedText.includes("risks") ||
    normalizedText.includes("safe") ||
    normalizedText.includes("safety") ||
    normalizedText.includes("irritation") ||
    normalizedText.includes("irritate") ||
    normalizedText.includes("contagious") ||
    normalizedText.includes("spread")

) {

    questionType = "safety";

}

        /*
         * -----------------------------------------
         * EXTRACT RELEVANT SENTENCES
         * -----------------------------------------
         */

        const sentences =
            articleContent
                .split(/[.!?]+/)
                .map(
                    sentence =>
                        sentence.trim()
                )
                .filter(
                    sentence =>
                        sentence.length > 20
                );


        let relevantSentences = [];


        if (
            questionType === "function"
        ) {

            relevantSentences =
                sentences.filter(
                    sentence =>
                        /helps|supports|does|works|hydrates|moisturiz|improv|protect/i
                            .test(sentence)
                );

        }

        else if (questionType === "causes") {
    if (
    normalizedText.includes("infection") ||
    normalizedText.includes("infected") ||
    normalizedText.includes("infect")
) {
    relevantSentences = sentences.filter(sentence =>
        /infection|infected|infect|complication|pus|blisters|fever|fluid/i.test(sentence)
    );

    const directInfectionSentences = relevantSentences.filter(sentence =>
        /signs of infection|infection or another complication|infected|infection/i.test(sentence)
    );

    if (directInfectionSentences.length) {
        relevantSentences = directInfectionSentences;
    }
}
}

    else if (
            questionType === "benefits"
        ) {

            relevantSentences =
                sentences.filter(
                    sentence =>
                        /helps|supports|benefit|hydration|barrier|comfort|improv/i
                            .test(sentence)
                );

        }


        else if (
            questionType === "usage"
        ) {

            relevantSentences =
                sentences.filter(
                    sentence =>
                        /use|apply|routine|moisturizer|product/i
                            .test(sentence)
                );

        }


        else if (questionType === "safety") {
    relevantSentences = sentences.filter(sentence =>
        /safe|risk|side effect|irrit|reaction|precaution|contagious|spread|infectious/i.test(sentence)
    );
}


        else if (
            questionType === "how"
        ) {

            relevantSentences =
                sentences.filter(
                    sentence =>
                        /helps|supports|works|skin|barrier|hydration/i
                            .test(sentence)
                );

        }


        /*
         * -----------------------------------------
         * FALLBACK
         * -----------------------------------------
         */

        if (
            !relevantSentences.length
        ) {

            relevantSentences =
                sentences.slice(0, 3);

        }


        /*
         * -----------------------------------------
         * REMOVE DUPLICATES
         * -----------------------------------------
         */

        relevantSentences =
            [...new Set(
                relevantSentences
            )];


        /*
         * -----------------------------------------
         * QUESTION-AWARE INTRODUCTION
         * -----------------------------------------
         */

        let introduction =
            "";


        if (
            questionType === "definition"
        ) {

            introduction =
                `📚 ${articleTitle}\n\n${articleSummary}`;

        }

        else if (questionType === "causes") {
    introduction = `📚 ${articleTitle}\n\nHere are the main factors and triggers discussed in the EMerriment Encyclopedia:`;
}

        else if (
            questionType === "function"
        ) {

            introduction =
                `📚 ${articleTitle}\n\nHere's what the EMerriment Encyclopedia says about what it does:`;

        }


        else if (
            questionType === "benefits"
        ) {

            introduction =
                `📚 ${articleTitle}\n\nHere's how it relates to skin benefits:`;

        }


        else if (
            questionType === "usage"
        ) {

            introduction =
                `📚 ${articleTitle}\n\nHere's the available information about using it:`;

        }


        else if (
            questionType === "safety"
        ) {

            introduction =
                `📚 ${articleTitle}\n\nHere's the available information related to safety and precautions:`;

        }


        else if (
            questionType === "how"
        ) {

            introduction =
                `📚 ${articleTitle}\n\nHere's what the Encyclopedia explains about how it works:`;

        }


        else {

            introduction =
                `📚 ${articleTitle}\n\n${articleSummary}`;

        }


        /*
         * -----------------------------------------
         * ARTICLE METADATA
         * -----------------------------------------
         */

        const categoryText =
            category
                ? `\nCategory: ${category}`
                : "";


        const readingText =
            readingTime
                ? `\nReading time: ${readingTime} min`
                : "";


        const relatedText =
            relatedConditions.length
                ? `\nRelated skin concerns: ${relatedConditions.join(", ")}`
                : "";


        /*
         * -----------------------------------------
         * FINAL QUESTION-AWARE RESPONSE
         * -----------------------------------------
         */

        return `
${introduction}

${relevantSentences.join(". ")}.

${categoryText}${readingText}${relatedText}

${personalization}

🧪 Development mode:
This answer was generated from the EMerriment Encyclopedia.
No OpenAI API call was made.
        `.trim();

    }
    
    /* =========================================
       ACNE
    ========================================= */

    if (
        intent === "acne"
    ) {

        let reply = `

I can help you understand acne and build a
simple skincare approach. ❤️

A good starting point is:

• Use a gentle cleanser.
• Avoid picking or squeezing pimples.
• Keep your routine simple and consistent.
• Introduce active ingredients gradually.
• Use sunscreen during the day.

${personalization}

If acne is severe, painful, persistent, or
leaving significant scarring, consider speaking
with a qualified healthcare professional.

🧪 Development mode:
No OpenAI API call was made.

        `.trim();


        if (articles.length) {

            reply +=

                `\n\n📚 Relevant EMerriment Encyclopedia articles:\n` +

                articles

                    .map(
                        article =>
                            `• ${
                                article.title ||
                                "Article"
                            }`
                    )

                    .join("\n");

        }


        if (products.length) {

            reply +=

                `\n\n🛍️ Potentially relevant products:\n` +

                products

                    .map(
                        product =>
                            `• ${
                                product.name ||
                                "Product"
                            }`
                    )

                    .join("\n");

        }


        return reply;

    }


    /* =========================================
       SKIN PROFILE
    ========================================= */

    if (
        intent === "skin_profile"
    ) {

        return `

I can help you understand your skin profile. ❤️

${personalization}

Current Context Engine values:

• Skin type:
  ${skin.skinType || "Not available"}

• Main concern:
  ${skin.concern || "Not available"}

• Oil level:
  ${skin.oilLevel || "Not available"}

• Sensitivity:
  ${skin.sensitivity || "Not available"}

• Skin score:
  ${skin.score ?? "Not available"}

${skin.recommendation
    ? `• Recommendation:\n  ${skin.recommendation}`
    : ""
}

🧪 Development mode:
No OpenAI API call was made.

        `.trim();

    }

    /* =========================================
   RECENT CONVERSATION HISTORY
========================================= */

if (
    intent === "general" &&
    (
        text.includes("what have we talked about recently") ||
        text.includes("what did we talk about recently") ||
        text.includes("what have we discussed recently") ||
        text.includes("what did we discuss recently") ||
        text.includes("recent conversation") ||
        text.includes("our recent conversation")
    )
) {

    const recentHistory =
    Array.isArray(context?.conversationHistory)
        ? context.conversationHistory
        : [];

if (!recentHistory.length) {

    return `
🧠 Recent Conversation

I don't have any recent conversation history available yet.

🧪 Development mode:
No OpenAI API call was made.
    `.trim();

}

const recentMessages =
    [...new Map(
        recentHistory
            .filter(item => item && item.content)
            .map(item => [
                `${item.role}:${item.content.trim().toLowerCase()}`,
                item
            ])
    ).values()]
        .filter(item => {

    const content =
        item.content
            .toLowerCase()
            .trim();

    const isHistorySummary =
        content.includes("recent conversation") ||
        content.includes(
            "here are some of the most recent things we've talked about"
        ) ||
        content.includes(
            "recent conversation history was loaded"
        );

    const isHistoryQuestion =
        content === "what have we talked about recently?" ||
        content === "what did we talk about recently?" ||
        content === "what have we discussed recently?" ||
        content === "what did we discuss recently?";

    return !isHistorySummary && !isHistoryQuestion;

})
        .slice(-6)
        .map(item => {

            const content =
                item.content
                    .replace(/\s+/g, " ")
                    .trim();

            if (!content) return null;

            if (item.role === "user") {

                return `• You asked: ${content}`;

            }

            const shortened =
                content.length > 180
                    ? content.slice(0, 180) + "..."
                    : content;

            return `• EMerriment AI discussed: ${shortened}`;

        })
        .filter(Boolean)
        .join("\n");
    return `
🧠 Recent Conversation

Here are some of the most recent things we've talked about:

${recentMessages}

I'm using your recent conversation history to keep the EMerriment AI experience more continuous and useful.

🧪 Development mode:
Conversation history was loaded from the EMerriment database.
No OpenAI API call was made.
    `.trim();
}

    /* =========================================
       MEMORY
    ========================================= */

    if (
        intent === "memory"
    ) {

        const savedMemories =
            memory.memories || [];


        const recentConversation =
            memory.conversationHistory || [];


        /* -----------------------------------------
           PERSISTENT MEMORY
        ----------------------------------------- */

        if (savedMemories.length) {

            return `

Yes — I remember some things you've asked
EMerriment AI to keep for you. 🧠❤️

Your saved memories:

${savedMemories
    .map(
        item =>
            `• ${item}`
    )
    .join("\n")}

These memories are stored separately from your
recent conversation history, so they can be used
to personalize future EMerriment AI responses.

${personalization}

🧪 Development mode:
No OpenAI API call was made.

            `.trim();

        }


        /* -----------------------------------------
           RECENT CONVERSATION
        ----------------------------------------- */

        if (recentConversation.length) {

            return `

I don't have any persistent memories saved yet,
but I can see some recent conversation context.

Recent conversation:

${recentConversation
    .slice(-3)
    .map(
        item =>
            `• ${item}`
    )
    .join("\n")}

🧪 Development mode:
No OpenAI API call was made.

            `.trim();

        }


        /* -----------------------------------------
           NOTHING AVAILABLE
        ----------------------------------------- */

        return `

I don't have any persistent memories saved yet,
and no recent conversation history was supplied.

You can explicitly tell me something to remember,
for example:

"Remember that I prefer lightweight moisturizers."

🧪 Development mode:
No OpenAI API call was made.

        `.trim();

    }

        /* =========================================================
       PRODUCT RECOMMENDATION RESPONSE
       ========================================================= */

    if (intent === "product") {

        if (!products.length) {

            return `
I understand that you're looking for a skincare product recommendation. ❤️

However, I couldn't find a matching EMerriment product in the current product database.

I can only recommend products that are available and approved in the EMerriment product database. I couldn't verify a suitable match this time, but I can still help you understand ingredients, routines, and options for your skin concern.

${personalization}

🧪 Development mode:
No OpenAI API call was made.
            `.trim();
        }

        const productList = products
            .map(product => {

                const name =
                    product.name ||
                    product.title ||
                    "EMerriment Product";

                const description =
                    product.description ||
                    product.summary ||
                    "";

                return `• ${name}${description ? ` — ${description}` : ""}`;

            })
            .join("\n");

        return `
🛍️ EMerriment Product Recommendations

Based on the information currently available, these EMerriment products may be relevant:

${productList}

${personalization}

Always consider your skin type, sensitivity, and current concerns when choosing skincare.

🧪 Development mode:
These recommendations were generated from the EMerriment product database.
No OpenAI API call was made.
        `.trim();
    }


    /* =========================================================
       INGREDIENT RESPONSE
       ========================================================= */

    if (intent === "ingredient") {

        if (articles.length) {

            const ingredientArticle = articles[0];

            const articleTitle =
                ingredientArticle?.title ||
                "Skincare Ingredient";

            const articleSummary =
                ingredientArticle?.summary ||
                "";

            const articleContent =
                ingredientArticle?.content ||
                "";

            return `
🧪 ${articleTitle}

${articleSummary}

${articleContent}

${personalization}

🧪 Development mode:
This explanation was generated from the EMerriment knowledge base.
No OpenAI API call was made.
            `.trim();
        }

        return `
🧪 Ingredient Education

I can help explain skincare ingredients, including:

• What the ingredient does
• How it interacts with the skin
• Who may benefit from it
• How it may fit into a skincare routine
• Important precautions

However, I couldn't find a matching ingredient article in the current EMerriment Encyclopedia.

${personalization}

🧪 Development mode:
No OpenAI API call was made.
        `.trim();
    }


    /* =========================================================
       SKIN PROFILE RESPONSE
       ========================================================= */

    if (intent === "skin_profile") {

        if (!skinProfile) {

            return `
🧴 I don't have a completed EMerriment skin profile for you yet.

Complete the EMerriment skin quiz so I can use your skin type, concerns, oil level, sensitivity, and other available information to personalize future answers.

🧪 Development mode:
No OpenAI API call was made.
            `.trim();
        }

        return `
🧴 Your EMerriment Skin Profile

Skin type: ${skinProfile.skin_type || "Not available"}
Main concern: ${skinProfile.concern || "Not available"}
Oil level: ${skinProfile.oil_level || "Not available"}
Sensitivity: ${skinProfile.sensitivity || "Not available"}
Score: ${skinProfile.score ?? "Not available"}

${skinProfile.recommendation
    ? `Current recommendation:\n${skinProfile.recommendation}`
    : ""}

${personalization}

🧪 Development mode:
This information was retrieved from your EMerriment profile data.
No OpenAI API call was made.
        `.trim();
    }


    /* =========================================================
       MEMORY RESPONSE
       ========================================================= */

    if (intent === "memory") {

        const memoryEntries =
            memory && typeof memory === "object"
                ? Object.entries(memory)
                : [];

        if (!memoryEntries.length) {

            return `
🧠 EMerriment Memory

I don't currently have any saved personal preferences or memories for you.

When you explicitly share useful long-term preferences, the EMerriment AI can save them and use them to personalize future conversations.

🧪 Development mode:
No OpenAI API call was made.
            `.trim();
        }

        const memoryText = memoryEntries
            .map(([key, value]) => `• ${key}: ${value}`)
            .join("\n");

        return `
🧠 What I Remember

${memoryText}

These memories are used only to help personalize your EMerriment experience.

🧪 Development mode:
Memory was loaded from the EMerriment AI memory system.
No OpenAI API call was made.
        `.trim();
    }


    /* =========================================================
       ACNE RESPONSE
       ========================================================= */

    if (intent === "acne") {

        return `
🧴 Acne Education

Acne can involve clogged pores, excess oil, inflammation, and changes in the skin environment.

The most useful approach depends on the type of acne, your skin characteristics, and the products or ingredients already being used.

${personalization}

For persistent, severe, painful, or scarring acne, professional medical assessment can be important.

🧪 Development mode:
No OpenAI API call was made.
        `.trim();
    }


    /* =========================================================
       GENERAL RESPONSE
       ========================================================= */

    return `
🤖 EMerriment AI

I received your question:

"${message}"

I'm currently running in EMerriment development mode.

Your request can be connected to the EMerriment knowledge system, including:

• Your skin profile
• Skin quiz results
• Encyclopedia articles
• Saved articles
• Reading history
• Recently viewed content
• Product recommendations
• AI memories
• Personalized skincare context

${personalization}

The next stage is to continue expanding the local EMerriment knowledge engine so answers can be grounded in your actual Encyclopedia content instead of relying on generic responses.

🧪 Development mode:
No OpenAI API call was made.
    `.trim();
}


/* =========================================================
   OPENAI RESPONSE TEXT EXTRACTION
   ========================================================= */

function extractOutputText(data) {

    try {

        if (!data) {
            return "";
        }


        /* -----------------------------------------
           Standard Responses API format
           ----------------------------------------- */

        if (
            Array.isArray(data.output) &&
            data.output.length
        ) {

            const textParts = [];

            for (const outputItem of data.output) {

                if (
                    !outputItem ||
                    !Array.isArray(outputItem.content)
                ) {
                    continue;
                }

                for (const contentItem of outputItem.content) {

                    if (
                        contentItem &&
                        typeof contentItem.text === "string"
                    ) {

                        textParts.push(contentItem.text);

                    }

                }

            }

            if (textParts.length) {

                return textParts.join("\n").trim();

            }
        }


        /* -----------------------------------------
           Direct output_text format
           ----------------------------------------- */

        if (
            typeof data.output_text === "string" &&
            data.output_text.trim()
        ) {

            return data.output_text.trim();

        }


        /* -----------------------------------------
           Chat Completions style format
           ----------------------------------------- */

        if (
            Array.isArray(data.choices) &&
            data.choices.length
        ) {

            const choice = data.choices[0];

            if (
                choice &&
                choice.message &&
                typeof choice.message.content === "string"
            ) {

                return choice.message.content.trim();

            }

        }


        /* -----------------------------------------
           Simple reply fallback
           ----------------------------------------- */

        if (
            typeof data.reply === "string" &&
            data.reply.trim()
        ) {

            return data.reply.trim();

        }


        /* -----------------------------------------
           Simple message fallback
           ----------------------------------------- */

        if (
            typeof data.message === "string" &&
            data.message.trim()
        ) {

            return data.message.trim();

        }


        return "";

    } catch (error) {

        console.error(
            "❌ Failed to extract AI response text:",
            error
        );

        return "";

    }

}

/* =========================================================
   FINAL FUNCTION INITIALIZATION
   ========================================================= */

console.log("✅ EMerriment AI Knowledge Engine initialized.");