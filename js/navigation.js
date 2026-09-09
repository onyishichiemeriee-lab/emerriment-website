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
       DASHBOARD AUTH VISIBILITY
       
       NOTE:
       This is UI only.
       Real protection must remain
       inside dashboard/auth logic.
    ----------------------------------------- */

    if (
        window.supabaseClient &&
        typeof window.supabaseClient.auth !== "undefined"
    ) {

        updateNavigationAuth();

    }

});


/* =========================================
   AUTH-AWARE NAVIGATION
========================================= */


async function updateNavigationAuth() {

    try {

        const {
            data: { session }
        } =
            await window.supabaseClient
                .auth
                .getSession();


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


        if (session) {

            /* Desktop */

            if (loginBtn)
                loginBtn.style.display = "none";


            if (signupBtn)
                signupBtn.style.display = "none";


            if (dashboardBtn)
                dashboardBtn.style.display =
                    "inline-flex";


            /* Mobile */

            if (mobileLogin)
                mobileLogin.style.display = "none";


            if (mobileSignup) {

                mobileSignup.textContent =
                    "My Dashboard";

                mobileSignup.href =
                    "dashboard.html";

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