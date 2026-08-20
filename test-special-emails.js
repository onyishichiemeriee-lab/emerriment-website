const welcome = require("./emails/welcome");
const report = require("./emails/report");
const newsletter = require("./emails/newsletter");

const testData = {
    name: "Emmanuel",
    email: "test@example.com",
    skinType: "Combination",
    concern: "Acne",
    oilLevel: "Moderate",
    sensitivity: "Low",
    score: 82,
    recommendation:
        "Focus on a gentle cleanser, lightweight moisturizer, and daily sunscreen."
};

const templates = {
    welcome,
    report,
    newsletter
};

for (const [type, template] of Object.entries(templates)) {

    try {

        const result = template(testData);

        if (!result || !result.subject || !result.html) {

            throw new Error(
                "Template must return subject and html."
            );

        }

        console.log(`\n✅ ${type.toUpperCase()}`);
        console.log(`   Subject: ${result.subject}`);
        console.log(`   HTML: ${result.html.length} characters`);

    } catch (error) {

        console.error(`\n❌ ${type.toUpperCase()} FAILED`);
        console.error(error);

    }

}