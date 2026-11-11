/* =========================================
   EMerriment AI Context Engine
========================================= */

"use strict";

const ContextEngine = {

    /* =====================================
       BUILD COMPLETE AI CONTEXT
    ===================================== */

    async buildContext(userId) {

        try {

            const client =
                window.supabaseClient;

            if (!client) {

                console.warn(
                    "ContextEngine: Supabase client not available."
                );

                return this.emptyContext(userId);

            }


            /* ---------------------------------
               CURRENT USER
            --------------------------------- */

            const {
                data: { user },
                error: userError
            } =
                await client.auth.getUser();


            if (userError) {

                console.warn(
                    "ContextEngine: Auth error:",
                    userError
                );

            }


            const currentUserId =
                userId ||
                user?.id ||
                null;


            if (!currentUserId) {

                console.warn(
                    "ContextEngine: No authenticated user."
                );

                return this.emptyContext(null);

            }


            /* ---------------------------------
               PROFILE
            --------------------------------- */

            let profile = null;

            try {

                const {
                    data,
                    error
                } =
                    await client

                        .from("profiles")

                        .select("*")

                        .eq(
                            "id",
                            currentUserId
                        )

                        .maybeSingle();


                if (error) {

                    console.warn(
                        "ContextEngine: Profile error:",
                        error
                    );

                }

                profile =
                    data || null;

            }

            catch (error) {

                console.warn(
                    "ContextEngine: Could not load profile:",
                    error
                );

            }


            /* ---------------------------------
               QUIZ RESULTS
            --------------------------------- */

            let quizResults = [];

            try {

                const {
                    data,
                    error
                } =
                    await client

                        .from("quiz_results")

                        .select("*")

                        .eq(
                            "user_id",
                            currentUserId
                        )

                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        )

                        .limit(5);


                if (error) {

                    console.warn(
                        "ContextEngine: Quiz result error:",
                        error
                    );

                }

                quizResults =
                    data || [];

            }

            catch (error) {

                console.warn(
                    "ContextEngine: Could not load quiz results:",
                    error
                );

            }


            /* ---------------------------------
               LATEST QUIZ RESULT
            --------------------------------- */

            const latestQuiz =
                quizResults.length
                    ? quizResults[0]
                    : null;


            /* ---------------------------------
               SKIN PROFILE
            --------------------------------- */

            const skinProfile =
                latestQuiz
                    ? {

                        skinType:
                            latestQuiz.skin_type ||
                            latestQuiz.skinType ||
                            null,

                        concern:
                            latestQuiz.concern ||
                            null,

                        oilLevel:
                            latestQuiz.oil_level ||
                            latestQuiz.oilLevel ||
                            null,

                        sensitivity:
                            latestQuiz.sensitivity ||
                            null,

                        score:
                            latestQuiz.score ??
                            null,

                        recommendation:
                            latestQuiz.recommendation ||
                            null,

                        createdAt:
                            latestQuiz.created_at ||
                            null

                    }
                    : null;


            /* ---------------------------------
               SAVED ARTICLES
            --------------------------------- */

            let savedArticles = [];

            try {

                const {
                    data,
                    error
                } =
                    await client

                        .from("saved_articles")

                        .select("*")

                        .eq(
                            "user_id",
                            currentUserId
                        );


                if (error) {

                    console.warn(
                        "ContextEngine: Saved articles error:",
                        error
                    );

                }

                savedArticles =
                    data || [];

            }

            catch (error) {

                console.warn(
                    "ContextEngine: Could not load saved articles:",
                    error
                );

            }


            /* ---------------------------------
               READING HISTORY
            --------------------------------- */

            let readingHistory = [];

            try {

                const {
                    data,
                    error
                } =
                    await client

                        .from("reading_history")

                        .select(`
                            *,
                            encyclopedia_articles (
                                id,
                                title,
                                slug,
                                category,
                                summary
                            )
                        `)

                        .eq(
                            "user_id",
                            currentUserId
                        )

                        .order(
                            "read_at",
                            {
                                ascending: false
                            }
                        )

                        .limit(10);


                if (error) {

                    console.warn(
                        "ContextEngine: Reading history error:",
                        error
                    );

                }

                readingHistory =
                    (data || []).map(item => ({

                        id:
                            item.id,

                        articleId:
                            item.article_id,

                        progress:
                            item.progress,

                        lastPosition:
                            item.last_position,

                        readAt:
                            item.read_at,

                        article:
                            item.encyclopedia_articles ||
                            null

                    }));

            }

            catch (error) {

                console.warn(
                    "ContextEngine: Could not load reading history:",
                    error
                );

            }


            /* ---------------------------------
               RECENTLY VIEWED ARTICLES
            --------------------------------- */

            const recentlyViewed =
                readingHistory.slice(0, 5);


            /* ---------------------------------
               ENCYCLOPEDIA ARTICLES
            --------------------------------- */

            let encyclopediaArticles = [];

            try {

                const {
                    data,
                    error
                } =
                    await client

                        .from("encyclopedia_articles")

                        .select(`
                            id,
                            title,
                            slug,
                            category,
                            summary,
                            content,
                            featured_image,
                            reading_time,
                            difficulty,
                            seo_keywords,
                            related_conditions,
                            author,
                            is_featured,
                            published_at
                        `)

                        .eq(
                            "status",
                            "published"
                        )

                        .order(
                            "published_at",
                            {
                                ascending: false
                            }
                        )

                        .limit(20);


                if (error) {

                    console.warn(
                        "ContextEngine: Encyclopedia articles error:",
                        error
                    );

                }

                encyclopediaArticles =
                    data || [];

            }

            catch (error) {

                console.warn(
                    "ContextEngine: Could not load Encyclopedia articles:",
                    error
                );

            }

            /* ---------------------------------
   CONVERSATION HISTORY
--------------------------------- */

let conversationHistory = [];

try {

    const {
        data,
        error
    } =
        await client

            .from("ai_messages")

            .select(`
                id,
                conversation_id,
                role,
                content,
                created_at
            `)

            .eq(
                "user_id",
                currentUserId
            )

            .order(
                "created_at",
                {
                    ascending: false
                }
            )

            .limit(20);


    if (error) {

        console.warn(
            "ContextEngine: Conversation history error:",
            error
        );

    }

    conversationHistory =
        (data || [])
            .reverse()
            .map(item => ({

                id:
                    item.id,

                conversationId:
                    item.conversation_id,

                role:
                    item.role,

                content:
                    item.content,

                createdAt:
                    item.created_at

            }));

}
catch (error) {

    console.warn(
        "ContextEngine: Could not load conversation history:",
        error
    );

}

            /* ---------------------------------
               AI MEMORY
            --------------------------------- */

            let memory = null;

            try {

                if (
                    window.AIMemory &&
                    typeof window.AIMemory.loadAll === "function"
                ) {

                    memory =
                        await window.AIMemory.loadAll(
                            currentUserId
                        );

                }

            }

            catch (error) {

                console.warn(
                    "ContextEngine: Could not load AI memory:",
                    error
                );

            }


            /* ---------------------------------
               RETURN AI CONTEXT
            --------------------------------- */

            const context = {

                userId:
                    currentUserId,

                user:
                    user || null,

                profile:
                    profile,

                skinProfile:
                    skinProfile,

                quizResults:
                    quizResults,

                memory:
                    memory,

                savedArticles:
                    savedArticles,

                readingHistory:
                    readingHistory,

                conversationHistory:
                    conversationHistory,

                encyclopediaArticles:
                    encyclopediaArticles,

                recentlyViewed:
                    recentlyViewed,

                recommendedProducts:
                    []

            };


            console.log(
                "🧠 EMerriment Context Engine built:",
                context
            );

            console.log(
                "🧠 Context Engine skin profile:",
                context.skinProfile
            );

            console.log(
                "🧠 Context Engine quiz results:",
                context.quizResults
            );


            return context;

        }

        catch (error) {

            console.error(
                "❌ ContextEngine build error:",
                error
            );

            return this.emptyContext(
                userId || null
            );

        }

    },


    /* =====================================
       EMPTY CONTEXT
    ===================================== */

    emptyContext(userId = null) {

        return {

            userId:

                userId,

            user:

                null,

            profile:

                null,

            skinProfile:

                null,

            quizResults:

                [],

            savedArticles:

                [],

            readingHistory:

                [],

            conversationHistory:

                [],

            encyclopediaArticles:

                [],

            recentlyViewed:

                [],

            recommendedProducts:

                []

        };

    },


    /* =====================================
       BACKWARD COMPATIBILITY
       Allows older code to call build()
    ===================================== */

    async build(userMessage) {

        return this.buildContext();

    }

};


/* =========================================
   EXPOSE GLOBALLY
========================================= */

window.ContextEngine =
    ContextEngine;


console.log(
    "✅ EMerriment Context Engine exposed globally."
);