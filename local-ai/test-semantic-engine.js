const SemanticEngine = require("./semantic-engine");

const tests = [
    {
        name: "Current emergency",
        message: "I'm having trouble breathing right now.",
        check: result =>
            result.symptom_context === "current" &&
            result.current_emergency === true &&
            result.safety_restrictions.includes(
                "emergency_assessment_required"
            )
    },
    {
        name: "Active irritation with multiple strong actives",
        message: "My skin is currently irritated and peeling. Can I combine glycolic acid, salicylic acid, and tretinoin to clear dark spots?",
        check: result =>
            ["active_irritation", "peeling"].includes(result.skin_state) &&
            ["moderate", "high"].includes(result.combination_risk) &&
            result.safety_restrictions.includes(
                "avoid_introducing_strong_actives_during_active_irritation"
            )
    },
    {
        name: "Historical irritation",
        message: "Last month my skin was irritated and peeling, but it has healed now. What does that mean?",
        check: result =>
            result.symptom_context === "historical" &&
            !["active_irritation", "peeling", "broken_skin"].includes(
                result.skin_state
            )
    }
];

async function runTests() {
    let passed = 0;

    for (const test of tests) {
        console.log(`\n🧪 Testing: ${test.name}`);

        const result = await SemanticEngine.analyze(test.message);

        const success =
            result.assessmentAvailable === true &&
            test.check(result);

        console.log("RESULT:", result);
        console.log(success ? "✅ PASSED" : "❌ FAILED");

        if (success) passed++;
    }

    console.log(`\n📊 RESULTS: ${passed}/${tests.length} passed`);
}

runTests().catch(console.error);