// ============================================
// Dashboard Reading History
// ============================================


// --------------------------------------------
// Recently Viewed
// --------------------------------------------

async function loadRecentlyViewed(userId){

    try{

        const { data, error } =

            await supabaseClient

            .from("reading_history")

            .select(`
                read_at,
                progress,
                encyclopedia_articles(*)
            `)

            .eq("user_id", userId)

            .order("read_at",

                {

                    ascending:false

                })

            .limit(8);

        if(error) throw error;

        renderRecentlyViewed(

            data || []

        );

    }

    catch(error){

        console.error(error);

    }

}



// --------------------------------------------
// Render Recently Viewed
// --------------------------------------------

function renderRecentlyViewed(items){

    const container =

        document.getElementById(

            "recentlyViewedContainer"

        );

    if(!container) return;

    container.innerHTML="";

    if(!items.length){

        container.innerHTML=`

            <div class="empty-state">

                <h3>No history yet</h3>

                <p>Your recently viewed articles will appear here.</p>

            </div>

        `;

        return;

    }

    items.forEach(item=>{

        const article =

            item.encyclopedia_articles;

        if(!article) return;

        const viewed =

            new Date(item.read_at)

            .toLocaleDateString();

        const card =

            document.createElement("div");

        card.className=

            "article-card";

        card.innerHTML=`

            <img src="${article.featured_image || 'https://placehold.co/600x400?text=EMerriment'}">

            <div class="article-content">

                <span>${article.category}</span>

                <h3>${article.title}</h3>

                <p>Viewed ${viewed}</p>

                <p>${item.progress || 0}% completed</p>

                <a class="read-btn"

                   href="article.html?slug=${article.slug}">

                    Read Again →

                </a>

            </div>

        `;

        container.appendChild(card);

    });

}



// --------------------------------------------
// Clear Reading History
// --------------------------------------------

async function clearReadingHistory(userId){

    try{

        const { error } =

            await supabaseClient

            .from("reading_history")

            .delete()

            .eq("user_id", userId);

        if(error) throw error;

        showNotification(

            "Reading history cleared."

        );

        loadRecentlyViewed(userId);

    }

    catch(error){

        console.error(error);

        showNotification(

            "Unable to clear history.",

            "error"

        );

    }

}



// --------------------------------------------
// Clear Button
// --------------------------------------------

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        const button =

            document.getElementById(

                "clearHistoryBtn"

            );

        if(!button) return;

        button.addEventListener(

            "click",

            async()=>{

                const {

                    data:{ user }

                } =

                await supabaseClient

                .auth

                .getUser();

                if(user){

                    clearReadingHistory(

                        user.id

                    );

                }

            }

        );

    }

);