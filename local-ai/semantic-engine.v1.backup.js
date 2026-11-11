
/* =========================================
   EMerriment Semantic Intelligence Engine
   Phase 8I — Version 1
   ========================================= */

"use strict";

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const OLLAMA_MODEL = "llama3.2";

const ANALYSIS_SCHEMA = {
    type: "object",
    properties: {
        intent: {
            type: "string",
            enum: [
                "informational",
                "personal_advice",
                "diagnosis_request",
                "treatment_request",
                "ingredient_question",
                "emergency",
                "other"
            ]
        },

        symptom_context: {
            type: "string",
            enum: [
                "current",
                "historical",
                "hypothetical",
                "negated",
                "quoted",
                "unclear",
                "not_applicable"
            ]
        },

        risk_level: {
            type: "string",
            enum: [
                "safe",
                "caution",
                "escalate",
                "uncertain"
            ]
        },

        current_emergency: {
            type: "boolean"
        },

                ingredient_risks: {
            type: "array",
            items: {
                type: "string"
            }
        },

        skin_state: {
            type: "string",
            enum: [
                "normal",
                "active_irritation",
                "peeling",
                "broken_skin",
                "unclear",
                "not_applicable"
            ]
        },

        combination_risk: {
            type: "string",
            enum: [
                "none",
                "low",
                "moderate",
                "high",
                "uncertain"
            ]
        },

        safety_restrictions: {
            type: "array",
            items: {
                type: "string",
                enum: [
                    "avoid_introducing_strong_actives_during_active_irritation",
                    "avoid_combining_potentially_irritating_actives",
                    "recommend_professional_assessment",
                    "avoid_diagnosis",
                    "emergency_assessment_required"
                ]
            }
        },

        reasoning: {
            type: "string"
        }
    },

    required: [
        "intent",
        "symptom_context",
        "risk_level",
        "current_emergency",
        "ingredient_risks",
        "skin_state",
        "combination_risk",
        "safety_restrictions",
        "reasoning"
    ]
};


/* -----------------------------------------
   Validate semantic assessment
----------------------------------------- */

function validateAssessment(data) {

    if (!data || typeof data !== "object") {
        return false;
    }

    const validIntents = [
        "informational",
        "personal_advice",
        "diagnosis_request",
        "treatment_request",
        "ingredient_question",
        "emergency",
        "other"
    ];

    const validContexts = [
        "current",
        "historical",
        "hypothetical",
        "negated",
        "quoted",
        "unclear",
        "not_applicable"
    ];

    const validRisks = [
        "safe",
        "caution",
        "escalate",
        "uncertain"
    ];

    const validAssessment = (
        validIntents.includes(data.intent) &&
        validContexts.includes(data.symptom_context) &&
        validRisks.includes(data.risk_level) &&
                typeof data.current_emergency === "boolean" &&

        Array.isArray(data.ingredient_risks) &&
        data.ingredient_risks.every(
            item => typeof item === "string"
        ) &&

        [
            "normal",
            "active_irritation",
            "peeling",
            "broken_skin",
            "unclear",
            "not_applicable"
        ].includes(data.skin_state) &&

        [
            "none",
            "low",
            "moderate",
            "high",
            "uncertain"
        ].includes(data.combination_risk) &&

        Array.isArray(data.safety_restrictions) &&
        data.safety_restrictions.every(item =>
            [
                "avoid_introducing_strong_actives_during_active_irritation",
                "avoid_combining_potentially_irritating_actives",
                "recommend_professional_assessment",
                "avoid_diagnosis",
                "emergency_assessment_required"
            ].includes(item)
        ) &&

        typeof data.reasoning === "string" &&
        typeof data.skin_state === "string" &&
        typeof data.combination_risk === "string" &&
        Array.isArray(data.safety_restrictions) &&
        data.safety_restrictions.every(
            item => typeof item === "string"
        )
    );

    if (!validAssessment) {
    console.log(
        "❌ Invalid semantic assessment:",
        JSON.stringify(data, null, 2)
    );
    return false;
}

    // A current emergency must never be downgraded.
    if (data.current_emergency === true) {

        if (
            data.symptom_context !== "current" ||
            data.risk_level !== "escalate"
        ) {
            return false;
        }
    }

    // A denied or historical symptom cannot be
    // simultaneously classified as a current emergency.
    if (
        ["negated", "historical", "hypothetical", "quoted"]
            .includes(data.symptom_context) &&
        data.current_emergency === true
    ) {
        return false;
    }

    // =========================================
// Phase 8I — Semantic consistency checks
// =========================================

const nonCurrentContexts = [
    "negated",
    "historical",
    "hypothetical",
    "quoted"
];

// Non-current symptoms must not be classified
// as active skin irritation or skin damage.
if (
    nonCurrentContexts.includes(data.symptom_context) &&
    [
        "active_irritation",
        "peeling",
        "broken_skin"
    ].includes(data.skin_state)
) {
    return false;
}

// Emergency restrictions must agree with
// the emergency assessment.
if (
    data.safety_restrictions.includes(
        "emergency_assessment_required"
    ) &&
    data.current_emergency !== true
) {
    return false;
}

// A current emergency must include its restriction.
if (data.current_emergency === true) {

    if (
        !data.safety_restrictions.includes(
            "emergency_assessment_required"
        )
    ) {
        return false;
    }

    // Emergency assessments must not invent
    // unrelated skincare conditions or restrictions.
    if (
        !["unclear", "not_applicable"].includes(data.skin_state) ||
        data.combination_risk !== "none" &&
        data.combination_risk !== "uncertain" ||
        data.ingredient_risks.length > 0 ||
        data.safety_restrictions.some(item =>
            item !== "emergency_assessment_required" &&
            item !== "avoid_diagnosis"
        )
    ) {
        return false;
    }
}

// A high combination risk cannot be classified
// as safe.
if (
    data.combination_risk === "high" &&
    data.risk_level === "safe"
) {
    return false;
}

    return true;
}

/* -----------------------------------------
   Safe fallback assessment
----------------------------------------- */

function fallbackAssessment() {

    return {
        intent: "other",

        symptom_context: "unclear",

        risk_level: "uncertain",

        current_emergency: false,

        ingredient_risks: [],

        skin_state: "unclear",

        combination_risk: "uncertain",

        safety_restrictions: [
            "avoid_diagnosis"
        ],

        reasoning:
            "Semantic assessment was unavailable. " +
            "A cautious response is required.",

        assessmentAvailable: false
    };
}

/* -----------------------------------------
   Analyze user message
----------------------------------------- */

async function analyze(message, context = {}) {

    if (
        typeof message !== "string" ||
        !message.trim()
    ) {
        return fallbackAssessment();
    }

    const prompt = `
You are the semantic understanding component of EMerriment AI.

Your task is to understand the meaning of the user's message.

Do not diagnose medical conditions.

Analyze the user's actual meaning, not isolated keywords.

IMPORTANT CONTEXT DISTINCTIONS:

STRICT CLASSIFICATION RULES:

1. NEGATION HAS PRIORITY:
If the user explicitly says they do NOT have a symptom,
classify symptom_context as "negated".

Examples:
- "I do not have difficulty breathing."
- "My lips are not swollen."
- "I'm not experiencing any reaction."

Never classify an explicitly denied symptom as current.

2. CURRENT EMERGENCY:
If the user describes serious emergency symptoms happening
to them now, set ALL THREE:

symptom_context = "current"
current_emergency = true
risk_level = "escalate"

Do not return risk_level = "uncertain" for a clearly
described current emergency.

3. SKINCARE QUESTIONS ARE NOT AUTOMATICALLY EMERGENCIES:

A user asking about ingredients, acne, eczema, irritation,
or skincare combinations should not automatically receive
intent = "emergency".

Use the appropriate intent:
- ingredient_question
- personal_advice
- treatment_request
- diagnosis_request

4. ACTIVE SKIN IRRITATION:

If the user describes active irritation, peeling, or broken
skin and asks about combining strong active ingredients,
classify the risk as at least "caution".

5. DO NOT INVENT CURRENT SYMPTOMS:

Do not describe a symptom as current unless the user's
message establishes that it is happening now.

CONTEXT CLASSIFICATION EXAMPLES — FOLLOW THESE CAREFULLY:

Example 1:
Message: "Can difficulty breathing be a sign of an allergic reaction?"
Classification:
symptom_context = "hypothetical"
current_emergency = false
intent = "informational"

A question about a symptom does not mean the user denies
experiencing it.

Example 2:
Message: "I do not have difficulty breathing or swollen lips."
Classification:
symptom_context = "negated"
current_emergency = false

Example 3:
Message: "Last month I experienced swollen lips, but I'm fine now."
Classification:
symptom_context = "historical"
current_emergency = false

A symptom that happened in the past and has resolved
must be classified as historical, not negated.

Example 4:
Message: "I'm having trouble breathing right now."
Classification:
symptom_context = "current"
current_emergency = true
risk_level = "escalate"

PRIORITY:
Determine whether the user is asking a question,
describing a past event, denying a symptom,
or reporting a current experience.

Do not confuse these categories.

1. CURRENT:
The user clearly describes symptoms happening to them now.

2. HISTORICAL:
The user describes symptoms that happened in the past and are no longer present.

3. HYPOTHETICAL:
The user asks a general or hypothetical question.

4. NEGATED:
The user explicitly denies experiencing a symptom.

5. QUOTED:
The symptoms are being discussed as something another person said.

6. UNCLEAR:
The message does not provide enough information to establish the context.

EMERGENCY ASSESSMENT:

Pay attention to potentially serious symptoms such as:

- Difficulty breathing.
- Shortness of breath.
- Throat closing or swelling.
- Swelling of the tongue or throat.
- Severe allergic reactions.

Only classify current_emergency as true when the message
describes a potentially serious emergency happening now.

Do not classify hypothetical, historical, quoted or explicitly
denied symptoms as a current emergency.

If context is unclear, use uncertain risk rather than inventing facts.

SKINCARE RISK ASSESSMENT:

Consider:

- Existing irritation.
- Peeling or broken skin.
- Eczema and other skin conditions.
- Combining multiple active ingredients.
- Pregnancy or breastfeeding when explicitly relevant.
- Potentially harmful substances.
- Unsafe self-treatment intentions.

=========================================
STRUCTURED SKIN STATE ASSESSMENT
=========================================

You MUST classify the user's skin_state.

Use:

- normal: No active irritation or skin damage is described.
- active_irritation: The user describes current burning,
  stinging, redness, inflammation or irritation.
- peeling: The user describes current flaking or peeling skin.
- broken_skin: The user describes open wounds, cracks,
  raw skin or damaged skin.
- unclear: The skin condition cannot be established.
- not_applicable: The message does not concern skin state.

If multiple states apply, prioritize:
broken_skin > peeling > active_irritation.

Do not infer active irritation from a stored skin profile.
Use the current message and relevant context carefully.

=========================================
INGREDIENT COMBINATION ASSESSMENT
=========================================

You MUST classify combination_risk.

Consider the actual ingredients, their intended use,
the user's current skin state and the proposed routine.

Use:

- none: No meaningful combination risk identified.
- low: Limited potential for interaction or irritation.
- moderate: Meaningful potential for irritation or incompatibility.
- high: Strong concern given the proposed combination
  and the user's described circumstances.
- uncertain: Insufficient information to assess.

Do not automatically classify every combination as dangerous.

=========================================
SAFETY RESTRICTIONS
=========================================

Return only applicable values from safety_restrictions.

Use:

avoid_introducing_strong_actives_during_active_irritation
when introducing strong potentially irritating actives
would be unsuitable given current irritation or skin damage.

avoid_combining_potentially_irritating_actives
when the proposed combination creates a meaningful
irritation concern.

recommend_professional_assessment
when the user's circumstances warrant professional guidance.

avoid_diagnosis
when a medical diagnosis is requested or cannot be
established from the available information.

emergency_assessment_required
when a potentially serious current emergency is identified.

Do not add restrictions merely because an ingredient
or symptom is mentioned.

Every restriction must be supported by the user's
actual message and the assessment.

=========================================
ASSESSMENT CONSISTENCY
=========================================
SKINCARE RISK VS MEDICAL EMERGENCY:

Do not classify a skincare ingredient combination as a
medical emergency merely because it may cause irritation.

The following are distinct:

- risk_level "caution": Potential irritation or unsuitable
  skincare combinations requiring conservative guidance.

- risk_level "escalate": A current or suspected serious
  medical emergency requiring urgent medical attention.

- current_emergency must be true only when the user's
  message describes a current emergency situation.

For current irritation or peeling combined with potentially
irritating active ingredients:

- Assess the actual skin condition and ingredients.
- Use an appropriate moderate or high combination risk
  when supported by the assessment.
- Include "avoid_introducing_strong_actives_during_active_irritation".
- Do not automatically classify this as an emergency.

EMERGENCY PRIORITY RULE:

When the user describes a current emergency symptom:

1. Set intent to "emergency".
2. Set symptom_context to "current".
3. Set risk_level to "escalate".
4. Set current_emergency to true.
5. Include "emergency_assessment_required" in safety_restrictions.
6. Set skin_state to "not_applicable" unless a separate current skin condition is explicitly described.
7. Set combination_risk to "none" unless an ingredient combination is explicitly discussed. Otherwise use "uncertain" when insufficient information exists.
8. Do not invent ingredient risks or unrelated skincare restrictions.
9. Include "avoid_diagnosis" if appropriate.
10. ingredient_risks must contain ingredient identifiers only,
    never safety restriction names or recommendations.

11. If no ingredients are explicitly mentioned in the user's
    message, ingredient_risks must be an empty array.

Emergency assessment takes priority over unrelated skincare classification.

If skin_state is peeling or broken_skin and the user
requests potentially irritating active ingredients,
carefully assess whether combination_risk should be
moderate or high.

If current active irritation makes introducing strong
actives unsuitable, include the corresponding
safety restriction.

If the user describes historical, hypothetical,
negated or quoted symptoms, do not automatically
classify them as current skin irritation.

Do not assume that a user's stored skin profile confirms
the cause of a new symptom.

Do not assume that an ingredient is safe merely because
you do not recognize it.

OUTPUT:

Return only valid JSON matching the supplied schema.

The user's message:

${message}

Relevant context:

${JSON.stringify(context)}

Analyze the message now.
`;

    try {

        const response = await fetch(
            OLLAMA_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    prompt,
                    format: ANALYSIS_SCHEMA,
                    stream: false,
                    options: {
                        temperature: 0
                    }
                })
            }
        );

        if (!response.ok) {

            console.error(
                "Semantic engine Ollama error:",
                await response.text()
            );

            return fallbackAssessment();
        }

        const result = await response.json();

        let assessment;

        try {

            assessment = JSON.parse(
                result.response || ""
            );

        } catch (error) {

            console.error(
                "Semantic engine returned invalid JSON."
            );

            return fallbackAssessment();
        }

        if (!validateAssessment(assessment)) {

    console.error(
        "❌ Semantic assessment failed validation."
    );

    console.error(
        "RAW ASSESSMENT:",
        JSON.stringify(assessment, null, 2)
    );

    return fallbackAssessment();
}

        return {
            ...assessment,
            assessmentAvailable: true
        };

    } catch (error) {

        console.error(
            "Semantic engine failure:",
            error.message
        );

        return fallbackAssessment();
    }
}


/* -----------------------------------------
   Module exports
----------------------------------------- */

module.exports = {
    analyze,
    validateAssessment,
    fallbackAssessment
};
