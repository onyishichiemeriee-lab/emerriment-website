// ============================================
// EMerriment Smart Recommendations
// ============================================


// --------------------------------------------
// Load Skin Profile
// --------------------------------------------

async function loadSkinProfile(userId){

    try{

        const { data, error } = await supabaseClient

            .from("quiz_results")

            .select("*")

            .eq("user_id", userId)

            .order("created_at", {

                ascending:false

            })

            .limit(1)

            .maybeSingle();

        if(error) throw error;

        return data;

    }

    catch(error){

        console.error(error);

        return null;

    }

}



// --------------------------------------------
// Reading History
// --------------------------------------------

async function loadReadingHistory(userId){

    try{

        const { data } = await supabaseClient

            .from("reading_history")

            .select(`
                *,
                encyclopedia_articles(
                    id,
                    title,
                    category,
                    seo_keywords,
                    related_conditions
                )
            `)

            .eq("user_id", userId)

            .order("read_at",{

                ascending:false

            })

            .limit(20);

        return data || [];

    }

    catch(error){

        console.error(error);

        return [];

    }

}



// --------------------------------------------
// Saved Articles
// --------------------------------------------

async function loadSavedArticleData(userId){

    try{

        const { data } = await supabaseClient

            .from("saved_articles")

            .select(`
                encyclopedia_articles(*)
            `)

            .eq("user_id",userId);

        return (data || [])

            .map(item=>item.encyclopedia_articles)

            .filter(Boolean);

    }

    catch(error){

        console.error(error);

        return [];

    }

}



// --------------------------------------------
// AI Article Recommendations
// --------------------------------------------

async function loadRecommendedArticles(user, profile){

    try{

        if(!profile) return;

        const readingHistory =

            await loadReadingHistory(user.id);

        const savedArticles =

            await loadSavedArticleData(user.id);

        const { data: articles } =

            await supabaseClient

            .from("encyclopedia_articles")

            .select("*");

        const ranked = articles

        .map(article=>{

            return{

                article,

                score:

                calculateArticleScore(

                    article,

                    profile,

                    readingHistory,

                    savedArticles

                )

            };

        })

        .sort(

            (a,b)=>b.score-a.score

        )

        .slice(0,6)

        .map(item=>item.article);

        renderArticleCards(

            "recommendedArticles",

            ranked

        );

    }

    catch(error){

        console.error(error);

    }

}



// --------------------------------------------
// Recommendation Algorithm
// --------------------------------------------

function calculateArticleScore(

    article,

    profile,

    history,

    saved

){

    let score = 0;



    if(

        article.related_conditions?.includes(

            profile.concern

        )

    ){

        score += 50;

    }



    if(

        article.category ===

        profile.skin_type

    ){

        score += 25;

    }



    const viewed =

        history.find(

            item=>

            item.encyclopedia_articles?.id===

            article.id

        );



    if(viewed){

        score -= 20;

    }



    const alreadySaved =

        saved.find(

            item=>item.id===article.id

        );



    if(alreadySaved){

        score -= 30;

    }



    score +=

        article.views || 0;



    return score;

}