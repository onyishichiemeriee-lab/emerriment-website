// ============================================
// EMerriment Dashboard
// Main Controller
// ============================================
//
// The page must never look blank or hang:
//   * a loading message is shown until every section has finished;
//   * sections load in parallel (previously ten requests ran one after
//     another, leaving the page empty for several seconds on mobile);
//   * a failing section is reported in a visible notice and does not stop
//     the other sections;
//   * an unexpected error always produces a visible message.

document.addEventListener("DOMContentLoaded", async () => {

    showLoading();

    let user = null;

    try {

        // Authentication (redirects to login.html when signed out).
        user = await checkAuthentication();

    } catch (error) {

        console.error("Dashboard authentication error:", error);

        showError("We couldn't verify your sign-in. Please reload the page or log in again.");

        return;

    }

    if (!user) {

        hideLoading();

        return;

    }

    try {

        const failed = await initializeDashboard(user);

        hideLoading();

        if (failed.length) {

            showError(
                "Some parts of your dashboard couldn't load (" +
                failed.join(", ") +
                "). Please reload the page."
            );

        }

    } catch (error) {

        console.error("Dashboard Error:", error);

        showError(
            "Something went wrong while loading your dashboard."
        );

    }

});


// ============================================
// Initialize Dashboard
// Returns the names of sections that failed.
// ============================================

async function initializeDashboard(user) {

    const failed = [];

    const run = async (label, load) => {

        try {

            return await load();

        } catch (error) {

            console.error("Dashboard section failed: " + label, error);

            failed.push(label);

            return null;

        }

    };

    // Greeting first, so the page is personalised immediately.
    await run("profile", () => loadUserProfile(user));

    const skinProfile = run("skin profile", () => loadSkinProfile(user.id));

    await Promise.all([

        run("stats", () => loadDashboardStats(user.id)),

        run("continue reading", () => loadContinueReading(user.id)),

        run("recently viewed", () => loadRecentlyViewed(user.id)),

        run("popular topics", () => loadPopularTopics()),

        run("saved articles", () => loadSavedArticles(user.id)),

        run("latest articles", () => loadLatestArticles()),

        skinProfile.then((profile) => Promise.all([

            run("recommended articles", () => loadRecommendedArticles(user, profile)),

            run("recommended products", () => loadRecommendedProducts(profile))

        ]))

    ]);

    return failed;

}
