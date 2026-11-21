/* =========================================
   EMerriment CMS — administrator sign-in (admin/loginCMS.html)

   The form (#adminLoginForm) is handled here; before WP4E this script
   listened for a #loginBtn that does not exist, so the CMS login did
   nothing. After signing in, the visitor goes to the CMS dashboard, whose
   shared guard (admin/js/admin-guard.js) admits administrators only and
   sends everyone else to the normal dashboard. Messages are text only and
   never include raw provider errors; nothing personal is logged.
========================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("adminLoginForm");
    const message = document.getElementById("message");

    if (!form) return;

    const show = (text, kind) => {
        if (!message) return;
        message.textContent = text;
        message.setAttribute("role", kind === "error" ? "alert" : "status");
        message.dataset.state = kind;
    };

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const client = window.supabaseClient;
        const email = String(document.getElementById("email").value || "").trim().toLowerCase();
        const password = String(document.getElementById("password").value || "");
        const button = form.querySelector('button[type="submit"]');

        if (!email || !password) {
            show("Please enter your email and password.", "error");
            return;
        }

        if (!client || !client.auth) {
            show("We couldn't connect to EMerriment right now. Please reload the page.", "error");
            return;
        }

        if (button) button.disabled = true;
        show("Signing in...", "info");

        try {
            const { error } = await client.auth.signInWithPassword({ email, password });

            if (error) {
                console.error("❌ CMS sign-in failed:", window.EMAdminGuard ? window.EMAdminGuard.safeError(error) : { kind: String(error.name || "Error") });
                show(/invalid login credentials/i.test(String(error.message || ""))
                    ? "Incorrect email or password."
                    : "We couldn't sign you in right now. Please try again.", "error");
                if (button) button.disabled = false;
                return;
            }

            show("Signed in. Opening the CMS...", "success");
            window.location.replace("/admin/dashboardCMS.html");
        } catch (error) {
            console.error("❌ CMS sign-in failed:", { kind: String((error && error.name) || "Error") });
            show("We couldn't sign you in right now. Please try again.", "error");
            if (button) button.disabled = false;
        }

    });

});
