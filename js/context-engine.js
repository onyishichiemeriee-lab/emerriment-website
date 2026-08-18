// =========================================
// EMerriment Context Engine
// =========================================

const ContextEngine = {

    // -----------------------------------------
    // Build AI Context
    // -----------------------------------------

    async buildContext(userId) {

        try {

            if (!userId) {

                console.warn(
                    "ContextEngine: No user ID provided."
                );

                return {
                    user: null,
                    skinProfile: null,
                    quizResults: [],
                    savedArticles: [],
                    readingHistory: []
                };

            }


            // -----------------------------------------
            // USER PROFILE
            // -----------------------------------------

            const { data: profile, error: profileError } =
                await supabaseClient
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


            // -----------------------------------------
            // LATEST QUIZ RESULT
            // -----------------------------------------

            const { data: quizResults, error: quizError } =
                await supabaseClient
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


            // -----------------------------------------
            // SAVED ARTICLES
            // -----------------------------------------

            const { data: savedArticles, error: savedError } =
                await supabaseClient
                    .from("saved_articles")
                    .select(`
                        *,
                        encyclopedia_articles(*)
                    `)
                    .eq("user_id", userId);


            if (savedError) {

                console.warn(
                    "ContextEngine saved article error:",
                    savedError
                );

            }


            // -----------------------------------------
            // READING HISTORY
            // -----------------------------------------

            const { data: readingHistory, error: historyError } =
                await supabaseClient
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
                    "ContextEngine history error:",
                    historyError
                );

            }


            // -----------------------------------------
            // RETURN CONTEXT
            // -----------------------------------------

            return {

                userId,

                profile:
                    profile || null,

                skinProfile:
                    profile || null,

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

            return {

                userId,

                profile: null,

                skinProfile: null,

                quizResults: [],

                savedArticles: [],

                readingHistory: []

            };

        }

    }

};

console.log(
    "✅ EMerriment Context Engine initialized."
);