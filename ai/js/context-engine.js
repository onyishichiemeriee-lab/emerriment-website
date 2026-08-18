/* =========================================
   EMerriment Context Engine
   ========================================= */

(function () {

    "use strict";

    const ContextEngine = {

        /* -----------------------------------------
           Get current authenticated user
        ----------------------------------------- */

        async getCurrentUser() {

            try {

                const client = window.supabaseClient;

                if (!client) {

                    console.warn(
                        "ContextEngine: Supabase client not available."
                    );

                    return null;
                }

                const {
                    data,
                    error
                } = await client.auth.getUser();

                if (error) {

                    console.warn(
                        "ContextEngine auth error:",
                        error
                    );

                    return null;
                }

                return data?.user || null;

            } catch (error) {

                console.error(
                    "ContextEngine getCurrentUser error:",
                    error
                );

                return null;
            }
        },


        /* -----------------------------------------
           Build user context
        ----------------------------------------- */

        async buildContext(userId) {

            const emptyContext = {

                userId: userId || null,

                profile: null,

                skinProfile: null,

                quizResults: [],

                savedArticles: [],

                readingHistory: []

            };


            try {

                const client =
                    window.supabaseClient;


                if (!client) {

                    console.warn(
                        "ContextEngine: Supabase client unavailable."
                    );

                    return emptyContext;
                }


                if (!userId) {

                    console.warn(
                        "ContextEngine: No authenticated user."
                    );

                    return emptyContext;
                }


                /* -----------------------------------------
                   USER PROFILE
                ----------------------------------------- */

                const {
                    data: profile,
                    error: profileError
                } = await client

                    .from("profiles")

                    .select("*")

                    .eq("id", userId)

                    .maybeSingle();


                if (profileError) {

                    console.warn(
                        "ContextEngine profile error:",
                        profileError
                    );

                }


                /* -----------------------------------------
                   QUIZ RESULTS
                ----------------------------------------- */

                const {
                    data: quizResults,
                    error: quizError
                } = await client

                    .from("quiz_results")

                    .select("*")

                    .eq("user_id", userId)

                    .order("created_at", {
                        ascending: false
                    })

                    .limit(5);


                if (quizError) {

                    console.warn(
                        "ContextEngine quiz error:",
                        quizError
                    );

                }


                /* -----------------------------------------
                   SAVED ARTICLES
                ----------------------------------------- */

                const {
                    data: savedArticles,
                    error: savedError
                } = await client

                    .from("saved_articles")

                    .select(`
                        *,
                        encyclopedia_articles(*)
                    `)

                    .eq("user_id", userId);


                if (savedError) {

                    console.warn(
                        "ContextEngine saved articles error:",
                        savedError
                    );

                }


                /* -----------------------------------------
                   READING HISTORY
                ----------------------------------------- */

                const {
                    data: readingHistory,
                    error: historyError
                } = await client

                    .from("reading_history")

                    .select(`
                        *,
                        encyclopedia_articles(*)
                    `)

                    .eq("user_id", userId)

                    .order("read_at", {
                        ascending: false
                    })

                    .limit(10);


                if (historyError) {

                    console.warn(
                        "ContextEngine reading history error:",
                        historyError
                    );

                }


                /* -----------------------------------------
                   RETURN CONTEXT
                ----------------------------------------- */

                return {

                    userId,

                    profile:
                        profile || null,

                    skinProfile:
                        Profile || null,

                    quizResults:
                        quizResults || [],

                    savedArticles:
                        savedArticles || [],

                    readingHistory:
                        readingHistory || []

                };


            } catch (error) {

                console.error(
                    "ContextEngine Error:",
                    error
                );

                return emptyContext;
            }

        }

    };


    /* -----------------------------------------
       Make globally available
    ----------------------------------------- */

    window.ContextEngine = ContextEngine;


    console.log(
        "✅ EMerriment Context Engine initialized."
    );

})();