// ============================================
// Dashboard Statistics
// ============================================

async function loadDashboardStats(userId) {

    try {

        await Promise.all([

            loadQuizCount(userId),

            loadSavedArticlesCount(userId),

            loadRecommendedProductsCount(userId),

            loadSkinJourney(userId)

        ]);

    }

    catch (error) {

        console.error(error);

    }

}



// --------------------------------------------
// Quiz Count
// --------------------------------------------

async function loadQuizCount(userId) {

    const { count } =

        await supabaseClient

        .from("quiz_results")

        .select("*", {

            count: "exact",

            head: true

        })

        .eq("user_id", userId);

    setText(

        "quizCount",

        count || 0

    );

}



// --------------------------------------------
// Saved Articles
// --------------------------------------------

async function loadSavedArticlesCount(userId) {

    const { count } =

        await supabaseClient

        .from("saved_articles")

        .select("*", {

            count: "exact",

            head: true

        })

        .eq("user_id", userId);

    setText(

        "savedArticles",

        count || 0

    );

}



// --------------------------------------------
// Recommended Products
// --------------------------------------------

async function loadRecommendedProductsCount(userId) {

    const { count } =

        await supabaseClient

        .from("saved_products")

        .select("*", {

            count: "exact",

            head: true

        })

        .eq("user_id", userId);

    setText(

        "recommendedProducts",

        count || 0

    );

}



// --------------------------------------------
// Skin Journey
// --------------------------------------------

async function loadSkinJourney(userId) {

    const { data } =

        await supabaseClient

        .from("quiz_results")

        .select("*")

        .eq("user_id", userId)

        .order("created_at", {

            ascending: false

        })

        .limit(1)

        .maybeSingle();

    if (!data) return;

    setText(

        "skinScore",

        data.score ?? "--"

    );

    setText(

        "skinType",

        data.skin_type

    );

    setText(

        "skinConcern",

        data.concern

    );

}