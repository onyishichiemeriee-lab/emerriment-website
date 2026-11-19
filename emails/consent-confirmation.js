/* =========================================
   EMerriment — confirm the 14-day lessons (double opt-in)
   -----------------------------------------
   Sent once, only when the person ticked the optional box on a quiz.
   It asks them to confirm that the address is theirs and that they want
   the lessons. Nothing promotional: no lesson content, no products, no
   tracking pixel, no tracked links. Until they confirm, no lesson is sent.

   confirmUrl — built server-side (confirm-subscription function, single-
   use token); it opens a page with a Confirm button, so merely opening
   the link (for example by a mail security scanner) changes nothing.
========================================= */
"use strict";

const escapeHtml = require("./escape-html");

// Only this site's own confirmation page may be linked.
const CONFIRM_URL_PATTERN =
    /^https:\/\/[A-Za-z0-9.-]+(:\d+)?\/\.netlify\/functions\/confirm-subscription\?t=[A-Za-z0-9_-]{43}$/;

const EXPIRY_DAYS = 7;

module.exports = ({ name, confirmUrl } = {}) => {

    if (typeof confirmUrl !== "string" || !CONFIRM_URL_PATTERN.test(confirmUrl)) {
        throw new Error("consent_confirmation_url_invalid");
    }

    const safeName = escapeHtml(name || "there");
    const safeUrl = escapeHtml(confirmUrl);

    const subject = "Please confirm: EMerriment skin education emails";

    const content = `
        <p>Hi ${safeName},</p>

        <p>When you completed the EMerriment Skin Quiz, you ticked the box
        asking for our free <strong>14-day skin education emails</strong>:
        one short lesson a day for two weeks.</p>

        <p>To make sure this address belongs to you and that you want them,
        please confirm:</p>

        <p style="text-align:center;margin:30px 0;">
            <a href="${safeUrl}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:999px;font-weight:bold;">Confirm my subscription</a>
        </p>

        <p>The link opens a page where you press <strong>Confirm</strong>.
        It works once and expires in ${EXPIRY_DAYS} days.</p>

        <p><strong>Didn't ask for this?</strong> Just ignore this email. You
        will not be subscribed and you will not receive the lessons.</p>

        <p style="font-size:13px;color:#64748B;">Your skin report was sent
        separately and is not affected. Every lesson has a one-click
        unsubscribe link.</p>
    `;

    const preheader = "One click to confirm. If you didn't ask, ignore this email and nothing will be sent.";

    // Deliberately NOT the shared layout: its footer carries site and
    // social calls to action, which do not belong in a confirmation request.
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirm your skin education emails</title>
</head>
<body style="margin:0;padding:0;background:#F8F5EF;font-family:Arial,sans-serif;color:#334155;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}</div>
<table width="100%" cellspacing="0" cellpadding="0" role="presentation">
<tr><td align="center" style="padding:32px 16px;">
<table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="max-width:560px;background:#ffffff;border-radius:18px;">
<tr><td style="padding:36px 32px;line-height:1.7;font-size:16px;">
<h1 style="margin:0 0 20px;color:#07111E;font-size:24px;">🌿 EMerriment</h1>
${content}
<p style="font-size:12px;color:#94A3B8;margin-top:28px;">© EMerriment</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    return { subject, html };

};

module.exports.EXPIRY_DAYS = EXPIRY_DAYS;
module.exports.CONFIRM_URL_PATTERN = CONFIRM_URL_PATTERN;
