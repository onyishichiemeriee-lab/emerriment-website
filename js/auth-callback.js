/* =========================================
   EMerriment — auth email link results
   -----------------------------------------
   Supabase returns to the site after an email link with details in the
   address bar:
     success  #access_token=…&type=signup|recovery   (read and cleared by
              supabase-js; this script never reads or logs the tokens)
     failure  #error=access_denied&error_code=otp_expired&error_description=…
   Previously a failure was silent: an expired confirmation link landed on
   the homepage with no explanation. This script shows a plain-text notice
   and removes the error details from the address bar.

   Load it BEFORE the Supabase library so the address is read before
   supabase-js clears it.
========================================= */
"use strict";

(function () {

    function readParams() {
        const out = {};
        const add = (text) => {
            new URLSearchParams(text).forEach((value, key) => {
                if (!(key in out)) out[key] = value;
            });
        };
        add(window.location.hash.replace(/^#/, ""));
        add(window.location.search.replace(/^\?/, ""));
        return out;
    }

    const params = readParams();
    const page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const isResetPage = page === "reset-password.html";
    const hasError = Boolean(params.error || params.error_code);
    const expired = params.error_code === "otp_expired" ||
        /expired|invalid/i.test(params.error_description || "");

    let notice = null;

    if (hasError) {

        notice = isResetPage
            ? {
                kind: "error",
                text: expired
                    ? "This password reset link has expired or was already used. Please request a new one."
                    : "This password reset link could not be used. Please request a new one.",
                href: "forgot-password.html",
                label: "Request a new reset link"
            }
            : {
                kind: "error",
                text: expired
                    ? "This email link has expired or was already used. If you have already confirmed your email, simply log in; otherwise log in to request a new confirmation email."
                    : "This email link could not be used. Please try again.",
                href: "login.html",
                label: "Go to login"
            };

        // Remove the error details from the address bar (and history).
        try {
            window.history.replaceState(null, "", window.location.pathname);
        } catch (error) {
            /* ignore */
        }

    } else if (params.access_token && params.type === "signup") {

        notice = {
            kind: "success",
            text: "Your email address is confirmed. Welcome to EMerriment!",
            href: "dashboard.html",
            label: "Go to your dashboard"
        };

    }

    window.EMAuthCallback = Object.freeze({
        hasError: hasError,
        expired: hasError && expired,
        type: params.type || null,
        hasTokens: Boolean(params.access_token || params.code)
    });

    if (!notice) return;

    function show() {

        const box = document.createElement("div");
        box.className = "auth-callback-notice auth-callback-" + notice.kind;
        box.setAttribute("role", notice.kind === "error" ? "alert" : "status");
        box.style.cssText =
            "margin:12px auto;max-width:640px;padding:14px 18px;border-radius:12px;" +
            "font-family:inherit;line-height:1.5;" +
            (notice.kind === "error"
                ? "background:#fff4f2;border:1px solid #f0c4bb;color:#7a2e1f;"
                : "background:#eef8f1;border:1px solid #b9e0c5;color:#1f5a33;");

        const text = document.createElement("p");
        text.style.margin = "0 0 8px";
        text.textContent = notice.text;

        const link = document.createElement("a");
        link.href = notice.href;
        link.textContent = notice.label;
        link.style.fontWeight = "600";
        link.style.color = "inherit";

        box.appendChild(text);
        box.appendChild(link);

        const target = isResetPage ? document.getElementById("passwordMessage") : null;
        if (target) {
            target.textContent = "";
            target.appendChild(box);
        } else {
            document.body.insertBefore(box, document.body.firstChild);
        }

        if (isResetPage && hasError) {
            const form = document.getElementById("passwordForm");
            if (form) {
                form.querySelectorAll("input, button").forEach((el) => { el.disabled = true; });
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", show);
    } else {
        show();
    }

})();
