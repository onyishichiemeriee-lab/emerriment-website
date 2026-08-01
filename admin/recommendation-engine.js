class RecommendationEngine {

 calculateArticleScore(article, profile, readingHistory = [], savedArticles = []) {

    let score = 0;

    if (!profile) return score;

    // ==========================================
    // 1. Skin Concern Match
    // ==========================================

    if (
        article.related_conditions &&
        article.related_conditions.includes(profile.concern)
    ) {

        score += 50;

    }

    // ==========================================
    // 2. Skin Type Match
    // ==========================================

    if (
        article.seo_keywords &&
        article.seo_keywords.includes(profile.skin_type)
    ) {

        score += 30;

    }

    // ==========================================
    // 3. Featured Article
    // ==========================================

    if (article.is_featured) {

        score += 15;

    }

    // ==========================================
    // 4. Popularity
    // ==========================================

    score += Math.min(article.views || 0, 100) / 10;

    // ==========================================
    // 5. Difficulty
    // ==========================================

    if (article.difficulty === "Beginner") {

        score += 5;

    }

    // ==========================================
    // 6. Learning Progress
    // ==========================================

    const progress = readingHistory.find(

        item => item.article_id === article.id

    );

    if (!progress) {

        score += 25;

    }

    else if (progress.progress < 30) {

        score += 20;

    }

    else if (progress.progress < 70) {

        score += 35;

    }

    else if (progress.progress < 100) {

        score += 40;

    }

    else {

        score -= 20;

    }

    // ==========================================
    // 7. Recent Interests
    // ==========================================

    score += this.calculateRecentInterestScore(

        article,

        readingHistory

    );

    // ==========================================
    // 8. Saved Articles
    // ==========================================

    savedArticles.forEach(saved => {

        if (

            saved.category === article.category

        ) {

            score += 15;

        }

        const savedConditions =
            saved.related_conditions || [];

        const articleConditions =
            article.related_conditions || [];

        articleConditions.forEach(condition => {

            if (savedConditions.includes(condition)) {

                score += 20;

            }

        });

        const savedKeywords =
            saved.seo_keywords || [];

        const articleKeywords =
            article.seo_keywords || [];

        articleKeywords.forEach(keyword => {

            if (savedKeywords.includes(keyword)) {

                score += 5;

            }

        });

    });

    return score;

}

calculateRecentInterestScore(article, readingHistory = []) {

    let score = 0;

    readingHistory.forEach(history => {

        const readArticle = history.encyclopedia_articles;

        if (!readArticle) return;

        // -------------------------
        // Category Match
        // -------------------------

        if (
            readArticle.category &&
            readArticle.category === article.category
        ) {

            score += 10;

        }

        // -------------------------
        // Related Conditions
        // -------------------------

        const readConditions =
            readArticle.related_conditions || [];

        const articleConditions =
            article.related_conditions || [];

        articleConditions.forEach(condition => {

            if (readConditions.includes(condition)) {

                score += 20;

            }

        });

        // -------------------------
        // SEO Keywords
        // -------------------------

        const readKeywords =
            readArticle.seo_keywords || [];

        const articleKeywords =
            article.seo_keywords || [];

        articleKeywords.forEach(keyword => {

            if (readKeywords.includes(keyword)) {

                score += 5;

            }

        });

    });

    return score;

}

}