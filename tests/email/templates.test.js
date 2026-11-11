/* Tests for every template under emails/ */
"use strict";

const assert = require("assert");
const path = require("path");
const H = require("./helpers");

const suite = H.createSuite("email templates");
const { test } = suite;

const emails = () => H.load("emails/index.js");
const escapeHtml = () => H.load("emails/escape-html.js");
const common = () => H.load("netlify/lib/email-common.js");

const ATTACK = "<script>alert(1)</script><img src=x onerror=alert(2)><a href=\"https://evil.example\">click</a>";

function tracking(leadId = "lead-42") {
    return common().buildTracking(leadId);
}

function assertNoInjection(html, label) {
    assert(!html.includes("<script>alert(1)"), label + ": script injected");
    assert(!html.includes("<img src=x"), label + ": img injected");
    assert(!html.includes("<a href=\"https://evil.example\">"), label + ": link injected");
    assert(!html.includes("javascript:"), label + ": javascript: URL");
}

test("escape helper escapes all HTML-significant characters and handles non-strings", async () => {
    const e = escapeHtml();
    assert.strictEqual(e(`<a href="x" onclick='y'>&\`</a>`), "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&#96;&lt;/a&gt;");
    assert.strictEqual(e(null), "");
    assert.strictEqual(e(undefined), "");
    assert.strictEqual(e(0), "0");
    assert.strictEqual(e(50), "50");
    assert.strictEqual(e("Ada"), "Ada");
});

test("all 14 lessons render with personalization, subject and design", async () => {
    const all = emails();
    for (let day = 1; day <= 14; day++) {
        const t = all[day]({ name: "Ada", email: "ada@example.com", tracking: tracking() });
        assert(typeof t.subject === "string" && t.subject.length > 5, `day ${day} subject`);
        assert(t.html.includes("Hello <strong>Ada</strong>"), `day ${day} greeting`);
        assert(t.html.includes("🌿 EMerriment"), `day ${day} header`);
        assert(t.html.includes("Healthy Skin Begins With Understanding"), `day ${day} tagline`);
        assert(t.html.includes("https://emerriment216.netlify.app"), `day ${day} site link`);
        assert(t.html.includes("© EMerriment"), `day ${day} footer`);
    }
    assert.strictEqual(all[15], undefined, "no Day 15 lesson");
});

test("all 14 lessons escape the name (body and Day 14 title) without double escaping", async () => {
    const all = emails();
    for (let day = 1; day <= 14; day++) {
        const t = all[day]({ name: ATTACK, email: "ada@example.com", tracking: tracking() });
        assertNoInjection(t.html, "day " + day);
        assert(t.html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"), `day ${day} escaped once`);
        assert(!t.html.includes("&amp;lt;"), `day ${day} double escaped`);
    }
    const d14 = all[14]({ name: "Ada & Co", tracking: tracking() });
    assert(d14.html.includes("Congratulations, Ada &amp; Co!"), "day 14 title escaped once");
});

test("lessons use a safe default when the name is missing", async () => {
    const all = emails();
    for (let day = 1; day <= 14; day++) {
        for (const name of [undefined, null, ""]) {
            const t = all[day]({ name, email: "ada@example.com" });
            assert(t.html.includes("Hello <strong>there</strong>"), `day ${day} default for ${JSON.stringify(name)}`);
            assert(!t.html.includes("undefined") && !t.html.includes(">null<"), `day ${day} leaks ${name}`);
        }
    }
});

test("welcome email: personalization, escaping, default", async () => {
    const { welcome } = emails();
    const ok = welcome({ name: "Ada", tracking: tracking() });
    assert(ok.html.includes("Hello <strong>Ada</strong>"));
    assert.strictEqual(ok.subject, "🌿 Welcome to EMerriment — Your Skin Journey Starts Here");
    assertNoInjection(welcome({ name: ATTACK }).html, "welcome");
    assert(welcome({}).html.includes("Hello <strong>there</strong>"));
});

test("report email: all values, escaping, special characters, defaults", async () => {
    const { report } = emails();
    const t = report({ name: "Ada", skinType: "Oily", concern: "Acne", oilLevel: "High", sensitivity: "Low",
        score: 50, recommendation: "Your skin needs hydration and consistency.", tracking: tracking() });
    for (const s of ["Ada", "Oily", "Acne", "High", "Low", "50/100", "Your skin needs hydration and consistency."]) {
        assert(t.html.includes(s), s);
    }
    const special = report({ name: "Zoë O'Brien & \"Co\"", concern: "Dark Spots < 2 weeks" });
    assert(special.html.includes("Zoë O&#39;Brien &amp; &quot;Co&quot;"));
    assert(special.html.includes("Dark Spots &lt; 2 weeks"));
    const attack = report({ name: ATTACK, skinType: ATTACK, concern: ATTACK, oilLevel: ATTACK,
        sensitivity: ATTACK, recommendation: ATTACK, score: ATTACK });
    assertNoInjection(attack.html, "report");
    const empty = report({});
    assert(empty.html.includes("there") && empty.html.includes("--/100") && empty.html.includes("Not determined"));
    assert(report({ score: 0 }).html.includes("0/100"), "score 0 kept");
});

test("newsletter: name and title escaped, subject made single-line, trusted content kept", async () => {
    const { newsletter } = emails();
    const t = newsletter({ name: ATTACK, title: ATTACK, subject: "Hello\r\nBcc: x@evil.example",
        content: "<p>Admin <strong>formatted</strong> content</p>" });
    assertNoInjection(t.html, "newsletter name/title");
    assert.strictEqual(t.html.split("&lt;script&gt;alert(1)&lt;/script&gt;").length - 1, 2, "name and title both escaped");
    assert(!/\r|\n/.test(t.subject), "subject has line breaks");
    assert(t.html.includes("<p>Admin <strong>formatted</strong> content</p>"), "admin HTML kept");
    const d = newsletter({});
    assert.strictEqual(d.subject, "🌿 Your EMerriment Skin Education Update");
    assert(d.html.includes("Hello <strong>there</strong>"));
});

test("tracking pixel: signed, placed once after the email body, no address in URL", async () => {
    const { report } = emails();
    const html = report({ name: "Ada", email: "ada@example.com", tracking: tracking("lead-42") }).html;
    const pixels = html.match(/<img[\s\S]*?>/g) || [];
    assert.strictEqual(pixels.length, 1, "one pixel");
    assert(/email-open\?l=lead-42&amp;t=[A-Za-z0-9_-]{32}"/.test(pixels[0]), "signed URL");
    assert(pixels[0].includes('width="1"') && pixels[0].includes('height="1"') && pixels[0].includes("display:none"));
    assert(html.indexOf("<img") > html.indexOf("© EMerriment"), "after footer");
    assert(html.indexOf("<img") < html.indexOf("</body>"), "inside body");
    assert(!html.includes("ada@example.com") && !html.includes("ada%40example.com"), "address not in HTML");
});

test("unsubscribe link: signed, shown in footer when tracking is given", async () => {
    const { report } = emails();
    const html = report({ name: "Ada", tracking: tracking("lead-42") }).html;
    assert(/href="https:\/\/emerriment216\.netlify\.app\/\.netlify\/functions\/unsubscribe\?l=lead-42&amp;t=[A-Za-z0-9_-]{32}"/.test(html));
    assert(html.includes("Unsubscribe from EMerriment emails"));
});

test("without tracking data, no pixel and no unsubscribe link are rendered (no broken URLs)", async () => {
    const { report } = emails();
    const html = report({ name: "Ada", email: "ada@example.com" }).html;
    assert(!html.includes("<img"));
    assert(!html.includes("email-open"));
    assert(!html.includes("undefined"));
});

test("layout refuses tracking URLs that are not this site's signed function links", async () => {
    const layout = H.load("emails/layout.js");
    for (const bad of ["javascript:alert(1)", "https://evil.example/x.gif", "http://emerriment216.netlify.app/.netlify/functions/email-open?l=1&t=x",
        "https://emerriment216.netlify.app/.netlify/functions/email-open?l=1&t=x\" onerror=\"alert(1)",
        "https://emerriment216.netlify.app/.netlify/functions/track-click?url=https://evil.example"]) {
        const html = layout({ title: "T", content: "C", tracking: { pixelUrl: bad, unsubscribeUrl: bad } });
        assert(!html.includes("<img"), "pixel rendered for " + bad);
        assert(!html.includes("Unsubscribe"), "unsubscribe rendered for " + bad);
    }
});

test("existing template scripts still pass", async () => {
    const { execFileSync } = require("child_process");
    for (const script of ["test-emails.js", "test-special-emails.js"]) {
        const out = execFileSync(process.execPath, [path.join(H.ROOT, script)], { cwd: H.ROOT, encoding: "utf8" });
        assert(!out.includes("FAILED"), script + " reported a failure");
        assert(out.includes("✅"), script + " produced no results");
    }
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
