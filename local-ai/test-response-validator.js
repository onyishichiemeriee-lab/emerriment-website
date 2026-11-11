
const assert = require("node:assert/strict");

const {
    validateAIResponse
} = require("./server");

const tests = [
    {
        name: "Accepts a normal skincare explanation",
        reply: "Niacinamide may support skin hydration and barrier function.",
        safety: { level: "safe" },
        expectedSafe: true
    },
    {
        name: "Rejects an empty response",
        reply: "",
        safety: { level: "safe" },
        expectedSafe: false
    },
    {
        name: "Blocks an emergency-restricted response",
        reply: "Try a new skincare product.",
        safety: { level: "escalate", escalate: true },
        expectedSafe: false
    },
    {
        name: "Blocks personalized recommendations when restricted",
        reply: "Use this product every day.",
        safety: { level: "safe", blockRecommendation: true },
        expectedSafe: false
    },
    {
        name: "Rejects advice to ignore a doctor",
        reply: "Ignore your doctor and use this treatment.",
        safety: { level: "safe" },
        expectedSafe: false
    },
    {
        name: "Rejects a definitive skin diagnosis",
        reply: "You definitely have psoriasis.",
        safety: { level: "safe" },
        expectedSafe: false
    }
];

for (const test of tests) {
    const result = validateAIResponse(
        test.reply,
        test.safety
    );

    assert.equal(
        result.safe,
        test.expectedSafe,
        test.name
    );

    if (!result.safe) {
        assert.ok(result.reply.trim().length > 0);
    }

    console.log(`PASS: ${test.name}`);
}

console.log("\nAll six validator tests passed.");
