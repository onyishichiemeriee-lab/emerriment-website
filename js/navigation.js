/* =========================================
   EMERRIMENT GLOBAL NAVIGATION
========================================= */


document.addEventListener("DOMContentLoaded", () => {


    /* -----------------------------------------
       ELEMENTS
    ----------------------------------------- */

    const menuToggle =
        document.getElementById("emMenuToggle");

    const mobileMenu =
        document.getElementById("emMobileMenu");


    /* -----------------------------------------
       MOBILE MENU
    ----------------------------------------- */

    if (menuToggle && mobileMenu) {

        menuToggle.addEventListener("click", () => {

            const isOpen =
                mobileMenu.classList.toggle("open");

            menuToggle.classList.toggle(
                "active",
                isOpen
            );

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        });


        /* Close menu after clicking link */

        const mobileLinks =
            mobileMenu.querySelectorAll("a");

        mobileLinks.forEach(link => {

            link.addEventListener("click", () => {

                mobileMenu.classList.remove("open");

                menuToggle.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

    }


    /* -----------------------------------------
       ACTIVE PAGE
    ----------------------------------------- */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const pageMap = {

        "index.html": "home",

        "": "home",

        "encyclopedia.html": "encyclopedia",

        "skin-quiz.html": "quiz",

        "ai.html": "ai",

        "products.html": "products",

        "dashboard.html": "dashboard"

    };


    const activePage =
        pageMap[currentPage];


    if (activePage) {

        document
            .querySelectorAll("[data-page]")
            .forEach(link => {

                if (
                    link.dataset.page ===
                    activePage
                ) {

                    link.classList.add("active");

                }

            });

    }


    /* -----------------------------------------
       CLOSE MENU WITH ESCAPE
    ----------------------------------------- */

    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            mobileMenu &&
            mobileMenu.classList.contains("open")
        ) {

            mobileMenu.classList.remove("open");

            menuToggle.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });


    /* -----------------------------------------
       AUTH NAVIGATION
    ----------------------------------------- */

    if (
        window.supabaseClient &&
        window.supabaseClient.auth
    ) {

        updateNavigationAuth();

    } else {

        console.warn(
            "⏳ Supabase client not ready for navigation."
        );

    }

});


/* =========================================
   AUTH-AWARE NAVIGATION
========================================= */


async function updateNavigationAuth() {

    try {

        /* -----------------------------------------
           CHECK SUPABASE
        ----------------------------------------- */

        if (
            !window.supabaseClient ||
            !window.supabaseClient.auth
        ) {

            console.warn(
                "Supabase client not available."
            );

            return;

        }


        /* -----------------------------------------
           GET CURRENT SESSION
        ----------------------------------------- */

        const {
            data: { session }
        } =
            await window.supabaseClient
                .auth
                .getSession();


        /* -----------------------------------------
           ELEMENTS
        ----------------------------------------- */

        const loginBtn =
            document.getElementById(
                "navLoginBtn"
            );

        const signupBtn =
            document.getElementById(
                "navSignupBtn"
            );

        const dashboardBtn =
            document.getElementById(
                "navDashboardBtn"
            );

        const mobileLogin =
            document.getElementById(
                "mobileLoginBtn"
            );

        const mobileSignup =
            document.getElementById(
                "mobileSignupBtn"
            );


        /* -----------------------------------------
           LOGGED IN
        ----------------------------------------- */

        if (session) {

            console.log(
                "🔐 Navigation auth: Logged in"
            );


            /* Desktop */

            if (loginBtn) {

                loginBtn.style.display =
                    "none";

            }


            if (signupBtn) {

                signupBtn.style.display =
                    "none";

            }


            if (dashboardBtn) {

                dashboardBtn.style.display =
                    "inline-flex";

            }


            /* Mobile */

            if (mobileLogin) {

                mobileLogin.style.display =
                    "none";

            }


            if (mobileSignup) {

                mobileSignup.style.display =
                    "inline-flex";

                mobileSignup.textContent =
                    "My Dashboard";

                mobileSignup.href =
                    "dashboard.html";

            }

        }


        /* -----------------------------------------
           LOGGED OUT
        ----------------------------------------- */

        else {

            console.log(
                "🔐 Navigation auth: Logged out"
            );


            /* Desktop */

            if (loginBtn) {

                loginBtn.style.display =
                    "inline-flex";

            }


            if (signupBtn) {

                signupBtn.style.display =
                    "inline-flex";

            }


            if (dashboardBtn) {

                dashboardBtn.style.display =
                    "none";

            }


            /* Mobile */

            if (mobileLogin) {

                mobileLogin.style.display =
                    "inline-flex";

            }


            if (mobileSignup) {

                mobileSignup.style.display =
                    "inline-flex";

                mobileSignup.textContent =
                    "Sign Up";

                mobileSignup.href =
                    "signup.html";

            }

        }

    }

    catch (error) {

        console.error(
            "Navigation auth check failed:",
            error
        );

    }

}