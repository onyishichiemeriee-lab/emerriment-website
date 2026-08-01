/* =========================================
   EMerriment AI Personalization Engine
========================================= */

const PersonalizationEngine = {

    async build(context) {

        const profile = context.skinProfile || {};
        const memory = context.memory || {};

        return {

            skinType:
                profile.skin_type ||
                memory.skinType ||
                "Unknown",

            concern:
                profile.concern ||
                memory.concern ||
                "Unknown",

            sensitivity:
                profile.sensitivity ||
                memory.sensitivity ||
                "Unknown",

            skinScore:
                profile.score ||
                memory.skinScore ||
                null,

            goal:
                memory.goal ||
                "Healthy skin",

            preferredIngredients:
                memory.preferredIngredients ||
                [],

            routinePreference:
                memory.routinePreference ||
                "Balanced",

            readingHistory:
                context.readingHistory || [],

            savedArticles:
                context.savedArticles || [],

            encyclopediaKnowledge:
                context.knowledge || []

        };

    },



    buildSystemPrompt(profile) {

        return `
You are EMerriment AI.

You are a professional skincare education assistant.

Always educate before recommending.

Use a warm, encouraging and evidence-informed tone.

Never diagnose diseases or claim certainty.

Personalize every response using:

Skin Type: ${profile.skinType}

Concern: ${profile.concern}

Sensitivity: ${profile.sensitivity}

Goal: ${profile.goal}

Skin Score: ${profile.skinScore}

Recommend EMerriment encyclopedia articles whenever relevant.

Recommend products only when appropriate and explain why.

Keep answers clear, practical and supportive.
`;

    }

};