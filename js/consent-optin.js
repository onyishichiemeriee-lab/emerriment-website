/* =========================================
   EMerriment — optional 14-day lessons box on the quiz forms
   -----------------------------------------
   The box (and its "we'll send one short email asking you to confirm"
   note) lives in an element marked [data-marketing-optin]. It ships
   hidden, with the checkbox disabled, and is only shown when the server
   says confirmation emails are switched on
   (/.netlify/functions/email-features, EMAIL_CONFIRMATION_ENABLED).

   Fails closed: no answer, an error or anything but
   { "consentConfirmation": true } keeps it hidden, unticked and
   disabled. The quiz scripts record a request only for a ticked box that
   is enabled, so a hidden box can never register one.
========================================= */
(function () {
    "use strict";

    var ENDPOINT = "/.netlify/functions/email-features";

    function apply(enabled) {
        var blocks = document.querySelectorAll("[data-marketing-optin]");
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            var box = block.querySelector('input[type="checkbox"]');
            block.hidden = !enabled;
            if (box) {
                if (!enabled) box.checked = false;
                box.disabled = !enabled;
            }
        }
    }

    function init() {
        apply(false);
        if (typeof fetch !== "function") return;
        fetch(ENDPOINT, { headers: { Accept: "application/json" }, credentials: "omit", cache: "no-store" })
            .then(function (response) { return response && response.ok ? response.json() : null; })
            .then(function (features) { apply(Boolean(features && features.consentConfirmation === true)); })
            .catch(function () { apply(false); });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
