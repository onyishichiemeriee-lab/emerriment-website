// ============================================
// Dashboard Authentication
// ============================================

// Null when the Supabase library failed to load (network, blocked CDN):
// the dashboard then shows a message instead of failing silently.
const supabaseClient = window.supabaseClient || null;

function dashboardUnavailable() {

    const message =
        "We couldn't connect to EMerriment right now. Please check your connection and reload the page.";

    if (typeof showError === "function") {
        showError(message);
    } else {
        console.error(message);
    }

}


// --------------------------------------------
// Check Authentication
// --------------------------------------------

async function checkAuthentication() {

    if (!supabaseClient) {

        dashboardUnavailable();

        return null;

    }

    try {

        const {

            data: { user },

            error

        } = await supabaseClient.auth.getUser();


        if (error || !user) {

            window.location.href = "login.html";

            return null;

        }


        return user;

    }

    catch (error) {

        console.error("❌ Dashboard authentication check failed:", { kind: String(error && error.name || "Error") });

        window.location.href = "login.html";

        return null;

    }

}


// --------------------------------------------
// Logout
// --------------------------------------------

async function logout() {

    if (supabaseClient) {

        await supabaseClient.auth.signOut();

    }

    window.location.href = "login.html";

}


// --------------------------------------------
// Auth Listener
// --------------------------------------------

if (supabaseClient) supabaseClient.auth.onAuthStateChange(

    (event) => {

        if (event === "SIGNED_OUT") {

            window.location.href = "login.html";

        }

    }

);


// --------------------------------------------
// Logout Button
// --------------------------------------------

document.addEventListener(

    "DOMContentLoaded",

    () => {

        const button =

            document.getElementById(

                "logoutBtn"

            );


        if (!button) return;


        button.addEventListener(

            "click",

            logout

        );

    }

);