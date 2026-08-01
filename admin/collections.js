async function createCollection(name, description = "") {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase

        .from("collections")

        .insert({

            user_id: user.id,

            name,

            description

        });

    if (error) {

        console.error(error);

        return;

    }

    loadCollections();

}

async function loadCollections() {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase

        .from("collections")

        .select("*")

        .eq("user_id", user.id)

        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error(error);

        return;

    }

    renderCollections(data || []);

}

async function addArticleToCollection(collectionId, articleId) {

    const { error } = await supabase

        .from("collection_articles")

        .upsert({

            collection_id: collectionId,

            article_id: articleId

        });

    if (error) {

        console.error(error);

    }

}

async function loadCollectionArticles(collectionId) {

    const { data, error } = await supabase

        .from("collection_articles")

        .select(`
            encyclopedia_articles(*)
        `)

        .eq("collection_id", collectionId);

    if (error) {

        console.error(error);

        return;

    }

    const articles = (data || [])

        .map(item => item.encyclopedia_articles)

        .filter(Boolean);

    renderCards("collectionArticles", articles);

}

function renderCollections(collections) {

    const container = document.getElementById("collectionsContainer");

    if (!container) return;

    container.innerHTML = "";

    collections.forEach(collection => {

        const card = document.createElement("div");

        card.className = "collection-card";

        card.innerHTML = `

            <h3>${collection.name}</h3>

            <p>${collection.description || ""}</p>

            <button onclick="loadCollectionArticles('${collection.id}')">

                Open Collection

            </button>

        `;

        container.appendChild(card);

    });

}