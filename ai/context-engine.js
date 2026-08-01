/* =========================================
   EMerriment AI Context Engine
========================================= */

const ContextEngine = {

    /* =====================================
       BUILD COMPLETE AI CONTEXT
    ===================================== */

    async build(userMessage) {

        const memory =
            await AIMemory.buildContext();

        const conversation =
            await this.getRecentConversation();

        const skinProfile =
            await this.getSkinProfile();

        const readingHistory =
            await this.getReadingHistory();

        const savedArticles =
            await this.getSavedArticles();

            const knowledge =
    await KnowledgeEngine.buildKnowledge(
        userMessage
    );

    const personalization =
    await PersonalizationEngine.build({

        memory,

        skinProfile,

        readingHistory,

        savedArticles,

        knowledge

    });

    const products =
    await ProductEngine.buildContext({

        personalization

    });

        return {

    currentMessage: userMessage,

    memory,

    conversation,

    skinProfile,

    readingHistory,

    savedArticles,

    knowledge,

    personalization,

    products

};

    },



    /* =====================================
       RECENT CONVERSATION
    ===================================== */

    async getRecentConversation() {

        if (!currentConversationId)
            return [];

        const messages =
            await loadMessages(
                currentConversationId
            );

        return messages.slice(-10);

    },



    /* =====================================
       SKIN PROFILE
    ===================================== */

    async getSkinProfile() {

        try {

            const {
                data: { user }
            } = await supabase.auth.getUser();

            if (!user)
                return null;

            const { data } = await supabase

                .from("leads")

                .select("*")

                .eq("id", user.id)

                .single();

            return data || null;

        }

        catch {

            return null;

        }

    },



    /* =====================================
       READING HISTORY
    ===================================== */

    async getReadingHistory() {

        try {

            const {
                data: { user }
            } = await supabase.auth.getUser();

            if (!user)
                return [];

            const { data } = await supabase

                .from("reading_history")

                .select("*")

                .eq("user_id", user.id)

                .order(
                    "viewed_at",
                    {
                        ascending: false
                    }
                )

                .limit(10);

            return data || [];

        }

        catch {

            return [];

        }

    },



    /* =====================================
       SAVED ARTICLES
    ===================================== */

    async getSavedArticles() {

        try {

            const {
                data: { user }
            } = await supabase.auth.getUser();

            if (!user)
                return [];

            const { data } = await supabase

                .from("saved_articles")

                .select("*")

                .eq("user_id", user.id);

            return data || [];

        }

        catch {

            return [];

        }

    }

};