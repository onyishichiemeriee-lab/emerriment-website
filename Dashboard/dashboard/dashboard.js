// ============================================
// EMerriment Dashboard
// Main Controller
// ============================================

document.addEventListener("DOMContentLoaded", async () => {

    try {

        showLoading();

        // Authentication
        const user = await checkAuthentication();

        if (!user) return;

        // Dashboard
        await initializeDashboard(user);

        hideLoading();

    } catch (error) {

        console.error("Dashboard Error:", error);

        showError(
            "Something went wrong while loading your dashboard."
        );

    }

});


// ============================================
// Initialize Dashboard
// ============================================

async function initializeDashboard(user) {

    await loadUserProfile(user);

    await loadDashboardStats(user.id);

    await loadContinueReading(user.id);

    await loadRecentlyViewed(user.id);

    await loadPopularTopics();

    const profile = await loadSkinProfile(user.id);

    await loadRecommendedArticles(user, profile);

    await loadRecommendedProducts(profile);

    await loadSavedArticles(user.id);

    await loadLatestArticles();

}