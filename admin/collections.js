/* =========================================
   EMerriment
   Collections Controller
========================================= */


/* =========================================
   SUPABASE CLIENT
========================================= */

const supabaseClient = window.supabaseClient;


/* =========================================
   SAFETY CHECK
========================================= */

if (!supabaseClient) {

    console.error(
        "❌ EMerriment: Supabase client is not initialized."
    );

    alert(
        "EMerriment could not connect to the database. Please refresh the page."
    );

}


/* =========================================
   CREATE COLLECTION
========================================= */

async function createCollection(
    name,
    description = ""
) {

    if (!supabaseClient) return;


    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {

            alert(
                "Please log in to create a collection."
            );

            return;

        }


        const {
            error
        } =
            await supabaseClient

                .from("collections")

                .insert({

                    user_id: user.id,

                    name: name,

                    description: description

                });


        if (error) {

            console.error(
                "❌ Create collection error:",
                error
            );

            alert(
                error.message
            );

            return;

        }


        console.log(
            "✅ Collection created."
        );


        await loadCollections();

    }

    catch (error) {

        console.error(
            "❌ Collection creation failed:",
            error
        );

    }

}


/* =========================================
   LOAD COLLECTIONS
========================================= */

async function loadCollections() {

    if (!supabaseClient) return;


    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {

            console.log(
                "No authenticated user."
            );

            renderCollections([]);

            return;

        }


        const {
            data,
            error
        } =
            await supabaseClient

                .from("collections")

                .select("*")

                .eq(
                    "user_id",
                    user.id
                )

                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "❌ Load collections error:",
                error
            );

            return;

        }


        console.log(
            "✅ Collections loaded:",
            data
        );


        renderCollections(
            data || []
        );

    }

    catch (error) {

        console.error(
            "❌ Collection loading failed:",
            error
        );

    }

}


/* =========================================
   ADD ARTICLE TO COLLECTION
========================================= */

async function addArticleToCollection(
    collectionId,
    articleId
) {

    if (!supabaseClient) return;


    const {
        error
    } =
        await supabaseClient

            .from("collection_articles")

            .upsert({

                collection_id:
                    collectionId,

                article_id:
                    articleId

            });


    if (error) {

        console.error(
            "❌ Add article error:",
            error
        );

        return;

    }


    console.log(
        "✅ Article added to collection."
    );

}


/* =========================================
   LOAD COLLECTION ARTICLES
========================================= */

async function loadCollectionArticles(
    collectionId
) {

    if (!supabaseClient) return;


    const {
        data,
        error
    } =
        await supabaseClient

            .from("collection_articles")

            .select(`
                encyclopedia_articles(*)
            `)

            .eq(
                "collection_id",
                collectionId
            );


    if (error) {

        console.error(
            "❌ Load collection articles error:",
            error
        );

        return;

    }


    const articles =
        (data || [])

            .map(
                item =>
                    item.encyclopedia_articles
            )

            .filter(Boolean);


    renderArticleCards(
        "collectionArticles",
        articles
    );

}


/* =========================================
   RENDER COLLECTIONS
========================================= */

function renderCollections(
    collections
) {

    const container =
        document.getElementById(
            "collectionsContainer"
        );


    if (!container) return;


    container.innerHTML = "";


    if (
        !collections ||
        collections.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-collections">

                <p>
                    You haven't created any collections yet.
                </p>

            </div>

        `;

        return;

    }


    collections.forEach(
        collection => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "collection-card";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        collection.name || "Untitled Collection"
                    )}
                </h3>


                <p>
                    ${escapeHTML(
                        collection.description || ""
                    )}
                </p>


                <button
                    type="button"
                    class="open-collection-btn"
                >
                    Open Collection
                </button>

            `;


            const button =
                card.querySelector(
                    ".open-collection-btn"
                );


            button.addEventListener(
                "click",
                () => {

                    loadCollectionArticles(
                        collection.id
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================
   RENDER ARTICLES
========================================= */

function renderArticleCards(
    containerId,
    articles
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) return;


    container.innerHTML = "";


    if (
        !articles ||
        articles.length === 0
    ) {

        container.innerHTML = `
            <p>
                No articles in this collection yet.
            </p>
        `;

        return;

    }


    articles.forEach(
        article => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "collection-article-card";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        article.title || "Untitled Article"
                    )}
                </h3>


                <p>
                    ${escapeHTML(
                        article.excerpt ||
                        article.description ||
                        ""
                    )}
                </p>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
    text
) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   GLOBAL ACCESS
========================================= */

window.createCollection =
    createCollection;

window.loadCollections =
    loadCollections;

window.addArticleToCollection =
    addArticleToCollection;

window.loadCollectionArticles =
    loadCollectionArticles;


/* =========================================
   INITIALIZED
========================================= */

console.log(
    "✅ EMerriment Collections initialized."
);