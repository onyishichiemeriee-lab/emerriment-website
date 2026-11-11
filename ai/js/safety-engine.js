/* =========================================
   EMerriment Safety Engine
   Phase 8A — Foundation
   ========================================= */

(function () {

    "use strict";

    const SafetyEngine = {

        /* -----------------------------------------
           Risk levels
        ----------------------------------------- */

        RISK_LEVELS: {
            SAFE: "safe",
            CAUTION: "caution",
            ESCALATE: "escalate",
            REFUSE: "refuse"
        },

        INGREDIENT_RISK_LEVELS: {
    SAFE: "safe",
    CAUTION: "caution",
    AVOID: "avoid",
    PROFESSIONAL_REVIEW: "professional_review"
},
        INGREDIENT_RISK_PRIORITY: {
            SAFE: 1,
            CAUTION: 2,
            PROFESSIONAL_REVIEW: 3,
            AVOID: 4
        },

                getHigherIngredientRisk(currentRisk, nextRisk) {
            const priority = this.INGREDIENT_RISK_PRIORITY;

            const currentPriority =
                priority[currentRisk.toUpperCase()] || 0;

            const nextPriority =
                priority[nextRisk.toUpperCase()] || 0;

            return nextPriority > currentPriority
                ? nextRisk
                : currentRisk;
        },
        
        /* -----------------------------------------
           Create a default safety result
        ----------------------------------------- */

        createResult() {

            return {
                level: this.RISK_LEVELS.SAFE,
                flags: [],
                reasons: [],
                actions: [],
                disclaimerRequired: false,
                escalate: false,
                blockRecommendation: false,
                medicalBoundary: false,
                medicalBoundaryMessage: null
            };

        },

        assessIngredient(ingredient, pregnancy = false, breastfeeding = false) {

            const safeIngredient = typeof ingredient === "string"
                ? ingredient.trim()
                : "";

            const normalizedIngredient = safeIngredient.toLowerCase();

            const knownIngredients = [
                "panthenol",
                "retinol",
                "retinyl palmitate",
                "tretinoin",
                "adapalene",
                "tazarotene",
                "trifarotene",
                "benzoyl peroxide",
                "azelaic acid",
                "salicylic acid",
                "glycolic acid"
            ];

            const isKnownIngredient =
                knownIngredients.includes(normalizedIngredient);

            const result = {
                ingredient: safeIngredient || null,
                riskLevel: isKnownIngredient
                    ? this.INGREDIENT_RISK_LEVELS.CAUTION
                    : this.INGREDIENT_RISK_LEVELS.PROFESSIONAL_REVIEW,
                flags: [],
                reasons: [],
                actions: []
            };

            const rules = [

                {
                    matches:
                        /^(retinol|retinyl palmitate)$/i.test(normalizedIngredient) &&
                        (pregnancy || breastfeeding),

                    riskLevel:
                        this.INGREDIENT_RISK_LEVELS.AVOID,

                    flag:
                        "retinol_retinyl_palmitate_pregnancy_breastfeeding",

                    reason:
                        "AAD advises avoiding retinol and retinyl palmitate during pregnancy or breastfeeding.",

                    action:
                        "avoid_and_seek_professional_guidance"
                },

                {
                    matches:
                        /^(tretinoin|adapalene|tazarotene|trifarotene)$/i.test(normalizedIngredient) &&
                        pregnancy,

                    riskLevel:
                        this.INGREDIENT_RISK_LEVELS.AVOID,

                    flag:
                        "topical_retinoid_pregnancy",

                    reason:
                        "Dermatology guidance recommends avoiding topical retinoids during pregnancy.",

                    action:
                        "avoid_and_seek_professional_guidance"
                },

                {
                    matches:
                        /^(benzoyl peroxide)$/i.test(normalizedIngredient) &&
                        pregnancy,

                    riskLevel:
                        this.INGREDIENT_RISK_LEVELS.CAUTION,

                    flag:
                        "benzoyl_peroxide_pregnancy",

                    reason:
                        "AAD and pregnancy guidance describe benzoyl peroxide as usable in limited amounts during pregnancy, with professional guidance recommended.",

                    action:
                        "use_limited_amount_and_confirm_with_professional"
                },

                {
                    matches:
                        /^(azelaic acid)$/i.test(normalizedIngredient) &&
                        pregnancy,

                    riskLevel:
                        this.INGREDIENT_RISK_LEVELS.CAUTION,

                    flag:
                        "azelaic_acid_pregnancy",

                    reason:
                        "AAD and MotherToBaby describe azelaic acid as an option that may be used during pregnancy when needed.",

                    action:
                        "confirm_with_professional"
                },

                {
                    matches:
                        /^(salicylic acid)$/i.test(normalizedIngredient) &&
                        pregnancy,

                    riskLevel:
                        this.INGREDIENT_RISK_LEVELS.CAUTION,

                    flag:
                        "salicylic_acid_pregnancy",

                    reason:
                        "Pregnancy guidance considers topical salicylic acid generally acceptable when used for a limited time, with professional guidance recommended.",

                    action:
                        "use_limited_amount_and_confirm_with_professional"
                },

                {
                    matches:
                        /^(glycolic acid)$/i.test(normalizedIngredient) &&
                        pregnancy,

                    riskLevel:
                        this.INGREDIENT_RISK_LEVELS.CAUTION,

                    flag:
                        "glycolic_acid_pregnancy",

                    reason:
                        "ACOG and MotherToBaby identify glycolic acid among topical acne ingredients that may be used during pregnancy when needed.",

                    action:
                        "confirm_with_professional"
                },

                {
    matches:
        /^tretinoin$/i.test(normalizedIngredient) &&
        breastfeeding,

    riskLevel:
        this.INGREDIENT_RISK_LEVELS.CAUTION,

    flag:
        "topical_tretinoin_breastfeeding",

    reason:
        "Topical tretinoin is poorly absorbed through the skin and is considered low risk during breastfeeding, but direct studies are limited. Avoid application to the nipple or areola and prevent infant contact with treated skin.",

    action:
        "avoid_nipple_application_and_infant_contact"
}

            ];

            rules.forEach(rule => {

                if (rule.matches) {

                    const nextRiskLevel =
    rule.riskLevel ||
    this.INGREDIENT_RISK_LEVELS.CAUTION;

const currentPriority =
    this.INGREDIENT_RISK_PRIORITY[
        result.riskLevel.toUpperCase()
    ] || 0;

const nextPriority =
    this.INGREDIENT_RISK_PRIORITY[
        nextRiskLevel.toUpperCase()
    ] || 0;

if (nextPriority > currentPriority) {
    result.riskLevel = nextRiskLevel;
}

                    if (rule.flag &&
                        !result.flags.includes(rule.flag)) {

                        result.flags.push(rule.flag);
                    }

                    if (rule.reason &&
                        !result.reasons.includes(rule.reason)) {

                        result.reasons.push(rule.reason);
                    }

                    if (rule.action &&
                        !result.actions.includes(rule.action)) {

                        result.actions.push(rule.action);
                    }
                }
            });

            if (result.flags.length === 0) {
    result.reasons.push(
        "No specific ingredient risk rule matched this ingredient and context. This is not proof of safety."
    );

    result.actions.push(
        "review_ingredient_evidence"
    );
}

            return result;

        },

                assessIngredientCombination(ingredients, context = {}) {
            const result = {
                ingredients: [],
                riskLevel:
                    this.INGREDIENT_RISK_LEVELS.PROFESSIONAL_REVIEW,
                flags: [],
                reasons: [],
                actions: []
            };

            if (!Array.isArray(ingredients)) {
    result.flags.push("invalid_ingredient_combination");

    result.reasons.push(
        "Ingredients must be provided as a list."
    );

    result.actions.push(
        "provide_valid_ingredient_list"
    );

    return result;
}

const normalizedIngredients = [
    ...new Set(
        ingredients
            .filter(item => typeof item === "string")
            .map(item => item.trim().toLowerCase())
            .filter(Boolean)
    )
];

result.ingredients = normalizedIngredients;

if (normalizedIngredients.length < 2) {
    result.flags.push("insufficient_ingredient_data");

    result.reasons.push(
        "At least two distinct ingredient names are needed. " +
        "Ingredient names alone cannot establish whether a product combination is safe."
    );

    result.actions.push(
        "review_ingredient_evidence"
    );

    return result;
}

const containsSalicylicAcid =
    normalizedIngredients.includes("salicylic acid");

const otherMedicatedActives = [
    "benzoyl peroxide",
    "retinol",
    "retinyl palmitate",
    "tretinoin",
    "adapalene",
    "tazarotene",
    "trifarotene",
    "glycolic acid",
    "azelaic acid"
];

const containsOtherMedicatedActive =
    normalizedIngredients.some(ingredient =>
        otherMedicatedActives.includes(ingredient)
    );

const clinicianDirected =
    context.clinicianDirected === true;

if (
    containsSalicylicAcid &&
    containsOtherMedicatedActive
) {
    result.riskLevel = this.getHigherIngredientRisk(
        result.riskLevel,
        this.INGREDIENT_RISK_LEVELS.PROFESSIONAL_REVIEW
    );

    result.flags.push(
        "salicylic_acid_with_other_medicated_topical"
    );

    result.reasons.push(
        "Guidance advises against applying salicylic acid with other medicated topical treatments to the same affected area unless directed by a clinician, because irritation may increase."
    );

    if (clinicianDirected) {
        result.flags.push("clinician_direction_reported");

        result.reasons.push(
            "You indicated that a clinician directed this combination. This context is recorded, but suitability for the specific products and skin condition still requires appropriate assessment."
        );

        result.actions.push(
            "follow_clinician_instructions_and_verify_product_details"
        );
    } else {
        result.actions.push(
            "confirm_same_area_combination_with_clinician"
        );
    }
} else {
    result.flags.push(
        "combination_requires_assessment"
    );

    if (clinicianDirected) {
        result.flags.push("clinician_direction_reported");

        result.reasons.push(
            "You indicated that a clinician directed this combination. That context has been recorded, but the combination has not been independently verified as appropriate for your specific products and skin condition."
        );

        result.actions.push(
            "follow_clinician_instructions_and_verify_product_details"
        );
    } else {
        result.reasons.push(
            "The combination has not been fully assessed. Ingredient names alone cannot establish safety; formulation, concentration, application area, and frequency may matter."
        );

        result.actions.push(
            "review_combination_evidence"
        );
    }
}

            if (context.irritatedSkin === true ||
                context.brokenSkin === true) {
                result.riskLevel = this.getHigherIngredientRisk(
    result.riskLevel,
    this.INGREDIENT_RISK_LEVELS.CAUTION
);

                result.flags.push("irritated_or_broken_skin");

                result.reasons.push(
                    "Irritated or broken skin may be more vulnerable to further irritation. " +
                    "The combination needs additional review."
                );

                result.actions.push(
                    "avoid_aggravating_irritation_and_seek_guidance"
                );
            }

            return result;
        },
        
        /* -----------------------------------------
           Analyze a user message
        ----------------------------------------- */

        analyze(message) {

    const result = this.createResult();

    if (!message || typeof message !== "string") {
        return result;
    }

    const text = message.trim();

    if (!text) {
        return result;
    }

    const lowerText = text.toLowerCase();

    /* -----------------------------------------
       Diagnosis request detection
       ----------------------------------------- */

    const diagnosisPatterns = [
        /\bdiagnose me\b/i,
        /\bdiagnose my\b/i,
        /\bwhat disease do i have\b/i,
        /\bwhat condition do i have\b/i,
        /\bwhat skin condition do i have\b/i,
        /\bwhat is wrong with my skin\b/i,
        /\bwhat's wrong with my skin\b/i,
        /\bdo i have\b.*\b(eczema|acne|psoriasis|melasma|rosacea|vitiligo|dermatitis|scabies)\b/i,
        /\bis this definitely\b/i,
        /\bis this certainly\b/i,
        /\bcan you tell me exactly what\b.*\bskin\b/i
    ];

    const isDiagnosisRequest =
        diagnosisPatterns.some(pattern => pattern.test(lowerText));

    if (isDiagnosisRequest) {

        result.level = this.RISK_LEVELS.CAUTION;

        result.flags.push("diagnosis_request");

        result.reasons.push(
            "User appears to be asking for a medical or skin diagnosis."
        );

        result.actions.push(
            "avoid_diagnosis"
        );

        result.disclaimerRequired = true;

        result.medicalBoundary = true;

result.medicalBoundaryMessage =
    "I can provide educational information about skin concerns, but I cannot diagnose a medical condition. A qualified healthcare professional can assess your skin and provide a diagnosis.";

    }

    /* -----------------------------------------
   Red-flag / escalation detection
   ----------------------------------------- */

const redFlagRules = [

    {
        pattern: /\b(severe pain|extreme pain)\b/i,
        flag: "severe_pain",
        reason:
            "User reports severe or extreme pain that may require professional medical assessment."
    },

    {
        pattern: /\b(getting rapidly worse|rapidly worsening|suddenly getting worse)\b/i,
        flag: "rapid_worsening",
        reason:
            "User reports rapid or sudden worsening of a skin concern."
    },

    {
        pattern: /\b(pus|pussy|drainage|leaking fluid)\b/i,
        flag: "infection_concern",
        reason:
            "User reports pus, drainage, or leaking fluid from a skin concern."
    },

    {
        pattern: /\b(significant swelling|severe swelling)\b/i,
        flag: "significant_swelling",
        reason:
            "User reports significant or severe swelling."
    },

    {
        pattern: /\b(high fever|fever)\b/i,
        flag: "fever",
        reason:
            "User reports fever together with a skin concern."
    },

    {
        pattern: /\b(trouble breathing|difficulty breathing)\b/i,
        flag: "breathing_difficulty",
        reason:
            "User reports difficulty breathing, which may require urgent medical attention."
    },

    {
        pattern: /\bswelling of (the )?(face|lips|tongue|throat)\b/i,
        flag: "facial_or_airway_swelling",
        reason:
            "User reports swelling involving the face, lips, tongue, or throat."
    },

    {
        pattern: /\bblisters all over\b/i,
        flag: "extensive_blistering",
        reason:
            "User reports extensive blistering that may require professional medical assessment."
    }

];

/* -----------------------------------------
   Persistent / unexplained concern detection
   ----------------------------------------- */

const persistentConcernRules = [

    {
        pattern: /\b(won't go away|doesn't go away|not going away)\b/i,
        flag: "persistent_concern",
        reason:
            "User reports a skin concern that is not resolving."
    },

    {
        pattern: /\b(keeps coming back|keeps returning|recurrent|recurring)\b/i,
        flag: "recurrent_concern",
        reason:
            "User reports a recurring or repeatedly returning skin concern."
    },

    {
        pattern: /\b(for weeks|for months|for a long time)\b/i,
        flag: "long_duration_concern",
        reason:
            "User reports a skin concern that has persisted for an extended period."
    },

    {
        pattern: /\b(unexplained|don't know what caused|dont know what caused)\b/i,
        flag: "unexplained_concern",
        reason:
            "User reports an unexplained skin concern."
    }

];

const matchedPersistentConcerns =
    persistentConcernRules.filter(rule =>
        rule.pattern.test(lowerText)
    );

if (matchedPersistentConcerns.length > 0) {

    if (result.level === this.RISK_LEVELS.SAFE) {
        result.level =
            this.RISK_LEVELS.CAUTION;
    }

    matchedPersistentConcerns.forEach(rule => {

        if (!result.flags.includes(rule.flag)) {

            result.flags.push(
                rule.flag
            );

        }

        if (!result.reasons.includes(rule.reason)) {

            result.reasons.push(
                rule.reason
            );

        }

    });

    result.actions.push(
        "recommend_professional_assessment"
    );

    result.disclaimerRequired =
        true;

    result.medicalBoundary =
        true;

    result.medicalBoundaryMessage =
        "A persistent or unexplained skin concern may need assessment by a qualified healthcare professional, especially if it is not improving or keeps returning.";
}

    /* -----------------------------------------
       Pregnancy / breastfeeding detection
       ----------------------------------------- */

    const higherRiskRules = [

        {
            pattern: /\b(pregnant|pregnancy|expecting a baby|expecting)\b/i,
            flag: "pregnancy",
            reason:
                "User indicates pregnancy, so skincare and ingredient recommendations should be handled more cautiously."
        },

        {
            pattern: /\b(breastfeeding|breast feeding|nursing|lactating)\b/i,
            flag: "breastfeeding",
            reason:
                "User indicates breastfeeding, so skincare and ingredient recommendations should be handled more cautiously."
        }

    ];

    const matchedHigherRisk =
        higherRiskRules.filter(rule =>
            rule.pattern.test(lowerText)
        );

    if (matchedHigherRisk.length > 0) {

        if (result.level === this.RISK_LEVELS.SAFE) {
            result.level =
                this.RISK_LEVELS.CAUTION;
        }

        matchedHigherRisk.forEach(rule => {

            if (!result.flags.includes(rule.flag)) {

                result.flags.push(
                    rule.flag
                );

            }

            if (!result.reasons.includes(rule.reason)) {

                result.reasons.push(
                    rule.reason
                );

            }

        });

        result.actions.push(
            "use_higher_safety_caution"
        );

        result.disclaimerRequired =
            true;

        result.medicalBoundaryMessage =
            "Because pregnancy or breastfeeding can affect which skincare ingredients and treatments are appropriate, ingredient and treatment choices should be checked with a qualified healthcare professional when there is uncertainty.";
    }

    /* -----------------------------------------
   Children / minors detection
   ----------------------------------------- */

const minorRules = [

    {
        pattern: /\b(my\s+(?:\d{1,2}\s*[- ]?\s*(?:year|yr)s?[- ]?old\s+)?(?:child|kid|baby|son|daughter))\b/i,
        flag: "minor",
        reason:
            "User appears to be asking about skincare for a child or minor."
    },

    {
        pattern: /\b(child|children|kid|kids|infant|toddler|newborn|teenager|teen|minor)\b/i,
        flag: "minor",
        reason:
            "User indicates that the skincare concern may involve a child or minor."
    },

    {
    pattern: /\b\d{1,2}\s*[- ]?\s*(?:year|yr)s?[- ]?old\b/i,
    flag: "minor",
    reason:
        "User indicates an age that may involve a child or minor."
}

];

/* -----------------------------------------
   Allergy / medication detection
   ----------------------------------------- */

const allergyMedicationRules = [

    {
        pattern: /\b(allergic to|allergy to|allergies to|allergic reaction|had an allergic reaction)\b/i,
        flag: "allergy_concern",
        reason:
            "User reports an allergy or possible allergic reaction, so ingredient recommendations should be handled cautiously."
    },

    {
        pattern: /\b(taking|currently taking|on|using)\b.{0,40}\b(medication|medicine|prescription|drug|antibiotic|steroid|isotretinoin|accutane)\b/i,
        flag: "medication_use",
        reason:
            "User indicates medication use, so skincare recommendations may need to account for medication-related considerations."
    },

    {
  pattern: /\b(?:(?:(?:this|that|the|a|an|new|my|another)\s+)?(?:skincare\s+)?(?:cream|product|serum|moisturizers?|moisturisers?|lotion|cleanser|toner|sunscreen|retinol(?:\s+product)?)\b.{0,120}\b(?:caused|causes|gave me|triggered|after\s+(?:i\s+)?(?:using|applying|i applied|i used)|when\s+i\s+(?:used|applied)|i\s+(?:used|applied|tried)\b)\b.{0,100}\b(?:rash|burning|burn|swelling|swollen|itching|itchy|hives|irritation|redness|stinging|reaction)\b|\b(?:my skin|my face|my body|i)\b.{0,60}\b(?:started|began|got|became|is|was|feels|felt|has become)\b.{0,50}\b(?:burning|burn|swelling|swollen|itching|itchy|hives|irritation|redness|stinging|rash)\b.{0,100}\b(?:after|since|when)\b.{0,40}\b(?:i\s+)?(?:applied|used|tried|put on)\b.{0,40}\b(?:(?:a|an|the|this|that|new|another|my)\s+)*(?:skincare\s+)?(?:product|cream|serum|moisturizers?|moisturisers?|lotion|cleanser|toner|sunscreen|retinol)\b)/i,
    flag: "possible_product_adverse_reaction",
    reason:
        "User reports a possible adverse skin reaction associated with a skincare product. The cause is not confirmed, so avoid recommending continued use without appropriate assessment."
}

];

const matchedAllergyMedicationRules =
    allergyMedicationRules.filter(rule =>
        rule.pattern.test(lowerText)
    );

if (matchedAllergyMedicationRules.length > 0) {

    if (result.level === this.RISK_LEVELS.SAFE) {
        result.level =
            this.RISK_LEVELS.CAUTION;
    }

    matchedAllergyMedicationRules.forEach(rule => {

        if (!result.flags.includes(rule.flag)) {
            result.flags.push(rule.flag);
        }

        if (!result.reasons.includes(rule.reason)) {
            result.reasons.push(rule.reason);
        }

    });

    result.actions.push(
        "use_allergy_medication_caution"
    );

    const hasPossibleProductReaction =
    matchedAllergyMedicationRules.some(
        rule =>
            rule.flag === "possible_product_adverse_reaction"
    );

if (hasPossibleProductReaction) {
    result.blockRecommendation = true;

    if (!result.actions.includes(
        "block_product_recommendations"
    )) {
        result.actions.push(
            "block_product_recommendations"
        );
    }
}

    result.disclaimerRequired =
        true;

    result.medicalBoundaryMessage =
        "Because allergies or medications can affect which skincare ingredients and treatments are appropriate, ingredient and treatment choices should be checked with a qualified healthcare professional when there is uncertainty.";
}

const matchedMinorRules =
    minorRules.filter(rule =>
        rule.pattern.test(lowerText)
    );

if (matchedMinorRules.length > 0) {

    if (result.level === this.RISK_LEVELS.SAFE) {
        result.level =
            this.RISK_LEVELS.CAUTION;
    }

    matchedMinorRules.forEach(rule => {

        if (!result.flags.includes(rule.flag)) {

            result.flags.push(
                rule.flag
            );

        }

        if (!result.reasons.includes(rule.reason)) {

            result.reasons.push(
                rule.reason
            );

        }

    });

    result.actions.push(
        "use_minor_safety_caution"
    );

    result.disclaimerRequired =
        true;

    result.medicalBoundaryMessage =
        "Skincare guidance for children and minors should be approached cautiously because age can affect which ingredients and treatments are appropriate. A qualified healthcare professional can provide age-appropriate guidance when needed.";
}

const matchedRedFlags =
    redFlagRules.filter(rule =>
        rule.pattern.test(lowerText)
    );

if (matchedRedFlags.length > 0) {

    result.level =
        this.RISK_LEVELS.ESCALATE;

    /*
     * Keep the general red_flag marker
     * for backward compatibility.
     */

    result.flags.push(
        "red_flag"
    );

    /*
     * Add specific safety categories.
     */

    matchedRedFlags.forEach(rule => {

        if (!result.flags.includes(rule.flag)) {

            result.flags.push(
                rule.flag
            );

        }

        if (!result.reasons.includes(rule.reason)) {

            result.reasons.push(
                rule.reason
            );

        }

    });

    result.actions.push(
        "recommend_medical_assessment"
    );

    result.disclaimerRequired =
        true;

    result.escalate =
        true;

    result.blockRecommendation =
        true;

}

            return result;

        }

    };

    window.SafetyEngine = SafetyEngine;

})();