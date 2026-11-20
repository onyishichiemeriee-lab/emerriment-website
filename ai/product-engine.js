/* =========================================
   EMerriment Product Recommendation Engine
========================================= */

const ProductEngine = {

    /* =====================================
       SEARCH PRODUCTS
    ===================================== */

    async search(filters = {}) {

        let query = supabase
            .from("products")
.select("*")
.eq("is_approved", true);

        if (filters.skinType) {
            query = query.contains(
                "skin_types",
                [filters.skinType]
            );
        }

        if (filters.concern) {
            query = query.contains(
                "concerns",
                [filters.concern]
            );
        }

        const { data, error } =
            await query.limit(6);

        if (error) {

            console.error(
                "Product Search:",
                emrSafeError(error)
            );

            return [];

        }

        return data || [];

    },



    /* =====================================
       ARTICLE PRODUCTS
    ===================================== */

    async getProductsForArticle(articleId) {

        const { data, error } =
    await supabase
        .from("products")
        .select("*")
        .eq("is_approved", true)
        .contains(
            "related_articles",
            [articleId]
        );

        if (error) return [];

        return data || [];

    },



    /* =====================================
       PERSONALIZED PRODUCTS
    ===================================== */

    async recommend(context) {

        const profile =
            context.personalization || {};

        return await this.search({

            skinType:
                profile.skinType,

            concern:
                profile.concern

        });

    },

    /* =====================================
   BUILD AI PRODUCT CONTEXT
===================================== */

async buildContext(context) {

    const recommendations =
        await this.recommend(context);

    // Safety gate: only approved products
    // may enter the AI recommendation context.
    return recommendations
        .filter(product => product.is_approved === true)
        .map(product => ({

            id: product.id,

            name: product.name,

            description: product.description,

            category: product.category,

            price: product.price,

            benefits: product.benefits || [],

            ingredients: product.ingredients || [],

            skin_types: product.skin_types || [],

            concerns: product.concerns || [],

            link: product.selar_link || null,

            image: product.image || null

        }));

}

};

/* -----------------------------------------
   Log privacy: an error reduced to its category.
   Supabase/PostgREST and Auth errors can carry row values,
   user ids or memory text in message/details/hint, so only
   name, code and HTTP status are logged — never the payload.
----------------------------------------- */

function emrSafeError(error) {
    if (!error) return { kind: "unknown" };
    return {
        kind: String(error.name || "Error").slice(0, 60),
        code: error.code !== undefined && error.code !== null ? String(error.code).slice(0, 40) : undefined,
        status: Number.isInteger(error.status) ? error.status : undefined
    };
}
