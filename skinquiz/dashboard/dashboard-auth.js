// ============================================
// Dashboard Authentication
// ============================================

const supabaseClient = window.supabaseClient;


// --------------------------------------------
// Check Authentication
// --------------------------------------------

async function checkAuthentication() {

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

        console.error(error);

        window.location.href = "login.html";

        return null;

    }

}


// --------------------------------------------
// Logout
// --------------------------------------------

async function logout() {

    await supabaseClient.auth.signOut();

    window.location.href = "login.html";

}


// --------------------------------------------
// Auth Listener
// --------------------------------------------

supabaseClient.auth.onAuthStateChange(

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