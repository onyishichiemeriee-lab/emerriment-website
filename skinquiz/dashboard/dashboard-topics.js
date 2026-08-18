// ============================================
// EMerriment Dashboard Topics
// ============================================


// --------------------------------------------
// Load Popular Topics
// --------------------------------------------

async function loadPopularTopics(){

    try{

        const { data, error } = await supabaseClient

            .from("encyclopedia_articles")

            .select(`
                id,
                title,
                category,
                related_conditions,
                views
            `);

        if(error) throw error;

        calculatePopularTopics(data || []);

    }

    catch(error){

        console.error(error);

        showNotification(

            "Unable to load popular topics.",

            "error"

        );

    }

}


// --------------------------------------------
// Calculate Topic Popularity
// --------------------------------------------

function calculatePopularTopics(articles){

    const scores = {};

    articles.forEach(article=>{

        const views = article.views || 0;

        if(article.category){

            scores[article.category] =

                (scores[article.category] || 0)

                + views;

        }

        if(Array.isArray(article.related_conditions)){

            article.related_conditions.forEach(condition=>{

                scores[condition] =

                    (scores[condition] || 0)

                    + views;

            });

        }

    });

    const topics = Object.entries(scores)

        .sort((a,b)=>b[1]-a[1])

        .slice(0,10);

    renderPopularTopics(topics);

}



// --------------------------------------------
// Render Popular Topics
// --------------------------------------------

function renderPopularTopics(topics){

    const container =

        document.getElementById(

            "popularTopicsContainer"

        );

    if(!container) return;

    container.innerHTML = "";

    if(!topics.length){

        container.innerHTML = `

            <div class="empty-state">

                <h3>No popular topics yet</h3>

                <p>

                    Topics will appear as your
                    encyclopedia grows.

                </p>

            </div>

        `;

        return;

    }

    topics.forEach(([topic,views])=>{

        const card =

            document.createElement("div");

        card.className =

            "topic-card";

        card.innerHTML = `

            <div class="topic-header">

                <h3>${topic}</h3>

            </div>

            <div class="topic-body">

                <p>${views} total views</p>

            </div>

        `;

        card.addEventListener(

            "click",

            ()=>{

                window.location.href =

                "encyclopedia.html?search=" +

                encodeURIComponent(topic);

            }

        );

        container.appendChild(card);

    });

}



// --------------------------------------------
// Topic Search
// --------------------------------------------

function initializeTopicSearch(){

    const search =

        document.getElementById(

            "topicSearch"

        );

    if(!search) return;

    search.addEventListener(

        "input",

        function(){

            const keyword =

                this.value

                .toLowerCase();

            const cards =

                document.querySelectorAll(

                    ".topic-card"

                );

            cards.forEach(card=>{

                const visible =

                    card.innerText

                    .toLowerCase()

                    .includes(keyword);

                card.style.display =

                    visible

                    ? ""

                    : "none";

            });

        }

    );

}



// --------------------------------------------
// Featured Topic
// --------------------------------------------

async function loadFeaturedTopic(){

    try{

        const { data, error } =

            await supabaseClient

            .from("encyclopedia_articles")

            .select("*")

            .order("views",{

                ascending:false

            })

            .limit(1)

            .maybeSingle();

        if(error || !data) return;

        renderFeaturedTopic(data);

    }

    catch(error){

        console.error(error);

    }

}



// --------------------------------------------
// Featured Topic Card
// --------------------------------------------

function renderFeaturedTopic(article){

    const container =

        document.getElementById(

            "featuredTopic"

        );

    if(!container) return;

    container.innerHTML = `

        <div class="featured-topic-card">

            <img

                src="${article.featured_image || "https://placehold.co/800x400?text=EMerriment"}"

                alt="${article.title}"

            >

            <div class="featured-content">

                <span>

                    Featured Topic

                </span>

                <h2>

                    ${article.title}

                </h2>

                <p>

                    ${article.summary || ""}

                </p>

                <a

                    href="article.html?slug=${article.slug}"

                    class="read-btn">

                    Read Article →

                </a>

            </div>

        </div>

    `;

}



// --------------------------------------------
// Initialize Discovery
// --------------------------------------------

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        initializeTopicSearch();

        loadFeaturedTopic();

    }

);