/* =========================================
   EMerriment AI Knowledge Engine
========================================= */

const KnowledgeEngine = {

    /* =====================================
   NORMALIZE QUERY
===================================== */

normalizeQuery(query) {

    if (!query) return "";

    return query
        .toLowerCase()
        .trim()
        .replace(/[?!.,;:]+/g, " ")
        .replace(/\s+/g, " ");

},

    /* =====================================
       SEARCH ARTICLES
    ===================================== */

    async search(query) {

    if (!query) return [];

    const normalizedQuery =
        this.normalizeQuery(query);

    const stopWords = new Set([
    "what",
    "what's",
    "is",
    "are",
    "the",
    "a",
    "an",
    "does",
    "do",
    "how",
    "can",
    "could",
    "would",
    "should",
    "why",
    "when",
    "where",
    "who",
    "tell",
    "me",
    "about",
    "for",
    "with",
    "from",
    "into",
    "this",
    "that"
]);

const keywords = normalizedQuery
    .split(/\s+/)
    .filter(word =>
        word.length > 2 &&
        !stopWords.has(word)
    );

        let request = window.supabaseClient
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

        const scoredArticles = (data || []).map(article => ({
    article,
    score: this.scoreArticle(article, keywords)
}));

scoredArticles.sort((a, b) => b.score - a.score);

return scoredArticles.map(item => item.article);

    },

/* =====================================
   SCORE ARTICLE RELEVANCE
===================================== */

scoreArticle(article, keywords) {

    if (!article || !keywords.length) {
        return 0;
    }

    const title =
        (article.title || "").toLowerCase();

    const summary =
        (article.summary || "").toLowerCase();

    const content =
        (article.content || "").toLowerCase();

    const category =
        (article.category || "").toLowerCase();

    let score = 0;

    keywords.forEach(keyword => {

        if (title.includes(keyword)) {
            score += 10;
        }

        if (summary.includes(keyword)) {
            score += 5;
        }

        if (category.includes(keyword)) {
            score += 3;
        }

        if (content.includes(keyword)) {
            score += 1;
        }

    });

    return score;

},

/* =====================================
   SCORE SENTENCES
===================================== */

scoreSentence(sentence, keywords, questionType = "overview") {

    if (!sentence || !keywords.length) {
        return 0;
    }

    const text =
        sentence.toLowerCase();

    let score = 0;

    /* ---------------------------------
       Keyword relevance
    --------------------------------- */

    keywords.forEach(keyword => {

        const index =
            text.indexOf(keyword);

        if (index !== -1) {

            score += 5;

            /*
             * Give a small bonus when the
             * keyword appears near the
             * beginning of the sentence.
             */

            if (index < 60) {
                score += 2;
            }

        }

    });

    /* ---------------------------------
       Generic question-type signals
    --------------------------------- */

    const questionSignals = {

        causes: [
            "cause",
            "caused",
            "trigger",
            "triggers",
            "factor",
            "factors",
            "because",
            "result",
            "lead to",
            "associated with"
        ],

        benefits: [
            "benefit",
            "benefits",
            "helps",
            "supports",
            "improve",
            "improves",
            "good for"
        ],

        function: [
            "helps",
            "supports",
            "works",
            "functions",
            "used to",
            "designed to",
            "improve"
        ],

        safety: [
            "safe",
            "risk",
            "side effect",
            "irritation",
            "reaction",
            "precaution",
            "contagious",
            "spread",
            "infection"
        ],

        usage: [
            "use",
            "uses",
            "using",
            "used",
            "apply",
            "applied"
        ],

        definition: [
            "is",
            "are",
            "means",
            "known as",
            "refers to",
            "type of"
        ],

        how: [
            "how",
            "steps",
            "recommended",
            "commonly"
        ]

    };

    const signals =
        questionSignals[questionType] || [];

    signals.forEach(signal => {

        if (text.includes(signal)) {

            score += 2;

        }

    });

    return score;

},

/* =====================================
   SCORE EVIDENCE RELEVANCE
===================================== */

scoreEvidenceRelevance(sentence, query, questionType) {

    if (!sentence || !query) {
        return 0;
    }

    const text =
        sentence.toLowerCase();

    const normalizedQuery =
        this.normalizeQuery(query);

    let score = 0;

    /* ---------------------------------
       Question-type relevance
    --------------------------------- */

    const relevancePatterns = {

        causes: [
            "cause",
            "caused",
            "trigger",
            "triggers",
            "factor",
            "factors",
            "because",
            "result",
            "lead to",
            "associated with"
        ],

        benefits: [
            "benefit",
            "benefits",
            "helps",
            "supports",
            "improve",
            "improves",
            "good for"
        ],

        function: [
            "helps",
            "supports",
            "works",
            "functions",
            "used to",
            "designed to"
        ],

        safety: [
            "safe",
            "risk",
            "side effect",
            "irritation",
            "reaction",
            "precaution",
            "contagious",
            "spread",
            "infection"
        ],

        usage: [
            "use",
            "uses",
            "using",
            "used",
            "apply",
            "applied"
        ],

        definition: [
            "is",
            "are",
            "means",
            "known as",
            "refers to",
            "type of"
        ],

        how: [
            "how",
            "steps",
            "recommended",
            "commonly"
        ]

    };

    const patterns =
        relevancePatterns[questionType] || [];

    patterns.forEach(pattern => {

        if (text.includes(pattern)) {

            score += 3;

        }

    });

    /* ---------------------------------
       Query word overlap
    --------------------------------- */

    const queryWords =
        normalizedQuery
            .split(/\s+/)
            .filter(word => word.length > 2);

    queryWords.forEach(word => {

        if (text.includes(word)) {

            score += 1;

        }

    });

    return score;

},

/* =====================================
   SCORE EVIDENCE QUALITY
===================================== */

scoreEvidenceQuality(sentence, questionType) {

    if (!sentence) {
        return 0;
    }

    const text =
        sentence.toLowerCase();

    let score = 0;

    const qualitySignals = {

        causes: [
            "because",
            "caused by",
            "causes",
            "trigger",
            "triggers",
            "factor",
            "factors",
            "associated with",
            "leads to"
        ],

        benefits: [
            "helps",
            "supports",
            "improves",
            "benefit",
            "benefits"
        ],

        function: [
            "helps",
            "supports",
            "works",
            "functions",
            "designed to"
        ],

        safety: [
            "safe",
            "risk",
            "side effect",
            "irritation",
            "reaction",
            "precaution"
        ],

        usage: [
            "used",
            "use",
            "using",
            "apply",
            "applied"
        ],

        definition: [
            "is",
            "are",
            "means",
            "known as",
            "refers to",
            "type of"
        ],

        how: [
            "recommended",
            "steps",
            "method",
            "how to"
        ]

    };

    const signals =
        qualitySignals[questionType] || [];

    signals.forEach(signal => {

        if (text.includes(signal)) {
            score += 2;
        }

    });

    /*
     * Prefer sentences that contain
     * meaningful descriptive information.
     */

    if (text.length >= 50) {
        score += 1;
    }

    if (text.length >= 100) {
        score += 1;
    }

    return score;

},

/* =====================================
   DETECT QUESTION TYPE
===================================== */

detectQuestionType(query) {

    const text =
        this.normalizeQuery(query);

    if (
        text.startsWith("what causes ") ||
        text.includes("causes of ") ||
        text.includes("cause of ") ||
        text.startsWith("why does ") ||
        text.startsWith("why do ") ||
        text.includes("cause ")
    ) {
        return "causes";
    }

    if (
    text.startsWith("what is ") ||
    text.startsWith("what are ") ||
    text.startsWith("who is ") ||
    (text.startsWith("what does ") &&
     text.includes("mean"))
) {
    return "definition";
}

if (
    text.startsWith("what does ") ||
    text.startsWith("what do ")
) {
    return "function";
}

    if (
        text.includes("benefit") ||
        text.includes("benefits") ||
        text.includes("good for")
    ) {
        return "benefits";
    }

    if (
        text.includes("how to ") ||
        text.startsWith("how do ") ||
        text.startsWith("how can ")
    ) {
        return "how";
    }

    if (
        text.includes("safe") ||
        text.includes("safety") ||
        text.includes("side effect") ||
        text.includes("side effects") ||
        text.includes("risk") ||
        text.includes("risks") ||
        text.includes("contagious") ||
        text.includes("spread")
    ) {
        return "safety";
    }

    if (
    /\buse\b/.test(text) ||
    /\buses\b/.test(text) ||
    /\busing\b/.test(text) ||
    /\bapply\b/.test(text)
) {
    return "usage";
}

    return "overview";

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

    const normalizedQuery =
        this.normalizeQuery(query);

        const questionType =
    this.detectQuestionType(query);

    const stopWords = new Set([
        "what",
        "what's",
        "is",
        "are",
        "the",
        "a",
        "an",
        "does",
        "do",
        "how",
        "can",
        "could",
        "would",
        "should",
        "why",
        "when",
        "where",
        "who",
        "tell",
        "me",
        "about",
        "for",
        "with",
        "from",
        "into",
        "this",
        "that"
    ]);

    const keywords = normalizedQuery
        .split(/\s+/)
        .filter(word =>
            word.length > 2 &&
            !stopWords.has(word)
        );

    const articles =
        await this.search(query);

    const primaryArticle =
        articles.length > 0
            ? articles[0]
            : null;

    let relevantSentences = [];

    if (primaryArticle) {

        const sentences =
            primaryArticle.content
                .split(/\r?\n+/)
                .flatMap(block =>
                    block.split(/(?<=[.!?])\s+/)
                )
                .filter(Boolean);

        relevantSentences =
            sentences
                .map(sentence => ({
                    sentence,
                    
score:
    this.scoreSentence(
        sentence,
        keywords,
        questionType
    ) +
    this.scoreEvidenceRelevance(
        sentence,
        query,
        questionType
    ) +
    this.scoreEvidenceQuality(
        sentence,
        questionType
    )

                }))
                .filter(item =>
                    item.score > 0
                )
                .sort((a, b) =>
                    b.score - a.score
                );

    }

    const topEvidence =
        relevantSentences.slice(0, 3);

    return {

        query: normalizedQuery,

        questionType,

        keywords,

        articles: articles.map(article => ({

            title: article.title,
            summary: article.summary,
            content: article.content,
            category: article.category,
            slug: article.slug

        })),

        primaryArticle: primaryArticle
            ? {
                title: primaryArticle.title,
                summary: primaryArticle.summary,
                content: primaryArticle.content,
                category: primaryArticle.category,
                slug: primaryArticle.slug
            }
            : null,

        relevantSentences,

        topEvidence,

        confidence:
            primaryArticle
                ? "high"
                : "low"

    };

    },

    /* =====================================
   BUILD ANSWER
===================================== */

buildAnswer(knowledge) {

    if (!knowledge || !knowledge.primaryArticle) {

        return {
            topic: null,
            questionType: knowledge?.questionType || "overview",
            summary: null,
            evidence: [],
            confidence: "low"
        };

    }

    const article =
        knowledge.primaryArticle;

    const evidence =
        knowledge.topEvidence || [];

    const summary =
        article.summary || "";

    return {

        topic: article.title,

        questionType:
            knowledge.questionType,

        summary:
    this.buildAnswerSummary(knowledge),

        evidence,

        confidence:
            knowledge.confidence

    };

},

/* =====================================
   BUILD ANSWER SUMMARY
===================================== */

buildAnswerSummary(knowledge) {

    if (!knowledge || !knowledge.primaryArticle) {
        return "";
    }

    const evidence =
        knowledge.topEvidence || [];

    if (!evidence.length) {
        return knowledge.primaryArticle.summary || "";
    }

    const questionType =
        knowledge.questionType || "overview";

    const prioritySignals = {

        causes: [
            "cause",
            "caused",
            "trigger",
            "triggers",
            "factor",
            "factors",
            "because",
            "associated with"
        ],

        benefits: [
            "benefit",
            "benefits",
            "helps",
            "supports",
            "improve",
            "good for"
        ],

        function: [
            "helps",
            "supports",
            "works",
            "functions",
            "designed to"
        ],

        safety: [
            "safe",
            "risk",
            "side effect",
            "irritation",
            "reaction",
            "precaution",
            "contagious",
            "spread",
            "infection"
        ],

        usage: [
            "use",
            "uses",
            "using",
            "used",
            "apply",
            "applied"
        ],

        definition: [
            "is",
            "are",
            "means",
            "known as",
            "refers to",
            "type of"
        ],

        how: [
            "recommended",
            "steps",
            "method",
            "how to"
        ]

    };

    const signals =
        prioritySignals[questionType] || [];

    const rankedEvidence =
        [...evidence].sort((a, b) => {

            const textA =
                a.sentence.toLowerCase();

            const textB =
                b.sentence.toLowerCase();

            const scoreA =
                signals.filter(signal =>
                    textA.includes(signal)
                ).length;

            const scoreB =
                signals.filter(signal =>
                    textB.includes(signal)
                ).length;

            return scoreB - scoreA;

        });

    return rankedEvidence
        .slice(0, 2)
        .map(item => item.sentence)
        .join(" ");

},

/* =====================================
   PERSONALIZE KNOWLEDGE
===================================== */

personalizeKnowledge(knowledge, context) {

    if (!knowledge) {
        return {
            knowledge: null,
            personalization: null
        };
    }

    if (!context) {
        return {
            knowledge,
            personalization: null
        };
    }

    const personalization = {

    userId:
        context.userId || null,

    profile:
        context.profile || null,

    skinProfile:
        context.skinProfile || null,

    memory:
        context.memory || null,

    savedArticles:
        context.savedArticles || [],

    readingHistory:
        context.readingHistory || [],

    recentlyViewed:
        context.recentlyViewed || [],

    recommendedProducts:
        context.recommendedProducts || []

};

return {

    knowledge,

    personalization,

    personalizedContext: {

        hasUserProfile:
            !!context.profile,

        hasSkinProfile:
            !!context.skinProfile,

        hasMemory:
            !!context.memory,

        hasReadingHistory:
            Array.isArray(context.readingHistory) &&
            context.readingHistory.length > 0,

        hasSavedArticles:
            Array.isArray(context.savedArticles) &&
            context.savedArticles.length > 0

    }

};

},

/* =====================================
   BUILD PERSONALIZATION SUMMARY
===================================== */

buildPersonalizationSummary(personalized) {

    if (!personalized) {
        return null;
    }

    const context =
        personalized.personalization || {};

    const skinProfile =
        context.skinProfile || null;

    const memory =
        context.memory || null;

    const summary = {

        hasProfile:
            !!context.profile,

        hasSkinProfile:
            !!skinProfile,

        hasMemory:
            !!memory,

        skinType:
            skinProfile?.skinType || null,

        concern:
            skinProfile?.concern || null,

        oilLevel:
            skinProfile?.oilLevel || null,

        sensitivity:
            skinProfile?.sensitivity || null,

        preferences:
            memory || null

    };

    return summary;

},

/* =====================================
   BUILD PERSONALIZATION NOTE
===================================== */

buildPersonalizationNote(personalized) {

    if (!personalized) {
        return "";
    }

    const context =
        personalized.personalization || {};

    const skinProfile =
        context.skinProfile || null;

    const memory =
        context.memory || null;

    const notes = [];

    if (skinProfile) {

        if (skinProfile.skinType) {

            notes.push(
                `The user's skin type is ${skinProfile.skinType}.`
            );

        }

        if (skinProfile.concern) {

            notes.push(
                `The user's current skin concern is ${skinProfile.concern}.`
            );

        }

        if (skinProfile.sensitivity) {

            notes.push(
                `The user's recorded sensitivity level is ${skinProfile.sensitivity}.`
            );

        }

    }

    if (memory) {

        Object.entries(memory).forEach(
            ([key, value]) => {

                if (value) {

                    notes.push(
                        `User preference: ${value}`
                    );

                }

            }
        );

    }

    return notes.join(" ");

},

/* =====================================
   BUILD PERSONALIZED KNOWLEDGE RESPONSE
===================================== */

buildPersonalizedResponse(personalized) {

    if (!personalized) {
        return null;
    }

    const knowledge =
        personalized.knowledge || null;

    if (!knowledge) {
        return null;
    }

    const personalization =
        this.buildPersonalizationSummary(
            personalized
        );

    const personalizationNote =
        this.buildPersonalizationNote(
            personalized
        );

    const answer =
        this.buildAnswer(knowledge);

    return {

        topic:
            answer.topic || null,

        questionType:
            answer.questionType || "overview",

        summary:
            answer.summary || null,

        evidence:
            answer.evidence || [],

        confidence:
            answer.confidence || "low",

        personalization,

        personalizationNote

    };

},

/* =====================================
   SELECT RELEVANT USER CONTEXT
===================================== */

selectRelevantContext(personalized) {

    if (!personalized) {
        return null;
    }

    const context =
        personalized.personalization || {};

    const knowledge =
        personalized.knowledge || {};

    const query =
        knowledge.query || "";

    const text =
        query.toLowerCase();

    const relevant = {};

    /*
       Skin profile
    */

    if (
        context.skinProfile &&
        (
            text.includes("skin") ||
            text.includes("routine") ||
            text.includes("ingredient") ||
            text.includes("product") ||
            text.includes("care") ||
            text.includes("eczema") ||
            text.includes("acne")
        )
    ) {

        relevant.skinProfile =
            context.skinProfile;

    }

    /*
       User preferences
    */

    if (
    context.memory &&
    (
        text.includes("product") ||
        text.includes("moisturizer") ||
        text.includes("routine") ||
        text.includes("ingredient") ||
        text.includes("skin") ||
        text.includes("care") ||
        text.includes("recommend")
    )
) {

        relevant.memory =
            context.memory;

    }

    /*
       Saved articles
    */

    if (
        Array.isArray(context.savedArticles) &&
        context.savedArticles.length > 0
    ) {

        relevant.savedArticles =
            context.savedArticles;

    }

    /*
       Reading history
    */

    if (
        Array.isArray(context.readingHistory) &&
        context.readingHistory.length > 0
    ) {

        relevant.readingHistory =
            context.readingHistory;

    }

    return relevant;

},

/* =====================================
   SCORE RELEVANT USER CONTEXT
===================================== */

scoreRelevantContext(personalized) {

    if (!personalized) {
        return null;
    }

    const relevant =
        this.selectRelevantContext(personalized);

    if (!relevant) {
        return null;
    }

    const scored = {};

    Object.entries(relevant).forEach(
        ([key, value]) => {

            let score = 0;

            if (value) {
                score += 1;
            }

            if (
                Array.isArray(value) &&
                value.length > 0
            ) {
                score += value.length;
            }

            if (
                typeof value === "object" &&
                !Array.isArray(value)
            ) {
                score += Object.keys(value).length;
            }

            scored[key] = {
                value,
                score
            };
        }
    );

    return scored;
},

/* =====================================
   RANK RELEVANT USER CONTEXT
===================================== */

rankRelevantContext(personalized) {

    const scored =
        this.scoreRelevantContext(personalized);

    if (!scored) {
        return [];
    }

    return Object.entries(scored)
        .map(([key, data]) => ({
            type: key,
            value: data.value,
            score: data.score
        }))
        .sort((a, b) => b.score - a.score);
},

/* =====================================
   BUILD CONTEXT SIGNAL
===================================== */

buildContextSignal(personalized) {

    const ranked =
        this.rankRelevantContext(personalized);

    if (!ranked.length) {
        return {
            primaryContext: null,
            supportingContext: [],
            contextConfidence: "low"
        };
    }

    const primaryContext =
        ranked[0];

    const supportingContext =
        ranked.slice(1);

    let contextConfidence = "low";

    if (primaryContext.score >= 5) {
        contextConfidence = "high";
    }
    else if (primaryContext.score >= 2) {
        contextConfidence = "medium";
    }

    return {
        primaryContext,
        supportingContext,
        contextConfidence
    };
},

/* =====================================
   INTEGRATE KNOWLEDGE + USER CONTEXT
===================================== */

integrateKnowledgeContext(personalized) {

    if (!personalized) {
        return null;
    }

    const knowledge =
        personalized.knowledge || null;

    if (!knowledge) {
        return null;
    }

    const contextSignal =
        this.buildContextSignal(personalized);

    const personalization =
        this.buildPersonalizationSummary(
            personalized
        );

    return {
        knowledge,
        contextSignal,
        personalization
    };
},

/* =====================================
   PREPARE RESPONSE CONTEXT
===================================== */

prepareResponseContext(integrated) {

    if (!integrated) {
        return null;
    }

    const knowledge =
        integrated.knowledge || null;

    const contextSignal =
        integrated.contextSignal || null;

    const personalization =
        integrated.personalization || null;

    if (!knowledge) {
        return null;
    }

    return {
        topic:
            knowledge.primaryArticle?.title || null,

        questionType:
            knowledge.questionType || "overview",

        query:
            knowledge.query || "",

        summary:
            this.buildAnswerSummary(knowledge),

        evidence:
            knowledge.topEvidence || [],

        confidence:
            knowledge.confidence || "low",

        contextSignal,

        personalization
    };
},

 /* =====================================
    BUILD RESPONSE
 ===================================== */

 buildResponse(responseContext) {

     if (!responseContext) {
         return null;
     }

     return {
         topic:
             responseContext.topic || null,

         questionType:
             responseContext.questionType || "overview",

         answer:
             responseContext.summary || null,

         evidence:
             responseContext.evidence || [],

         confidence:
             responseContext.confidence || "low",

         personalization:
             responseContext.personalization || null,

         contextSignal:
             responseContext.contextSignal || null
     };
 },
 
  /* =====================================
    BUILD RECOMMENDATION CONTEXT
 ===================================== */

 buildRecommendationContext(responseContext, personalized = null) {

    if (!responseContext) {
        return null;
    }

    const personalization =
        responseContext.personalization || {};

    const rawContext =
        personalized?.personalization || {};

    return {

        topic:
            responseContext.topic || null,

        questionType:
            responseContext.questionType || "overview",

        skinProfile: {

            skinType:
                personalization.skinType || null,

            concern:
                personalization.concern || null,

            oilLevel:
                personalization.oilLevel || null,

            sensitivity:
                personalization.sensitivity || null

        },

        memory:
            personalization.preferences || null,

        recommendedProducts:
            rawContext.recommendedProducts || [],

        savedArticles:
            rawContext.savedArticles || [],

        readingHistory:
            rawContext.readingHistory || []

    };
},

buildRecommendationSources(recommendationContext) {

    if (!recommendationContext) {
        return null;
    }

    return {
        products:
            recommendationContext.recommendedProducts || [],

        savedArticles:
            recommendationContext.savedArticles || [],

        readingHistory:
            recommendationContext.readingHistory || []
    };
},

scoreRecommendationSources(recommendationContext, sources) {

    if (!recommendationContext || !sources) {
        return null;
    }

    const topic =
        (recommendationContext.topic || "").toLowerCase();

    const concern =
        (
            recommendationContext.skinProfile?.concern ||
            ""
        ).toLowerCase();

    const scoreItem = (item) => {

        if (!item) {
            return 0;
        }

        const text = [
            item.title,
            item.summary,
            item.content,
            item.category,
            item.slug
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        let score = 0;

        if (topic && text.includes(topic)) {
            score += 5;
        }

        if (concern && text.includes(concern)) {
            score += 3;
        }

        return score;
    };

    return {
        products:
            sources.products.map(item => ({
                item,
                score: scoreItem(item)
            })),

        savedArticles:
            sources.savedArticles.map(item => ({
                item,
                score: scoreItem(item)
            })),

        readingHistory:
            sources.readingHistory.map(item => ({
                item,
                score: scoreItem(item)
            }))
    };
},

rankRecommendationSources(scoredSources) {

    if (!scoredSources) {
        return null;
    }

    const rank = (items) => {

        if (!Array.isArray(items)) {
            return [];
        }

        return [...items].sort(
            (a, b) => b.score - a.score
        );
    };

    return {
        products:
            rank(scoredSources.products),

        savedArticles:
            rank(scoredSources.savedArticles),

        readingHistory:
            rank(scoredSources.readingHistory)
    };
},

selectRecommendations(rankedSources, limit = 3) {

    if (!rankedSources) {
        return null;
    }

    const select = (items) => {

        if (!Array.isArray(items)) {
            return [];
        }

        return items
            .filter(item =>
                item &&
                item.score > 0
            )
            .slice(0, limit);
    };

    return {
        products:
            select(rankedSources.products),

        savedArticles:
            select(rankedSources.savedArticles),

        readingHistory:
            select(rankedSources.readingHistory)
    };
},

buildRecommendationResult(selectedRecommendations) {

    if (!selectedRecommendations) {
        return null;
    }

    return {
        products:
            selectedRecommendations.products || [],

        articles:
            selectedRecommendations.savedArticles || [],

        learning:
            selectedRecommendations.readingHistory || []
    };
},

prepareRecommendationContext(recommendationResult) {

    if (!recommendationResult) {
        return null;
    }

    return {
        products:
            recommendationResult.products || [],

        articles:
            recommendationResult.articles || [],

        learning:
            recommendationResult.learning || [],

        hasRecommendations:
            (
                (recommendationResult.products || []).length > 0 ||
                (recommendationResult.articles || []).length > 0 ||
                (recommendationResult.learning || []).length > 0
            )
    };
},

buildRecommendationPayload(recommendationContext) {

    if (!recommendationContext) {
        return null;
    }

    return {
        recommendations: {
            products:
                recommendationContext.products || [],

            articles:
                recommendationContext.articles || [],

            learning:
                recommendationContext.learning || []
        },

        hasRecommendations:
            recommendationContext.hasRecommendations || false
    };
},

buildRecommendationExplanation(recommendationPayload) {

    if (!recommendationPayload) {
        return "";
    }

    if (!recommendationPayload.hasRecommendations) {
        return "No relevant recommendations were found.";
    }

    const recommendations =
        recommendationPayload.recommendations || {};

    const parts = [];

    if (
        Array.isArray(recommendations.products) &&
        recommendations.products.length > 0
    ) {
        parts.push(
            `${recommendations.products.length} relevant product recommendation(s) found.`
        );
    }

    if (
        Array.isArray(recommendations.articles) &&
        recommendations.articles.length > 0
    ) {
        parts.push(
            `${recommendations.articles.length} relevant article recommendation(s) found.`
        );
    }

    if (
        Array.isArray(recommendations.learning) &&
        recommendations.learning.length > 0
    ) {
        parts.push(
            `${recommendations.learning.length} relevant learning item(s) found.`
        );
    }

    return parts.join(" ");
},

buildFinalRecommendation(recommendationPayload) {

    if (!recommendationPayload) {
        return null;
    }

    const explanation =
        this.buildRecommendationExplanation(
            recommendationPayload
        );

    return {
        recommendations:
            recommendationPayload.recommendations || {
                products: [],
                articles: [],
                learning: []
            },

        hasRecommendations:
            recommendationPayload.hasRecommendations || false,

        explanation
    };
},

};