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

                    userId: null,

                    user: null,

                    profile: null,

                    skinProfile: null,

                    quizResults: [],

                    savedArticles: [],

                    readingHistory: [],

                    conversationHistory: [],

                    encyclopediaArticles: [],

                    recentlyViewed: [],

                    recommendedProducts: []

                };

            }


            // -----------------------------------------
            // USER PROFILE
            // -----------------------------------------

            const {
                data: profile,
                error: profileError
            } =
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
            // QUIZ RESULTS
            // -----------------------------------------

            const {
                data: quizResults,
                error: quizError
            } =
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
            // BUILD SKIN PROFILE
            // -----------------------------------------

            const latestQuiz =
                quizResults &&
                quizResults.length > 0

                    ? quizResults[0]

                    : null;


            let skinProfile = null;


            if (latestQuiz) {

                skinProfile = {

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

                };

            }


            // -----------------------------------------
            // SAVED ARTICLES
            // -----------------------------------------

            const {
                data: savedArticles,
                error: savedError
            } =
                await supabaseClient

                    .from("saved_articles")

                    .select(`
                        *,
                        encyclopedia_articles(*)
                    `)

                    .eq(
                        "user_id",
                        userId
                    );


            if (savedError) {

                console.warn(
                    "ContextEngine saved article error:",
                    savedError
                );

            }


            // -----------------------------------------
            // READING HISTORY
            // -----------------------------------------

            const {
                data: readingHistory,
                error: historyError
            } =
                await supabaseClient

                    .from("reading_history")

                    .select(`
                        *,
                        encyclopedia_articles(*)
                    `)

                    .eq(
                        "user_id",
                        userId
                    )

                    .order(
                        "read_at",
                        {
                            ascending: false
                        }
                    )

                    .limit(10);


            if (historyError) {

                console.warn(
                    "ContextEngine history error:",
                    historyError
                );

            }


            // -----------------------------------------
            // RETURN COMPLETE AI CONTEXT
            // -----------------------------------------

            return {

                userId,

                user:
                    profile || null,

                profile:
                    profile || null,

                skinProfile,

                quizResults:
                    quizResults || [],

                savedArticles:
                    savedArticles || [],

                readingHistory:
                    readingHistory || [],

                conversationHistory:
                    [],

                encyclopediaArticles:
                    [],

                recentlyViewed:
                    [],

                recommendedProducts:
                    []

            };


        } catch (error) {

            console.error(
                "ContextEngine Error:",
                error
            );


            return {

                userId,

                user: null,

                profile: null,

                skinProfile: null,

                quizResults: [],

                savedArticles: [],

                readingHistory: [],

                conversationHistory: [],

                encyclopediaArticles: [],

                recentlyViewed: [],

                recommendedProducts: []

            };

        }

    }

};


console.log(
    "✅ EMerriment Context Engine initialized."
);