/* =========================================
   EMerriment — verified customer onboarding
   -----------------------------------------
   Sent only for rows in public.purchases (verified purchases), by
   netlify/functions/customer-onboarding.js. Selar already sends the
   receipt and download link, so these emails never repeat payment
   details: they help the customer USE what they bought.

   Day 0  — welcome and how to get started
   Day 3  — getting the most from it (habits, patience, safety)
   Day 10 — check-in and a request for feedback

   Transactional/service messages about a purchase the customer made;
   they still carry the unsubscribe link (one click stops them).
========================================= */
"use strict";

const layout = require("./layout");
const escapeHtml = require("./escape-html");

const SITE = "https://emerriment.com";

const box = (title, body) => `
    <div style="background:#E0F7FA;padding:20px 22px;border-left:5px solid #00BCD4;border-radius:8px;margin:26px 0;">
        <strong>${title}</strong>
        <div style="margin-top:8px;">${body}</div>
    </div>`;

const button = (href, label) => `
    <p style="text-align:center;margin:30px 0;">
        <a href="${href}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:999px;font-weight:bold;">${label}</a>
    </p>`;

function names({ name, productName }) {
    return {
        safeName: escapeHtml(name || "there"),
        safeProduct: escapeHtml(productName || "your EMerriment programme")
    };
}

const day0 = (data) => {
    const { safeName, safeProduct } = names(data);
    return {
        subject: "🌿 Welcome — let's get you started",
        preheader: "Where to find your purchase, and a simple first step for this week.",
        html: layout({
            tracking: data.tracking,
            preheader: "Where to find your purchase, and a simple first step for this week.",
            title: "Welcome to your EMerriment journey 🌿",
            content: `
                <p>Hello <strong>${safeName}</strong> 👋🏽</p>
                <p>Thank you for choosing <strong>${safeProduct}</strong>. We're glad to be part of your skincare routine.</p>
                ${box("📩 Where is my purchase?", `
                    <p style="margin:0;">Selar sent your receipt and access link in a separate email. If you can't find it, search your inbox (and Spam or Promotions) for <strong>"Selar"</strong>.</p>`)}
                <p><strong>Your first step this week:</strong> read the introduction once, then choose <em>one</em> habit to start with. Small, steady changes are easier to keep — and easier to judge — than changing everything at once.</p>
                <p>Questions about your skin are welcome in the EMerriment encyclopedia and the EMerriment AI assistant, which are free to use alongside your purchase.</p>
                ${button(SITE + "/encyclopedia.html", "Explore the encyclopedia")}
                <p style="font-size:13px;color:#64748B;">EMerriment provides skincare education, not medical advice. For a skin condition that is painful, spreading or not improving, please see a dermatologist or doctor.</p>`
        })
    };
};

const day3 = (data) => {
    const { safeName, safeProduct } = names(data);
    return {
        subject: "Three habits that make your routine work",
        preheader: "Consistency, patch testing and sunscreen — the basics that matter most.",
        html: layout({
            tracking: data.tracking,
            preheader: "Consistency, patch testing and sunscreen — the basics that matter most.",
            title: "Getting the most from it ✨",
            content: `
                <p>Hello <strong>${safeName}</strong>,</p>
                <p>A few days in with <strong>${safeProduct}</strong>, here are three habits that help any routine:</p>
                <ol style="padding-left:20px;line-height:1.7;">
                    <li><strong>Be consistent.</strong> Skin renews over weeks, so give a routine about 4–6 weeks before judging it.</li>
                    <li><strong>Introduce one new product at a time</strong> and patch test it first, so you know what your skin is reacting to.</li>
                    <li><strong>Use sunscreen every morning.</strong> It protects your progress, especially if you are working on dark spots.</li>
                </ol>
                ${box("💡 Tip", `<p style="margin:0;">Write down what you use and how your skin feels each week. It makes changes easier to notice — and to discuss with a professional if needed.</p>`)}
                ${button(SITE + "/dashboard.html", "Open your dashboard")}`
        })
    };
};

const day10 = (data) => {
    const { safeName, safeProduct } = names(data);
    return {
        subject: "How is it going? (one quick question)",
        preheader: "Tell us what's working and what isn't — it helps us improve.",
        html: layout({
            tracking: data.tracking,
            preheader: "Tell us what's working and what isn't — it helps us improve.",
            title: "How is it going? 💬",
            content: `
                <p>Hello <strong>${safeName}</strong>,</p>
                <p>You've had <strong>${safeProduct}</strong> for about ten days. We'd love to know how it's going.</p>
                <p>Simply reply in your own words — what's helpful, what's confusing, what you'd like more of. Every answer is read and helps us improve EMerriment for everyone.</p>
                ${box("🔁 Not seeing changes yet?", `<p style="margin:0;">That's normal at this stage. Keep the routine simple and consistent, and look at the encyclopedia article for your main concern for realistic timelines.</p>`)}
                ${button(SITE + "/encyclopedia.html", "Find your concern in the encyclopedia")}`
        })
    };
};

module.exports = { 0: day0, 3: day3, 10: day10, DAYS: [0, 3, 10] };
