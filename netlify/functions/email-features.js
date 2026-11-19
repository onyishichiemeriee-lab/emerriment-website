"use strict";

const { isConfirmationEnabled } = require("../lib/consent-confirmation");


/* =========================================
   EMerriment — public email feature switches
   -----------------------------------------
   GET → { "consentConfirmation": true | false }

   Read by js/consent-optin.js so the quiz pages only OFFER the optional
   14-day lessons box while confirmation emails can actually be sent
   (EMAIL_CONFIRMATION_ENABLED=true). Otherwise the box stays hidden and
   disabled: no promise of a confirmation email, and no request recorded
   that nobody could ever confirm.

   Deliberately exposes this one switch only — not the lesson or customer
   onboarding switches, and nothing from the database. Not cached, so
   switching it off takes effect for the next page view.
========================================= */


exports.handler = async (event) => {

    const method = event && event.httpMethod;

    if (method !== "GET" && method !== "HEAD") {
        return { statusCode: 405, headers: { "Allow": "GET" }, body: "" };
    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex",
            "X-Content-Type-Options": "nosniff"
        },
        body: method === "HEAD" ? "" : JSON.stringify({ consentConfirmation: isConfirmationEnabled() })
    };

};
