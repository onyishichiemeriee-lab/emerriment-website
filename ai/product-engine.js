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
            .select("*");

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
                error
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

        return recommendations.map(product => ({

            id: product.id,

            name: product.name,

            description:
                product.description,

            benefits:
                product.benefits,

            link:
                product.link,

            image:
                product.image

        }));

    }

};