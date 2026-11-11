
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
        // V1 — Existing semantic intelligence
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
            enum: ["safe", "caution", "escalate", "uncertain"]
        },

        current_emergency: { type: "boolean" },

        ingredient_risks: {
            type: "array",
            items: { type: "string" }
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
            enum: ["none", "low", "moderate", "high", "uncertain"]
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

        reasoning: { type: "string" },

        // V2 — Entity intelligence
        entities: {
            type: "object",
            properties: {
                ingredients: { type: "array", items: { type: "string" } },
                products: { type: "array", items: { type: "string" } },
                symptoms: { type: "array", items: { type: "string" } },
                conditions: { type: "array", items: { type: "string" } },
                treatments: { type: "array", items: { type: "string" } }
            },
            required: [
                "ingredients",
                "products",
                "symptoms",
                "conditions",
                "treatments"
            ]
        },

        // V2 — Temporal intelligence
        timeline: {
            type: "object",
            properties: {
                onset: {
                    type: "string",
                    enum: [
                        "just_started",
                        "days_ago",
                        "weeks_ago",
                        "months_ago",
                        "long_term",
                        "unknown",
                        "not_applicable"
                    ]
                },
                status: {
                    type: "string",
                    enum: [
                        "ongoing",
                        "resolved",
                        "intermittent",
                        "worsening",
                        "improving",
                        "unknown",
                        "not_applicable"
                    ]
                },
                progression: {
                    type: "string",
                    enum: [
                        "improving",
                        "worsening",
                        "unchanged",
                        "fluctuating",
                        "unknown",
                        "not_applicable"
                    ]
                }
            },
            required: ["onset", "status", "progression"]
        },

        // V2 — Relationship intelligence
        relationships: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    subject: { type: "string" },
                    relationship: {
                        type: "string",
                        enum: [
                            "possibly_related_to",
                            "used_before",
                            "started_after",
                            "used_with",
                            "experienced_after",
                            "intended_for",
                            "unknown"
                        ]
                    },
                    object: { type: "string" },
                    certainty: {
                        type: "string",
                        enum: ["reported", "possible", "unclear"]
                    }
                },
                required: [
                    "subject",
                    "relationship",
                    "object",
                    "certainty"
                ]
            }
        },

        // V2 — User intention
        user_goal: {
            type: "object",
            properties: {
                primary: { type: "string" },
                desired_outcome: { type: "string" }
            },
            required: ["primary", "desired_outcome"]
        },

        // V2 — Missing information
        information_gaps: {
            type: "array",
            items: { type: "string" }
        },

        // V2 — Next-step decision
        recommended_action: {
            type: "object",
            properties: {
                type: {
                    type: "string",
                    enum: [
                        "answer",
                        "clarify",
                        "retrieve_evidence",
                        "caution",
                        "escalate",
                        "refuse",
                        "uncertain"
                    ]
                },
                reason: { type: "string" }
            },
            required: ["type", "reason"]
        },

        // V2 — Memory candidate (not an automatic save)
        memory_candidate: {
            type: "object",
            properties: {
                should_remember: { type: "boolean" },
                category: {
                    type: "string",
                    enum: [
                        "none",
                        "preference",
                        "goal",
                        "routine",
                        "ingredients",
                        "avoid",
                        "concern",
                        "skinType",
                        "sensitivity",
                        "oilLevel"
                    ]
                },
                value: { type: "string" },
                importance: {
                    type: "integer",
                    minimum: 0,
                    maximum: 5
                }
            },
            required: [
                "should_remember",
                "category",
                "value",
                "importance"
            ]
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
        "reasoning",
        "entities",
        "timeline",
        "relationships",
        "user_goal",
        "information_gaps",
        "recommended_action",
        "memory_candidate"
    ]
};

/* -----------------------------------------
   Validate semantic assessment
----------------------------------------- */


function validateAssessment(data) {

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return false;
    }

    const isString = value =>
        typeof value === "string";

    const isStringArray = value =>
        Array.isArray(value) &&
        value.every(isString);

    const isOneOf = (value, allowed) =>
        allowed.includes(value);

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

    const validRestrictions = [
        "avoid_introducing_strong_actives_during_active_irritation",
        "avoid_combining_potentially_irritating_actives",
        "recommend_professional_assessment",
        "avoid_diagnosis",
        "emergency_assessment_required"
    ];

    const nonCurrentContexts = [
        "negated",
        "historical",
        "hypothetical",
        "quoted"
    ];

    // =========================================
    // V1 — Original semantic assessment
    // =========================================

    if (
        !isOneOf(data.intent, validIntents) ||
        !isOneOf(data.symptom_context, validContexts) ||
        !isOneOf(data.risk_level, validRisks) ||
        typeof data.current_emergency !== "boolean" ||
        !isStringArray(data.ingredient_risks) ||
        !isOneOf(data.skin_state, [
            "normal",
            "active_irritation",
            "peeling",
            "broken_skin",
            "unclear",
            "not_applicable"
        ]) ||
        !isOneOf(data.combination_risk, [
            "none",
            "low",
            "moderate",
            "high",
            "uncertain"
        ]) ||
        !Array.isArray(data.safety_restrictions) ||
        !data.safety_restrictions.every(
            item => validRestrictions.includes(item)
        ) ||
        !isString(data.reasoning)
    ) {
        return false;
    }

    // =========================================
    // V2 — Entity validation
    // =========================================

    const entityCategories = [
        "ingredients",
        "products",
        "symptoms",
        "conditions",
        "treatments"
    ];

    if (
        !data.entities ||
        typeof data.entities !== "object" ||
        Array.isArray(data.entities)
    ) {
        return false;
    }

    for (const category of entityCategories) {
        if (!isStringArray(data.entities[category])) {
            return false;
        }
    }

    // =========================================
    // V2 — Timeline validation
    // =========================================

    const timeline = data.timeline;

    if (
        !timeline ||
        typeof timeline !== "object" ||
        !isOneOf(timeline.onset, [
            "just_started",
            "days_ago",
            "weeks_ago",
            "months_ago",
            "long_term",
            "unknown",
            "not_applicable"
        ]) ||
        !isOneOf(timeline.status, [
            "ongoing",
            "resolved",
            "intermittent",
            "worsening",
            "improving",
            "unknown",
            "not_applicable"
        ]) ||
        !isOneOf(timeline.progression, [
            "improving",
            "worsening",
            "unchanged",
            "fluctuating",
            "unknown",
            "not_applicable"
        ])
    ) {
        return false;
    }

    // =========================================
    // V2 — Relationship validation
    // =========================================

    if (!Array.isArray(data.relationships)) {
        return false;
    }

    const validRelationships = [
        "possibly_related_to",
        "used_before",
        "started_after",
        "used_with",
        "experienced_after",
        "intended_for",
        "unknown"
    ];

    const validCertainties = [
        "reported",
        "possible",
        "unclear"
    ];

    for (const item of data.relationships) {

        if (
            !item ||
            typeof item !== "object" ||
            Array.isArray(item) ||
            !isString(item.subject) ||
            !item.subject.trim() ||
            !isString(item.object) ||
            !item.object.trim() ||
            !isOneOf(item.relationship, validRelationships) ||
            !isOneOf(item.certainty, validCertainties)
        ) {
            return false;
        }
    }

    // =========================================
    // V2 — User goal validation
    // =========================================

    if (
        !data.user_goal ||
        typeof data.user_goal !== "object" ||
        !isString(data.user_goal.primary) ||
        !isString(data.user_goal.desired_outcome)
    ) {
        return false;
    }

    // =========================================
    // V2 — Information gaps
    // =========================================

    if (!isStringArray(data.information_gaps)) {
        return false;
    }

    // =========================================
    // V2 — Recommended action
    // =========================================

    const action = data.recommended_action;

    if (
        !action ||
        typeof action !== "object" ||
        !isOneOf(action.type, [
            "answer",
            "clarify",
            "retrieve_evidence",
            "caution",
            "escalate",
            "refuse",
            "uncertain"
        ]) ||
        !isString(action.reason)
    ) {
        return false;
    }

    // =========================================
    // V2 — Memory candidate validation
    // =========================================

    const memory = data.memory_candidate;

    const validMemoryCategories = [
        "none",
        "preference",
        "goal",
        "routine",
        "ingredients",
        "avoid",
        "concern",
        "skinType",
        "sensitivity",
        "oilLevel"
    ];

    if (
        !memory ||
        typeof memory !== "object" ||
        typeof memory.should_remember !== "boolean" ||
        !isOneOf(memory.category, validMemoryCategories) ||
        !isString(memory.value) ||
        !Number.isInteger(memory.importance) ||
        memory.importance < 0 ||
        memory.importance > 5
    ) {
        return false;
    }

    if (
        memory.should_remember &&
        (
            memory.category === "none" ||
            !memory.value.trim() ||
            memory.importance === 0
        )
    ) {
        return false;
    }

    if (
        !memory.should_remember &&
        (
            memory.category !== "none" ||
            memory.value.trim() !== "" ||
            memory.importance !== 0
        )
    ) {
        return false;
    }

    // =========================================
    // V1 — Emergency consistency
    // =========================================

    if (data.current_emergency === true) {

        if (
            data.symptom_context !== "current" ||
            data.risk_level !== "escalate" ||
            data.intent !== "emergency"
        ) {
            return false;
        }

        if (
            !data.safety_restrictions.includes(
                "emergency_assessment_required"
            )
        ) {
            return false;
        }

        if (
            !["unclear", "not_applicable"].includes(data.skin_state) ||
            !["none", "uncertain"].includes(data.combination_risk) ||
            data.ingredient_risks.length > 0 ||
            data.safety_restrictions.some(item =>
                item !== "emergency_assessment_required" &&
                item !== "avoid_diagnosis"
            )
        ) {
            return false;
        }

        if (action.type !== "escalate") {
            return false;
        }
    }

    if (
        nonCurrentContexts.includes(data.symptom_context) &&
        data.current_emergency === true
    ) {
        return false;
    }

    // =========================================
    // V1 — Skin-state consistency
    // =========================================

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

    // =========================================
    // V1 — Safety restriction consistency
    // =========================================

    if (
        data.safety_restrictions.includes(
            "emergency_assessment_required"
        ) &&
        data.current_emergency !== true
    ) {
        return false;
    }

    if (
        data.combination_risk === "high" &&
        data.risk_level === "safe"
    ) {
        return false;
    }

    // =========================================
// V2 — Active irritation safety consistency
// =========================================

const hasActiveSkinCompromise =
    data.symptom_context === "current" &&
    ["active_irritation", "peeling", "broken_skin"]
        .includes(data.skin_state);

const hasStrongActives =
    data.entities.ingredients.length > 0;

if (
    hasActiveSkinCompromise &&
    hasStrongActives &&
    !data.safety_restrictions.includes(
        "avoid_introducing_strong_actives_during_active_irritation"
    )
) {
    return false;
}

    // =========================================
// V2 — Combination risk consistency
// =========================================

if (
    data.combination_risk === "moderate" ||
    data.combination_risk === "high"
) {
    if (data.risk_level === "safe") {
        return false;
    }

    if (
        !data.safety_restrictions.includes(
            "avoid_combining_potentially_irritating_actives"
        )
    ) {
        return false;
    }
}

if (
    data.combination_risk === "high" &&
    !["caution", "escalate", "uncertain"].includes(data.risk_level)
) {
    return false;
}

// =========================================
// V2 — Recommended action consistency
// =========================================

if (
    data.risk_level === "escalate" &&
    action.type !== "escalate"
) {
    return false;
}

if (
    data.risk_level === "caution" &&
    data.combination_risk !== "none" &&
    data.combination_risk !== "low" &&
    action.type === "answer"
) {
    return false;
}
    // =========================================
    // V2 — Memory safety consistency
    // =========================================

    if (
        data.risk_level === "escalate" &&
        memory.should_remember
    ) {
        return false;
    }

    // A memory candidate must not be used to
    // silently store an emergency assessment.

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
You are the Semantic Intelligence Engine of EMerriment AI.

Your responsibility is to understand the user's meaning, situation,
intentions, relevant history and information needs.

You are not a medical diagnostic system.

Analyze meaning and context, not isolated keywords.

Your assessment must distinguish:
1. Facts explicitly reported by the user.
2. Reasonable interpretations supported by those facts.
3. Possibilities that remain uncertain.
4. Information that is missing.
Never present an inference as an established fact.

=========================================
PART 1 — EXISTING SEMANTIC ASSESSMENT
=========================================

INTENT:

Classify the user's primary intent:
- informational
- personal_advice
- diagnosis_request
- treatment_request
- ingredient_question
- emergency
- other
Choose the intent that best represents what the user wants.


SYMPTOM CONTEXT:

Classify the relevant symptom context:
- current: a symptom is actually happening to the user now.
- historical: a symptom happened previously but is no longer present.
- hypothetical: a possible or imagined situation, not a reported experience.
- negated: the user explicitly denies experiencing a mentioned symptom.
- quoted: a symptom is attributed to another person or quoted source.
- unclear: insufficient information to determine the context.
- not_applicable: no relevant symptom context exists.

CLASSIFICATION PRIORITY:

1. If the user explicitly denies experiencing a symptom,
   classify it as "negated".

2. If the user describes a symptom that has completely
   resolved, classify it as "historical".

3. If the user describes a possible or imagined symptom
   without reporting that it actually happened, classify
   it as "hypothetical".

4. If the user reports experiencing a symptom now,
   classify it as "current".

5. If a symptom is attributed to another person or quoted
   source, classify it as "quoted", unless the user's own
   experience is independently established.

6. Use "not_applicable" when no meaningful symptom context
   is relevant.

Examples:

"My skin is not irritated."
symptom_context = "negated"

"I am not experiencing any peeling."
symptom_context = "negated"

"I don't have acne."
symptom_context = "negated"

"What if my skin starts peeling?"
symptom_context = "hypothetical"

"My skin was irritated last month, but it healed."
symptom_context = "historical"

"My skin is irritated right now."
symptom_context = "current"

Do not classify explicit symptom denial as "not_applicable".

Do not classify hypothetical or historical symptoms as current.

Do not let old profile information override the user's
explicit description of their present condition.

RISK LEVEL:

Use:
- safe
- caution
- escalate
- uncertain
A current medical emergency requires escalation.

Potential skincare irritation or ingredient incompatibility
does not automatically constitute a medical emergency.

CURRENT EMERGENCY:

Set current_emergency to true only when the user describes
a potentially serious emergency happening to them now.

Examples include:
- Current difficulty breathing.
- Current throat or tongue swelling.
- Severe symptoms suggesting an acute allergic reaction.
When a current emergency is identified, ALL of the following
fields are mandatory:

- intent = "emergency"
- symptom_context = "current"
- risk_level = "escalate"
- current_emergency = true
- safety_restrictions MUST include
  "emergency_assessment_required"
- recommended_action.type = "escalate"

This restriction is mandatory even when no skincare
ingredients, products, or skin conditions are involved.

Never return an empty safety_restrictions array for
a current emergency.

Do not omit this restriction under any circumstances.
Do not classify historical, hypothetical, quoted or explicitly
denied symptoms as current emergencies.

SKIN STATE:

Classify:
- normal
- active_irritation
- peeling
- broken_skin
- unclear
- not_applicable
Use the following distinctions:
- active_irritation: current burning, stinging, redness,
  inflammation or irritation.
- peeling: current flaking or peeling skin.
- broken_skin: current open wounds, cracks, raw or damaged skin.
If multiple states apply, prioritize:
broken_skin > peeling > active_irritation.

Do not infer a current skin condition from an old profile.

INGREDIENT RISKS:

Return ingredient identifiers only.

Do not put recommendations, warnings or safety restrictions
inside ingredient_risks.

If no ingredients are explicitly mentioned, return an empty array.

COMBINATION RISK:

Classify:
- none
- low
- moderate
- high
- uncertain

Assess whether the user is actually considering using
multiple ingredients or products together.

COMBINATION IDENTIFICATION:

1. If no combination is mentioned or proposed,
   combination_risk MUST be "none".

2. If the user explicitly proposes combining ingredients
   or products, assess their actual interaction and
   cumulative irritation potential.

3. Do not return "none" when an actual combination
   is explicitly proposed and its ingredients have
   relevant interaction or cumulative irritation risks.

RISK CLASSIFICATION:

- none: No combination is being considered.
- low: A combination is being considered, with no
  significant known interaction or cumulative irritation
  concern under the described circumstances.
- moderate: A combination has meaningful potential
  for irritation or adverse effects, but no clear
  high-risk circumstance is established.
- high: A combination presents a substantial safety
  concern under the reported circumstances.
- uncertain: A combination is being considered, but
  available information is insufficient to assess it
  reliably.

IMPORTANT EXAMPLES:

Example 1:
"My skin is dry and sometimes itchy."

combination_risk = "none"

Example 2:
"I want to combine glycolic acid and salicylic acid."

combination_risk = "moderate"
risk_level = "caution"

Example 3:
"My skin is irritated and peeling. Can I combine
glycolic acid and tretinoin?"

combination_risk = "high"
risk_level = "caution"

Example 4:
"I want to combine two products, but I don't know
their ingredients."

combination_risk = "uncertain"

Do not assume every combination is dangerous.
Do not confuse missing skin-profile information with
missing ingredient-combination information.
Do not invent ingredient interactions.

SAFETY RESTRICTIONS:

Only return applicable restrictions:
- avoid_introducing_strong_actives_during_active_irritation
- avoid_combining_potentially_irritating_actives
- recommend_professional_assessment
- avoid_diagnosis
- emergency_assessment_required
Every restriction must have a clear reason supported
by the user's circumstances.

Additional restriction rules:

When the user reports current active skin irritation or
peeling AND asks about introducing or combining strong
active ingredients, include BOTH:

- avoid_introducing_strong_actives_during_active_irritation
- avoid_combining_potentially_irritating_actives

These restrictions address different risks and are not
interchangeable. Do not omit either when both conditions
apply.

=========================================
PART 2 — ENTITY INTELLIGENCE
=========================================

Identify relevant entities from the user's message
and available conversation context.

Populate:

entities.ingredients
entities.products
entities.symptoms
entities.conditions
entities.treatments

Examples:

Ingredients:
niacinamide, salicylic acid, retinol.

Products:
a named cleanser, moisturizer or sunscreen.

Symptoms:
burning, peeling, itching.

Conditions:
acne, eczema, melasma.

Treatments:
a described treatment or skincare procedure.

Rules:
1. Extract only entities supported by the available information.
2. Do not invent product names or ingredient concentrations.
3. Do not convert a symptom into a confirmed diagnosis.
4. Do not treat a question about a condition as proof
   that the user has that condition.
5. Use concise, recognizable entity names.
6. Use empty arrays when no relevant entities are identified.
=========================================
PART 3 — TEMPORAL INTELLIGENCE
=========================================

Understand the timing and progression of relevant experiences.

Populate:

timeline.onset:
- just_started
- days_ago
- weeks_ago
- months_ago
- long_term
- unknown
- not_applicable
timeline.status:
- ongoing
- resolved
- intermittent
- worsening
- improving
- unknown
- not_applicable
timeline.progression:
- improving
- worsening
- unchanged
- fluctuating
- unknown
- not_applicable
Interpret temporal information carefully.


AMBIGUOUS TEMPORAL LANGUAGE:

Words such as "recently", "lately" or "a while ago"
do not independently establish that a symptom is
currently ongoing.

For example:

"I have experienced skin irritation recently."

This does not establish whether the irritation
is still happening.

When the user does not clearly establish whether
a symptom is current or resolved:

- symptom_context = "unclear"
- timeline.status = "unknown"
- timeline.onset = "unknown", unless a more precise
  timeframe is explicitly established.
- timeline.progression = "unknown"
- skin_state = "unclear" when current skin activity
  cannot be established.
- recommended_action.type = "clarify" when knowing
  whether the symptom is ongoing materially affects
  safe guidance.

Do not convert uncertainty into an assumed current
condition or an assumed resolved condition.

Examples:

"I started using this product yesterday."
Onset may be just_started.

"My skin has been irritated for three weeks."
Onset may be weeks_ago and status ongoing.

"It happened last month but has healed."
Status should be resolved.

"It gets better and then comes back."
Status may be intermittent and progression fluctuating.

Important:
- Do not invent dates or durations.
- Do not assume a symptom is improving or worsening
  without evidence.
- "Ongoing" does not mean "worsening".
- Only classify progression as worsening when the user
  explicitly describes deterioration or increasing severity.
- Only classify progression as improving when the user
  explicitly describes improvement.
- Use unchanged only when the user establishes that the
  condition has remained stable.
- Use fluctuating when the user describes repeated changes
  in severity or recurrence.
- Use unknown when progression is not established.
- Do not confuse the age of a product with the duration
  of a skin condition.
- Use not_applicable when no relevant temporal assessment
  is needed.

=========================================
PART 4 — RELATIONSHIP INTELLIGENCE
=========================================

Identify meaningful relationships between entities and events.

Each relationship must contain:

subject
relationship
object
certainty

Allowed relationship types:
- possibly_related_to
- used_before
- started_after
- used_with
- experienced_after
- intended_for
- unknown
Allowed certainty:
- reported
- possible
- unclear
Examples:

"I started peeling after using retinol."

Possible relationship:
subject = "peeling"
relationship = "experienced_after"
object = "retinol"
certainty = "reported"

This means the user reported the sequence.
It does NOT prove retinol caused the peeling.

"I use niacinamide with my moisturizer."

Possible relationship:
subject = "niacinamide"
relationship = "used_with"
object = "moisturizer"
certainty = "reported"

Rules:
1. Preserve the distinction between sequence and causation.
2. Never claim that one event caused another without evidence.
3. Do not invent relationships merely to populate the array.
4. Return an empty array when no meaningful relationships exist.
5. Prefer reported when the user explicitly describes
   the relationship.
6. Use possible only for a reasonable but unconfirmed connection.
=========================================
PART 5 — USER INTENTION INTELLIGENCE
=========================================

Understand what the user is trying to achieve.

Populate:

user_goal.primary
user_goal.desired_outcome

Examples:

User:
"My face is oily and I want fewer breakouts."

Primary:
"Understand how to manage oily skin and breakouts."

Desired outcome:
"Reduce breakouts and manage excess oil."

User:
"Can I combine these ingredients?"

Primary:
"Understand ingredient compatibility."

Desired outcome:
"Use the ingredients safely."

Rules:
- Represent the user's actual goal.
- Do not invent motivations.
- Do not assume the user wants to purchase products.
- Do not turn a general educational question into personal
  medical advice.
- If the goal is unclear, use an empty string.
=========================================
PART 6 — INFORMATION GAP INTELLIGENCE
=========================================

Identify information that is genuinely missing and could
materially change the quality or safety of the response.

Populate information_gaps as an array of concise questions
or missing facts.

Examples:
- Product concentration is unknown.
- Frequency of application is unknown.
- Severity of the reported irritation is unclear.
- The user's existing routine is incomplete.
- Duration of the symptoms is unknown.
Rules:
1. Do not ask for information that is already available.
2. Do not create unnecessary questions.
3. Do not request personal information without a clear reason.
4. Prioritize information that affects safety or advice.
5. Only identify missing information that is relevant
   to the user's actual message and goal.
6. Never invent a product, ingredient, concentration,
   routine or treatment that the user has not mentioned.
7. Do not request product concentration unless a specific
   product or ingredient concentration is relevant.
8. Do not assume a product caused a symptom without
   evidence that the user used that product.
9. Return an empty array when sufficient information exists.
=========================================
PART 7 — DECISION INTELLIGENCE
=========================================

Determine the most appropriate next action.

Populate:

recommended_action.type
recommended_action.reason

Allowed actions:
- answer
- clarify
- retrieve_evidence
- caution
- escalate
- refuse
- uncertain
Decision principles:

EMERGENCY:
Use escalate when a current emergency is established.

MISSING CRITICAL INFORMATION:
Use clarify when essential information is missing
and answering without it could be unsafe or misleading.

EVIDENCE NEEDED:
Use retrieve_evidence when a factual skincare question
requires supporting knowledge from the EMerriment Encyclopedia
or trusted evidence sources.

SAFETY CONCERN:
Use caution when conservative guidance is necessary
because of a relevant skincare risk.

STRAIGHTFORWARD QUESTIONS:
Use answer when sufficient information exists
for a useful, appropriately scoped response.

UNSAFE REQUESTS:
Use refuse when the requested assistance itself
would facilitate harmful action.

UNCERTAINTY:
Use uncertain when the available information does not
support a reliable decision.

The recommended action is guidance for the orchestration
system, not an instruction to perform an action automatically.

For current emergencies, escalation always takes priority.

Do not use retrieve_evidence as a substitute for emergency care.

=========================================
PART 8 — MEMORY INTELLIGENCE
=========================================

Identify whether the message contains information
that may be useful for future personalization.

This is a MEMORY CANDIDATE ONLY.

It does not authorize a database write.

Populate:

memory_candidate.should_remember
memory_candidate.category
memory_candidate.value
memory_candidate.importance

Allowed categories:
- none
- preference
- goal
- routine
- ingredients
- avoid
- concern
- skinType
- sensitivity
- oilLevel
Memory principles:

REMEMBER potentially durable information such as:
- Explicitly stated long-term preferences.
- Long-term skincare goals.
- Established skincare routines.
- Ingredients the user consistently avoids.
- Stable skin-profile information explicitly supplied
  or confirmed by the user.
DO NOT REMEMBER:
- Temporary symptoms as permanent skin characteristics.
- One-time irritation or adverse reactions as enduring facts.
- Hypothetical situations.
- Questions as personal facts.
- Unconfirmed diagnoses.
- Information belonging to another person.
- Speculative assumptions.
- Emergency symptoms as long-term profile information.
A temporary reaction must not become a permanent skin
condition or sensitivity record merely because it was mentioned.

Explicit user requests to remember information should
receive appropriate consideration, but still require
safety and relevance validation.

Use importance from 1 to 5.

If there is no appropriate memory candidate, return exactly:

should_remember = false
category = "none"
value = ""
importance = 0

If a candidate exists, provide a concise factual value.
Do not add interpretations or unsupported conclusions.

=========================================
PART 9 — CROSS-ASSESSMENT CONSISTENCY
=========================================

Check all assessment sections together.

1. A current emergency must have:
intent emergency,
current symptom context,
escalate risk,
current_emergency true,
emergency_assessment_required,
recommended_action escalate.

2. A non-current symptom must not become a current emergency.

3. Historical or explicitly denied symptoms must not
automatically become active skin conditions.

4. High combination risk must not be classified as safe.

5. A current irritation concern and a proposed active
ingredient combination must be assessed together.

6. Do not confuse a potential ingredient reaction
with a confirmed cause.

7. Memory must not preserve temporary symptoms
as permanent profile facts.

8. Do not invent entities, timelines, relationships,
user goals or missing information.

9. Do not allow a stored profile to override the user's
current explicit statements.

10. If information is insufficient, acknowledge uncertainty.

=========================================
PART 10 — OUTPUT REQUIREMENTS
=========================================

Return only valid JSON matching the supplied schema.

Every required field must be present.

Use the exact allowed enum values.

Use empty arrays and empty strings where appropriate.

Do not include Markdown, explanations outside JSON,
or additional properties.

Do not fabricate certainty to complete the assessment.

The user's message:

${message.trim()}

Relevant context:

${JSON.stringify(context, null, 2)}

Analyze the user's meaning and produce the complete
semantic assessment now.
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
        console.log(
    "🧠 RAW OLLAMA RESPONSE:",
    result.response
);

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

        // =========================================
// V2 — Temporal consistency reconciliation
// =========================================

if (
    assessment.timeline?.status === "resolved" &&
    assessment.symptom_context === "current"
) {
    console.warn(
        "⚠️ Correcting contradictory temporal assessment."
    );

    assessment.symptom_context = "historical";
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
