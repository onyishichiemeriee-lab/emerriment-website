/* =========================================
   EMerriment — privacy-safe funnel events
   -----------------------------------------
   emTrack(event, params) forwards an ALLOW-LISTED event with ALLOW-LISTED
   parameters to the existing Google Analytics tag (gtag) when the page
   loads it; elsewhere it does nothing. It never sends email addresses,
   names, quiz answers or tokens: unknown parameters are dropped, strings
   are short, and any value containing "@" is discarded.

   Automatic events on pages that load this file:
     quiz_start      first interaction with a quiz form
     checkout_click  click on a Selar product link (product slug only)
   Pages call emTrack() for the rest (see VISITOR_TO_CUSTOMER_JOURNEY.md).
   A checkout click is an INTENT signal only — never a purchase.
========================================= */
"use strict";

(function () {

    const EVENTS = new Set([
        "quiz_start", "quiz_complete", "quiz_validation_error", "lead_submit",
        "marketing_consent", "report_email_request", "checkout_click",
        "sign_up", "login", "dashboard_view"
    ]);

    const PARAMS = new Set(["form", "field", "success", "granted", "sent", "product", "placement", "method"]);

    function clean(params) {
        const out = {};
        for (const [key, value] of Object.entries(params || {})) {
            if (!PARAMS.has(key)) continue;
            if (typeof value === "boolean") {
                out[key] = value;
            } else if (typeof value === "number" && Number.isFinite(value)) {
                out[key] = Math.round(value);
            } else if (typeof value === "string") {
                const text = value.trim().slice(0, 40);
                if (text && !text.includes("@")) out[key] = text;
            }
        }
        return out;
    }

    function emTrack(event, params) {
        if (!EVENTS.has(event)) return false;
        const payload = clean(params);
        try {
            if (typeof window.gtag === "function") {
                window.gtag("event", event, payload);
                return true;
            }
        } catch (error) {
            /* analytics must never break the page */
        }
        return false;
    }

    window.emTrack = emTrack;
    window.EMAnalytics = Object.freeze({ clean: clean, EVENTS: EVENTS, PARAMS: PARAMS });

    function productSlug(href) {
        try {
            const url = new URL(href, window.location.href);
            if (!/(^|\.)selar\.(com|co)$/.test(url.hostname)) return null;
            return url.pathname.replace(/^\/+/, "").split("/")[0] || null;
        } catch (error) {
            return null;
        }
    }

    function onReady() {

        document.addEventListener("click", function (event) {
            const link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
            if (!link) return;
            const slug = productSlug(link.getAttribute("href"));
            if (!slug) return;
            const page = (window.location.pathname.split("/").pop() || "home").replace(/\.html$/, "") || "home";
            emTrack("checkout_click", { product: slug, placement: page });
        }, true);

        let started = false;
        const startQuiz = function (event) {
            if (started) return;
            const form = event.target && event.target.closest ? event.target.closest(".quiz-form, #quizForm, .quiz-container") : null;
            if (!form) return;
            started = true;
            emTrack("quiz_start", { form: form.id === "quizForm" || form.classList.contains("quiz-container") ? "quiz_page" : "homepage" });
        };
        document.addEventListener("change", startQuiz, true);
        document.addEventListener("input", startQuiz, true);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onReady);
    } else {
        onReady();
    }

})();
