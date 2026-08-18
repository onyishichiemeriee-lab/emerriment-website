// ============================================
// EMerriment Dashboard Reading
// ============================================

// --------------------------------------------
// Continue Reading
// --------------------------------------------

async function loadContinueReading(userId) {

    try {

        const { data, error } = await supabaseClient

            .from("reading_history")

            .select(`
                progress,
                last_position,
                read_at,
                encyclopedia_articles(*)
            `)

            .eq("user_id", userId)

            .lt("progress", 100)

            .order("read_at", { ascending: false })

            .limit(6);

        if (error) throw error;

        renderContinueReading(data || []);

    }

    catch (error) {

        console.error(error);

    }

}


// --------------------------------------------
// Render Continue Reading
// --------------------------------------------

function renderContinueReading(items) {

    const container =
        document.getElementById(
            "continueReadingContainer"
        );

    if (!container) return;

    container.innerHTML = "";

    if (!items.length) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>No articles in progress</h3>

                <p>Start reading to continue here.</p>

            </div>

        `;

        return;

    }

    items.forEach(item => {

        const article =
            item.encyclopedia_articles;

        if (!article) return;

        const card =
            document.createElement("div");

        card.className =
            "article-card";

        card.innerHTML = `

            <img src="${article.featured_image || 'https://placehold.co/600x400?text=EMerriment'}">

            <div class="article-content">

                <span>${article.category || "General"}</span>

                <h3>${article.title}</h3>

                <div class="progress-bar">

                    <div class="progress-fill"

                        style="width:${item.progress}%">

                    </div>

                </div>

                <p>${item.progress}% completed</p>

                <a href="article.html?slug=${article.slug}"

                   class="read-btn">

                    Continue Reading →

                </a>

            </div>

        `;

        container.appendChild(card);

    });

}



// --------------------------------------------
// Latest Articles
// --------------------------------------------

async function loadLatestArticles() {

    try {

        const { data, error } =
            await supabaseClient

            .from("encyclopedia_articles")

            .select("*")

            .order("created_at",

                {

                    ascending:false

                })

            .limit(6);

        if(error) throw error;

        renderArticleCards(

            "latestArticles",

            data || []

        );

    }

    catch(error){

        console.error(error);

    }


}

async function loadSavedArticles(userId) {

    try {

        const { data, error } = await supabaseClient

            .from("saved_articles")

            .select(`
                encyclopedia_articles(*)
            `)

            .eq("user_id", userId);

        if (error) throw error;

        const articles = (data || [])

            .map(item => item.encyclopedia_articles)

            .filter(Boolean);

        renderArticleCards(
            "savedArticlesContainer",
            articles
        );

    }

    catch(error) {

        console.error(error);

    }

}