/* =========================================
   EMerriment AI
   Netlify AI Chat Function
========================================= */

"use strict";


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

        if (AI_MODE !== "live") {

            console.log(
                "🧪 DEMO MODE — OpenAI API call skipped."
            );


            const demoReply =
                generateDemoResponse(
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
                        "mock"

                }
            );

        }


        /* -----------------------------------------
           BUILD CONTEXT
        ----------------------------------------- */

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
                        context.recommendedProducts || []

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
            null

    };

}


/* -----------------------------------------
   MEMORY
----------------------------------------- */

function getRecentMemory(context) {

    const history =
        Array.isArray(
            context?.conversationHistory
        )

            ? context.conversationHistory

            : [];


    return history

        .slice(-6)

        .map(
            item => {

                if (
                    typeof item ===
                    "string"
                ) {

                    return item;

                }


                return (

                    item?.content ||

                    item?.message ||

                    item?.text ||

                    ""

                );

            }
        )

        .filter(Boolean);

}


/* -----------------------------------------
   PERSONALIZATION
----------------------------------------- */

function buildPersonalization(context) {

    const skin =
        getSkinProfile(context);


    const details = [];


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


    if (!details.length) {

        return (
            "No skin-profile information is available yet."
        );

    }


    return (
        "Available skin profile: " +
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


    const terms =
        message

            .toLowerCase()

            .split(/\W+/)

            .filter(
                word =>
                    word.length > 2
            );


    return articles

        .filter(
            article => {

                const searchable =
                    JSON.stringify(
                        article
                    )
                    .toLowerCase();


                return terms.some(
                    term =>
                        searchable.includes(
                            term
                        )
                );

            }
        )

        .slice(
            0,
            3
        );

}


/* -----------------------------------------
   PRODUCT RECOMMENDATION LOGIC
----------------------------------------- */

function getProductRecommendations(
    message,
    context
) {

    const products =
        Array.isArray(
            context?.recommendedProducts
        )

            ? context.recommendedProducts

            : [];


    const terms =
        message

            .toLowerCase()

            .split(/\W+/)

            .filter(
                word =>
                    word.length > 2
            );


    return products

        .filter(
            product => {

                const searchable =
                    JSON.stringify(
                        product
                    )
                    .toLowerCase();


                return terms.some(
                    term =>
                        searchable.includes(
                            term
                        )
                );

            }
        )

        .slice(
            0,
            3
        );

}


/* -----------------------------------------
   DEMO RESPONSE ENGINE
----------------------------------------- */

function generateDemoResponse(
    message,
    context
) {

    const text =
        message.toLowerCase();


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
        getProductRecommendations(
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

        text.includes("hello") ||

        text.includes("hi") ||

        text.includes("hey")

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
       ACNE
    ========================================= */

    if (

        text.includes("acne") ||

        text.includes("pimple") ||

        text.includes("pimples")

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
       SKIN TYPE
    ========================================= */

    if (

        text.includes("skin type") ||

        text.includes("oily skin") ||

        text.includes("dry skin") ||

        text.includes("combination skin")

    ) {

        return `

I can help you understand your skin type. ❤️

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

🧪 Development mode:
No OpenAI API call was made.

        `.trim();

    }


    /* =========================================
       MEMORY TEST
    ========================================= */

    if (

        text.includes("remember") ||

        text.includes("memory") ||

        text.includes("what did i say")

    ) {

        if (memory.length) {

            return `

Yes — the development Memory Layer can
currently see recent conversation context
supplied with this request.

Recent context:

${memory

    .slice(-3)

    .map(
        item =>
            `• ${item}`
    )

    .join("\n")}

This is the foundation for persistent EMerriment
AI memory that we can later connect to Supabase.

🧪 Development mode:
No OpenAI API call was made.

            `.trim();

        }


        return `

The EMerriment AI Memory Layer is ready for
development, but no conversation history was
supplied with this request yet.

Next we'll connect persistent memory so useful
information can survive across sessions.

🧪 Development mode:
No OpenAI API call was made.

        `.trim();

    }


    /* =========================================
       ENCYCLOPEDIA
    ========================================= */

    if (

        text.includes("article") ||

        text.includes("encyclopedia") ||

        text.includes("learn about")

    ) {

        if (articles.length) {

            return `

I found potentially relevant EMerriment
Encyclopedia content. 📚❤️

${articles

    .map(
        article =>
            `• ${
                article.title ||
                "Article"
            }`
    )

    .join("\n")}

The next Encyclopedia module will use the
actual article content to ground AI answers.

🧪 Development mode:
No OpenAI API call was made.

            `.trim();

        }


        return `

The EMerriment Encyclopedia integration is
ready at the architecture level.

Once article data is supplied through the
Context Engine, I can identify relevant content
and use it for personalized answers.

🧪 Development mode:
No OpenAI API call was made.

        `.trim();

    }


    /* =========================================
       DEFAULT
    ========================================= */

    return `

Thanks for your question. ❤️

I'm currently running in EMerriment AI
development mode.

${personalization}

The system is being built to understand:

• Your skin profile
• Your quiz results
• Conversation memory
• Saved Encyclopedia articles
• Reading history
• Relevant Encyclopedia content
• Personalized product recommendations

Context records currently available:

• Quiz results:
  ${
      Array.isArray(
          context?.quizResults
      )
          ? context.quizResults.length
          : 0
  }

• Saved articles:
  ${
      Array.isArray(
          context?.savedArticles
      )
          ? context.savedArticles.length
          : 0
  }

• Reading history:
  ${
      Array.isArray(
          context?.readingHistory
      )
          ? context.readingHistory.length
          : 0
  }

• Conversation history:
  ${
      Array.isArray(
          context?.conversationHistory
      )
          ? context.conversationHistory.length
          : 0
  }

As we build the remaining modules, these
pieces will work together to create a genuinely
personalized EMerriment AI experience.

🧪 No OpenAI API call was made.

    `.trim();

}


/* =========================================
   RESPONSE TEXT FALLBACK
========================================= */

function extractOutputText(data) {

    if (

        !data ||

        !Array.isArray(
            data.output
        )

    ) {

        return "";

    }


    let text = "";


    for (

        const item

        of data.output

    ) {

        if (

            item.type !==
            "message"

        ) {

            continue;

        }


        if (

            !Array.isArray(
                item.content
            )

        ) {

            continue;

        }


        for (

            const content

            of item.content

        ) {

            if (

                content.type ===
                "output_text"

            ) {

                text +=
                    content.text ||
                    "";

            }

        }

    }


    return text.trim();

}