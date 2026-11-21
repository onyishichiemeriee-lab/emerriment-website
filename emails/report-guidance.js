/* =========================================
   EMerriment — educational guidance for the skin report
   -----------------------------------------
   Fixed, reviewed text keyed by the quiz's known answer values (never the
   visitor's own text, so nothing user-supplied is inserted). Educational
   starting points only: no diagnosis, no treatment promises, no product
   claims; each concern says when to see a professional.
========================================= */
"use strict";

const CONCERNS = {
    acne: {
        label: "Acne",
        points: [
            "Cleanse gently twice a day and avoid harsh scrubs — irritation can make breakouts look worse.",
            "Look for products labelled “non-comedogenic” so they are less likely to clog pores.",
            "Ingredients often discussed for acne include salicylic acid, benzoyl peroxide and adapalene. Introduce one at a time and patch test first.",
            "Try not to pick or squeeze spots; it raises the risk of marks and scarring."
        ],
        seeSomeone: "Painful, deep or scarring acne deserves a dermatologist's opinion — effective treatments exist."
    },
    hyperpigmentation: {
        label: "Hyperpigmentation",
        points: [
            "Daily broad-spectrum sunscreen is the foundation: without it, dark areas tend to return.",
            "Fading usually takes weeks to months, so judge progress over 8–12 weeks rather than days.",
            "Ingredients often discussed include niacinamide, vitamin C and azelaic acid. Start slowly to avoid irritation, which can itself darken skin.",
            "Avoid harsh scrubs and peels at home; gentle care protects your skin barrier."
        ],
        seeSomeone: "A spot that changes shape, colour or size should be checked by a doctor or dermatologist."
    },
    rosacea: {
        label: "Rosacea",
        points: [
            "Choose gentle, fragrance-free products and keep your routine short.",
            "Notice your triggers — heat, sun, spicy food and alcohol are common ones — and keep a simple diary.",
            "Use sunscreen daily; mineral formulas are often better tolerated by sensitive, redness-prone skin.",
            "Avoid hot water, rough cloths and strong exfoliants."
        ],
        seeSomeone: "Rosacea is best confirmed and managed with a dermatologist, who can recommend proven treatments."
    },
    eczema: {
        label: "Eczema",
        points: [
            "Moisturise generously, ideally within a few minutes after washing, to support your skin barrier.",
            "Use lukewarm (not hot) water and a gentle, fragrance-free cleanser.",
            "Keep a note of possible triggers such as fragrance, harsh soaps or certain fabrics.",
            "Pat your skin dry rather than rubbing it."
        ],
        seeSomeone: "Skin that cracks, weeps, becomes infected or keeps you awake needs medical care."
    }
};

CONCERNS["dark spots"] = { ...CONCERNS.hyperpigmentation, label: "Dark spots" };

const SKIN_TYPES = {
    oily: "Oily skin still needs moisture — a lightweight, oil-free gel moisturiser helps keep it balanced.",
    dry: "Dry skin often does best with a gentle cream cleanser and a richer moisturiser to hold in water.",
    combination: "Combination skin can be treated by zone: lighter textures where you are oily, more moisture where you are dry.",
    normal: "Normal skin mostly needs consistency: gentle cleansing, moisturiser and daily sunscreen.",
    sensitive: "Sensitive skin benefits from fewer products, fragrance-free formulas and patch testing anything new."
};

function key(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

// Returns { concern, skinTip } or nulls for unknown answers.
function guidanceFor({ concern, skinType } = {}) {
    return {
        concern: CONCERNS[key(concern)] || null,
        skinTip: SKIN_TYPES[key(skinType)] || null
    };
}

module.exports = { guidanceFor, CONCERNS, SKIN_TYPES };
