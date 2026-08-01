/* =========================================
   EMerriment AI Knowledge Engine
========================================= */

const KnowledgeEngine = {

    /* =====================================
       SEARCH ARTICLES
    ===================================== */

    async search(query) {

        if (!query) return [];

        const keywords = query
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2);

        let request = supabase
            .from("encyclopedia_articles")
            .select("*");

        keywords.forEach(keyword => {

            request = request.or(

                `title.ilike.%${keyword}%,summary.ilike.%${keyword}%,content.ilike.%${keyword}%,category.ilike.%${keyword}%`

            );

        });

        const { data, error } = await request.limit(5);

        if (error) {

            console.error(
                "Knowledge Search Error:",
                error
            );

            return [];

        }

        return data || [];

    },



    /* =====================================
       GET ARTICLE BY SLUG
    ===================================== */

    async getArticle(slug) {

        const { data, error } = await supabase

            .from("encyclopedia_articles")

            .select("*")

            .eq("slug", slug)

            .single();

        if (error) return null;

        return data;

    },



    /* =====================================
       RELATED ARTICLES
    ===================================== */

    async getRelated(category, excludeId) {

        const { data } = await supabase

            .from("encyclopedia_articles")

            .select("*")

            .eq("category", category)

            .neq("id", excludeId)

            .limit(4);

        return data || [];

    },



    /* =====================================
       BUILD KNOWLEDGE CONTEXT
    ===================================== */

    async buildKnowledge(query) {

        const articles =
            await this.search(query);

        return articles.map(article => ({

            title: article.title,

            summary: article.summary,

            content: article.content,

            category: article.category,

            slug: article.slug

        }));

    }

};