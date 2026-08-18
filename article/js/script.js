// SUPABASE CONNECTION

const supabaseClient = window.supabaseClient;

const skincareKnowledge = {
  acne: {
title: "Acne",

explanation:
"Acne is a common skin condition that develops when pores become clogged with oil, dead skin cells and bacteria.",

causes:
"Excess oil production, hormonal fluctuations, genetics, inflammation and clogged pores.",

solution:
"Gentle cleansing, non-comedogenic skincare products, consistent moisturization and sunscreen use may help support acne-prone skin.",

prevention:
"Maintain a consistent skincare routine, avoid picking pimples and use products suitable for your skin type."
},

eczema: {
title: "Eczema",

explanation:
"Eczema is a condition that weakens the skin barrier and causes dry, itchy and inflamed skin.",

causes:
"Genetics, allergens, irritants, weather changes and immune system responses.",

solution:
"Regular moisturization, gentle skincare products and avoiding known triggers may help reduce flare-ups.",

prevention:
"Keep skin hydrated, avoid harsh products and identify personal triggers."
},

psoriasis: {
title: "Psoriasis",

explanation:
"Psoriasis is a chronic immune-mediated condition that causes thick, scaly patches on the skin.",

causes:
"Immune system dysfunction, genetics, infections, stress and certain medications.",

solution:
"Medical treatment is often needed. Moisturizers and trigger management may support skin comfort.",

prevention:
"Reduce stress, avoid smoking and follow treatment plans prescribed by healthcare professionals."
},

rosacea: {
title: "Rosacea",

explanation:
"Rosacea commonly causes facial redness, flushing and visible blood vessels.",

causes:
"Genetics, sun exposure, spicy foods, heat, alcohol and stress.",

solution:
"Gentle skincare, sunscreen use and avoiding personal triggers may help reduce symptoms.",

prevention:
"Identify triggers and protect skin from excessive sun exposure."
},

vitiligo: {
title: "Vitiligo",

explanation:
"Vitiligo is a condition where skin loses pigment due to destruction of melanocytes.",

causes:
"Autoimmune processes, genetics and possible environmental triggers.",

solution:
"Treatment options vary and should be discussed with a dermatologist.",

prevention:
"There is no known prevention, but sun protection is important."
},

melasma: {
title: "Melasma",

explanation:
"Melasma causes brown or gray patches on the skin, often on the face.",

causes:
"Sun exposure, hormonal changes and genetic predisposition.",

solution:
"Sun protection, topical treatments and professional care may help improve appearance.",

prevention:
"Use sunscreen daily and minimize excessive UV exposure."
},

scabies: {
title: "Scabies",

explanation:
"Scabies is a contagious skin infestation caused by microscopic mites.",

causes:
"Direct skin-to-skin contact with an infected person.",

solution:
"Prescription treatment is usually required to eliminate mites.",

prevention:
"Avoid close contact with infected individuals and wash clothing and bedding."
},

boils: {
title: "Boils",

explanation:
"Boils are painful skin infections that develop around hair follicles.",

causes:
"Bacterial infection, poor hygiene, friction and weakened immunity.",

solution:
"Warm compresses may help, while severe cases may require medical treatment.",

prevention:
"Practice good hygiene and avoid sharing personal items."
},

ringworm: {
title: "Ringworm",

explanation:
"Ringworm is a fungal infection that causes circular, itchy rashes.",

causes:
"Fungal organisms spread through people, animals or contaminated surfaces.",

solution:
"Antifungal treatments are commonly used.",

prevention:
"Keep skin clean and dry and avoid sharing towels."
},

hives: {
title: "Hives",

explanation:
"Hives are raised, itchy welts that appear suddenly on the skin.",

causes:
"Allergies, infections, medications, stress and temperature changes.",

solution:
"Identifying and avoiding triggers may help. Some cases require medical treatment.",

prevention:
"Reduce exposure to known triggers whenever possible."
},

seborrheicdermatitis: {
title: "Seborrheic Dermatitis",

explanation:
"Seborrheic dermatitis is a common skin condition that causes flaky, oily patches and redness, especially on the scalp and face.",

causes:
"Overgrowth of skin yeast, excess oil production, stress and genetics.",

solution:
"Medicated shampoos, gentle cleansing and moisturizing may help manage symptoms.",

prevention:
"Manage stress and maintain a consistent scalp and skincare routine."
},

contactdermatitis: {
title: "Contact Dermatitis",

explanation:
"Contact dermatitis occurs when the skin reacts to an irritant or allergen.",

causes:
"Fragrances, soaps, detergents, metals, plants and skincare products.",

solution:
"Identify and avoid triggers while using gentle skincare products.",

prevention:
"Patch test new products and avoid known irritants."
},

folliculitis: {
title: "Folliculitis",

explanation:
"Folliculitis is inflammation or infection of hair follicles that can resemble acne.",

causes:
"Bacteria, fungi, friction, shaving and sweating.",

solution:
"Keep the area clean and avoid further irritation. Some cases require medical treatment.",

prevention:
"Use clean razors and avoid tight clothing."
},

impetigo: {
title: "Impetigo",

explanation:
"Impetigo is a contagious bacterial skin infection common in children.",

causes:
"Bacterial infection entering through cuts, scratches or insect bites.",

solution:
"Medical treatment is often required to eliminate the infection.",

prevention:
"Practice good hygiene and avoid sharing personal items."
},

cellulitis: {
title: "Cellulitis",

explanation:
"Cellulitis is a bacterial infection affecting deeper layers of the skin.",

causes:
"Bacteria entering through cracks, wounds or broken skin.",

solution:
"Prompt medical attention is usually necessary.",

prevention:
"Clean wounds properly and protect damaged skin."
},

keratosispilaris: {
title: "Keratosis Pilaris",

explanation:
"Keratosis pilaris causes rough, small bumps often found on the arms and thighs.",

causes:
"Build-up of keratin around hair follicles.",

solution:
"Regular moisturization and gentle exfoliation may improve appearance.",

prevention:
"Keep skin hydrated and avoid overly harsh scrubbing."
},

coldsores: {
title: "Cold Sores",

explanation:
"Cold sores are small blisters typically appearing around the lips.",

causes:
"Herpes simplex virus infection.",

solution:
"Antiviral medications may help shorten outbreaks.",

prevention:
"Avoid sharing personal items during active outbreaks."
},

warts: {
title: "Warts",

explanation:
"Warts are non-cancerous skin growths caused by human papillomavirus (HPV).",

causes:
"Direct contact with HPV-infected skin or surfaces.",

solution:
"Various treatments can remove or reduce warts.",

prevention:
"Avoid touching warts and wear footwear in public showers."
},

athletesfoot: {
title: "Athlete's Foot",

explanation:
"Athlete's foot is a fungal infection affecting the feet.",

causes:
"Fungal growth in warm, moist environments.",

solution:
"Antifungal treatments and proper foot hygiene may help.",

prevention:
"Keep feet dry and avoid sharing footwear."
},

hyperpigmentation: {
title: "Hyperpigmentation",

explanation:
"Hyperpigmentation occurs when certain areas of skin become darker than surrounding skin.",

causes:
"Sun exposure, inflammation, acne and hormonal changes.",

solution:
"Sun protection and targeted skincare ingredients may help improve appearance.",

prevention:
"Use sunscreen daily and avoid picking skin lesions."
},

lupus: {
title: "Cutaneous Lupus",

explanation:
"Cutaneous lupus is an autoimmune condition that can affect the skin, often causing rashes and increased sensitivity to sunlight.",

causes:
"Autoimmune activity, genetics and environmental triggers.",

solution:
"Sun protection and medical management are often important.",

prevention:
"Protect skin from UV exposure and follow treatment recommendations."
},

scleroderma: {
title: "Scleroderma",

explanation:
"Scleroderma is an autoimmune condition that causes hardening and tightening of the skin.",

causes:
"Abnormal immune system activity and genetic factors.",

solution:
"Treatment focuses on symptom management and preventing complications.",

prevention:
"There is no known prevention, but early medical care may help."
},

dermatomyositis: {
title: "Dermatomyositis",

explanation:
"Dermatomyositis is a rare condition that affects both the skin and muscles.",

causes:
"Autoimmune dysfunction and genetic factors.",

solution:
"Medical treatment is usually necessary to manage symptoms.",

prevention:
"There is no known prevention."
},

pemphigus: {
title: "Pemphigus Vulgaris",

explanation:
"Pemphigus is a rare autoimmune disorder that causes painful blisters on the skin and mucous membranes.",

causes:
"Autoimmune attack on skin cells.",

solution:
"Requires medical treatment and monitoring.",

prevention:
"There is no known prevention."
},

bullouspemphigoid: {
title: "Bullous Pemphigoid",

explanation:
"Bullous pemphigoid is an autoimmune condition that causes large fluid-filled blisters.",

causes:
"Immune system dysfunction.",

solution:
"Medical treatment is usually required.",

prevention:
"There is no known prevention."
},

albinism: {
title: "Albinism",

explanation:
"Albinism is a genetic condition characterized by reduced or absent melanin production.",

causes:
"Inherited genetic mutations.",

solution:
"Sun protection and regular skin monitoring are important.",

prevention:
"Albinism cannot be prevented."
},

postinflammatoryhyperpigmentation: {
title: "Post-Inflammatory Hyperpigmentation",

explanation:
"PIH refers to dark marks left behind after inflammation or injury to the skin.",

causes:
"Acne, eczema, burns, insect bites and skin irritation.",

solution:
"Sun protection and targeted skincare may help improve appearance over time.",

prevention:
"Avoid picking or irritating skin lesions."
},

freckles: {
title: "Freckles",

explanation:
"Freckles are small pigmented spots that commonly appear on sun-exposed skin.",

causes:
"Genetics and sun exposure.",

solution:
"Usually harmless and do not require treatment.",

prevention:
"Use sunscreen and limit excessive sun exposure."
},

lentigines: {
title: "Lentigines",

explanation:
"Lentigines are flat brown spots often associated with aging and sun exposure.",

causes:
"Chronic UV exposure and aging.",

solution:
"Some cosmetic treatments may reduce their appearance.",

prevention:
"Daily sunscreen use is recommended."
},

sunburn: {
title: "Sunburn",

explanation:
"Sunburn is skin damage caused by excessive ultraviolet radiation exposure.",

causes:
"Too much sun exposure without adequate protection.",

solution:
"Cool compresses, moisturizers and hydration may help comfort the skin.",

prevention:
"Use sunscreen, protective clothing and seek shade."
},

blackheads: {
title: "Blackheads",

explanation:
"Blackheads are open clogged pores that appear dark because the contents are exposed to air.",

causes:
"Excess oil production, dead skin cells and clogged pores.",

solution:
"Salicylic acid, gentle exfoliation and consistent cleansing may help.",

prevention:
"Maintain a regular skincare routine and avoid pore-clogging products."
},

whiteheads: {
title: "Whiteheads",

explanation:
"Whiteheads are clogged pores that remain closed beneath the skin surface.",

causes:
"Oil buildup, dead skin cells and clogged follicles.",

solution:
"Gentle exfoliation and acne-friendly skincare products may help.",

prevention:
"Cleanse regularly and avoid heavy pore-clogging products."
},

cysticacne: {
title: "Cystic Acne",

explanation:
"Cystic acne is a severe form of acne that develops deep beneath the skin.",

causes:
"Hormonal fluctuations, genetics and inflammation.",

solution:
"Professional medical treatment is often recommended.",

prevention:
"Early treatment may help reduce complications and scarring."
},

nodularacne: {
title: "Nodular Acne",

explanation:
"Nodular acne causes large, painful bumps beneath the skin.",

causes:
"Deep inflammation and excess oil production.",

solution:
"Medical treatment is often necessary.",

prevention:
"Seek treatment early to reduce the risk of scarring."
},

fungalacne: {
title: "Fungal Acne",

explanation:
"Fungal acne is caused by yeast overgrowth and often appears as itchy, uniform bumps.",

causes:
"Overgrowth of Malassezia yeast, sweating and humid environments.",

solution:
"Antifungal treatment may be helpful in some cases.",

prevention:
"Keep skin clean and avoid prolonged damp conditions."
},

acnescars: {
title: "Acne Scars",

explanation:
"Acne scars can develop when deeper skin layers are damaged during inflammation.",

causes:
"Severe acne, picking pimples and delayed treatment.",

solution:
"Professional treatments may help improve appearance.",

prevention:
"Avoid picking pimples and treat acne early."
},

ingrownhair: {
title: "Ingrown Hair",

explanation:
"An ingrown hair occurs when a hair grows back into the skin instead of outward.",

causes:
"Shaving, waxing, curly hair and friction.",

solution:
"Gentle exfoliation and proper shaving techniques may help.",

prevention:
"Use sharp razors and shave in the direction of hair growth."
},

milia: {
title: "Milia",

explanation:
"Milia are small white cysts that form when keratin becomes trapped beneath the skin.",

causes:
"Trapped skin cells and keratin buildup.",

solution:
"They often resolve naturally, but professional removal may be needed.",

prevention:
"Gentle exfoliation may help reduce buildup."
},

skintags: {
title: "Skin Tags",

explanation:
"Skin tags are small, soft growths that commonly develop in skin folds.",

causes:
"Friction, genetics and aging.",

solution:
"They are harmless but can be removed by a healthcare professional.",

prevention:
"There is no guaranteed prevention."
},

sebaceousfilaments: {
title: "Sebaceous Filaments",

explanation:
"Sebaceous filaments are natural structures that help move oil to the skin surface.",

causes:
"Normal oil production and pore anatomy.",

solution:
"Regular cleansing and salicylic acid may reduce their appearance.",

prevention:
"They cannot be permanently removed because they are a normal skin feature."
}
};

skincareKnowledge.pimples =
skincareKnowledge.acne;

skincareKnowledge.pimple =
skincareKnowledge.acne;

skincareKnowledge.zits =
skincareKnowledge.acne;

skincareKnowledge.zit =
skincareKnowledge.acne;

skincareKnowledge.acnescar =
skincareKnowledge.acnescars;

skincareKnowledge.ingrownhairs =
skincareKnowledge.ingrownhair;

skincareKnowledge.skintag =
skincareKnowledge.skintags;

skincareKnowledge.niacinamide = {
title: "Niacinamide",

explanation:
"Niacinamide is a form of Vitamin B3 commonly used in skincare to support the skin barrier and improve the appearance of uneven skin tone.",

causes:
"People often use niacinamide to address oiliness, enlarged pores and uneven skin tone.",

solution:
"It can be incorporated into a skincare routine through serums, moisturizers and other skincare products.",

prevention:
"Patch test new products and introduce them gradually."
};

skincareKnowledge.vitaminc = {
title: "Vitamin C",

explanation:
"Vitamin C is an antioxidant that helps protect the skin from environmental stressors and improve the appearance of dull skin.",

causes:
"It is commonly used for hyperpigmentation, uneven skin tone and antioxidant support.",

solution:
"Apply Vitamin C products consistently and pair with sunscreen for daytime protection.",

prevention:
"Store products properly to reduce oxidation."
};

skincareKnowledge.retinol = {
title: "Retinol",

explanation:
"Retinol is a Vitamin A derivative that promotes skin cell turnover and is widely used in anti-aging and acne routines.",

causes:
"People use retinol to address acne, fine lines and uneven skin texture.",

solution:
"Start slowly and gradually increase use to improve tolerance.",

prevention:
"Use sunscreen daily because retinol may increase sun sensitivity."
};

skincareKnowledge.retinal = {
title: "Retinal",

explanation:
"Retinal is a Vitamin A derivative that converts efficiently into retinoic acid within the skin.",

causes:
"It is often used for acne, skin texture and signs of aging.",

solution:
"Introduce slowly and follow product instructions.",

prevention:
"Use sunscreen and avoid overuse."
};

skincareKnowledge.hyaluronicacid = {
title: "Hyaluronic Acid",

explanation:
"Hyaluronic acid is a humectant that attracts water and helps improve skin hydration.",

causes:
"It is commonly used to support dehydrated or dry skin.",

solution:
"Apply to slightly damp skin and follow with moisturizer.",

prevention:
"Maintain a consistent hydration-focused routine."
};

skincareKnowledge.ceramides = {
title: "Ceramides",

explanation:
"Ceramides are natural lipids that help strengthen and protect the skin barrier.",

causes:
"Low ceramide levels may contribute to dryness and barrier disruption.",

solution:
"Use moisturizers containing ceramides to support barrier function.",

prevention:
"Avoid excessive exfoliation and harsh cleansers."
};

skincareKnowledge.salicylicacid = {
title: "Salicylic Acid",

explanation:
"Salicylic acid is a beta hydroxy acid (BHA) that helps unclog pores and remove excess oil.",

causes:
"It is commonly used for acne, blackheads and oily skin.",

solution:
"Use as directed in cleansers, toners or treatments.",

prevention:
"Avoid excessive use that may cause irritation."
};

skincareKnowledge.glycolicacid = {
title: "Glycolic Acid",

explanation:
"Glycolic acid is an alpha hydroxy acid (AHA) that exfoliates the skin surface.",

causes:
"It is commonly used to improve texture and brightness.",

solution:
"Use gradually and monitor skin tolerance.",

prevention:
"Always wear sunscreen when using exfoliating acids."
};

skincareKnowledge.lacticacid = {
title: "Lactic Acid",

explanation:
"Lactic acid is a gentle AHA that exfoliates while helping improve hydration.",

causes:
"It is often used for dullness and rough texture.",

solution:
"Introduce slowly and follow with moisturizer.",

prevention:
"Use sunscreen daily."
};

skincareKnowledge.azelaicacid = {
title: "Azelaic Acid",

explanation:
"Azelaic acid is a multifunctional ingredient used for acne and uneven skin tone.",

causes:
"It is commonly chosen for acne-prone and sensitive skin.",

solution:
"Apply consistently according to product instructions.",

prevention:
"Patch test new products before widespread use."
};

skincareKnowledge.vitaminc =
skincareKnowledge.vitaminc;

skincareKnowledge.hyaluronic =
skincareKnowledge.hyaluronicacid;

skincareKnowledge.salicylic =
skincareKnowledge.salicylicacid;

skincareKnowledge.glycolic =
skincareKnowledge.glycolicacid;

skincareKnowledge.lactic =
skincareKnowledge.lacticacid;

skincareKnowledge.azelaic =
skincareKnowledge.azelaicacid;

skincareKnowledge.benzoylperoxide = {
title: "Benzoyl Peroxide",
explanation: "Benzoyl peroxide is a popular acne-fighting ingredient that helps reduce acne-causing bacteria.",
causes: "Often used when dealing with inflammatory acne.",
solution: "Use according to product instructions and start slowly.",
prevention: "Avoid overuse to reduce irritation."
};

skincareKnowledge.peptides = {
title: "Peptides",
explanation: "Peptides are short chains of amino acids that support skin repair and firmness.",
causes: "Commonly used in anti-aging skincare.",
solution: "Can be incorporated into moisturizers and serums.",
prevention: "Use consistently for best results."
};

skincareKnowledge.bakuchiol = {
title: "Bakuchiol",
explanation: "Bakuchiol is a plant-derived ingredient often used as an alternative to retinol.",
causes: "Used for skin texture and signs of aging.",
solution: "Apply consistently according to product directions.",
prevention: "Patch test new products."
};

skincareKnowledge.squalane = {
title: "Squalane",
explanation: "Squalane is a lightweight moisturizing ingredient that supports skin hydration.",
causes: "Used to improve dryness and support the skin barrier.",
solution: "Apply after water-based products.",
prevention: "Choose products suitable for your skin type."
};

skincareKnowledge.panthenol = {
title: "Panthenol",
explanation: "Panthenol, also called Pro-Vitamin B5, helps soothe and hydrate the skin.",
causes: "Often used for irritation and dryness.",
solution: "Use in moisturizers and barrier-support products.",
prevention: "Maintain a gentle skincare routine."
};

skincareKnowledge.zincpca = {
title: "Zinc PCA",
explanation: "Zinc PCA helps manage excess oil and supports acne-prone skin.",
causes: "Commonly used in oily skin formulations.",
solution: "Use as part of a balanced skincare routine.",
prevention: "Avoid harsh over-cleansing."
};

skincareKnowledge.kojicacid = {
title: "Kojic Acid",
explanation: "Kojic acid is used to improve the appearance of hyperpigmentation and dark spots.",
causes: "Frequently included in brightening products.",
solution: "Use consistently and combine with sunscreen.",
prevention: "Protect skin from UV exposure."
};

skincareKnowledge.tranexamicacid = {
title: "Tranexamic Acid",
explanation: "Tranexamic acid is often used to improve the appearance of melasma and discoloration.",
causes: "Targets uneven skin tone concerns.",
solution: "Use consistently as directed.",
prevention: "Use sunscreen daily."
};

skincareKnowledge.alphaarbutin = {
title: "Alpha Arbutin",
explanation: "Alpha Arbutin helps improve the appearance of uneven skin tone.",
causes: "Often used for dark spots and pigmentation concerns.",
solution: "Apply consistently and pair with sun protection.",
prevention: "Avoid excessive sun exposure."
};

skincareKnowledge.sulfur = {
title: "Sulfur",
explanation: "Sulfur helps absorb excess oil and is commonly used in acne treatments.",
causes: "Often chosen for oily and acne-prone skin.",
solution: "Use according to product instructions.",
prevention: "Avoid excessive application."
};

skincareKnowledge.centellaasiatica = {
title: "Centella Asiatica",
explanation: "Centella Asiatica is a soothing botanical ingredient often used for sensitive skin.",
causes: "Commonly used for redness and irritation.",
solution: "Can be incorporated into calming skincare routines.",
prevention: "Avoid known skin irritants."
};

skincareKnowledge.greentea = {
title: "Green Tea",
explanation: "Green tea contains antioxidants that help support healthy-looking skin.",
causes: "Used to calm and protect the skin.",
solution: "Apply through serums, toners or moisturizers.",
prevention: "Maintain a consistent skincare routine."
};

skincareKnowledge.allantoin = {
title: "Allantoin",
explanation: "Allantoin is a soothing ingredient that helps support skin comfort.",
causes: "Often used in products for sensitive skin.",
solution: "Use in moisturizers and calming treatments.",
prevention: "Avoid overly harsh skincare products."
};

skincareKnowledge.urea = {
title: "Urea",
explanation: "Urea helps hydrate and soften rough or dry skin.",
causes: "Often used for dryness and keratosis pilaris.",
solution: "Apply regularly as part of a moisturizing routine.",
prevention: "Keep skin consistently hydrated."
};

skincareKnowledge.mandelicacid = {
title: "Mandelic Acid",
explanation: "Mandelic acid is a gentle exfoliating acid often used for acne-prone skin.",
causes: "Used to improve texture and support exfoliation.",
solution: "Introduce gradually.",
prevention: "Use sunscreen daily."
};

skincareKnowledge.licoriceroot = {
title: "Licorice Root Extract",
explanation: "Licorice root extract is commonly used for brightening and soothing the skin.",
causes: "Frequently included in pigmentation products.",
solution: "Use consistently as directed.",
prevention: "Combine with sunscreen."
};

skincareKnowledge.charcoal = {
title: "Charcoal",
explanation: "Charcoal is used in skincare products to help absorb excess oil and impurities.",
causes: "Commonly found in masks and cleansers.",
solution: "Use according to product instructions.",
prevention: "Avoid overuse if skin becomes dry."
};

skincareKnowledge.oatextract = {
title: "Oat Extract",
explanation: "Oat extract helps soothe and support sensitive skin.",
causes: "Often used in eczema-friendly products.",
solution: "Apply regularly through moisturizers and creams.",
prevention: "Avoid known skin triggers."
};

skincareKnowledge.glycerin = {
title: "Glycerin",
explanation: "Glycerin is a humectant that attracts water into the skin.",
causes: "Commonly used to improve hydration.",
solution: "Use in moisturizers and hydrating serums.",
prevention: "Maintain a consistent skincare routine."
};

skincareKnowledge.caffeine = {
title: "Caffeine",
explanation: "Caffeine is commonly used in skincare products targeting puffiness and tired-looking skin.",
causes: "Frequently included in eye care products.",
solution: "Apply according to product instructions.",
prevention: "Maintain healthy sleep habits."
};

skincareKnowledge.morningroutine = {
title: "Morning Skincare Routine",

explanation:
"A morning skincare routine focuses on protecting and hydrating the skin throughout the day.",

causes:
"Skin is exposed to UV rays, pollution and environmental stressors during the day.",

solution:
"Cleanser → Moisturizer → Sunscreen SPF 30+",

prevention:
"Apply sunscreen daily and reapply when necessary."
};

skincareKnowledge.nightroutine = {
title: "Night Skincare Routine",

explanation:
"A night skincare routine focuses on cleansing and supporting skin repair while sleeping.",

causes:
"Skin naturally repairs itself during sleep.",

solution:
"Cleanser → Treatment Serum → Moisturizer",

prevention:
"Remove makeup before bed and stay consistent."
};

skincareKnowledge.acneroutine = {
title: "Acne Skincare Routine",

explanation:
"An acne routine helps manage breakouts while supporting the skin barrier.",

causes:
"Acne is influenced by oil production, hormones, inflammation and bacteria.",

solution:
"Salicylic Acid Cleanser → Lightweight Moisturizer → Sunscreen",

prevention:
"Avoid picking pimples and use non-comedogenic products."
};

skincareKnowledge.oilyskinroutine = {
title: "Oily Skin Routine",

explanation:
"Oily skin routines focus on balancing excess oil without over-drying the skin.",

causes:
"Genetics, hormones and environmental factors can increase oil production.",

solution:
"Gentle Cleanser → Niacinamide Serum → Moisturizer → Sunscreen",

prevention:
"Avoid harsh cleansers that can trigger more oil production."
};

skincareKnowledge.dryskinroutine = {
title: "Dry Skin Routine",

explanation:
"Dry skin routines focus on hydration and strengthening the skin barrier.",

causes:
"Low oil production, weather and barrier damage.",

solution:
"Hydrating Cleanser → Hyaluronic Acid → Moisturizer → Sunscreen",

prevention:
"Avoid over-exfoliation and harsh products."
};

skincareKnowledge.combinationskinroutine = {
title: "Combination Skin Routine",

explanation:
"Combination skin has both oily and dry areas requiring balanced care.",

causes:
"Different oil production levels across the face.",

solution:
"Gentle Cleanser → Lightweight Moisturizer → Sunscreen",

prevention:
"Use products suitable for multiple skin needs."
};

skincareKnowledge.sensitiveskinroutine = {
title: "Sensitive Skin Routine",

explanation:
"Sensitive skin routines focus on minimizing irritation and protecting the skin barrier.",

causes:
"Weakened skin barrier, allergies or environmental triggers.",

solution:
"Fragrance-Free Cleanser → Ceramide Moisturizer → Sunscreen",

prevention:
"Patch test new products before full use."
},

searchKnowledge.teenskincareroutine = {
title: "Teen Skincare Routine",

explanation:
"Teen skincare should focus on simplicity, consistency and sun protection.",

causes:
"Hormonal changes can increase oil production and acne.",

solution:
"Cleanser → Moisturizer → Sunscreen",

prevention:
"Avoid using too many active ingredients at once."
},

searchKnowledge.hyperpigmentationroutine = {
title: "Hyperpigmentation Routine",

explanation:
"This routine focuses on improving uneven skin tone and dark spots.",

causes:
"Sun exposure, acne and inflammation commonly contribute to pigmentation.",

solution:
"Vitamin C → Sunscreen → Niacinamide → Moisturizer",

prevention:
"Daily sunscreen is essential."
},

searchKnowledge.antiagingroutine = {
title: "Anti-Aging Routine",

explanation:
"Anti-aging routines focus on protecting skin and supporting healthy aging.",

causes:
"Sun exposure, genetics and natural aging processes.",

solution:
"Vitamin C → Sunscreen (AM) | Retinol → Moisturizer (PM)",

prevention:
"Consistent sunscreen use is one of the most important habits."
},

searchKnowledge.doublecleansing = {
title: "Double Cleansing",

explanation:
"Double cleansing uses an oil-based cleanser followed by a water-based cleanser.",

causes:
"Useful for removing sunscreen, makeup and excess oil.",

solution:
"Oil Cleanser → Gentle Water-Based Cleanser",

prevention:
"Do not over-cleanse if skin becomes irritated."
},

searchKnowledge.patchtesting = {
title: "Patch Testing",

explanation:
"Patch testing helps determine whether a product may irritate your skin.",

causes:
"New skincare ingredients may trigger reactions in some individuals.",

solution:
"Apply a small amount to a discreet area before full use.",

prevention:
"Always patch test new products."
},

searchKnowledge.exfoliation = {
title: "Exfoliation",

explanation:
"Exfoliation removes dead skin cells and may improve skin texture.",

causes:
"Dead skin naturally accumulates on the surface.",

solution:
"Use gentle exfoliants according to product instructions.",

prevention:
"Avoid excessive exfoliation."
},

searchKnowledge.overexfoliation = {
title: "Over-Exfoliation",

explanation:
"Over-exfoliation occurs when the skin barrier becomes damaged from excessive exfoliation.",

causes:
"Using too many acids, scrubs or treatments too frequently.",

solution:
"Stop exfoliating temporarily and focus on hydration.",

prevention:
"Use exfoliating products in moderation."
},

searchKnowledge.sunscreen = {
title: "Sunscreen",

explanation:
"Sunscreen helps protect the skin from harmful UV radiation.",

causes:
"UV exposure contributes to sunburn, aging and pigmentation.",

solution:
"Apply SPF 30 or higher daily.",

prevention:
"Reapply throughout the day when needed."
}

skincareKnowledge.amroutine =
skincareKnowledge.morningroutine;

skincareKnowledge.pmroutine =
skincareKnowledge.nightroutine;

skincareKnowledge.spf =
skincareKnowledge.sunscreen;

skincareKnowledge.sunprotection =
skincareKnowledge.sunscreen;

skincareKnowledge.acneroutine =
skincareKnowledge.acneroutine;

skincareKnowledge.oilyskin =
skincareKnowledge.oilyskinroutine;

skincareKnowledge.dryskin =
skincareKnowledge.dryskinroutine;

skincareKnowledge.sensitiveskin =
skincareKnowledge.sensitiveskinroutine;

skincareKnowledge.skincaremyth1 = {
title: "Myth: Oily Skin Doesn't Need Moisturizer",

explanation:
"This is false. All skin types need hydration, including oily skin.",

causes:
"Many people confuse oil with hydration.",

solution:
"Use a lightweight, non-comedogenic moisturizer.",

prevention:
"Choose products suited to your skin type."
},

skincareKnowledge.skincaremyth2 = {
title: "Myth: Acne Is Caused By Dirty Skin",

explanation:
"Acne is influenced by hormones, inflammation, oil production and genetics.",

causes:
"Over-cleansing can actually worsen irritation.",

solution:
"Use gentle cleansing and appropriate acne treatments.",

prevention:
"Avoid scrubbing the skin aggressively."
},

skincareKnowledge.skincaremyth3 = {
title: "Myth: Sunscreen Is Only Needed On Sunny Days",

explanation:
"UV rays can reach the skin even on cloudy days.",

causes:
"Many people underestimate daily UV exposure.",

solution:
"Apply sunscreen every day.",

prevention:
"Make SPF part of your routine."
},

skincareKnowledge.skincaremyth4 = {
title: "Myth: Drinking Water Cures Acne",

explanation:
"Hydration supports health but does not directly cure acne.",

causes:
"Acne is a complex skin condition.",

solution:
"Follow a consistent acne routine.",

prevention:
"Focus on evidence-based skincare."
},

skincareKnowledge.skincaremyth5 = {
title: "Myth: Expensive Products Are Always Better",

explanation:
"Price does not always determine effectiveness.",

causes:
"Marketing often influences perceptions.",

solution:
"Focus on ingredients and suitability.",

prevention:
"Research products before purchasing."
},

skincareKnowledge.skincaremyth6 = {
title: "Myth: Natural Products Are Always Safe",

explanation:
"Natural ingredients can still cause irritation or allergies.",

causes:
"Many plant extracts contain potential irritants.",

solution:
"Patch test all new products.",

prevention:
"Don't assume natural means risk-free."
},

skincareKnowledge.skincaremyth7 = {
title: "Myth: You Can Shrink Pores Permanently",

explanation:
"Pore size is largely determined by genetics.",

causes:
"Marketing claims often exaggerate results.",

solution:
"Keep pores clean and use niacinamide or salicylic acid.",

prevention:
"Maintain realistic expectations."
},

searchKnowledge.skincaremyth8 = {
title: "Myth: Tanning Clears Acne",

explanation:
"Sun exposure may temporarily mask redness but can worsen skin damage.",

causes:
"UV exposure can increase pigmentation and aging.",

solution:
"Use proper acne treatments instead.",

prevention:
"Protect skin with sunscreen."
},

skincareKnowledge.skincaremistake1 = {
title: "Sleeping With Makeup",

explanation:
"Leaving makeup on overnight may contribute to clogged pores and irritation.",

causes:
"Makeup, oil and dirt accumulate on the skin.",

solution:
"Remove makeup before sleeping.",

prevention:
"Keep makeup remover accessible."
},

skincareKnowledge.skincaremistake2 = {
title: "Over-Cleansing",

explanation:
"Washing too often may damage the skin barrier.",

causes:
"Excessive cleansing removes protective oils.",

solution:
"Cleanse gently 1–2 times daily.",

prevention:
"Avoid harsh cleansers."
},

skincareKnowledge.skincaremistake3 = {
title: "Picking Pimples",

explanation:
"Picking increases inflammation and may cause scarring.",

causes:
"Manual trauma damages skin tissue.",

solution:
"Use acne treatments and avoid touching lesions.",

prevention:
"Keep hands away from the face."
},

skincareKnowledge.skincaremistake4 = {
title: "Skipping Sunscreen",

explanation:
"Daily UV exposure contributes to aging and hyperpigmentation.",

causes:
"Many people underestimate UV damage.",

solution:
"Apply SPF daily.",

prevention:
"Make sunscreen a habit."
},

skincareKnowledge.skincaremistake5 = {
title: "Using Too Many Products",

explanation:
"Too many active ingredients can overwhelm the skin barrier.",

causes:
"Layering multiple treatments without guidance.",

solution:
"Keep routines simple and consistent.",

prevention:
"Introduce products gradually."
},

skincareKnowledge.skincaremistake6 = {
title: "Changing Products Too Quickly",

explanation:
"Many products need weeks before noticeable results appear.",

causes:
"Impatience and unrealistic expectations.",

solution:
"Give products adequate time.",

prevention:
"Track progress over several weeks."
}

skincareKnowledge.pores =
skincareKnowledge.skincaremyth7;

skincareKnowledge.tanning =
skincareKnowledge.skincaremyth8;

skincareKnowledge.makeup =
skincareKnowledge.skincaremistake1;

skincareKnowledge.pickingskin =
skincareKnowledge.skincaremistake3;

skincareKnowledge.sunscreenmyth =
skincareKnowledge.skincaremyth3;

skincareKnowledge.perioraldermatitis = {
    title: "Perioral Dermatitis",

    explanation:
    "Perioral dermatitis is a facial rash that commonly appears around the mouth, nose, or eyes as small red bumps and irritation.",

    causes:
    "Possible causes include prolonged topical steroid use, heavy facial creams, certain cosmetics, fluoride toothpaste, and hormonal changes.",

    solution:
    "Treatment may include stopping triggering products, avoiding topical steroids unless prescribed, and seeking medical advice for appropriate medications.",

    prevention:
    "Use gentle skincare, avoid unnecessary steroid creams on the face, and introduce new products carefully."
};

skincareKnowledge.heatrash = {
    title: "Heat Rash",

    explanation:
    "Heat rash develops when sweat ducts become blocked, trapping sweat beneath the skin.",

    causes:
    "Hot weather, excessive sweating, tight clothing, and humid environments.",

    solution:
    "Keep the skin cool, wear loose clothing, and avoid overheating until the rash improves.",

    prevention:
    "Stay cool, wear breathable fabrics, and reduce excessive sweating when possible."
};

skincareKnowledge.sebaceoushyperplasia = {
    title: "Sebaceous Hyperplasia",

    explanation:
    "Sebaceous hyperplasia appears as small yellowish bumps caused by enlarged oil glands.",

    causes:
    "Aging, genetics, and increased sebaceous gland activity.",

    solution:
    "A dermatologist may recommend treatments such as electrocautery or laser therapy if desired for cosmetic reasons.",

    prevention:
    "There is no guaranteed prevention, but consistent skincare and sun protection may support overall skin health."
};

skincareKnowledge.milia = {
    title: "Milia",

    explanation:
    "Milia are tiny white cysts that form when keratin becomes trapped beneath the skin.",

    causes:
    "Skin injury, heavy skincare products, or natural skin renewal.",

    solution:
    "Milia often resolve naturally, while persistent cases can be removed safely by a trained professional.",

    prevention:
    "Use gentle exfoliation and avoid overly heavy products if they contribute to buildup."
};

skincareKnowledge.skinpurging = {
    title: "Skin Purging",

    explanation:
    "Skin purging is a temporary increase in breakouts after starting ingredients that speed up skin cell turnover.",

    causes:
    "Retinoids, AHAs, BHAs, and other exfoliating ingredients.",

    solution:
    "Continue using the product as directed if irritation is manageable, unless symptoms become severe or prolonged.",

    prevention:
    "Introduce active ingredients gradually and monitor your skin's response."
};

skincareKnowledge.chemicalburn = {
    title: "Chemical Burn From Skincare",

    explanation:
    "A chemical burn occurs when skincare products damage the skin barrier due to excessive strength or misuse.",

    causes:
    "Overusing acids, combining strong active ingredients, or leaving products on too long.",

    solution:
    "Stop the irritating product, keep the skin moisturized, and seek medical care if the burn is severe.",

    prevention:
    "Patch test new products and follow usage instructions carefully."
};

skincareKnowledge.sunallergy = {
    title: "Sun Allergy",

    explanation:
    "Sun allergy describes abnormal skin reactions after sun exposure, including itchy rashes or redness.",

    causes:
    "Certain medications, genetic factors, and immune responses to sunlight.",

    solution:
    "Limit sun exposure, wear protective clothing, and consult a healthcare professional for persistent symptoms.",

    prevention:
    "Use broad-spectrum sunscreen and protective clothing during outdoor activities."
};

skincareKnowledge.chappedlips = {
    title: "Chapped Lips",

    explanation:
    "Chapped lips occur when the lips become dry, cracked, or irritated.",

    causes:
    "Cold weather, dehydration, lip licking, and environmental exposure.",

    solution:
    "Apply a moisturizing lip balm regularly and avoid licking the lips.",

    prevention:
    "Protect lips from harsh weather and stay hydrated."
};

skincareKnowledge.xerosis = {
    title: "Xerosis",

    explanation:
    "Xerosis is the medical term for excessively dry skin.",

    causes:
    "Cold climates, aging, harsh soaps, low humidity, and certain medical conditions.",

    solution:
    "Use fragrance-free moisturizers, gentle cleansers, and avoid prolonged hot showers.",

    prevention:
    "Moisturize consistently and protect the skin barrier."
};

skincareKnowledge.itchyskin = {
    title: "Itchy Skin",

    explanation:
    "Itchy skin, also known as pruritus, may occur with dryness, allergies, infections, or skin diseases.",

    causes:
    "Dry skin, eczema, allergic reactions, insect bites, and systemic illnesses.",

    solution:
    "Treat the underlying cause, moisturize regularly, and avoid scratching the affected area.",

    prevention:
    "Maintain healthy skin hydration and avoid known irritants."
};

skincareKnowledge.skininfection = {
    title: "Skin Infection",

    explanation:
    "Skin infections can be caused by bacteria, viruses, fungi, or parasites affecting the skin.",

    causes:
    "Broken skin, weakened immunity, poor hygiene, or exposure to infectious organisms.",

    solution:
    "Treatment depends on the specific cause and may require professional medical evaluation.",

    prevention:
    "Keep wounds clean, practice good hygiene, and avoid sharing personal items."
};

skincareKnowledge.insectbites = {
    title: "Insect Bites",

    explanation:
    "Insect bites often cause small, itchy, red bumps due to the body's reaction to insect saliva or venom.",

    causes:
    "Mosquitoes, fleas, bed bugs, ticks, and other insects.",

    solution:
    "Clean the area, avoid scratching, and seek medical care for severe allergic reactions.",

    prevention:
    "Use insect repellent and wear protective clothing outdoors."
};

skincareKnowledge.bedbugs = {
    title: "Bed Bug Bites",

    explanation:
    "Bed bug bites usually appear as itchy red bumps that often occur in clusters or lines.",

    causes:
    "Exposure to bed bugs hiding in mattresses, furniture, or luggage.",

    solution:
    "Treat symptoms, wash bedding thoroughly, and eliminate the infestation.",

    prevention:
    "Inspect hotel beds, keep sleeping areas clean, and address infestations promptly."
};

skincareKnowledge.poisonivy = {
    title: "Poison Ivy Rash",

    explanation:
    "Poison ivy rash develops after contact with urushiol oil from poison ivy plants.",

    causes:
    "Touching poison ivy, poison oak, or poison sumac.",

    solution:
    "Wash exposed skin promptly and seek medical advice if the rash is severe.",

    prevention:
    "Learn to identify these plants and wear protective clothing outdoors."
};

skincareKnowledge.keloid = {
    title: "Keloid",

    explanation:
    "Keloids are raised scars that grow beyond the boundaries of the original wound.",

    causes:
    "Skin injuries, surgery, acne, burns, or piercings in susceptible individuals.",

    solution:
    "Treatment options may include steroid injections, silicone sheets, or specialist procedures.",

    prevention:
    "Proper wound care may reduce risk, though genetics also play a role."
};

skincareKnowledge.hypertrophicscar = {
    title: "Hypertrophic Scar",

    explanation:
    "Hypertrophic scars are raised scars that remain within the original wound area.",

    causes:
    "Skin injuries and excessive collagen production during healing.",

    solution:
    "Silicone therapy, pressure treatment, or professional medical care may help.",

    prevention:
    "Practice good wound care and avoid unnecessary trauma to healing skin."
};

skincareKnowledge.skinpicking = {
    title: "Skin Picking",

    explanation:
    "Repeated skin picking can damage the skin and delay healing.",

    causes:
    "Stress, anxiety, boredom, acne, or underlying mental health conditions.",

    solution:
    "Address triggers, protect healing skin, and seek professional support if the behavior is difficult to control.",

    prevention:
    "Develop healthier coping strategies and keep hands occupied."
};

skincareKnowledge.razorburn = {
    title: "Razor Burn",

    explanation:
    "Razor burn is skin irritation that develops after shaving.",

    causes:
    "Dull blades, dry shaving, shaving too closely, or shaving against hair growth.",

    solution:
    "Use soothing moisturizers and allow the skin to recover before shaving again.",

    prevention:
    "Use a sharp razor, shaving cream, and shave gently with the direction of hair growth."
};

skincareKnowledge.razorbumps = {
    title: "Razor Bumps",

    explanation:
    "Razor bumps develop when shaved hairs grow back into the skin.",

    causes:
    "Curly hair, close shaving, and improper shaving techniques.",

    solution:
    "Allow hair to grow out, exfoliate gently, and use appropriate shaving methods.",

    prevention:
    "Avoid shaving too closely and consider alternative hair removal methods if needed."
};

skincareKnowledge.calluses = {
    title: "Calluses",

    explanation:
    "Calluses are thickened areas of skin that develop from repeated pressure or friction.",

    causes:
    "Walking, manual labor, sports, and poorly fitting footwear.",

    solution:
    "Reduce pressure, moisturize regularly, and gently file thickened skin if appropriate.",

    prevention:
    "Wear properly fitting shoes and use protective padding when necessary."
};

skincareKnowledge.androgeneticalopecia = {
title: "Androgenetic Alopecia",

explanation:
"Androgenetic alopecia is the most common type of hair loss, often called male or female pattern baldness.",

causes:
"Genetics, hormones, and aging.",

solution:
"Treatment options may include medications such as minoxidil, finasteride (for some adults), or other therapies recommended by a healthcare professional.",

prevention:
"While genetics can't be changed, early treatment may help slow progression."
};

skincareKnowledge.telogeneffluvium = {
title: "Telogen Effluvium",

explanation:
"Telogen effluvium is temporary hair shedding that occurs after stress or illness.",

causes:
"Illness, surgery, childbirth, emotional stress, rapid weight loss, or nutritional deficiencies.",

solution:
"Treat the underlying cause and maintain a balanced diet. Hair often regrows over time.",

prevention:
"Manage stress, eat a nutritious diet, and seek medical advice for persistent shedding."
};

skincareKnowledge.alopeciaareata = {
title: "Alopecia Areata",

explanation:
"Alopecia areata is an autoimmune condition that causes patchy hair loss.",

causes:
"The immune system mistakenly attacks hair follicles.",

solution:
"A dermatologist may recommend medications or other treatments depending on severity.",

prevention:
"There is no guaranteed prevention because it is autoimmune."
};

skincareKnowledge.tractionalopecia = {
title: "Traction Alopecia",

explanation:
"Hair loss caused by repeated pulling on the hair over time.",

causes:
"Tight braids, ponytails, wigs, extensions, or hairstyles that place constant tension on the scalp.",

solution:
"Loosen hairstyles and avoid continued tension to help preserve hair follicles.",

prevention:
"Wear protective hairstyles without excessive tension."
};

skincareKnowledge.dandruff = {
title: "Dandruff",

explanation:
"Dandruff causes white flakes and itching on the scalp.",

causes:
"Dry skin, oily scalp, yeast overgrowth, or sensitivity to hair products.",

solution:
"Use anti-dandruff shampoos containing appropriate active ingredients.",

prevention:
"Wash the scalp regularly and avoid product buildup."
};

skincareKnowledge.seborrheicdermatitis = {
title: "Seborrheic Dermatitis",

explanation:
"A chronic inflammatory condition affecting oily areas like the scalp and face.",

causes:
"Yeast overgrowth, genetics, and excess oil production.",

solution:
"Medicated shampoos and treatments recommended by a healthcare professional may help.",

prevention:
"Maintain a consistent scalp care routine."
};

skincareKnowledge.scalppsoriasis = {
title: "Scalp Psoriasis",

explanation:
"Scalp psoriasis causes thick, scaly patches and itching.",

causes:
"An autoimmune condition that speeds up skin cell production.",

solution:
"Prescription treatments and medicated shampoos may reduce symptoms.",

prevention:
"Although not preventable, consistent treatment can reduce flare-ups."
};

skincareKnowledge.folliculitis = {
title: "Scalp Folliculitis",

explanation:
"Inflammation or infection of hair follicles on the scalp.",

causes:
"Bacteria, fungi, irritation, or ingrown hairs.",

solution:
"Treatment depends on the cause and may include medicated cleansers or prescription medication.",

prevention:
"Keep the scalp clean and avoid sharing combs or razors."
};

skincareKnowledge.splitends = {
title: "Split Ends",

explanation:
"Split ends occur when the protective outer layer of the hair becomes damaged.",

causes:
"Heat styling, chemical treatments, friction, and dryness.",

solution:
"Trim damaged hair and use moisturizing hair products.",

prevention:
"Limit excessive heat and protect hair from damage."
};

skincareKnowledge.brittlehair = {
title: "Brittle Hair",

explanation:
"Brittle hair breaks easily due to dryness or damage.",

causes:
"Over-processing, heat styling, poor nutrition, and environmental damage.",

solution:
"Use moisturizing conditioners and reduce damaging hair practices.",

prevention:
"Protect hair and maintain a balanced diet."
};

skincareKnowledge.onychomycosis = {
title: "Nail Fungus",

explanation:
"Nail fungus causes thickened, discolored, brittle nails.",

causes:
"Fungal infection entering through small cracks in the nail.",

solution:
"Treatment may require prescription antifungal medication.",

prevention:
"Keep nails clean and dry and avoid walking barefoot in public showers."
};

skincareKnowledge.ingrownnail = {
title: "Ingrown Toenail",

explanation:
"An ingrown nail occurs when the nail grows into the surrounding skin.",

causes:
"Improper nail trimming, tight shoes, or injury.",

solution:
"Mild cases may improve with proper care, while severe cases require medical treatment.",

prevention:
"Trim nails straight across and wear properly fitting footwear."
};

skincareKnowledge.brittlenails = {
title: "Brittle Nails",

explanation:
"Brittle nails chip, crack, or split easily.",

causes:
"Frequent water exposure, aging, nutritional deficiencies, or certain medical conditions.",

solution:
"Moisturize nails and protect hands during cleaning.",

prevention:
"Wear gloves when handling water or chemicals."
};

skincareKnowledge.yellowtoenails = {
title: "Yellow Toenails",

explanation:
"Yellow nails may result from fungal infection, aging, or nail polish staining.",

causes:
"Fungal infections, smoking, or prolonged polish use.",

solution:
"Treat the underlying cause and seek medical advice if persistent.",

prevention:
"Practice proper nail hygiene."
};

skincareKnowledge.vitiligo = {
title: "Vitiligo",

explanation:
"Vitiligo is a condition where patches of skin lose their pigment.",

causes:
"Autoimmune destruction of pigment-producing cells.",

solution:
"Treatment may include topical medications, light therapy, or cosmetic camouflage.",

prevention:
"There is no proven prevention."
};

skincareKnowledge.melasma = {
title: "Melasma",

explanation:
"Melasma causes brown or gray patches, commonly on the face.",

causes:
"Sun exposure, hormones, pregnancy, and genetics.",

solution:
"Sun protection and treatment guided by a healthcare professional may improve appearance.",

prevention:
"Daily sunscreen use is essential."
};

skincareKnowledge.freckles = {
title: "Freckles",

explanation:
"Freckles are small pigmented spots that become more noticeable with sun exposure.",

causes:
"Genetics and ultraviolet radiation.",

solution:
"No treatment is necessary unless desired for cosmetic reasons.",

prevention:
"Protect the skin from excessive sun exposure."
};

skincareKnowledge.lentigines = {
title: "Solar Lentigines",

explanation:
"Solar lentigines, also called age spots, develop after years of sun exposure.",

causes:
"Long-term ultraviolet damage.",

solution:
"Cosmetic treatments are available if desired.",

prevention:
"Use sunscreen consistently."
};

skincareKnowledge.postinflammatoryerythema = {
title: "Post-Inflammatory Erythema",

explanation:
"Red marks that remain after inflammation such as acne has healed.",

causes:
"Inflammation damages small blood vessels in the skin.",

solution:
"Sun protection and time often improve appearance; some treatments may help.",

prevention:
"Treat inflammatory skin conditions early."
};

skincareKnowledge.skinbarrierdamage = {
title: "Damaged Skin Barrier",

explanation:
"A damaged skin barrier allows moisture to escape and irritants to enter.",

causes:
"Over-exfoliation, harsh cleansers, environmental damage, and excessive active ingredients.",

solution:
"Use gentle skincare, moisturizers, and temporarily avoid irritating products.",

prevention:
"Build a balanced skincare routine and avoid overusing active ingredients."
};

skincareKnowledge.sunburn = {
title: "Sunburn",

explanation:
"Sunburn is skin damage caused by too much ultraviolet (UV) radiation from the sun or tanning beds.",

causes:
"Excessive UV exposure without adequate sun protection.",

solution:
"Cool the skin, stay hydrated, apply soothing moisturizers such as aloe vera, and avoid further sun exposure while healing.",

prevention:
"Use broad-spectrum sunscreen, wear protective clothing, and seek shade during peak sunlight hours."
};

skincareKnowledge.photoaging = {
title: "Photoaging",

explanation:
"Photoaging is premature skin aging caused by repeated exposure to ultraviolet rays.",

causes:
"Long-term sun exposure without proper protection.",

solution:
"Daily sunscreen use and a skincare routine that supports skin health may improve the appearance of photoaged skin.",

prevention:
"Protect your skin from UV exposure every day."
};

skincareKnowledge.uvdamage = {
title: "UV Skin Damage",

explanation:
"Ultraviolet radiation can damage skin cells, leading to wrinkles, pigmentation changes, and increased skin cancer risk.",

causes:
"Repeated exposure to UVA and UVB rays.",

solution:
"Minimize further exposure and maintain a sun-protective skincare routine.",

prevention:
"Apply sunscreen daily and wear sun-protective clothing."
};

skincareKnowledge.dehydratedskin = {
title: "Dehydrated Skin",

explanation:
"Dehydrated skin lacks water, making it feel tight, dull, and less elastic.",

causes:
"Weather, harsh skincare products, inadequate water intake, or excessive cleansing.",

solution:
"Use hydrating skincare products and moisturizers while maintaining adequate hydration.",

prevention:
"Avoid over-cleansing and protect the skin barrier."
};

skincareKnowledge.waterloss = {
title: "Transepidermal Water Loss",

explanation:
"Transepidermal water loss occurs when too much water escapes through the skin barrier.",

causes:
"Damaged skin barrier, dry climate, or harsh skincare routines.",

solution:
"Use barrier-supporting moisturizers containing ingredients such as ceramides.",

prevention:
"Protect the skin barrier and moisturize consistently."
};

skincareKnowledge.wrinkles = {
title: "Wrinkles",

explanation:
"Wrinkles are lines that develop as the skin loses collagen and elasticity over time.",

causes:
"Aging, UV exposure, smoking, and repeated facial movements.",

solution:
"A skincare routine that includes sun protection and evidence-based ingredients may improve their appearance.",

prevention:
"Protect the skin from sun damage and maintain healthy lifestyle habits."
};

skincareKnowledge.finelines = {
title: "Fine Lines",

explanation:
"Fine lines are shallow wrinkles that often appear as an early sign of skin aging.",

causes:
"Aging, dehydration, and sun exposure.",

solution:
"Moisturizing and sun protection can improve the appearance of fine lines.",

prevention:
"Use sunscreen daily and keep the skin hydrated."
};

skincareKnowledge.lossofelasticity = {
title: "Loss of Skin Elasticity",

explanation:
"Skin elasticity decreases as collagen and elastin naturally decline with age.",

causes:
"Aging, UV exposure, smoking, and environmental damage.",

solution:
"Healthy skincare habits and sun protection help support skin quality.",

prevention:
"Protect the skin from excessive UV exposure."
};

skincareKnowledge.collagenloss = {
title: "Collagen Loss",

explanation:
"Collagen provides skin structure, but production naturally declines over time.",

causes:
"Aging, UV exposure, smoking, and poor nutrition.",

solution:
"Maintain healthy skincare habits and protect collagen through sun protection.",

prevention:
"Limit sun exposure and avoid smoking."
};

skincareKnowledge.elastinloss = {
title: "Elastin Loss",

explanation:
"Elastin allows the skin to stretch and return to its original shape.",

causes:
"Aging and chronic UV exposure.",

solution:
"Protect skin from further damage and support overall skin health.",

prevention:
"Daily sunscreen remains one of the most effective preventive measures."
};

skincareKnowledge.stretchmarks = {
title: "Stretch Marks",

explanation:
"Stretch marks develop when the skin stretches faster than collagen can adapt.",

causes:
"Pregnancy, puberty, rapid weight gain, bodybuilding, or corticosteroid use.",

solution:
"Some treatments may reduce their appearance, although complete removal is uncommon.",

prevention:
"Maintain stable body weight and keep the skin moisturized."
};

skincareKnowledge.scarcare = {
title: "Scar Care",

explanation:
"Proper scar care can help improve the appearance of healing skin.",

causes:
"Scars form naturally after skin injury.",

solution:
"Protect scars from sun exposure and follow healthcare guidance when appropriate.",

prevention:
"Prompt wound care may reduce scar severity."
};

skincareKnowledge.woundhealing = {
title: "Wound Healing",

explanation:
"Wound healing is the body's natural process of repairing damaged skin.",

causes:
"Injuries, surgery, burns, acne, or skin conditions.",

solution:
"Keep wounds clean, protected, and monitor for signs of infection.",

prevention:
"Treat cuts and abrasions promptly."
};

skincareKnowledge.hyperkeratosis = {
title: "Hyperkeratosis",

explanation:
"Hyperkeratosis is the thickening of the outer layer of the skin.",

causes:
"Repeated friction, pressure, or certain skin conditions.",

solution:
"Treatment depends on the underlying cause and may include moisturizers or keratolytic products.",

prevention:
"Reduce repeated friction where possible."
};

skincareKnowledge.calluses = {
title: "Calluses",

explanation:
"Calluses are thickened areas of skin that develop from repeated pressure or friction.",

causes:
"Walking, manual labor, or poorly fitting footwear.",

solution:
"Reduce pressure and moisturize affected areas.",

prevention:
"Wear properly fitting shoes and protective gloves when needed."
};

skincareKnowledge.corns = {
title: "Corns",

explanation:
"Corns are small thickened areas of skin caused by repeated pressure.",

causes:
"Tight footwear or repeated rubbing.",

solution:
"Relieve pressure and seek medical care if painful or persistent.",

prevention:
"Choose comfortable shoes that fit well."
};

skincareKnowledge.blisters = {
title: "Blisters",

explanation:
"Blisters are fluid-filled pockets that form after friction, burns, or irritation.",

causes:
"Friction, heat, burns, or allergic reactions.",

solution:
"Keep blisters clean and protected while they heal.",

prevention:
"Reduce friction and wear properly fitting footwear."
};

skincareKnowledge.chappedskin = {
title: "Chapped Skin",

explanation:
"Chapped skin becomes dry, rough, cracked, and sometimes painful.",

causes:
"Cold weather, low humidity, harsh soaps, and dehydration.",

solution:
"Apply moisturizing creams frequently and avoid irritating products.",

prevention:
"Protect the skin from harsh weather and moisturize regularly."
};

skincareKnowledge.skinirritation = {
title: "Skin Irritation",

explanation:
"Skin irritation is redness, discomfort, or inflammation caused by physical or chemical triggers.",

causes:
"Harsh skincare products, allergens, friction, or environmental exposure.",

solution:
"Identify and avoid the trigger while using gentle skincare products.",

prevention:
"Patch-test new products and avoid unnecessary irritation."
};

skincareKnowledge.environmentaldamage = {
title: "Environmental Skin Damage",

explanation:
"Pollution, UV rays, smoke, and environmental stressors can gradually damage the skin.",

causes:
"Air pollution, sunlight, cigarette smoke, and oxidative stress.",

solution:
"Cleanse the skin gently, use antioxidants where appropriate, and wear sunscreen daily.",

prevention:
"Protect the skin from environmental stress with consistent skincare and sun protection."
};

skincareKnowledge.dandruff = {
title: "Dandruff",

explanation:
"Dandruff is a common scalp condition that causes white flakes and itching.",

causes:
"An overgrowth of scalp yeast, oily skin, dry skin, or sensitivity to hair products.",

solution:
"Use anti-dandruff shampoos containing ingredients such as zinc pyrithione or ketoconazole.",

prevention:
"Wash the scalp regularly and manage excess oil."
};

skincareKnowledge.seborrheicdermatitis = {
title: "Seborrheic Dermatitis",

explanation:
"A chronic inflammatory skin condition affecting oily areas like the scalp and face.",

causes:
"Yeast overgrowth, genetics, stress, and excess oil production.",

solution:
"Medicated shampoos and treatments recommended by a healthcare professional may help.",

prevention:
"Maintain a regular scalp-care routine."
};

skincareKnowledge.hairloss = {
title: "Hair Loss",

explanation:
"Hair loss occurs when hair sheds faster than it regrows.",

causes:
"Genetics, stress, hormonal changes, illness, medications, or nutritional deficiencies.",

solution:
"Treatment depends on the underlying cause and may require medical evaluation.",

prevention:
"Maintain overall health and avoid unnecessary hair damage."
};

skincareKnowledge.alopecia = {
title: "Alopecia",

explanation:
"Alopecia refers to hair loss that may affect the scalp or other parts of the body.",

causes:
"Autoimmune disease, genetics, stress, or certain medical conditions.",

solution:
"Management depends on the specific type of alopecia.",

prevention:
"Some forms cannot be prevented, but early treatment may improve outcomes."
};

skincareKnowledge.telogeneffluvium = {
title: "Telogen Effluvium",

explanation:
"A temporary increase in hair shedding following physical or emotional stress.",

causes:
"Illness, childbirth, surgery, severe stress, or nutritional deficiencies.",

solution:
"Hair often regrows after the triggering event resolves.",

prevention:
"Manage stress and maintain good nutrition."
};

skincareKnowledge.splitends = {
title: "Split Ends",

explanation:
"Split ends occur when the protective outer layer of the hair shaft becomes damaged.",

causes:
"Heat styling, chemical treatments, friction, and dryness.",

solution:
"Trim damaged ends and reduce hair damage.",

prevention:
"Protect hair from excessive heat and chemical processing."
};

skincareKnowledge.dryscalp = {
title: "Dry Scalp",

explanation:
"Dry scalp causes itching and flaking due to insufficient moisture.",

causes:
"Cold weather, harsh shampoos, or naturally dry skin.",

solution:
"Use gentle moisturizing hair products.",

prevention:
"Avoid harsh cleansers and excessive washing."
};

skincareKnowledge.oilyscalp = {
title: "Oily Scalp",

explanation:
"An oily scalp produces excess sebum, making hair greasy quickly.",

causes:
"Genetics, hormones, and overactive sebaceous glands.",

solution:
"Wash regularly using products suitable for oily hair.",

prevention:
"Use lightweight hair products and avoid excessive oil buildup."
};

skincareKnowledge.folliculitis = {
title: "Scalp Folliculitis",

explanation:
"Inflammation of hair follicles on the scalp that can cause small bumps or pimples.",

causes:
"Bacterial infection, irritation, or ingrown hairs.",

solution:
"Treatment depends on the cause and may require medical evaluation.",

prevention:
"Keep the scalp clean and avoid irritation."
};

skincareKnowledge.ingrownhair = {
title: "Ingrown Hair",

explanation:
"An ingrown hair grows back into the skin instead of outward.",

causes:
"Shaving, waxing, curly hair, or clogged follicles.",

solution:
"Warm compresses and gentle exfoliation may help release the trapped hair.",

prevention:
"Use proper shaving techniques and avoid shaving too closely."
};

skincareKnowledge.beardbumps = {
title: "Beard Bumps",

explanation:
"Beard bumps are ingrown hairs that commonly develop after shaving.",

causes:
"Curly hair and close shaving.",

solution:
"Adjust shaving techniques and allow hairs to grow naturally when possible.",

prevention:
"Shave in the direction of hair growth."
};

skincareKnowledge.brittlenails = {
title: "Brittle Nails",

explanation:
"Brittle nails break, peel, or split easily.",

causes:
"Frequent exposure to water, aging, nutritional deficiencies, or nail trauma.",

solution:
"Keep nails moisturized and protect them from excessive water exposure.",

prevention:
"Wear gloves during cleaning and avoid harsh chemicals."
};

skincareKnowledge.nailfungus = {
title: "Nail Fungus",

explanation:
"A fungal infection that causes nails to become thick, yellow, and brittle.",

causes:
"Fungal organisms entering through tiny cracks in the nail.",

solution:
"Medical treatment is often required for complete resolution.",

prevention:
"Keep feet clean and dry and avoid sharing nail tools."
};

skincareKnowledge.hangnails = {
title: "Hangnails",

explanation:
"Small torn pieces of skin around the nail.",

causes:
"Dry skin, nail biting, or trauma.",

solution:
"Trim carefully and moisturize regularly.",

prevention:
"Keep cuticles hydrated."
};

skincareKnowledge.paronychia = {
title: "Paronychia",

explanation:
"An infection of the skin surrounding the fingernail or toenail.",

causes:
"Bacteria, fungi, nail biting, or injury.",

solution:
"Medical evaluation may be necessary if swelling or pus develops.",

prevention:
"Avoid picking or biting the nails."
};

skincareKnowledge.yellownails = {
title: "Yellow Nails",

explanation:
"Nails may turn yellow due to fungal infections, smoking, or staining.",

causes:
"Fungal infection, nail polish, or medical conditions.",

solution:
"Treatment depends on the underlying cause.",

prevention:
"Maintain nail hygiene and allow nails to breathe between polish applications."
};

skincareKnowledge.ridgednails = {
title: "Ridged Nails",

explanation:
"Vertical or horizontal ridges may develop on the nails over time.",

causes:
"Aging, injury, or certain health conditions.",

solution:
"Seek medical evaluation if new severe ridges appear suddenly.",

prevention:
"Protect nails from repeated trauma."
};

skincareKnowledge.whitespotsonnails = {
title: "White Spots on Nails",

explanation:
"Small white marks on nails are often caused by minor nail injuries.",

causes:
"Nail trauma or less commonly certain medical conditions.",

solution:
"They usually grow out naturally.",

prevention:
"Avoid nail injuries."
};

skincareKnowledge.nailbiting = {
title: "Nail Biting",

explanation:
"Nail biting is a common habit that can damage nails and surrounding skin.",

causes:
"Stress, anxiety, boredom, or habit.",

solution:
"Behavioral techniques may help break the habit.",

prevention:
"Keep nails trimmed and identify triggers."
};

skincareKnowledge.healthyhair = {
title: "Healthy Hair Care",

explanation:
"Healthy hair depends on proper scalp care, balanced nutrition, and gentle styling practices.",

causes:
"Hair health is influenced by genetics, lifestyle, nutrition, and hair-care habits.",

solution:
"Use gentle hair products, minimize heat damage, and maintain a balanced diet.",

prevention:
"Practice consistent hair care and protect hair from excessive damage."
};

skincareKnowledge.microneedling = {
title: "Microneedling",

explanation:
"Microneedling is a cosmetic procedure that uses tiny needles to stimulate collagen production.",

causes:
"Performed to improve acne scars, fine lines, enlarged pores, and skin texture.",

solution:
"Have the procedure performed by a qualified professional and follow proper aftercare.",

prevention:
"Choose experienced providers and protect treated skin from the sun."
};

skincareKnowledge.chemicalpeel = {
title: "Chemical Peel",

explanation:
"A chemical peel removes damaged outer skin layers to improve skin texture and tone.",

causes:
"Used for acne scars, pigmentation, and fine lines.",

solution:
"Follow post-treatment instructions carefully and moisturize the skin.",

prevention:
"Always wear sunscreen after a peel."
};

skincareKnowledge.laserresurfacing = {
title: "Laser Skin Resurfacing",

explanation:
"A cosmetic treatment that uses laser energy to improve skin texture and reduce scars or wrinkles.",

causes:
"Performed for cosmetic skin improvement.",

solution:
"Requires professional evaluation and post-treatment skincare.",

prevention:
"Protect healing skin with sunscreen."
};

skincareKnowledge.botox = {
title: "Botox",

explanation:
"Botox is an injectable treatment that temporarily relaxes muscles to reduce facial wrinkles.",

causes:
"Used cosmetically for expression lines.",

solution:
"Seek treatment from qualified medical professionals.",

prevention:
"Choose licensed providers."
};

skincareKnowledge.fillers = {
title: "Dermal Fillers",

explanation:
"Injectable fillers restore lost facial volume and soften wrinkles.",

causes:
"Age-related volume loss or cosmetic enhancement.",

solution:
"Only receive fillers from experienced professionals.",

prevention:
"Discuss risks before treatment."
};

skincareKnowledge.skininfection = {
title: "Skin Infection",

explanation:
"Skin infections occur when bacteria, fungi, viruses, or parasites invade the skin.",

causes:
"Cuts, weakened skin barrier, or poor hygiene.",

solution:
"Treatment depends on the cause and may require medical care.",

prevention:
"Keep wounds clean and practice good hygiene."
};

skincareKnowledge.cellulitis = {
title: "Cellulitis",

explanation:
"Cellulitis is a bacterial infection affecting deeper layers of the skin.",

causes:
"Bacteria entering through cuts or cracks in the skin.",

solution:
"Requires prompt medical treatment with appropriate medication.",

prevention:
"Treat wounds quickly and keep skin healthy."
};

skincareKnowledge.impetigo = {
title: "Impetigo",

explanation:
"Impetigo is a contagious bacterial skin infection that commonly affects children.",

causes:
"Staphylococcus or Streptococcus bacteria.",

solution:
"Medical treatment is usually necessary.",

prevention:
"Wash hands frequently and avoid sharing towels."
};

skincareKnowledge.boils = {
title: "Boils",

explanation:
"Boils are painful pus-filled infections that develop around hair follicles.",

causes:
"Usually caused by bacterial infection.",

solution:
"Warm compresses may help, but larger boils may require medical treatment.",

prevention:
"Maintain good hygiene and avoid squeezing boils."
};

skincareKnowledge.carbuncles = {
title: "Carbuncles",

explanation:
"A carbuncle is a cluster of connected boils.",

causes:
"Deep bacterial infection affecting multiple follicles.",

solution:
"Medical evaluation is often necessary.",

prevention:
"Treat skin infections early."
};

skincareKnowledge.nutritionandskin = {
title: "Nutrition and Skin Health",

explanation:
"A balanced diet supports healthy skin structure and repair.",

causes:
"Poor nutrition may contribute to dull or unhealthy-looking skin.",

solution:
"Eat a varied diet rich in fruits, vegetables, healthy fats, and protein.",

prevention:
"Maintain healthy eating habits."
};

skincareKnowledge.sleepandskin = {
title: "Sleep and Skin",

explanation:
"Sleep supports normal skin repair and overall health.",

causes:
"Poor sleep may affect skin appearance and barrier function.",

solution:
"Aim for consistent, adequate sleep each night.",

prevention:
"Develop healthy sleep habits."
};

skincareKnowledge.stressandskin = {
title: "Stress and Skin",

explanation:
"Stress can worsen several skin conditions in some people.",

causes:
"Physical or emotional stress.",

solution:
"Practice stress-management techniques and maintain healthy routines.",

prevention:
"Prioritize self-care and adequate rest."
};

skincareKnowledge.exerciseandskin = {
title: "Exercise and Skin",

explanation:
"Regular exercise supports overall health and may benefit skin through improved circulation.",

causes:
"Physical activity affects circulation and sweating.",

solution:
"Cleanse the skin after workouts.",

prevention:
"Avoid staying in sweaty clothing for long periods."
};

skincareKnowledge.hydration = {
title: "Hydration",

explanation:
"Proper hydration supports normal body function and contributes to healthy-looking skin.",

causes:
"Dehydration can leave skin looking dull.",

solution:
"Drink enough fluids based on your needs.",

prevention:
"Maintain healthy hydration habits daily."
};

skincareKnowledge.smokingandskin = {
title: "Smoking and Skin",

explanation:
"Smoking accelerates premature skin aging and delays wound healing.",

causes:
"Tobacco smoke reduces blood flow and damages collagen.",

solution:
"Quitting smoking benefits overall skin and health.",

prevention:
"Avoid tobacco products."
};

skincareKnowledge.alcoholandskin = {
title: "Alcohol and Skin",

explanation:
"Heavy alcohol use may contribute to dehydration and worsen certain skin conditions.",

causes:
"Alcohol affects hydration and blood vessels.",

solution:
"Drink responsibly and stay hydrated.",

prevention:
"Limit excessive alcohol intake."
};

skincareKnowledge.skinbarrier = {
title: "Skin Barrier",

explanation:
"The skin barrier protects against water loss, irritants, and microorganisms.",

causes:
"It can become damaged by harsh products or environmental factors.",

solution:
"Use gentle cleansers and moisturizers that support the skin barrier.",

prevention:
"Avoid over-exfoliation and harsh skincare."
};

skincareKnowledge.skincancerawareness = {
title: "Skin Cancer Awareness",

explanation:
"Skin cancer develops from abnormal growth of skin cells, often related to UV exposure.",

causes:
"Sun exposure, tanning beds, and genetic factors.",

solution:
"Seek prompt medical evaluation for changing or suspicious skin lesions.",

prevention:
"Use sunscreen daily and perform regular skin self-checks."
};

skincareKnowledge.skinhealthtips = {
title: "General Skin Health Tips",

explanation:
"Healthy skin is supported by consistent skincare habits and healthy lifestyle choices.",

causes:
"Daily habits influence long-term skin health.",

solution:
"Cleanse gently, moisturize, wear sunscreen, eat well, sleep adequately, and stay hydrated.",

prevention:
"Practice a consistent skincare routine every day."
};

// 201
skincareKnowledge.skinmicrobiome = {
title:"Skin Microbiome",
explanation:"The skin microbiome is the community of beneficial bacteria, fungi, and other microorganisms living on your skin that help protect it from harmful germs and support a healthy skin barrier.",
causes:"Harsh cleansers, excessive antibiotic use, over-exfoliation, pollution, and certain skin conditions can disrupt the microbiome.",
solution:"Use gentle cleansers, avoid unnecessary antibiotics, moisturize regularly, and choose microbiome-friendly skincare when appropriate.",
prevention:"Keep your skincare routine simple, avoid over-cleansing, and protect your skin barrier."
};

// 202
skincareKnowledge.transepidermalwaterloss = {
title:"Transepidermal Water Loss (TEWL)",
explanation:"TEWL refers to the amount of water that naturally evaporates from your skin. Excessive TEWL indicates a weakened skin barrier.",
causes:"Dry weather, damaged skin barrier, harsh skincare products, eczema, and frequent washing.",
solution:"Use ceramide-rich moisturizers, avoid harsh cleansers, and apply occlusive products to reduce water loss.",
prevention:"Moisturize daily and protect your skin from environmental damage."
};

// 203
skincareKnowledge.skinbarrierrepair = {
title:"Skin Barrier Repair",
explanation:"Skin barrier repair focuses on restoring the outer protective layer of the skin after it has been damaged.",
causes:"Over-exfoliation, excessive retinoid use, harsh soaps, and environmental stress.",
solution:"Use gentle skincare, ceramides, cholesterol, fatty acids, and avoid irritating products until the barrier heals.",
prevention:"Introduce active ingredients gradually and avoid overusing exfoliants."
};

// 204
skincareKnowledge.ceramides = {
title:"Ceramides",
explanation:"Ceramides are natural lipids that help hold skin cells together, keeping the skin barrier strong and hydrated.",
causes:"Ceramide levels naturally decrease with age and may be reduced by harsh skincare.",
solution:"Use moisturizers containing ceramides to strengthen the skin barrier.",
prevention:"Maintain a consistent moisturizing routine."
};

// 205
skincareKnowledge.cholesterolinskincare = {
title:"Cholesterol in Skincare",
explanation:"Cholesterol is a natural component of healthy skin that works with ceramides and fatty acids to maintain barrier function.",
causes:"Skin barrier damage or aging may reduce cholesterol levels in the skin.",
solution:"Barrier-repair creams containing cholesterol may help restore healthy skin.",
prevention:"Avoid excessive irritation and keep skin moisturized."
};

// 206
skincareKnowledge.fattyacids = {
title:"Fatty Acids in Skincare",
explanation:"Fatty acids nourish the skin barrier, reduce dryness, and improve skin softness.",
causes:"Loss of skin lipids due to aging or harsh skincare.",
solution:"Use moisturizers containing essential fatty acids.",
prevention:"Maintain healthy skincare habits and avoid stripping the skin."
};

// 207
skincareKnowledge.sebaceousfilaments = {
title:"Sebaceous Filaments",
explanation:"Sebaceous filaments are normal structures lining pores that help transport oil to the skin's surface. They are often mistaken for blackheads.",
causes:"Natural oil production and enlarged pores.",
solution:"Salicylic acid, retinoids, and gentle cleansing can reduce their appearance but cannot permanently remove them.",
prevention:"Maintain a consistent skincare routine."
};

// 208
skincareKnowledge.skinpurging = {
title:"Skin Purging",
explanation:"Skin purging is a temporary increase in breakouts after starting certain active ingredients that speed up skin cell turnover.",
causes:"Retinoids, AHAs, BHAs, and similar exfoliating ingredients.",
solution:"Continue treatment if appropriate unless severe irritation occurs, and consult a dermatologist if unsure.",
prevention:"Introduce active ingredients gradually."
};

// 209
skincareKnowledge.comedogenic = {
title:"Comedogenic Products",
explanation:"Comedogenic products are more likely to clog pores and contribute to acne in susceptible individuals.",
causes:"Heavy oils, waxes, and certain cosmetic ingredients.",
solution:"Choose products labeled non-comedogenic if you are acne-prone.",
prevention:"Read ingredient lists and patch-test new products."
};

// 210
skincareKnowledge.noncomedogenic = {
title:"Non-Comedogenic Skincare",
explanation:"Non-comedogenic products are formulated to reduce the likelihood of clogging pores.",
causes:"Designed specifically for acne-prone skin.",
solution:"Select non-comedogenic cleansers, moisturizers, and sunscreens.",
prevention:"Maintain a consistent acne-friendly routine."
};

// 211
skincareKnowledge.hairloss = {
title:"Hair Loss",
explanation:"Hair loss is the partial or complete loss of hair from the scalp or other parts of the body.",
causes:"Genetics, hormonal changes, nutritional deficiencies, stress, illness, or certain medications.",
solution:"Treatment depends on the cause and may include medications, nutritional support, or medical evaluation.",
prevention:"Eat a balanced diet, manage stress, and seek early evaluation for persistent hair loss."
};

// 212
skincareKnowledge.dandruff = {
title:"Dandruff",
explanation:"Dandruff is a common scalp condition causing flaking and sometimes itching.",
causes:"Excess oil, yeast overgrowth, dry skin, or sensitivity to hair products.",
solution:"Use anti-dandruff shampoos containing zinc pyrithione, ketoconazole, or selenium sulfide.",
prevention:"Wash hair regularly and manage scalp health."
};

// 213
skincareKnowledge.seborrheicdermatitisscalp = {
title:"Scalp Seborrheic Dermatitis",
explanation:"A chronic inflammatory scalp condition causing greasy scales and redness.",
causes:"Yeast overgrowth, genetics, stress, and oily skin.",
solution:"Medicated shampoos and dermatologist-recommended treatments.",
prevention:"Maintain regular scalp care and manage flare triggers."
};

// 214
skincareKnowledge.splitends = {
title:"Split Ends",
explanation:"Split ends occur when the protective outer layer of the hair becomes damaged, causing the hair shaft to split.",
causes:"Heat styling, chemical treatments, and excessive brushing.",
solution:"Trim damaged ends and reduce heat exposure.",
prevention:"Use conditioners and minimize hair damage."
};

// 215
skincareKnowledge.brittlenails = {
title:"Brittle Nails",
explanation:"Brittle nails break, split, or peel easily.",
causes:"Frequent water exposure, aging, nutritional deficiencies, or certain medical conditions.",
solution:"Moisturize nails and seek medical advice if persistent.",
prevention:"Protect nails from excessive moisture and harsh chemicals."
};

// 216
skincareKnowledge.hangnails = {
title:"Hangnails",
explanation:"Hangnails are small pieces of torn skin around the nails.",
causes:"Dry skin, nail biting, and frequent hand washing.",
solution:"Trim carefully and moisturize the cuticles.",
prevention:"Use hand cream and avoid picking at the skin."
};

// 217
skincareKnowledge.cuticlecare = {
title:"Cuticle Care",
explanation:"Healthy cuticles protect new nail growth from infection.",
causes:"Dryness, aggressive manicures, and harsh chemicals.",
solution:"Moisturize regularly and avoid cutting healthy cuticles.",
prevention:"Use cuticle oil consistently."
};

// 218
skincareKnowledge.ingrowntoenail = {
title:"Ingrown Toenail",
explanation:"An ingrown toenail occurs when the edge of the nail grows into the surrounding skin.",
causes:"Improper nail trimming, tight shoes, and injury.",
solution:"Soak the foot, wear comfortable footwear, and seek medical care if infected.",
prevention:"Trim nails straight across and wear properly fitting shoes."
};

// 219
skincareKnowledge.hyperhidrosis = {
title:"Hyperhidrosis",
explanation:"Hyperhidrosis is excessive sweating beyond what the body needs for temperature regulation.",
causes:"Genetics, certain medical conditions, or medications.",
solution:"Antiperspirants, prescription treatments, or medical procedures may help.",
prevention:"There is no guaranteed prevention, but early treatment can improve quality of life."
};

// 220
skincareKnowledge.bodyodor = {
title:"Body Odor",
explanation:"Body odor develops when sweat interacts with bacteria on the skin.",
causes:"Sweating, bacteria, diet, hormonal changes, and certain medical conditions.",
solution:"Practice good hygiene, use antiperspirants, and wear breathable clothing.",
prevention:"Bathe regularly and keep skin clean and dry."
};

// 221
skincareKnowledge.chemicalburn = {
title:"Chemical Burn",
explanation:"A chemical burn occurs when the skin is damaged after contact with strong acids, alkalis, or irritating skincare products.",
causes:"Industrial chemicals, household cleaners, misuse of chemical peels, or overuse of skincare acids.",
solution:"Immediately rinse the affected area with plenty of clean water, stop using the product, and seek medical attention if severe.",
prevention:"Always follow product instructions, wear protective equipment when handling chemicals, and patch-test new skincare products."
};

// 222
skincareKnowledge.sunallergy = {
title:"Sun Allergy",
explanation:"Sun allergy is an abnormal reaction of the skin to sunlight, causing itchy rashes or blisters shortly after sun exposure.",
causes:"Genetics, certain medications, and immune system reactions to UV light.",
solution:"Avoid direct sunlight, wear protective clothing, apply broad-spectrum sunscreen, and consult a dermatologist.",
prevention:"Limit UV exposure and use adequate sun protection daily."
};

// 223
skincareKnowledge.photosensitivity = {
title:"Photosensitivity",
explanation:"Photosensitivity is increased sensitivity of the skin to sunlight, leading to redness, rashes, or burns.",
causes:"Certain medications, skincare ingredients, autoimmune diseases, and genetics.",
solution:"Discontinue the triggering product if appropriate, protect the skin from sunlight, and seek medical advice.",
prevention:"Read medication labels and use sunscreen consistently."
};

// 224
skincareKnowledge.skincalcification = {
title:"Skin Calcification",
explanation:"Skin calcification occurs when calcium deposits form within the skin and underlying tissues.",
causes:"Autoimmune diseases, tissue injury, kidney disorders, and abnormal calcium metabolism.",
solution:"Treatment depends on the underlying cause and may require specialist care.",
prevention:"Manage underlying medical conditions appropriately."
};

skincareKnowledge.calcinosiscutis = {
title:"Calcinosis Cutis",
explanation:"Calcinosis cutis is a condition where calcium deposits develop beneath the skin, forming hard lumps.",
causes:"Connective tissue diseases, trauma, infections, or metabolic disorders.",
solution:"Medical evaluation is necessary. Treatment may include medication or surgical removal in selected cases.",
prevention:"Early treatment of associated medical conditions may reduce risk."
};

skincareKnowledge.livedoreticularis = {
title:"Livedo Reticularis",
explanation:"Livedo reticularis appears as a lace-like purple discoloration of the skin due to changes in blood flow.",
causes:"Cold temperatures, autoimmune disorders, blood vessel diseases, or certain medications.",
solution:"Treat the underlying condition and keep the body warm if cold-induced.",
prevention:"Protect against cold exposure and manage chronic illnesses."
};

skincareKnowledge.chilblains = {
title:"Chilblains",
explanation:"Chilblains are painful, itchy swellings that develop after exposure to cold, damp conditions.",
causes:"Sudden warming after cold exposure and poor circulation.",
solution:"Warm the affected area gradually and avoid scratching.",
prevention:"Keep hands and feet warm and dry during cold weather."
};

skincareKnowledge.coldurticaria = {
title:"Cold Urticaria",
explanation:"Cold urticaria is a type of hives triggered by exposure to cold temperatures.",
causes:"Abnormal immune response to cold.",
solution:"Avoid cold exposure and seek medical advice for appropriate treatment.",
prevention:"Dress warmly and avoid sudden temperature changes."
};

skincareKnowledge.heatrashadults = {
title:"Heat Rash in Adults",
explanation:"Heat rash occurs when sweat ducts become blocked, trapping sweat beneath the skin.",
causes:"Hot weather, excessive sweating, and tight clothing.",
solution:"Cool the skin, wear loose clothing, and stay hydrated.",
prevention:"Keep cool and avoid overheating."
};

skincareKnowledge.winteritch = {
title:"Winter Itch",
explanation:"Winter itch is dry, itchy skin that develops during cold, dry weather.",
causes:"Low humidity, indoor heating, and frequent hot showers.",
solution:"Use rich moisturizers, humidifiers, and lukewarm water when bathing.",
prevention:"Moisturize daily during colder months."
};

skincareKnowledge.skinaging = {
title:"Skin Aging",
explanation:"Skin aging is the gradual loss of elasticity, firmness, and hydration over time.",
causes:"Natural aging, UV exposure, smoking, pollution, and lifestyle factors.",
solution:"Use sunscreen, retinoids when appropriate, antioxidants, and maintain healthy habits.",
prevention:"Protect your skin from UV damage and maintain a balanced lifestyle."
};

skincareKnowledge.elastosis = {
title:"Solar Elastosis",
explanation:"Solar elastosis is the degeneration of elastic tissue caused by years of sun exposure.",
causes:"Chronic ultraviolet radiation.",
solution:"Protect the skin from further UV exposure and consult a dermatologist for cosmetic treatment options.",
prevention:"Wear sunscreen every day."
};

skincareKnowledge.crowsfeet = {
title:"Crow's Feet",
explanation:"Crow's feet are fine lines and wrinkles that develop around the outer corners of the eyes.",
causes:"Aging, repetitive facial expressions, and sun exposure.",
solution:"Retinoids, moisturizers, sunscreen, and professional treatments may improve appearance.",
prevention:"Protect the delicate eye area from UV damage."
};

skincareKnowledge.frownlines = {
title:"Frown Lines",
explanation:"Frown lines are vertical wrinkles that develop between the eyebrows over time.",
causes:"Repeated facial expressions, aging, and reduced collagen.",
solution:"Skincare, sunscreen, and cosmetic procedures may reduce their appearance.",
prevention:"Maintain healthy skin and protect against sun damage."
};

skincareKnowledge.laughlines = {
title:"Laugh Lines",
explanation:"Laugh lines are natural facial folds that become more noticeable with age.",
causes:"Aging, smiling, collagen loss, and sun exposure.",
solution:"Hydration, retinoids, sunscreen, and cosmetic treatments.",
prevention:"Maintain skin hydration and daily sun protection."
};

skincareKnowledge.neckwrinkles = {
title:"Neck Wrinkles",
explanation:"Neck wrinkles are folds and fine lines that develop on the neck due to aging and repeated movement.",
causes:"Sun exposure, collagen loss, and looking down at devices frequently.",
solution:"Apply sunscreen and moisturizer to the neck and consider retinoids if suitable.",
prevention:"Extend your skincare routine to your neck daily."
};

skincareKnowledge.techneck = {
title:"Tech Neck",
explanation:"Tech neck refers to horizontal neck lines that develop from repeatedly looking down at phones and tablets.",
causes:"Frequent device use and poor posture.",
solution:"Improve posture, moisturize the neck, and protect it from UV damage.",
prevention:"Hold devices at eye level whenever possible."
};

skincareKnowledge.skinhydration = {
title:"Skin Hydration",
explanation:"Skin hydration refers to the amount of water contained within the skin, helping it remain soft and healthy.",
causes:"Adequate hydration depends on the skin barrier and moisturizing habits.",
solution:"Use hydrating skincare ingredients like hyaluronic acid and moisturizers.",
prevention:"Drink enough fluids and maintain a healthy skincare routine."
};

skincareKnowledge.dehydratedskin = {
title:"Dehydrated Skin",
explanation:"Dehydrated skin lacks water rather than oil and may feel tight, dull, or rough.",
causes:"Weather changes, harsh cleansers, over-exfoliation, and insufficient hydration.",
solution:"Use gentle cleansers, hydrating serums, and moisturizers.",
prevention:"Avoid stripping the skin and hydrate consistently."
};

skincareKnowledge.skinresilience = {
title:"Skin Resilience",
explanation:"Skin resilience is the skin's ability to recover from environmental stress, irritation, and minor damage.",
causes:"Healthy skin barrier, balanced hydration, and good skincare habits improve resilience.",
solution:"Support the skin barrier with gentle products and consistent moisturizing.",
prevention:"Protect the skin from excessive sun, pollution, and harsh skincare."
};

skincareKnowledge.skinph = {
title:"Skin pH",
explanation:"Skin pH measures how acidic or alkaline the skin's surface is. Healthy skin is slightly acidic, which helps protect against harmful bacteria and supports the skin barrier.",
causes:"Harsh soaps, over-cleansing, pollution, and certain skin conditions can disrupt skin pH.",
solution:"Use pH-balanced cleansers and avoid harsh alkaline soaps.",
prevention:"Choose gentle skincare products and avoid excessive washing."
};

skincareKnowledge.acidmantle = {
title:"Acid Mantle",
explanation:"The acid mantle is a thin protective layer made of oils, sweat, and beneficial microorganisms that shields the skin from harmful microbes and moisture loss.",
causes:"Overwashing, harsh cleansers, and excessive exfoliation can damage it.",
solution:"Use gentle cleansers and barrier-repair moisturizers.",
prevention:"Avoid stripping the skin with harsh products."
};

skincareKnowledge.blueLightSkinDamage = {
title:"Blue Light and Skin",
explanation:"Blue light from digital devices and sunlight may contribute to pigmentation and oxidative stress in some people, although its effects are still being studied.",
causes:"Long-term exposure to screens and sunlight.",
solution:"Use antioxidant skincare and broad-spectrum sunscreen.",
prevention:"Limit unnecessary screen exposure and protect your skin outdoors."
};

skincareKnowledge.pollutionskindamage = {
 title:"Pollution and Skin Damage",
 explanation:"Air pollution can contribute to premature aging, dullness, and skin irritation by increasing oxidative stress.",
 causes:"Vehicle emissions, industrial pollution, and airborne particles.",
 solution:"Cleanse gently, use antioxidants, and apply sunscreen daily.",
 prevention:"Cleanse your face after spending time in polluted environments."
};

skincareKnowledge.hardwater = {
 title:"Hard Water and Skin",
 explanation:"Hard water contains high levels of minerals that may leave residue on the skin and contribute to dryness or irritation in some people.",
 causes:"High mineral content in local water supplies.",
 solution:"Use gentle cleansers and moisturize after washing.",
 prevention:"Consider water-softening solutions if hard water is a persistent issue."
};

skincareKnowledge.softwater = {
 title:"Soft Water and Skin",
 explanation:"Soft water contains fewer minerals and may feel gentler on the skin than hard water.",
 causes:"Water treatment processes that remove calcium and magnesium.",
 solution:"Continue using gentle skincare and moisturizers.",
 prevention:"Maintain a healthy skincare routine regardless of water type."
};

skincareKnowledge.facewashingmistakes = {
 title:"Face Washing Mistakes",
 explanation:"Common cleansing mistakes can weaken the skin barrier and contribute to dryness or breakouts.",
 causes:"Using hot water, harsh scrubs, over-cleansing, or sleeping with makeup.",
 solution:"Wash twice daily with a gentle cleanser using lukewarm water.",
 prevention:"Follow a simple, consistent cleansing routine."
};

skincareKnowledge.doublecleansing = {
 title:"Double Cleansing",
 explanation:"Double cleansing involves using an oil-based cleanser followed by a water-based cleanser to thoroughly remove sunscreen, makeup, and excess oil.",
 causes:"Often recommended for people who wear heavy makeup or sunscreen.",
 solution:"Choose gentle cleansers suitable for your skin type.",
 prevention:"Avoid excessive cleansing if your skin feels irritated."
};

skincareKnowledge.facemist = {
 title:"Face Mist",
 explanation:"Face mists are lightweight sprays that can temporarily refresh and hydrate the skin.",
 causes:"Often used during hot weather or in dry indoor environments.",
 solution:"Choose alcohol-free formulas with hydrating ingredients.",
 prevention:"Use as a supplement rather than a replacement for moisturizer."
};

skincareKnowledge.overnightmask = {
title:"Overnight Face Mask",
explanation:"An overnight mask is designed to provide prolonged hydration and support the skin while you sleep.",
causes:"Useful for dry or dehydrated skin.",
solution:"Apply as the last step of your nighttime routine.",
prevention:"Use according to product directions."
};

skincareKnowledge.facialoils = {
title:"Facial Oils",
explanation:"Facial oils help lock in moisture and support the skin barrier, especially for dry skin.",
causes:"Commonly used to reduce moisture loss.",
solution:"Apply after moisturizer or as directed by the product.",
prevention:"Choose oils appropriate for your skin type."
};

skincareKnowledge.occlusives = {
title:"Occlusive Skincare",
explanation:"Occlusive ingredients form a protective layer over the skin to reduce water loss.",
causes:"Often used for dry or compromised skin barriers.",
solution:"Apply as the final step in your skincare routine.",
prevention:"Use appropriately to avoid trapping irritants on acne-prone skin."
};

skincareKnowledge.emollients = {
title:"Emollients",
explanation:"Emollients soften and smooth the skin by filling small gaps between skin cells.",
causes:"Frequently included in moisturizers.",
solution:"Use daily to improve skin comfort and softness.",
prevention:"Maintain regular moisturizing habits."
};

skincareKnowledge.humectants = {
title:"Humectants",
explanation:"Humectants attract water into the outer layers of the skin, improving hydration.",
causes:"Common examples include glycerin and hyaluronic acid.",
solution:"Apply alongside a moisturizer to help retain hydration.",
prevention:"Use consistently in your skincare routine."
};

skincareKnowledge.peptides = {
title:"Peptides",
explanation:"Peptides are short chains of amino acids that help support healthy-looking skin and may improve the appearance of fine lines over time.",
causes:"Naturally found in the skin but decrease with age.",
solution:"Use peptide-containing serums or moisturizers.",
prevention:"Combine with sunscreen for healthy aging."
};

skincareKnowledge.growthfactors = {
title:"Growth Factors in Skincare",
explanation:"Growth factors are proteins used in some skincare products to support skin repair and improve the appearance of aging skin.",
causes:"Often included in advanced anti-aging products.",
solution:"Use as directed and consult a dermatologist if unsure.",
prevention:"Protect your skin daily with sunscreen."
};

skincareKnowledge.collagenloss = {
title:"Collagen Loss",
explanation:"Collagen loss is a natural part of aging that contributes to wrinkles and reduced skin firmness.",
causes:"Aging, UV exposure, smoking, and pollution.",
solution:"Use sunscreen, retinoids when appropriate, and maintain a healthy lifestyle.",
prevention:"Protect your skin from excessive sun exposure."
};

skincareKnowledge.elastin = {
title:"Elastin",
explanation:"Elastin is a protein that allows the skin to stretch and return to its original shape.",
causes:"Natural aging and UV exposure gradually reduce elastin quality.",
solution:"Support skin health with sun protection and a consistent skincare routine.",
prevention:"Avoid excessive sun exposure and smoking."
};

skincareKnowledge.skinrenewal = {
title:"Skin Cell Renewal",
explanation:"Skin cell renewal is the natural process of replacing old skin cells with new ones.",
causes:"This process slows naturally with age.",
solution:"Gentle exfoliation and retinoids may support healthy cell turnover when appropriate.",
prevention:"Maintain healthy skincare habits and sun protection."
};

skincareKnowledge.oxidativestress = {
 title:"Oxidative Stress",
 explanation:"Oxidative stress occurs when free radicals damage skin cells faster than the body can repair them, contributing to premature aging.",
 causes:"UV radiation, pollution, smoking, and poor lifestyle habits.",
 solution:"Use antioxidants, sunscreen, and maintain a healthy lifestyle.",
 prevention:"Protect your skin daily from environmental damage."
};

skincareKnowledge.skinfibroma = {
title:"Skin Fibroma",
explanation:"A skin fibroma is a harmless growth made of fibrous connective tissue. It often appears as a small, firm bump on the skin.",
causes:"Minor skin injury, genetics, or unknown factors.",
solution:"Treatment is usually unnecessary unless it becomes irritated or for cosmetic reasons.",
prevention:"There is no proven way to prevent skin fibromas."
};

skincareKnowledge.dermatofibroma = {
title:"Dermatofibroma",
explanation:"Dermatofibroma is a common, benign skin nodule that usually develops on the legs or arms after minor skin trauma.",
causes:"Insect bites, minor injuries, or unknown causes.",
solution:"Most do not require treatment. Surgical removal is an option if bothersome.",
prevention:"Avoid unnecessary skin trauma where possible."
};

skincareKnowledge.sebaceoushyperplasia = {
title:"Sebaceous Hyperplasia",
explanation:"Sebaceous hyperplasia is an enlargement of oil glands that appears as small yellowish bumps, especially on the face.",
causes:"Aging, genetics, and increased oil gland activity.",
solution:"Dermatological treatments such as electrocautery or laser therapy may improve appearance.",
prevention:"There is no guaranteed prevention."
}

skincareKnowledge.milia = {
title:"Milia",
explanation:"Milia are tiny white cysts that form when dead skin cells become trapped beneath the skin.",
causes:"Skin injury, heavy skincare products, or natural skin renewal.",
solution:"Often disappear naturally or can be removed safely by a dermatologist.",
prevention:"Avoid overly heavy skincare products if prone to milia."
}

skincareKnowledge.syringoma = {
title:"Syringoma",
explanation:"Syringomas are harmless sweat gland tumors that usually appear as tiny flesh-colored bumps around the eyes.",
causes:"Genetics and overgrowth of sweat glands.",
solution:"Treatment is cosmetic and may include laser therapy or electrosurgery.",
prevention:"There is no known prevention."
}

skincareKnowledge.xanthelasma = {
title:"Xanthelasma",
explanation:"Xanthelasma are soft yellow cholesterol deposits that develop around the eyelids.",
causes:"High cholesterol, genetics, or metabolic disorders.",
solution:"Medical evaluation is recommended. Cosmetic removal is available.",
prevention:"Maintain healthy cholesterol levels."
};

skincareKnowledge.lipoma = {
title:"Lipoma",
explanation:"A lipoma is a soft, slow-growing lump made of fatty tissue beneath the skin.",
causes:"Genetics and unknown factors.",
solution:"Usually harmless and only removed if painful or bothersome.",
prevention:"There is no known prevention."
};

skincareKnowledge.epidermoidcyst = {
title:"Epidermoid Cyst",
explanation:"An epidermoid cyst is a slow-growing lump beneath the skin filled with keratin.",
causes:"Blocked hair follicles or skin injury.",
solution:"Medical removal if infected, painful, or bothersome.",
prevention:"Avoid squeezing cysts and protect the skin from trauma."
};

skincareKnowledge.pilarcyst = {
title:"Pilar Cyst",
explanation:"Pilar cysts are benign cysts that commonly develop on the scalp from hair follicles.",
causes:"Genetics and blocked follicles.",
solution:"Surgical removal if necessary.",
prevention:"There is no reliable prevention."
};

skincareKnowledge.skinulcer = {
title:"Skin Ulcer",
explanation:"A skin ulcer is an open sore that develops when skin tissue breaks down and fails to heal properly.",
causes:"Poor circulation, diabetes, pressure, or infection.",
solution:"Proper wound care and treatment of the underlying cause are essential.",
prevention:"Protect the skin and manage chronic medical conditions."
};

skincareKnowledge.venousulcer = {
title:"Venous Leg Ulcer",
explanation:"A venous ulcer is a chronic wound caused by poor blood flow in the leg veins.",
causes:"Chronic venous insufficiency and poor circulation.",
solution:"Compression therapy and professional wound care.",
prevention:"Maintain healthy circulation and wear compression stockings if recommended."
};

skincareKnowledge.arterialulcer = {
title:"Arterial Ulcer",
explanation:"Arterial ulcers result from poor blood supply due to narrowed arteries.",
causes:"Peripheral artery disease and smoking.",
solution:"Urgent medical evaluation and restoration of blood flow.",
prevention:"Control cardiovascular risk factors."
};

skincareKnowledge.pressureulcer = {
title:"Pressure Ulcer",
explanation:"Pressure ulcers are skin injuries caused by prolonged pressure over bony areas.",
causes:"Immobility and reduced blood circulation.",
solution:"Pressure relief, wound care, and medical supervision.",
prevention:"Reposition frequently and use pressure-relieving cushions."
};

skincareKnowledge.skinmaceration = {
title:"Skin Maceration",
explanation:"Skin maceration occurs when the skin becomes overly soft and damaged from prolonged moisture exposure.",
causes:"Sweating, wound dressings, or wet clothing.",
solution:"Keep the area dry and protect the skin barrier.",
prevention:"Reduce prolonged moisture exposure."
};

skincareKnowledge.skinexcoriation = {
title:"Skin Excoriation",
explanation:"Excoriation refers to skin damage caused by scratching, rubbing, or picking.",
causes:"Itchy skin, anxiety, or skin-picking disorder.",
solution:"Treat the underlying cause and protect damaged skin.",
prevention:"Manage itching early and avoid repetitive picking."
};

skincareKnowledge.lichenification = {
title:"Lichenification",
explanation:"Lichenification is thickened, leathery skin caused by repeated scratching or rubbing.",
causes:"Chronic eczema and persistent itching.",
solution:"Treat the itch and avoid scratching.",
prevention:"Manage itchy skin conditions promptly."
};

skincareKnowledge.fissuredskin = {
title:"Skin Fissures",
explanation:"Skin fissures are deep cracks that develop when very dry or inflamed skin splits.",
causes:"Dry skin, eczema, psoriasis, and repeated friction.",
solution:"Moisturize regularly and protect the affected area.",
prevention:"Prevent excessive dryness with daily moisturization."
};

skincareKnowledge.skinatrophy = {
title:"Skin Atrophy",
explanation:"Skin atrophy is thinning of the skin, making it fragile and more easily injured.",
causes:"Aging, prolonged steroid use, or certain medical conditions.",
solution:"Consult a healthcare professional and protect delicate skin.",
prevention:"Use topical steroids only as directed."
};

skincareKnowledge.telangiectasia = {
title:"Telangiectasia",
explanation:"Telangiectasia are tiny enlarged blood vessels visible near the skin's surface.",
causes:"Sun damage, rosacea, aging, and genetics.",
solution:"Laser therapy may reduce their appearance.",
prevention:"Wear sunscreen daily and protect the skin from UV damage."
};

skincareKnowledge.angioma = {
title:"Cherry Angioma",
explanation:"Cherry angiomas are harmless bright red skin growths made of small blood vessels.",
causes:"Aging, genetics, and unknown factors.",
solution:"No treatment is necessary unless they bleed or are cosmetically bothersome.",
prevention:"There is no proven prevention."
};

skincareKnowledge.perioraldermatitis = {
title:"Perioral Dermatitis",
explanation:"Perioral dermatitis is an inflammatory skin condition that causes small red bumps around the mouth, nose, or eyes.",
causes:"Topical steroid creams, heavy facial products, hormonal changes, and certain toothpastes.",
solution:"Stop triggering products under medical guidance and consult a dermatologist for appropriate treatment.",
prevention:"Avoid unnecessary steroid creams on the face and use gentle skincare."
};

skincareKnowledge.perioculardermatitis = {
title:"Periocular Dermatitis",
explanation:"Periocular dermatitis is irritation and inflammation occurring around the eyes.",
causes:"Allergies, cosmetics, eczema, or irritant skincare products.",
solution:"Identify and avoid triggers while using gentle, fragrance-free products.",
prevention:"Patch-test new cosmetics and avoid rubbing the eyes."
};

skincareKnowledge.angularcheilitis = {
title:"Angular Cheilitis",
explanation:"Angular cheilitis causes painful cracks and inflammation at the corners of the mouth.",
causes:"Fungal infection, bacterial infection, saliva irritation, vitamin deficiencies, or poorly fitting dentures.",
solution:"Treatment depends on the cause and may include antifungal or antibacterial medication.",
prevention:"Keep the corners of the mouth dry and maintain good oral hygiene."
};

skincareKnowledge.actinickeratosis = {
title:"Actinic Keratosis",
explanation:"Actinic keratosis is a rough, scaly patch caused by years of sun damage. It can sometimes develop into skin cancer if left untreated.",
causes:"Long-term ultraviolet (UV) exposure.",
solution:"Seek evaluation by a dermatologist for appropriate treatment.",
prevention:"Use sunscreen daily and avoid excessive sun exposure."
};

skincareKnowledge.keratosispilarisrubra = {
title:"Keratosis Pilaris Rubra",
explanation:"Keratosis pilaris rubra is a form of keratosis pilaris that causes persistent redness along with rough bumps.",
causes:"Genetics and excess keratin buildup.",
solution:"Gentle exfoliation, moisturizers containing urea or lactic acid, and patience.",
prevention:"Maintain regular moisturizing habits."
};

skincareKnowledge.erythemanodosum = {
title:"Erythema Nodosum",
explanation:"Erythema nodosum is an inflammatory condition causing tender red nodules, usually on the shins.",
causes:"Infections, medications, autoimmune diseases, or pregnancy.",
solution:"Treat the underlying cause and rest if symptoms are severe.",
prevention:"Prompt treatment of underlying medical conditions."
};

skincareKnowledge.erythemamultiforme = {
title:"Erythema Multiforme",
explanation:"Erythema multiforme is an immune-mediated skin reaction characterized by target-shaped lesions.",
causes:"Herpes simplex infection, medications, or other infections.",
solution:"Medical evaluation is important to identify and manage the underlying trigger.",
prevention:"Manage recurrent infections and avoid known triggers."
},

skincareKnowledge.granulomaannulare = {
title:"Granuloma Annulare",
explanation:"Granuloma annulare is a harmless skin condition causing ring-shaped bumps, usually on the hands and feet.",
causes:"The exact cause is unknown but may involve immune system activity.",
solution:"Many cases resolve without treatment, though creams or injections may be recommended.",
prevention:"There is no known prevention."
},

skincareKnowledge.pyogenicgranuloma = {
title:"Pyogenic Granuloma",
explanation:"A pyogenic granuloma is a small, rapidly growing blood vessel growth that bleeds easily.",
causes:"Minor injury, hormonal changes, or unknown factors.",
solution:"Professional removal is often recommended.",
prevention:"Avoid repeated skin trauma where possible."
},

skincareKnowledge.necrobiosislipoidica = {
title:"Necrobiosis Lipoidica",
explanation:"Necrobiosis lipoidica is a rare skin disorder often associated with diabetes that causes shiny yellow-brown patches.",
causes:"Diabetes and changes in blood vessels.",
solution:"Dermatological evaluation and management of underlying health conditions.",
prevention:"Maintain good diabetes control when applicable."
},

skincareKnowledge.cutaneousvasculitis = {
title:"Cutaneous Vasculitis",
explanation:"Cutaneous vasculitis is inflammation of small blood vessels in the skin, causing spots, bruising, or ulcers.",
causes:"Infections, medications, autoimmune diseases, or unknown factors.",
solution:"Medical assessment is essential to determine the underlying cause.",
prevention:"Treat infections promptly and monitor chronic illnesses."
};

skincareKnowledge.purpura = {
title:"Purpura",
explanation:"Purpura refers to purple spots on the skin caused by bleeding beneath the surface.",
causes:"Blood disorders, medications, infections, or fragile blood vessels.",
solution:"Medical evaluation is necessary to determine the cause.",
prevention:"Manage underlying health conditions appropriately."
};

skincareKnowledge.petechiae = {
title:"Petechiae",
explanation:"Petechiae are tiny red or purple spots caused by bleeding under the skin.",
causes:"Infections, blood clotting disorders, medications, or trauma.",
solution:"Seek medical evaluation, especially if accompanied by fever or illness.",
prevention:"Address underlying medical conditions promptly."
};
skincareKnowledge.ecchymosis = {
title:"Ecchymosis",
explanation:"Ecchymosis is a larger area of bleeding beneath the skin, commonly known as bruising.",
causes:"Trauma, blood disorders, medications, or fragile blood vessels.",
solution:"Most bruises heal naturally, but persistent bruising requires medical evaluation.",
prevention:"Protect the skin from injury where possible."
};

skincareKnowledge.postprocedurecare = {
title:"Post-Procedure Skincare",
explanation:"Post-procedure skincare focuses on helping the skin recover after treatments such as chemical peels, laser therapy, or microneedling.",
causes:"Professional cosmetic procedures temporarily weaken the skin barrier.",
solution:"Use gentle cleansers, moisturizers, sunscreen, and follow professional aftercare instructions.",
prevention:"Choose qualified professionals and follow recovery guidelines."
};

skincareKnowledge.laserresurfacing = {
title:"Laser Skin Resurfacing",
explanation:"Laser skin resurfacing is a cosmetic procedure that improves skin texture, scars, and wrinkles by stimulating new collagen.",
causes:"Performed for cosmetic skin rejuvenation.",
solution:"Recovery requires sun protection and proper aftercare.",
prevention:"Choose experienced professionals and follow post-treatment advice."
};

skincareKnowledge.microneedling = {
title:"Microneedling",
explanation:"Microneedling is a cosmetic treatment that uses tiny needles to stimulate collagen production.",
causes:"Performed to improve acne scars, fine lines, and skin texture.",
solution:"Professional treatment combined with proper aftercare produces the best results.",
prevention:"Always seek treatment from qualified providers."
};

skincareKnowledge.hydrafacial = {
title:"HydraFacial",
explanation:"HydraFacial is a non-invasive facial treatment that cleanses, exfoliates, and hydrates the skin.",
causes:"Used for cosmetic skin maintenance.",
solution:"Regular sessions may improve skin appearance for some individuals.",
prevention:"Maintain a consistent skincare routine between treatments."
};

skincareKnowledge.cryotherapywarts = {
title:"Cryotherapy for Warts",
explanation:"Cryotherapy removes certain skin lesions by freezing them with liquid nitrogen.",
causes:"Commonly used to treat viral warts and some benign growths.",
solution:"Treatment should be performed by a qualified healthcare professional.",
prevention:"Avoid direct contact with contagious warts and maintain good hygiene."
};

skincareKnowledge.skinhealthcheck = {
title:"Skin Health Check",
explanation:"A skin health check is a full-body examination performed to identify suspicious moles, skin cancers, or other skin conditions early.",
causes:"Routine preventive healthcare.",
solution:"Schedule regular skin examinations, especially if you have many moles or significant sun exposure.",
prevention:"Perform monthly self-checks and see a dermatologist for concerning skin changes."
};

skincareKnowledge.babyacne = {
title:"Baby Acne",
explanation:"Baby acne is a common condition that causes small red or white bumps on a newborn's face, especially on the cheeks, forehead, and nose.",
causes:"Maternal hormones, immature skin, and normal newborn development.",
solution:"Wash the baby's face gently with water and avoid harsh skincare products. Most cases clear on their own.",
prevention:"There is no known prevention, but gentle skin care can help avoid irritation."
};

skincareKnowledge.cradlecap = {
title:"Cradle Cap",
explanation:"Cradle cap is a common scalp condition in infants that causes greasy, yellowish scales on the scalp.",
causes:"Overactive oil glands influenced by maternal hormones and natural skin yeast.",
solution:"Gently wash the scalp and loosen scales with a soft brush if recommended.",
prevention:"Regular gentle scalp cleansing may help reduce buildup."
};

skincareKnowledge.diaperrash = {
title:"Diaper Rash",
explanation:"Diaper rash is skin irritation that develops in the diaper area due to prolonged moisture or friction.",
causes:"Wet diapers, friction, diarrhea, yeast infection, and sensitive skin.",
solution:"Change diapers frequently, keep the area dry, and use protective barrier creams.",
prevention:"Keep the diaper area clean and dry with frequent diaper changes."
};

skincareKnowledge.contacturticaria = {
title:"Contact Urticaria",
explanation:"Contact urticaria is an immediate skin reaction that causes itchy hives after touching a triggering substance.",
causes:"Latex, foods, cosmetics, plants, or chemicals.",
solution:"Avoid the trigger and seek medical advice if symptoms are severe.",
prevention:"Identify and avoid substances that trigger reactions."
};

skincareKnowledge.aquagenicurticaria = {
title:"Aquagenic Urticaria",
explanation:"Aquagenic urticaria is a rare condition where contact with water triggers itchy hives.",
causes:"The exact cause is unknown but involves an abnormal immune response.",
solution:"Medical evaluation is necessary. Treatment focuses on symptom control.",
prevention:"There is no proven prevention."
};

skincareKnowledge.dermatographism = {
title:"Dermatographism",
explanation:"Dermatographism is a condition where scratching or rubbing the skin causes raised, red welts.",
causes:"An exaggerated histamine response in the skin.",
solution:"Antihistamines may help reduce symptoms.",
prevention:"Avoid scratching and reduce skin irritation."
};

skincareKnowledge.skinallergytesting = {
title:"Skin Allergy Testing",
explanation:"Skin allergy testing helps identify substances that trigger allergic skin reactions.",
causes:"Performed when allergic contact dermatitis or other allergies are suspected.",
solution:"Testing should be performed by qualified healthcare professionals.",
prevention:"Avoid identified allergens after testing."
};

skincareKnowledge.patchtesting = {
title:"Patch Testing",
explanation:"Patch testing identifies delayed allergic reactions to skincare ingredients or environmental substances.",
causes:"Persistent allergic contact dermatitis.",
solution:"Follow your dermatologist's recommendations after testing.",
prevention:"Avoid products containing confirmed allergens."
};

skincareKnowledge.skinbiopsy = {
title:"Skin Biopsy",
explanation:"A skin biopsy is a medical procedure where a small sample of skin is removed for laboratory examination.",
causes:"Used to diagnose skin diseases, infections, or skin cancer.",
solution:"Keep the biopsy site clean and follow wound care instructions.",
prevention:"Not applicable; this is a diagnostic procedure."
};

skincareKnowledge.woodslampexam = {
title:"Wood's Lamp Examination",
explanation:"A Wood's lamp uses ultraviolet light to help identify certain skin infections and pigmentation disorders.",
causes:"Performed during dermatological evaluation.",
solution:"No treatment is required for the examination itself.",
prevention:"Not applicable."
};

skincareKnowledge.dermoscopy = {
title:"Dermoscopy",
explanation:"Dermoscopy is a non-invasive technique used to examine moles and skin lesions more closely.",
causes:"Performed during skin cancer screening and dermatological assessment.",
solution:"Regular monitoring may be recommended for suspicious lesions.",
prevention:"Routine skin checks help detect changes early."
};

skincareKnowledge.skinselfexam = {
title:"Skin Self-Examination",
explanation:"A skin self-exam involves regularly checking your skin for new or changing spots, moles, or growths.",
causes:"Recommended for early detection of skin cancer and other conditions.",
solution:"Report suspicious changes to a dermatologist promptly.",
prevention:"Perform monthly skin self-examinations."
};

skincareKnowledge.skinbarrierdamage = {
title:"Damaged Skin Barrier",
explanation:"A damaged skin barrier allows moisture to escape and irritants to enter more easily.",
causes:"Over-exfoliation, harsh cleansers, weather changes, and excessive active ingredients.",
solution:"Simplify your skincare routine and focus on barrier repair with gentle moisturizers.",
prevention:"Avoid overusing exfoliating acids and harsh products."
};

skincareKnowledge.reactiveskin = {
title:"Reactive Skin",
explanation:"Reactive skin easily becomes irritated, red, or uncomfortable when exposed to certain products or environmental factors.",
causes:"Sensitive skin, weakened barrier, allergies, or skin conditions.",
solution:"Use fragrance-free, gentle skincare products.",
prevention:"Introduce new products slowly and patch-test first."
};

skincareKnowledge.strawberrylegs = {
title:"Strawberry Legs",
explanation:"Strawberry legs describe dark dots on the legs caused by clogged pores or hair follicles.",
causes:"Shaving, dry skin, keratosis pilaris, and clogged follicles.",
solution:"Gentle exfoliation, moisturizing, and proper shaving techniques.",
prevention:"Keep the skin hydrated and exfoliate regularly."
};

skincareKnowledge.razorbumps = {
title:"Razor Bumps",
explanation:"Razor bumps occur when shaved hairs grow back into the skin, causing inflammation.",
causes:"Curly hair, improper shaving technique, and close shaving.",
solution:"Use proper shaving methods and avoid shaving too closely.",
prevention:"Shave in the direction of hair growth using sharp blades."
};

skincareKnowledge.razorburn = {
title:"Razor Burn",
explanation:"Razor burn is skin irritation that occurs shortly after shaving.",
causes:"Dull blades, dry shaving, and excessive friction.",
solution:"Apply soothing moisturizers and avoid shaving until the skin heals.",
prevention:"Use shaving cream and replace blades regularly."
};

skincareKnowledge.ingrownhair = {
title:"Ingrown Hair",
explanation:"An ingrown hair develops when hair curls back into the skin instead of growing outward.",
causes:"Shaving, waxing, curly hair, and friction.",
solution:"Avoid picking the area and use gentle exfoliation if appropriate.",
prevention:"Use proper hair removal techniques."
};

skincareKnowledge.bodyacne = {
title:"Body Acne",
explanation:"Body acne affects areas such as the back, chest, shoulders, and arms.",
causes:"Hormones, sweat, friction, and clogged pores.",
solution:"Use acne-friendly body washes and wear breathable clothing.",
prevention:"Shower after sweating and avoid tight clothing."
};

skincareKnowledge.bacne = {
title:"Back Acne (Bacne)",
explanation:"Back acne refers specifically to acne affecting the upper and lower back.",
causes:"Oil production, sweat, hormones, and friction from clothing or backpacks.",
solution:"Use benzoyl peroxide or salicylic acid body cleansers if appropriate and maintain consistent hygiene.",
prevention:"Keep the back clean, shower after exercise, and avoid prolonged sweaty clothing."
};

skincareKnowledge.beardruff = {
title:"Beard Dandruff",
explanation:"Beard dandruff is flaking of the skin beneath facial hair, often accompanied by itching and dryness.",
causes:"Dry skin, seborrheic dermatitis, poor beard hygiene, and harsh cleansers.",
solution:"Wash your beard with a gentle beard shampoo, moisturize the skin underneath, and use beard oil if appropriate.",
prevention:"Maintain a regular beard care routine and avoid harsh products."
};

skincareKnowledge.beardacne = {
title:"Beard Acne",
explanation:"Beard acne consists of pimples and clogged pores that develop beneath facial hair.",
causes:"Oil buildup, bacteria, ingrown hairs, shaving irritation, and hormones.",
solution:"Cleanse the beard daily and use acne-friendly skincare products.",
prevention:"Keep facial hair clean and avoid touching your face frequently."
};

skincareKnowledge.beardcare = {
title:"Beard Skincare",
explanation:"Beard skincare focuses on keeping both facial hair and the skin underneath healthy.",
causes:"Neglecting beard hygiene can lead to irritation and dryness.",
solution:"Wash, moisturize, and trim the beard regularly.",
prevention:"Develop a consistent beard care routine."
};

skincareKnowledge.maskne = {
title:"Maskne",
explanation:"Maskne refers to acne and irritation caused by wearing face masks for long periods.",
causes:"Heat, friction, trapped sweat, and bacteria beneath the mask.",
solution:"Use breathable masks, cleanse gently, and moisturize regularly.",
prevention:"Wash reusable masks frequently and change disposable masks as recommended."
};

skincareKnowledge.frictionskin = {
title:"Friction Dermatitis",
explanation:"Friction dermatitis is skin irritation caused by repeated rubbing against clothing or equipment.",
causes:"Tight clothing, sports equipment, or repetitive movement.",
solution:"Reduce friction, moisturize the skin, and wear properly fitting clothing.",
prevention:"Protect areas exposed to repeated rubbing."
};

skincareKnowledge.swimmersitch = {
title:"Swimmer's Itch",
explanation:"Swimmer's itch is an itchy rash caused by an allergic reaction to tiny parasites found in some freshwater lakes.",
causes:"Exposure to contaminated freshwater.",
solution:"Cool compresses and anti-itch treatments may relieve symptoms.",
prevention:"Avoid swimming in affected waters and towel dry immediately."
};

skincareKnowledge.swimmersskin = {
title:"Swimming Pool Skin Care",
explanation:"Swimming pools can dry out the skin because of chlorine exposure.",
causes:"Frequent swimming in chlorinated water.",
solution:"Shower after swimming and apply moisturizer immediately.",
prevention:"Use barrier creams before swimming when appropriate."
};

skincareKnowledge.chlorinerash = {
title:"Chlorine Rash",
explanation:"A chlorine rash is skin irritation that develops after exposure to chlorinated pools.",
causes:"Sensitivity to chlorine and prolonged swimming.",
solution:"Rinse the skin thoroughly and apply fragrance-free moisturizer.",
prevention:"Limit chlorine exposure and shower after swimming."
};

skincareKnowledge.saltwaterskin = {
title:"Salt Water and Skin",
explanation:"Salt water may temporarily improve some skin conditions but can also dry out the skin.",
causes:"Natural salt content removes surface oils.",
solution:"Rinse with fresh water after swimming and moisturize.",
prevention:"Hydrate the skin after beach visits."
};

skincareKnowledge.windburn = {
title:"Windburn",
explanation:"Windburn is skin irritation caused by exposure to strong wind, often combined with cold weather.",
causes:"Cold temperatures, wind, and dry air.",
solution:"Use rich moisturizers and protect exposed skin.",
prevention:"Wear protective clothing and moisturize before going outdoors."
};

skincareKnowledge.altitudeskin = {
title:"High Altitude Skin Care",
explanation:"High-altitude environments can increase skin dryness and UV exposure.",
causes:"Lower humidity and stronger ultraviolet radiation.",
solution:"Use sunscreen and hydrating moisturizers.",
prevention:"Protect the skin whenever traveling to high elevations."
};

skincareKnowledge.airplaneskin = {
title:"Airplane Skin Dryness",
explanation:"Long flights often leave the skin feeling dry because cabin air has very low humidity.",
causes:"Low cabin humidity and dehydration.",
solution:"Drink water regularly and apply moisturizer during flights.",
prevention:"Carry travel-sized skincare products."
};

skincareKnowledge.travelskincare = {
title:"Travel Skincare",
explanation:"Travel can disrupt skincare routines due to climate changes and long journeys.",
causes:"Different weather, stress, and irregular routines.",
solution:"Pack essential skincare products and stay hydrated.",
prevention:"Keep your routine simple while traveling."
};

skincareKnowledge.gymskincare = {
    title:"Gym Skincare",
    explanation:"Exercise benefits the skin, but sweat left on the skin can contribute to irritation or breakouts.",
    causes:"Sweat, bacteria, and friction from workout clothing.",
    solution:"Cleanse the skin after workouts and wear breathable fabrics.",
    prevention:"Avoid staying in sweaty clothes for long periods."
};

skincareKnowledge.helmetacne = {
    title:"Helmet Acne",
    explanation:"Helmet acne develops where helmets trap sweat, oil, and friction against the skin.",
    causes:"Sports helmets, motorcycle helmets, and protective equipment.",
    solution:"Clean helmets regularly and wash the skin after use.",
    prevention:"Use clean helmet liners and maintain good hygiene."
};

skincareKnowledge.makeupbrushhygiene = {
    title:"Makeup Brush Hygiene",
    explanation:"Dirty makeup brushes can transfer oil, bacteria, and old makeup back onto the skin.",
    causes:"Infrequent cleaning of brushes and sponges.",
    solution:"Wash makeup brushes regularly with gentle soap.",
    prevention:"Clean brushes every one to two weeks depending on use."
};

skincareKnowledge.expiredskincare = {
    title:"Expired Skincare Products",
    explanation:"Expired skincare products may become less effective or increase the risk of irritation.",
    causes:"Using products beyond their expiration date.",
    solution:"Discard expired products and replace them with fresh ones.",
    prevention:"Check expiration dates and PAO (Period After Opening) symbols."
};

skincareKnowledge.productlayering = {
    title:"Product Layering",
    explanation:"Product layering refers to applying skincare products in the correct order for maximum effectiveness.",
    causes:"Improper layering can reduce product performance.",
    solution:"Apply products from the thinnest consistency to the thickest.",
    prevention:"Learn the correct order for your skincare routine."
};

skincareKnowledge.skincareroutineorder = {
    title:"Correct Skincare Routine Order",
    explanation:"Following the correct order helps each skincare product work effectively.",
    causes:"Using products in the wrong sequence may reduce absorption.",
    solution:"Generally: Cleanser → Toner → Serum → Moisturizer → Sunscreen (morning).",
    prevention:"Follow a consistent routine every day."
};

skincareKnowledge.minimalistskincare = {
    title:"Minimalist Skincare",
    explanation:"Minimalist skincare focuses on using only a few essential products instead of complicated routines.",
    causes:"Many people benefit from simpler routines that reduce irritation.",
    solution:"Choose effective, evidence-based products suited to your skin type.",
    prevention:"Avoid buying unnecessary skincare products."
};

skincareKnowledge.fragranceskincare = {
    title:"Fragrance in Skincare",
    explanation:"Fragrance is added to many skincare products to improve scent, but it can sometimes irritate sensitive skin.",
    causes:"Natural essential oils, synthetic fragrances, and perfume ingredients.",
    solution:"If you have sensitive skin, choose fragrance-free products whenever possible.",
    prevention:"Patch-test new products and avoid known fragrance allergens."
};

skincareKnowledge.essentialoils = {
    title:"Essential Oils in Skincare",
    explanation:"Essential oils are concentrated plant extracts used in some skincare products for their fragrance or potential benefits.",
    causes:"Derived from flowers, herbs, fruits, and trees.",
    solution:"Use products containing essential oils carefully, especially if you have sensitive skin.",
    prevention:"Always patch-test before using products with essential oils."
};

skincareKnowledge.preservatives = {
    title:"Preservatives in Skincare",
    explanation:"Preservatives prevent bacteria, mold, and fungi from growing in skincare products, making them safer to use.",
    causes:"Necessary in products containing water.",
    solution:"Use products with safe preservatives rather than preservative-free products that may spoil quickly.",
    prevention:"Store skincare products properly and close containers tightly."
};

skincareKnowledge.alcoholinskincare = {
    title:"Alcohol in Skincare",
    explanation:"Some alcohols can dry the skin, while fatty alcohols help moisturize and soften it.",
    causes:"Different types of alcohol serve different purposes in skincare.",
    solution:"Understand ingredient labels and avoid drying alcohols if your skin is easily irritated.",
    prevention:"Choose products suitable for your skin type."
};

skincareKnowledge.comedone = {
    title:"Comedone",
    explanation:"A comedone is a clogged hair follicle that may appear as a blackhead or whitehead.",
    causes:"Oil, dead skin cells, and clogged pores.",
    solution:"Use gentle exfoliants and acne treatments when appropriate.",
    prevention:"Cleanse regularly and avoid pore-clogging products."
};

skincareKnowledge.papule = {
    title:"Papule",
    explanation:"A papule is a small, solid, raised bump on the skin that does not contain pus.",
    causes:"Inflammation from acne, infections, or skin conditions.",
    solution:"Treat the underlying condition and avoid picking at the bump.",
    prevention:"Maintain healthy skincare habits."
};

skincareKnowledge.pustule = {
    title:"Pustule",
    explanation:"A pustule is a raised skin bump filled with pus, commonly seen in inflammatory acne.",
    causes:"Bacterial growth and inflammation within clogged pores.",
    solution:"Avoid squeezing pustules and use acne treatments when appropriate.",
    prevention:"Maintain a consistent acne-friendly skincare routine."
};

skincareKnowledge.nodule = {
    title:"Skin Nodule",
    explanation:"A skin nodule is a larger, deeper lump beneath the skin that may be painful.",
    causes:"Severe acne, cysts, infections, or other skin disorders.",
    solution:"Seek medical advice rather than attempting to squeeze it.",
    prevention:"Treat acne early to reduce the risk of nodules."
};

skincareKnowledge.plaque = {
    title:"Skin Plaque",
    explanation:"A plaque is a broad, raised area of skin that is larger than a papule and commonly seen in psoriasis.",
    causes:"Inflammation, autoimmune diseases, and certain infections.",
    solution:"Treatment depends on the underlying skin condition.",
    prevention:"Manage chronic skin diseases with professional care."
};

skincareKnowledge.vesicle = {
    title:"Vesicle",
    explanation:"A vesicle is a small blister filled with clear fluid.",
    causes:"Friction, eczema, burns, viral infections, or allergic reactions.",
    solution:"Protect the blister and avoid popping it unless advised by a healthcare professional.",
    prevention:"Avoid known irritants and protect the skin from injury."
};

skincareKnowledge.bulla = {
    title:"Bulla",
    explanation:"A bulla is a large fluid-filled blister greater than 5 millimeters in diameter.",
    causes:"Burns, autoimmune diseases, friction, and infections.",
    solution:"Seek medical evaluation for large or unexplained blisters.",
    prevention:"Protect the skin from burns and trauma."
};

skincareKnowledge.macula = {
    title:"Macule",
    explanation:"A macule is a flat area of skin discoloration without any change in texture or thickness.",
    causes:"Freckles, pigmentation disorders, or certain infections.",
    solution:"Treatment depends on the underlying cause.",
    prevention:"Protect the skin from excessive sun exposure."
};

skincareKnowledge.patch = {
    title:"Skin Patch",
    explanation:"A patch is a flat area of skin discoloration larger than one centimeter.",
    causes:"Vitiligo, melasma, eczema, or fungal infections.",
    solution:"Treatment varies according to the underlying diagnosis.",
    prevention:"Early evaluation helps determine the correct treatment."
};

skincareKnowledge.wheal = {
    title:"Wheal",
    explanation:"A wheal is a temporary raised, itchy swelling of the skin commonly seen in hives.",
    causes:"Allergic reactions, infections, medications, or physical triggers.",
    solution:"Identify the trigger and seek medical advice if symptoms are severe.",
    prevention:"Avoid known allergens whenever possible."
};

skincareKnowledge.scale = {
    title:"Skin Scaling",
    explanation:"Scaling refers to the shedding of dead skin cells in visible flakes.",
    causes:"Psoriasis, eczema, fungal infections, and dry skin.",
    solution:"Treat the underlying condition and moisturize regularly.",
    prevention:"Maintain healthy skin hydration."
};

skincareKnowledge.crust = {
    title:"Skin Crusting",
    explanation:"A crust forms when dried blood, pus, or fluid collects on the surface of the skin.",
    causes:"Healing wounds, infections, or skin diseases.",
    solution:"Allow crusts to heal naturally unless directed otherwise by a healthcare professional.",
    prevention:"Protect wounds from infection."
};

skincareKnowledge.erosion = {
    title:"Skin Erosion",
    explanation:"A skin erosion is a shallow loss of the outer layer of skin that usually heals without scarring.",
    causes:"Blisters, friction, or skin diseases.",
    solution:"Keep the area clean and protected during healing.",
    prevention:"Treat skin conditions early and reduce friction."
};

skincareKnowledge.excoriationdisorder = {
    title:"Excoriation Disorder",
    explanation:"Excoriation disorder is a condition in which a person repeatedly picks at their skin, causing injury.",
    causes:"Mental health factors, stress, anxiety, or obsessive behaviors.",
    solution:"Professional medical and psychological support can be beneficial.",
    prevention:"Early recognition and stress management may reduce symptoms."
};

skincareKnowledge.sebum = {
    title:"Sebum",
    explanation:"Sebum is the natural oil produced by sebaceous glands that helps protect and moisturize the skin.",
    causes:"Hormones strongly influence sebum production.",
    solution:"Use skincare products suited to your skin type rather than trying to eliminate all oil.",
    prevention:"Maintain a balanced skincare routine."
};

skincareKnowledge.skinflora = {
    title:"Skin Flora",
    explanation:"Skin flora refers to the beneficial microorganisms naturally living on the skin that help maintain healthy skin.",
    causes:"Everyone has a unique skin microbiome influenced by age, environment, and skincare habits.",
    solution:"Support healthy skin with gentle cleansing and barrier-friendly skincare.",
    prevention:"Avoid unnecessary antibacterial products unless medically recommended."
};

skincareKnowledge.parabeninskincare = {
  title:"Parabens in Skincare",
  explanation:"Parabens are preservatives used in skincare products to prevent the growth of bacteria, mold, and yeast.",
  causes:"They are added to extend product shelf life and maintain product safety.",
  solution:"If you prefer, choose paraben-free products, though approved parabens are considered safe by many regulatory agencies.",
  prevention:"Store skincare products properly and replace expired products."
};

skincareKnowledge.sulfates = {
  title:"Sulfates in Skincare",
  explanation:"Sulfates are cleansing agents that create foam and remove dirt and oil from the skin.",
  causes:"Commonly found in facial cleansers, body washes, and shampoos.",
  solution:"If your skin feels dry or irritated, consider sulfate-free cleansers.",
  prevention:"Choose cleansers suited to your skin type."
};

skincareKnowledge.silicones = {
  title:"Silicones in Skincare",
  explanation:"Silicones create a smooth feel on the skin and help reduce moisture loss.",
  causes:"Common ingredients in moisturizers, primers, and serums.",
  solution:"Most people tolerate silicones well, but those prone to clogged pores may prefer silicone-free formulas.",
  prevention:"Cleanse the skin thoroughly at the end of the day."
};

skincareKnowledge.mineraloil = {
  title:"Mineral Oil",
  explanation:"Mineral oil is a highly purified ingredient that helps prevent moisture loss by forming a protective barrier on the skin.",
  causes:"Frequently used in moisturizers and ointments.",
  solution:"Suitable for many people with dry skin when used appropriately.",
  prevention:"Choose products that match your skin type."
};

skincareKnowledge.petrolatum = {
  title:"Petrolatum",
  explanation:"Petrolatum is an occlusive ingredient that locks moisture into the skin and supports barrier repair.",
  causes:"Commonly found in healing ointments.",
  solution:"Apply to dry or irritated areas as directed.",
  prevention:"Maintain consistent moisturization."
};

skincareKnowledge.ureainskincare = {
  title:"Urea in Skincare",
  explanation:"Urea is a moisturizing ingredient that also gently softens thick or rough skin.",
  causes:"Naturally present in healthy skin and included in many moisturizers.",
  solution:"Use products with appropriate urea concentrations for your skin concern.",
  prevention:"Keep the skin hydrated consistently."
};

skincareKnowledge.allantoin = {
  title:"Allantoin",
  explanation:"Allantoin is a soothing skincare ingredient that helps soften the skin and reduce irritation.",
  causes:"Commonly added to moisturizers and sensitive skin products.",
  solution:"Use products containing allantoin if your skin is easily irritated.",
  prevention:"Maintain a gentle skincare routine."
};

skincareKnowledge.panthenol = {
  title:"Panthenol",
  explanation:"Panthenol, also known as provitamin B5, is a hydrating ingredient that supports skin barrier function.",
  causes:"Widely used in moisturizers and barrier repair products.",
  solution:"Apply consistently to improve hydration.",
  prevention:"Choose moisturizers with barrier-supporting ingredients."
};

skincareKnowledge.centellaasiatica = {
  title:"Centella Asiatica",
  explanation:"Centella asiatica is a plant extract known for its soothing and skin-repairing properties.",
  causes:"Frequently used in products designed for sensitive skin.",
  solution:"Use consistently to support skin recovery.",
  prevention:"Pair with sunscreen for overall skin health."
};

skincareKnowledge.madecassoside = {
  title:"Madecassoside",
  explanation:"Madecassoside is an active compound derived from Centella asiatica that helps calm irritated skin.",
  causes:"Included in many soothing skincare products.",
  solution:"Apply to sensitive or inflamed skin as directed.",
  prevention:"Avoid unnecessary skin irritation."
};

skincareKnowledge.greenteaextract = {
  title:"Green Tea Extract",
  explanation:"Green tea extract contains antioxidants that help protect the skin from environmental stress.",
  causes:"Commonly added to anti-aging and calming skincare products.",
  solution:"Use products containing green tea extract consistently.",
  prevention:"Combine antioxidant skincare with sunscreen."
};

skincareKnowledge.licoricerootextract = {
  title:"Licorice Root Extract",
  explanation:"Licorice root extract is known for helping brighten the appearance of uneven skin tone and soothing irritation.",
  causes:"Frequently included in pigmentation-focused skincare.",
  solution:"Use consistently as part of a balanced skincare routine.",
  prevention:"Always wear sunscreen when treating pigmentation."
};

skincareKnowledge.coenzymeq10 = {
  title:"Coenzyme Q10",
  explanation:"Coenzyme Q10 is an antioxidant naturally found in the body that helps protect skin cells from oxidative stress.",
  causes:"Natural levels decline with age.",
  solution:"Use antioxidant-rich skincare products containing CoQ10.",
  prevention:"Protect skin from excessive UV exposure."
};

skincareKnowledge.ferulicacid = {
  title:"Ferulic Acid",
  explanation:"Ferulic acid is an antioxidant that helps stabilize vitamins C and E while protecting the skin from free radical damage.",
  causes:"Naturally found in certain plants.",
  solution:"Often used in morning antioxidant serums.",
  prevention:"Use alongside daily sunscreen."
};

skincareKnowledge.resveratrol = {
  title:"Resveratrol",
  explanation:"Resveratrol is a plant-derived antioxidant that helps defend the skin against environmental damage.",
  causes:"Extracted from grapes and other plants.",
  solution:"Use antioxidant serums containing resveratrol.",
  prevention:"Maintain consistent sun protection."
};

skincareKnowledge.bakuchiol = {
  title:"Bakuchiol",
  explanation:"Bakuchiol is a plant-derived ingredient often used as an alternative to retinol for improving the appearance of aging skin.",
  causes:"Derived from the Babchi plant.",
  solution:"Use regularly according to product instructions.",
  prevention:"Continue using sunscreen daily."
};

skincareKnowledge.polyhydroxyacids = {
  title:"Polyhydroxy Acids (PHAs)",
  explanation:"PHAs are gentle exfoliating acids that help remove dead skin cells while being suitable for many people with sensitive skin.",
  causes:"Used as milder alternatives to AHAs.",
  solution:"Introduce gradually into your skincare routine.",
  prevention:"Avoid over-exfoliating the skin."
};

skincareKnowledge.mandelicacid = {
  title:"Mandelic Acid",
  explanation:"Mandelic acid is an alpha hydroxy acid with larger molecules that exfoliate the skin more gently than some other AHAs.",
  causes:"Derived from bitter almonds.",
  solution:"Use according to product directions and moisturize afterward.",
  prevention:"Wear sunscreen daily while using exfoliating acids."
};

skincareKnowledge.azelaicacidbenefits = {
  title:"Azelaic Acid Benefits",
  explanation:"Azelaic acid helps improve the appearance of acne, redness, and uneven skin tone.",
  causes:"Naturally produced by certain types of yeast.",
  solution:"Use consistently under professional guidance if needed.",
  prevention:"Support results with a gentle skincare routine."
};

skincareKnowledge.caffeineinskincare = {
  title:"Caffeine in Skincare",
  explanation:"Caffeine is commonly used in eye creams and serums to temporarily reduce the appearance of puffiness.",
  causes:"Its antioxidant and vasoconstrictive properties.",
  solution:"Apply products containing caffeine as directed.",
  prevention:"Maintain healthy sleep habits and hydration."
};

skincareKnowledge.phytophotodermatitis = {
  title:"Phytophotodermatitis",
  explanation:"Phytophotodermatitis is a skin reaction that occurs when certain plant chemicals come into contact with the skin and are then exposed to sunlight.",
  causes:"Limes, celery, parsley, figs, wild parsnip, and UV exposure.",
  solution:"Wash the area immediately, avoid further sun exposure, and seek medical advice if severe.",
  prevention:"Wash your skin after handling certain plants before going into the sun."
};

skincareKnowledge.poisonivy = {
  title:"Poison Ivy Rash",
  explanation:"Poison ivy rash is an allergic skin reaction caused by contact with urushiol oil found in poison ivy, poison oak, and poison sumac.",
  causes:"Direct or indirect contact with urushiol oil.",
  solution:"Wash exposed skin quickly and use appropriate anti-itch treatments.",
  prevention:"Wear protective clothing and avoid contact with poisonous plants."
};

skincareKnowledge.poisonoak = {
  title:"Poison Oak Rash",
  explanation:"Poison oak causes an itchy, blistering rash similar to poison ivy.",
  causes:"Exposure to urushiol oil.",
  solution:"Clean the skin immediately and seek medical care if the rash is widespread.",
  prevention:"Learn to identify poison oak and avoid touching it."
};

skincareKnowledge.poisonsumac = {
  title:"Poison Sumac Rash",
  explanation:"Poison sumac is a plant that can cause severe allergic skin reactions after skin contact.",
  causes:"Urushiol oil exposure.",
  solution:"Wash exposed areas promptly and manage symptoms with appropriate care.",
  prevention:"Avoid areas where poison sumac grows."
};

skincareKnowledge.jellyfishsting = {
  title:"Jellyfish Sting",
  explanation:"Jellyfish stings occur when tentacles release venom into the skin, causing pain and irritation.",
  causes:"Contact with jellyfish tentacles.",
  solution:"Rinse with seawater, remove tentacles carefully, and seek medical attention for severe reactions.",
  prevention:"Avoid swimming in jellyfish-infested waters."
};

skincareKnowledge.coralcuts = {
  title:"Coral Cuts",
  explanation:"Coral cuts are skin injuries caused by sharp coral reefs and may become infected if not cleaned properly.",
  causes:"Contact with coral while swimming or diving.",
  solution:"Clean the wound thoroughly and monitor for signs of infection.",
  prevention:"Wear protective footwear and avoid touching coral."
};

skincareKnowledge.sandburn = {
  title:"Sand Burn",
  explanation:"Sand burn is skin irritation caused by repeated rubbing against sand, especially during sports or beach activities.",
  causes:"Friction between the skin and rough sand.",
  solution:"Clean the affected area and apply moisturizer or protective ointment.",
  prevention:"Wear protective clothing when appropriate."
};

skincareKnowledge.insectbiteprevention = {
  title:"Preventing Insect Bites",
  explanation:"Preventing insect bites helps reduce the risk of itching, allergic reactions, and insect-borne diseases.",
  causes:"Mosquitoes, fleas, ticks, and other insects.",
  solution:"Use insect repellent and wear protective clothing.",
  prevention:"Avoid insect-prone environments whenever possible."
};

skincareKnowledge.mosquitobites = {
  title:"Mosquito Bites",
  explanation:"Mosquito bites cause itchy bumps due to the body's reaction to mosquito saliva.",
  causes:"Mosquito feeding.",
  solution:"Avoid scratching and use anti-itch creams if necessary.",
  prevention:"Use mosquito repellents and protective clothing."
};

skincareKnowledge.tickbites = {
  title:"Tick Bites",
  explanation:"Tick bites can transmit infections if the tick remains attached for an extended period.",
  causes:"Outdoor exposure in grassy or wooded areas.",
  solution:"Remove ticks carefully with tweezers and monitor for symptoms.",
  prevention:"Wear long sleeves and inspect your skin after outdoor activities."
};

skincareKnowledge.fleabites = {
  title:"Flea Bites",
  explanation:"Flea bites appear as small itchy bumps, usually on the legs and ankles.",
  causes:"Contact with fleas from pets or infested environments.",
  solution:"Reduce itching and eliminate fleas from the environment.",
  prevention:"Treat pets regularly for fleas."
};

skincareKnowledge.bedbugbites = {
  title:"Bed Bug Bites",
  explanation:"Bed bug bites often appear in clusters and usually develop overnight.",
  causes:"Bed bug infestation.",
  solution:"Treat symptoms and eliminate bed bugs from the home.",
  prevention:"Inspect mattresses and luggage when traveling."
};

skincareKnowledge.spiderbites = {
  title:"Spider Bites",
  explanation:"Most spider bites are harmless, but some species can cause significant skin injury.",
  causes:"Spider venom after a bite.",
  solution:"Clean the wound and seek medical attention if severe symptoms develop.",
  prevention:"Avoid handling spiders and wear gloves when working outdoors."
};

skincareKnowledge.fireantstings = {
  title:"Fire Ant Stings",
  explanation:"Fire ant stings cause painful burning sensations followed by itchy pustules.",
  causes:"Fire ant venom.",
  solution:"Wash the area and manage pain or itching appropriately.",
  prevention:"Avoid disturbing fire ant nests."
};

skincareKnowledge.skinprobiotics = {
  title:"Probiotics in Skincare",
  explanation:"Probiotics are beneficial microorganisms that may help support the skin's natural microbiome.",
  causes:"Used in some skincare formulations.",
  solution:"Choose products supported by scientific evidence.",
  prevention:"Maintain a healthy skin barrier."
};

skincareKnowledge.postbiotics = {
  title:"Postbiotics in Skincare",
  explanation:"Postbiotics are beneficial compounds produced by probiotics that may support healthy skin.",
  causes:"Included in certain barrier-repair skincare products.",
  solution:"Use consistently as part of a gentle skincare routine.",
  prevention:"Protect your skin barrier."
};

skincareKnowledge.prebioticskincare = {
  title:"Prebiotics in Skincare",
  explanation:"Prebiotics help nourish beneficial microorganisms naturally living on the skin.",
  causes:"Added to microbiome-supporting skincare.",
  solution:"Use products designed for sensitive or barrier-damaged skin.",
  prevention:"Avoid harsh products that disrupt the microbiome."
};

skincareKnowledge.circadianrhythm = {
  title:"Skin Circadian Rhythm",
  explanation:"The skin follows a natural 24-hour rhythm that influences repair, hydration, and oil production.",
  causes:"Natural biological processes.",
  solution:"Maintain both morning and evening skincare routines.",
  prevention:"Get adequate sleep and follow consistent skincare habits."
};

skincareKnowledge.beautysleep = {
  title:"Beauty Sleep",
  explanation:"Quality sleep allows the skin to repair itself and maintain a healthy appearance.",
  causes:"Deep sleep supports collagen production and skin recovery.",
  solution:"Aim for 7–9 hours of quality sleep each night.",
  prevention:"Maintain a regular sleep schedule."
};

skincareKnowledge.sleepdeprivationskin = {
  title:"Sleep Deprivation and Skin",
  explanation:"Poor sleep can contribute to dull skin, dark circles, slower healing, and increased signs of aging.",
  causes:"Chronic sleep deprivation and stress.",
  solution:"Improve sleep habits and maintain healthy skincare.",
  prevention:"Prioritize consistent, restorative sleep."
};

skincareKnowledge.skinfasting = {
title:"Skin Fasting",
explanation:"Skin fasting is the practice of temporarily reducing or stopping skincare products to allow the skin to function naturally.",
causes:"Some people try it to simplify routines or recover from overusing products.",
solution:"If trying skin fasting, continue basic cleansing, moisturizing, and sunscreen while monitoring your skin.",
prevention:"Avoid overloading your skin with unnecessary products."
};

skincareKnowledge.overexfoliation = {
title:"Over-Exfoliation",
explanation:"Over-exfoliation occurs when the skin is exfoliated too frequently, damaging the protective skin barrier.",
causes:"Using multiple acids, scrubs, or retinoids too often.",
solution:"Stop exfoliating temporarily, use gentle moisturizers, and focus on barrier repair.",
prevention:"Limit exfoliation according to your skin type."
};

skincareKnowledge.skincycling = {
title:"Skin Cycling",
explanation:"Skin cycling is a skincare routine that alternates active ingredients with recovery nights to reduce irritation.",
causes:"Designed to improve tolerance to ingredients like retinoids and exfoliating acids.",
solution:"Follow a structured routine with active nights followed by recovery nights.",
prevention:"Introduce powerful ingredients gradually."
};

skincareKnowledge.slugging = {
title:"Slugging",
explanation:"Slugging is a skincare technique where an occlusive ointment is applied as the final nighttime step to reduce water loss.",
causes:"Popular for people with dry or compromised skin barriers.",
solution:"Apply a thin layer over moisturizer before bed if appropriate for your skin type.",
prevention:"Avoid slugging over active acne if it worsens breakouts."
};

skincareKnowledge.skinstreaming = {
title:"Skin Streaming",
explanation:"Skin streaming focuses on simplifying skincare by using fewer, effective products.",
causes:"Growing interest in minimalist skincare routines.",
solution:"Keep only products that address your specific skin concerns.",
prevention:"Avoid buying unnecessary skincare products."
};

skincareKnowledge.glassskin = {
title:"Glass Skin",
explanation:"Glass skin describes skin that appears exceptionally smooth, hydrated, and radiant.",
causes:"Achieved through consistent hydration and healthy skincare habits.",
solution:"Focus on hydration, sunscreen, and gentle skincare.",
prevention:"Maintain long-term healthy skincare practices."
};

skincareKnowledge.cloudskin = {
title:"Cloud Skin",
explanation:"Cloud skin is a beauty trend that creates a soft, natural, semi-matte complexion.",
causes:"Achieved through balanced hydration and lightweight makeup.",
solution:"Use lightweight moisturizers and natural-finish products.",
prevention:"Maintain healthy skin beneath makeup."
};

skincareKnowledge.dolphinskin = {
title:"Dolphin Skin",
explanation:"Dolphin skin refers to a luminous, glossy complexion with healthy-looking hydration.",
causes:"Achieved using hydrating skincare and dewy makeup products.",
solution:"Layer hydrating serums and moisturizers before sunscreen.",
prevention:"Protect skin from dehydration."
};

skincareKnowledge.skinimalism = {
title:"Skinimalism",
explanation:"Skinimalism is a beauty movement encouraging simple skincare and embracing natural skin.",
causes:"Response to overly complicated skincare routines.",
solution:"Use only products your skin genuinely needs.",
prevention:"Avoid following every skincare trend."
};

skincareKnowledge.beautyfilters = {
title:"Beauty Filters and Skin Expectations",
explanation:"Beauty filters can create unrealistic expectations about normal skin texture and appearance.",
causes:"Social media editing tools.",
solution:"Remember that real skin has pores, texture, and natural variation.",
prevention:"Follow educational creators who promote realistic skincare."
};

skincareKnowledge.airpollutionacne = {
title:"Air Pollution and Acne",
explanation:"Air pollution may contribute to clogged pores and inflammation that can worsen acne in some people.",
causes:"Particulate matter, dust, and environmental pollutants.",
solution:"Cleanse gently after spending time outdoors and use antioxidants.",
prevention:"Protect skin with sunscreen and cleanse daily."
};

skincareKnowledge.urbanaging = {
title:"Urban Skin Aging",
explanation:"Urban aging refers to premature skin aging caused by pollution, UV exposure, and environmental stress.",
causes:"Living in highly polluted cities.",
solution:"Use antioxidants, sunscreen, and barrier-supporting moisturizers.",
prevention:"Maintain daily sun protection and cleanse thoroughly."
};

skincareKnowledge.infraredradiation = {
title:"Infrared Radiation and Skin",
explanation:"Infrared radiation generates heat that may contribute to skin aging over time.",
causes:"Sunlight and artificial heat sources.",
solution:"Daily sunscreen remains one of the most effective protective measures.",
prevention:"Limit unnecessary prolonged heat exposure."
};

skincareKnowledge.blueberriesforskin = {
title:"Blueberries and Skin Health",
explanation:"Blueberries contain antioxidants that support overall skin health as part of a balanced diet.",
causes:"Rich in vitamins and plant compounds.",
solution:"Include antioxidant-rich fruits in your diet.",
prevention:"Maintain healthy eating habits."
};

skincareKnowledge.omegathree = {
title:"Omega-3 Fatty Acids and Skin",
explanation:"Omega-3 fatty acids support healthy skin by helping maintain the skin barrier and reducing inflammation.",
causes:"Found in fish, walnuts, and flaxseed.",
solution:"Consume omega-3-rich foods as part of a balanced diet.",
prevention:"Eat a varied, nutrient-rich diet."
};

skincareKnowledge.zincforskin = {
title:"Zinc and Skin",
explanation:"Zinc is an essential mineral involved in wound healing and normal skin function.",
causes:"Obtained through diet or supplements when medically indicated.",
solution:"Meet daily zinc requirements through healthy eating.",
prevention:"Avoid unnecessary supplementation without medical advice."
};

skincareKnowledge.biotinmyth = {
title:"Biotin and Skin: Myth vs Fact",
explanation:"Biotin is important for health, but most people already get enough through their diet, and supplementation is not necessary for everyone.",
causes:"Marketing claims have increased its popularity.",
solution:"Seek medical advice before taking supplements.",
prevention:"Eat a balanced diet instead of relying solely on supplements."
};

skincareKnowledge.collagensupplements = {
title:"Collagen Supplements",
explanation:"Collagen supplements are marketed to support skin elasticity, though research is still evolving.",
causes:"Natural collagen production decreases with age.",
solution:"Combine healthy nutrition with sun protection for the best long-term skin health.",
prevention:"Protect natural collagen by wearing sunscreen daily."
};

skincareKnowledge.hydrationmyths = {
title:"Hydration Myths",
explanation:"Drinking water is important for overall health, but it does not instantly cure dry skin if the skin barrier is damaged.",
causes:"Common skincare misconceptions.",
solution:"Combine proper hydration with daily moisturizing.",
prevention:"Support skin both internally and externally."
};

skincareKnowledge.healthyglow = {
title:"Healthy Skin Glow",
explanation:"Healthy-looking skin usually reflects consistent skincare, good nutrition, adequate sleep, hydration, and sun protection.",
causes:"Overall lifestyle and skin health.",
solution:"Develop healthy daily habits rather than chasing quick fixes.",
prevention:"Be consistent with your skincare routine and healthy lifestyle."
};

skincareKnowledge.pregnancymelasma = {
title:"Pregnancy Melasma",
explanation:"Pregnancy melasma, often called the 'mask of pregnancy,' is a common pigmentation condition that causes dark patches on the face during pregnancy.",
causes:"Hormonal changes combined with sun exposure.",
solution:"Use broad-spectrum sunscreen daily and consult a dermatologist after pregnancy if treatment is desired.",
prevention:"Protect your skin from UV exposure throughout pregnancy."
};

skincareKnowledge.pregnancyacne = {
title:"Pregnancy Acne",
explanation:"Pregnancy acne develops due to hormonal fluctuations that increase oil production during pregnancy.",
causes:"Hormonal changes and increased sebum production.",
solution:"Use pregnancy-safe skincare products and consult your healthcare provider before using acne medications.",
prevention:"Maintain a gentle skincare routine."
};

skincareKnowledge.pregnancystretchmarks = {
title:"Pregnancy Stretch Marks",
explanation:"Stretch marks commonly develop as the skin stretches rapidly during pregnancy.",
causes:"Rapid skin stretching, genetics, and hormonal changes.",
solution:"Moisturizing may improve skin comfort, while treatments after pregnancy may reduce their appearance.",
prevention:"Healthy weight gain during pregnancy may reduce risk."
};

skincareKnowledge.pregnancyskincare = {
title:"Pregnancy Skincare",
explanation:"Pregnancy skincare focuses on protecting both the mother's skin and the developing baby by choosing safe skincare ingredients.",
causes:"Hormonal changes often alter skin sensitivity.",
solution:"Use gentle cleansers, moisturizers, and pregnancy-safe sunscreen.",
prevention:"Always check with your healthcare provider before starting new skincare products."
};

skincareKnowledge.menopausalskin = {
title:"Menopausal Skin",
explanation:"Menopause often causes the skin to become thinner, drier, and less elastic.",
causes:"Declining estrogen levels.",
solution:"Use hydrating moisturizers, sunscreen, and barrier-supporting skincare.",
prevention:"Healthy lifestyle habits help support skin health during menopause."
};

skincareKnowledge.hormonalpigmentation = {
title:"Hormonal Pigmentation",
explanation:"Hormonal pigmentation refers to dark patches that develop because of hormonal changes.",
causes:"Pregnancy, birth control pills, hormone therapy, and endocrine disorders.",
solution:"Sun protection and dermatologist-guided treatments.",
prevention:"Daily sunscreen helps reduce worsening."
};

skincareKnowledge.pcosacne = {
title:"PCOS Acne",
explanation:"PCOS acne is persistent acne linked to hormonal imbalance in people with polycystic ovary syndrome.",
causes:"Elevated androgen hormones increase oil production.",
solution:"Treatment may involve lifestyle changes and medical therapy recommended by healthcare professionals.",
prevention:"Managing PCOS may help improve symptoms."
};

skincareKnowledge.thyroidskin = {
title:"Thyroid Disorders and Skin",
explanation:"Thyroid disorders can affect the skin, causing dryness, puffiness, or changes in texture.",
causes:"Hypothyroidism or hyperthyroidism.",
solution:"Treating the underlying thyroid condition often improves skin symptoms.",
prevention:"Routine medical follow-up for thyroid disease."
};

skincareKnowledge.diabeticskin = {
title:"Diabetes and Skin",
explanation:"Diabetes can affect the skin in many ways, including dryness, slow wound healing, and increased infection risk.",
causes:"High blood sugar affecting circulation and immunity.",
solution:"Control blood sugar and maintain proper skincare.",
prevention:"Good diabetes management supports healthier skin."
};

skincareKnowledge.kidneydisease_skin = {
title:"Kidney Disease and Skin",
explanation:"Chronic kidney disease may cause itchy, dry, or discolored skin.",
causes:"Waste product buildup and mineral imbalances.",
solution:"Medical management and consistent moisturization.",
prevention:"Manage kidney disease with appropriate healthcare."
};

skincareKnowledge.liverdisease_skin = {
title:"Liver Disease and Skin",
explanation:"Certain liver diseases may cause itching, yellowing of the skin, or spider angiomas.",
causes:"Reduced liver function and bile buildup.",
solution:"Medical evaluation is essential.",
prevention:"Maintain liver health and seek treatment early."
};

skincareKnowledge.anemiaskin = {
title:"Anemia and Skin",
explanation:"Anemia may cause pale skin, brittle nails, and delayed wound healing.",
causes:"Iron deficiency or other blood disorders.",
solution:"Treat the underlying cause under medical supervision.",
prevention:"Eat a balanced diet rich in essential nutrients."
};

skincareKnowledge.vitaminddeficiencyskin = {
title:"Vitamin D Deficiency and Skin",
explanation:"Vitamin D plays an important role in skin health and immune function.",
causes:"Limited sun exposure, poor diet, or medical conditions.",
solution:"Discuss appropriate supplementation with your healthcare provider if deficient.",
prevention:"Maintain healthy vitamin D levels."
};

skincareKnowledge.vitamincdeficiency = {
title:"Vitamin C Deficiency",
explanation:"Vitamin C deficiency may impair collagen production and wound healing.",
causes:"Poor nutrition or certain medical conditions.",
solution:"Increase vitamin C intake through diet or supplements if advised.",
prevention:"Eat fruits and vegetables rich in vitamin C."
};

skincareKnowledge.vitamina_skin = {
title:"Vitamin A and Skin",
explanation:"Vitamin A supports healthy skin cell growth and repair.",
causes:"Obtained through diet and certain skincare ingredients.",
solution:"Meet nutritional requirements without exceeding safe limits.",
prevention:"Maintain a balanced diet."
};

skincareKnowledge.seleniumskin = {
title:"Selenium and Skin",
explanation:"Selenium is a trace mineral that contributes to antioxidant defense in the skin.",
causes:"Obtained through foods such as Brazil nuts, seafood, and whole grains.",
solution:"Meet daily nutritional needs through a balanced diet.",
prevention:"Avoid excessive supplementation."
};

skincareKnowledge.copperskin = {
title:"Copper and Skin",
explanation:"Copper contributes to collagen formation and normal skin structure.",
causes:"Naturally present in many foods.",
solution:"Maintain adequate dietary intake.",
prevention:"Eat a balanced diet."
};

skincareKnowledge.magnesiumskin = {
title:"Magnesium and Skin",
explanation:"Magnesium supports numerous body functions, including processes important for healthy skin.",
causes:"Obtained through leafy vegetables, nuts, seeds, and whole grains.",
solution:"Maintain a healthy diet rich in magnesium.",
prevention:"Address deficiencies under medical supervision."
};

skincareKnowledge.protein_skin = {
title:"Protein and Skin Health",
explanation:"Protein provides amino acids needed to build collagen, repair tissues, and maintain healthy skin.",
causes:"Low protein intake may affect skin healing.",
solution:"Consume adequate protein from healthy food sources.",
prevention:"Follow a balanced diet."
};

skincareKnowledge.gutskinaxis = {
title:"Gut-Skin Axis",
explanation:"The gut-skin axis describes the relationship between gut health, the immune system, and skin health. Research suggests the gut microbiome may influence certain skin conditions.",
causes:"Diet, gut microbiome imbalance, stress, and inflammation.",
solution:"Maintain a balanced diet, manage stress, and discuss persistent skin concerns with a healthcare professional.",
prevention:"Support overall health through healthy nutrition and lifestyle habits."
};

skincareKnowledge.nightcream = {
title:"Night Cream",
explanation:"Night creams are moisturizers designed to hydrate and support the skin while you sleep, when natural skin repair is most active.",
causes:"They often contain richer moisturizing ingredients than daytime creams.",
solution:"Apply after your serum as the last step of your nighttime skincare routine.",
prevention:"Choose a night cream suitable for your skin type."
};

skincareKnowledge.daycream = {
title:"Day Cream",
explanation:"Day creams provide lightweight hydration while helping protect the skin from daily environmental stress.",
causes:"They are formulated for daytime wear and are often used under sunscreen or makeup.",
solution:"Apply every morning after cleansing and before sunscreen.",
prevention:"Choose a formula that matches your skin's needs."
};

skincareKnowledge.facialsteam = {
title:"Facial Steaming",
explanation:"Facial steaming exposes the skin to warm steam to temporarily soften surface oils and loosen debris.",
causes:"Often used before cleansing or facials.",
solution:"Limit steaming sessions and moisturize afterward.",
prevention:"Avoid excessive steaming, especially if you have sensitive skin or rosacea."
};

skincareKnowledge.icefacial = {
title:"Ice Facial",
explanation:"Ice facials involve applying cold temperatures to the skin to temporarily reduce puffiness and refresh the complexion.",
causes:"Cold constricts superficial blood vessels for a short period.",
solution:"Wrap ice in a clean cloth instead of placing it directly on the skin.",
prevention:"Avoid prolonged direct ice contact to prevent skin injury."
};

skincareKnowledge.facialmassage = {
title:"Facial Massage",
explanation:"Facial massage may help relax facial muscles and temporarily reduce puffiness while improving product application.",
causes:"Performed manually or with skincare tools.",
solution:"Use gentle upward movements with a facial oil or moisturizer.",
prevention:"Avoid excessive pressure on inflamed or acne-prone skin."
};

skincareKnowledge.gua_sha = {
title:"Gua Sha",
explanation:"Gua Sha is a massage technique using a smooth stone tool to gently glide across the skin.",
causes:"Commonly used in skincare routines for relaxation and temporary puffiness reduction.",
solution:"Always use a lubricant like facial oil before using the tool.",
prevention:"Use gentle pressure and keep the tool clean."
};

skincareKnowledge.jaderoller = {
title:"Jade Roller",
explanation:"A jade roller is a facial massage tool that may temporarily reduce puffiness and provide a cooling sensation.",
causes:"Frequently used in beauty routines.",
solution:"Roll gently from the center of the face outward.",
prevention:"Wash the roller regularly to keep it clean."
};

skincareKnowledge.facialtowel = {
title:"Face Towels",
explanation:"Using clean face towels helps reduce the transfer of bacteria and dirt onto the skin.",
causes:"Dirty towels may contribute to skin irritation or breakouts.",
solution:"Replace or wash face towels every few days.",
prevention:"Use a dedicated towel only for your face."
};

skincareKnowledge.pillowcaseacne = {
title:"Pillowcases and Acne",
explanation:"Pillowcases collect oil, sweat, and bacteria over time, which may contribute to breakouts in some people.",
causes:"Infrequent washing of bedding.",
solution:"Wash pillowcases at least once or twice each week.",
prevention:"Keep bedding clean as part of good skincare hygiene."
};

skincareKnowledge.silkpillowcase = {
title:"Silk Pillowcases",
explanation:"Silk pillowcases create less friction than some fabrics and may feel gentler on the skin and hair.",
causes:"Smooth silk fibers reduce surface friction.",
solution:"Choose high-quality washable silk pillowcases if desired.",
prevention:"Wash pillowcases regularly regardless of material."
};

skincareKnowledge.humidifier = {
title:"Humidifiers and Skin",
explanation:"Humidifiers increase indoor moisture, which may help reduce skin dryness during dry weather.",
causes:"Low indoor humidity from heating or air conditioning.",
solution:"Use a clean humidifier and maintain proper humidity levels.",
prevention:"Clean the humidifier frequently to prevent mold growth."
};

skincareKnowledge.airconditioningskin = {
title:"Air Conditioning and Skin",
explanation:"Air conditioning may dry the skin by reducing humidity indoors.",
causes:"Extended exposure to dry indoor air.",
solution:"Moisturize regularly and stay hydrated.",
prevention:"Consider using a humidifier in dry environments."
};

skincareKnowledge.heaterskin = {
title:"Indoor Heating and Skin",
explanation:"Indoor heating can reduce humidity, causing dry, itchy skin during colder months.",
causes:"Artificial heating systems.",
solution:"Apply moisturizer frequently and avoid excessively hot showers.",
prevention:"Maintain adequate indoor humidity."
};

skincareKnowledge.handcream = {
title:"Hand Cream",
explanation:"Hand creams help restore moisture and protect the skin on the hands from dryness and irritation.",
causes:"Frequent handwashing and environmental exposure.",
solution:"Apply after every hand wash when possible.",
prevention:"Carry a hand cream for regular use."
};

skincareKnowledge.footcare = {
title:"Foot Skincare",
explanation:"Foot skincare helps prevent dryness, cracking, and discomfort while maintaining healthy feet.",
causes:"Pressure, friction, and dry skin.",
solution:"Moisturize daily and wear properly fitting shoes.",
prevention:"Inspect your feet regularly for skin changes."
};

skincareKnowledge.heelcracks = {
title:"Cracked Heels",
explanation:"Cracked heels develop when dry skin around the heel thickens and splits under pressure.",
causes:"Dry skin, prolonged standing, obesity, and poorly fitting footwear.",
solution:"Use thick moisturizers containing urea and wear supportive shoes.",
prevention:"Moisturize the heels consistently."
};

skincareKnowledge.elbowdarkness = {
title:"Dark Elbows",
explanation:"Dark elbows occur when thicker skin develops increased pigmentation from friction or dryness.",
causes:"Repeated rubbing, dry skin, and sun exposure.",
solution:"Moisturize regularly and use gentle exfoliation when appropriate.",
prevention:"Reduce friction and protect exposed skin from the sun."
};

skincareKnowledge.kneedarkness = {
title:"Dark Knees",
explanation:"Dark knees commonly result from friction, dryness, and increased pigmentation.",
causes:"Frequent kneeling, dry skin, and sun exposure.",
solution:"Use moisturizers and sunscreen while avoiding harsh scrubbing.",
prevention:"Maintain skin hydration and minimize repeated friction."
};

skincareKnowledge.bodybrushing = {
title:"Dry Body Brushing",
explanation:"Dry body brushing involves brushing dry skin before bathing to remove loose surface skin cells.",
causes:"Used as part of some body care routines.",
solution:"Brush gently using a clean, soft-bristled brush.",
prevention:"Avoid brushing irritated or broken skin."
};

skincareKnowledge.bodylotion = {
title:"Body Lotion",
explanation:"Body lotion helps maintain hydration, soften the skin, and support the skin barrier across the body.",
causes:"Daily environmental exposure and water loss from the skin.",
solution:"Apply immediately after bathing to lock in moisture.",
prevention:"Use body lotion consistently as part of your daily skincare routine."
};

skincareKnowledge.skinpurging = {
title:"Skin Purging",
explanation:"Skin purging is a temporary increase in breakouts that can occur after starting certain active skincare ingredients that speed up skin cell turnover.",
causes:"Retinoids, AHAs, BHAs, and other exfoliating ingredients.",
solution:"Continue using the product as directed if purging is expected, unless severe irritation occurs. Consult a dermatologist if unsure.",
prevention:"Introduce active ingredients gradually."
};

skincareKnowledge.retinization = {
title:"Retinization",
explanation:"Retinization is the adjustment period when the skin adapts to retinoids, often causing dryness, peeling, or redness.",
causes:"Beginning retinoid treatment too quickly.",
solution:"Use retinoids slowly, moisturize well, and apply sunscreen daily.",
prevention:"Start with a low strength and use only a few nights per week."
};

skincareKnowledge.skinbarrierrepair = {
title:"Skin Barrier Repair",
explanation:"Skin barrier repair focuses on restoring the skin's protective outer layer after irritation or damage.",
causes:"Over-exfoliation, harsh cleansers, weather, and excessive active ingredients.",
solution:"Use ceramides, moisturizers, gentle cleansers, and avoid irritating products temporarily.",
prevention:"Avoid damaging the skin barrier with aggressive routines."
};

skincareKnowledge.transepidermalwaterloss = {
title:"Transepidermal Water Loss (TEWL)",
explanation:"TEWL is the natural loss of water through the skin. Excessive TEWL often indicates a weakened skin barrier.",
causes:"Dry weather, harsh skincare, eczema, and aging.",
solution:"Use barrier-repair moisturizers and avoid over-cleansing.",
prevention:"Protect the skin barrier daily."
};

skincareKnowledge.skinelasticity = {
title:"Skin Elasticity",
explanation:"Skin elasticity is the skin's ability to stretch and return to its original shape.",
causes:"Collagen and elastin naturally decline with age.",
solution:"Sun protection, healthy nutrition, and consistent skincare help maintain elasticity.",
prevention:"Avoid smoking and excessive sun exposure."
};

skincareKnowledge.photoaging = {
title:"Photoaging",
explanation:"Photoaging refers to premature skin aging caused primarily by long-term ultraviolet (UV) exposure.",
causes:"Repeated sun exposure without adequate protection.",
solution:"Use sunscreen daily and consider dermatologist-guided treatments if needed.",
prevention:"Practice consistent sun protection."
};

skincareKnowledge.intrinsicaging = {
title:"Intrinsic Skin Aging",
explanation:"Intrinsic aging is the natural aging process that occurs over time due to genetics and biological changes.",
causes:"Natural aging and genetics.",
solution:"Maintain a healthy lifestyle and consistent skincare routine.",
prevention:"Natural aging cannot be prevented, but healthy habits support skin health."
};

skincareKnowledge.extrinsicaging = {
title:"Extrinsic Skin Aging",
explanation:"Extrinsic aging results from external factors such as UV radiation, smoking, pollution, and lifestyle habits.",
causes:"Environmental damage and unhealthy lifestyle choices.",
solution:"Protect the skin with sunscreen and antioxidant skincare.",
prevention:"Reduce exposure to avoidable environmental damage."
};

skincareKnowledge.freeradicals = {
title:"Free Radicals",
explanation:"Free radicals are unstable molecules that can damage skin cells and contribute to premature aging.",
causes:"Sunlight, pollution, smoking, and normal metabolism.",
solution:"Use antioxidants and sunscreen regularly.",
prevention:"Protect the skin from excessive environmental stress."
};

skincareKnowledge.oxidants = {
title:"Antioxidants and Skin",
explanation:"Antioxidants help protect skin cells from damage caused by free radicals.",
causes:"Naturally found in many fruits, vegetables, and skincare ingredients.",
solution:"Use antioxidant-rich skincare and eat a balanced diet.",
prevention:"Maintain healthy lifestyle habits."
};

skincareKnowledge.skinfirmness = {
title:"Skin Firmness",
explanation:"Skin firmness refers to how tight and resilient the skin feels.",
causes:"Collagen loss, aging, and UV exposure.",
solution:"Use sunscreen and ingredients that support healthy skin structure.",
prevention:"Protect collagen with daily sun protection."
};

skincareKnowledge.expressionlines = {
title:"Expression Lines",
explanation:"Expression lines are wrinkles that develop from repeated facial movements over time.",
causes:"Smiling, frowning, and natural aging.",
solution:"Healthy skincare and sun protection help reduce premature aging.",
prevention:"Protect the skin from UV damage."
};

skincareKnowledge.crepeyskin = {
title:"Crepey Skin",
explanation:"Crepey skin appears thin, loose, and finely wrinkled, resembling crepe paper.",
causes:"Aging, sun damage, and loss of collagen.",
solution:"Hydrating skincare and dermatologist-guided treatments may improve appearance.",
prevention:"Protect skin from excessive sun exposure."
};

skincareKnowledge.skintexture = {
title:"Uneven Skin Texture",
explanation:"Uneven skin texture refers to rough, bumpy, or irregular skin surfaces.",
causes:"Acne scars, enlarged pores, sun damage, and aging.",
solution:"Gentle exfoliation and appropriate skincare may improve texture over time.",
prevention:"Protect skin from UV damage and treat acne early."
};

skincareKnowledge.skinresilience = {
title:"Skin Resilience",
explanation:"Skin resilience is the skin's ability to recover from stress, irritation, and environmental damage.",
causes:"Healthy barrier function and proper hydration support resilience.",
solution:"Use gentle skincare and maintain overall health.",
prevention:"Avoid unnecessary skin irritation."
};

skincareKnowledge.skinfatigue = {
title:"Skin Fatigue",
explanation:"Skin fatigue describes dull, tired-looking skin caused by stress, poor sleep, or environmental factors.",
causes:"Stress, dehydration, poor sleep, and pollution.",
solution:"Prioritize sleep, hydration, and consistent skincare.",
prevention:"Maintain healthy daily habits."
};

skincareKnowledge.digitaleyestrain_skin = {
title:"Digital Lifestyle and Skin",
explanation:"Long hours indoors and heavy screen use may indirectly affect skin health through stress, poor sleep, and reduced outdoor activity.",
causes:"Modern lifestyle habits.",
solution:"Take regular breaks, sleep well, and maintain healthy skincare habits.",
prevention:"Balance screen time with healthy lifestyle choices."
};

skincareKnowledge.seasonalskincare = {
title:"Seasonal Skincare",
explanation:"Skin needs often change with the seasons because temperature and humidity affect hydration and barrier function.",
causes:"Weather changes throughout the year.",
solution:"Adjust moisturizers and cleansers according to the season.",
prevention:"Review your skincare routine as seasons change."
};

skincareKnowledge.winterskincare = {
title:"Winter Skincare",
explanation:"Winter weather often causes dryness because cold air and indoor heating reduce skin moisture.",
causes:"Low humidity and cold temperatures.",
solution:"Use richer moisturizers and avoid very hot showers.",
prevention:"Protect exposed skin and moisturize consistently."
};

skincareKnowledge.summerskincare = {
title:"Summer Skincare",
explanation:"Summer skincare focuses on managing sweat, oil production, and increased UV exposure.",
causes:"Hot weather, humidity, and sunlight.",
solution:"Use lightweight moisturizers, sunscreen, and cleanse after sweating.",
prevention:"Reapply sunscreen and stay hydrated."
};

skincareKnowledge.combinationskin = {
title:"Combination Skin",
explanation:"Combination skin has both oily and dry areas, usually with an oily T-zone and drier cheeks.",
causes:"Genetics, hormones, and environmental factors.",
solution:"Use gentle cleansers and apply products according to different areas of the face.",
prevention:"Choose balanced skincare formulated for combination skin."
};

skincareKnowledge.normalskin = {
title:"Normal Skin",
explanation:"Normal skin is generally balanced with minimal dryness, oiliness, or sensitivity.",
causes:"Healthy skin barrier and balanced oil production.",
solution:"Maintain a simple routine with cleansing, moisturizing, and sunscreen.",
prevention:"Avoid harsh skincare products."
};

skincareKnowledge.dehydratedskin = {
title:"Dehydrated Skin",
explanation:"Dehydrated skin lacks water, not oil, and can affect every skin type.",
causes:"Weather, dehydration, harsh skincare, and excessive cleansing.",
solution:"Use hydrating serums, moisturizers, and drink enough fluids.",
prevention:"Protect the skin barrier and stay hydrated."
};

skincareKnowledge.skinundertones = {
title:"Skin Undertones",
explanation:"Skin undertones are the natural colors beneath the surface of your skin that remain constant regardless of tanning.",
causes:"Genetics.",
solution:"Knowing your undertone helps when choosing makeup and clothing colors.",
prevention:"Not applicable."
};

skincareKnowledge.facemapping = {
title:"Face Mapping",
explanation:"Face mapping is the belief that acne locations reflect internal health problems. Scientific evidence supporting this is limited.",
causes:"Acne usually results from clogged pores, hormones, bacteria, and inflammation.",
solution:"Treat acne based on its actual cause rather than location alone.",
prevention:"Maintain a consistent skincare routine."
};

skincareKnowledge.skinmicroinjury = {
title:"Micro-Injuries to the Skin",
explanation:"Small injuries to the skin occur daily from shaving, scratching, or friction.",
causes:"Minor physical trauma.",
solution:"Keep the skin clean and moisturized while allowing it to heal.",
prevention:"Reduce unnecessary friction and irritation."
};

skincareKnowledge.woundhealing = {
title:"Skin Wound Healing",
explanation:"Wound healing is the body's natural process of repairing damaged skin.",
causes:"Cuts, burns, surgery, or injuries.",
solution:"Keep wounds clean and follow proper wound care instructions.",
prevention:"Protect the skin from injury whenever possible."
};

skincareKnowledge.scarprevention = {
title:"Scar Prevention",
explanation:"Proper wound care may help reduce the appearance of scars after the skin heals.",
causes:"Deep skin injury or inflammation.",
solution:"Avoid picking wounds and protect healing skin from the sun.",
prevention:"Treat wounds promptly and carefully."
};

skincareKnowledge.keloidscars = {
title:"Keloid Scars",
explanation:"Keloids are raised scars that grow beyond the original injury.",
causes:"Genetics and abnormal wound healing.",
solution:"Dermatologists may recommend injections, silicone sheets, or other treatments.",
prevention:"People prone to keloids should minimize unnecessary skin trauma."
};

skincareKnowledge.hypertrophicscars = {
title:"Hypertrophic Scars",
explanation:"Hypertrophic scars are raised scars that stay within the original wound boundaries.",
causes:"Excess collagen production during healing.",
solution:"Silicone gels and dermatologist-recommended treatments may help.",
prevention:"Proper wound care supports healthy healing."
};

skincareKnowledge.skincareexpiration = {
title:"Skincare Storage",
explanation:"Proper storage helps skincare products remain safe and effective.",
causes:"Heat, sunlight, and moisture can damage ingredients.",
solution:"Store products in a cool, dry place away from direct sunlight.",
prevention:"Close containers tightly after each use."
};

skincareKnowledge.cleanbeauty = {
title:"Clean Beauty",
explanation:"Clean beauty is a marketing term without a universal scientific definition.",
causes:"Growing consumer interest in ingredient transparency.",
solution:"Focus on evidence-based ingredients rather than marketing claims.",
prevention:"Read ingredient lists carefully."
};

skincareKnowledge.naturalbeauty = {
title:"Natural Skincare",
explanation:"Natural ingredients can benefit the skin, but natural does not always mean safer or more effective.",
causes:"Plant-derived ingredients.",
solution:"Patch-test all new products regardless of whether they are natural or synthetic.",
prevention:"Use products appropriate for your skin type."
};

skincareKnowledge.organicbeauty = {
title:"Organic Skincare",
explanation:"Organic skincare uses ingredients grown according to organic farming standards.",
causes:"Consumer preference for organically produced ingredients.",
solution:"Choose products based on effectiveness rather than labels alone.",
prevention:"Check product certifications if important to you."
};

skincareKnowledge.veganskincare = {
title:"Vegan Skincare",
explanation:"Vegan skincare products do not contain animal-derived ingredients.",
causes:"Ethical, environmental, or personal preferences.",
solution:"Verify products through trusted certification when possible.",
prevention:"Read ingredient labels carefully."
};

skincareKnowledge.crueltyfree = {
title:"Cruelty-Free Skincare",
explanation:"Cruelty-free products are not tested on animals according to specific certification standards.",
causes:"Ethical manufacturing practices.",
solution:"Look for recognized cruelty-free certifications.",
prevention:"Research brands before purchasing."
};

skincareKnowledge.dermatologist = {
title:"When to See a Dermatologist",
explanation:"Persistent, severe, painful, or changing skin conditions should be evaluated by a dermatologist.",
causes:"Skin diseases that require professional diagnosis or treatment.",
solution:"Seek medical care for concerning skin changes.",
prevention:"Schedule routine skin examinations when appropriate."
};

skincareKnowledge.teledermatology = {
title:"Teledermatology",
explanation:"Teledermatology allows people to consult dermatologists remotely using digital technology.",
causes:"Growing access to virtual healthcare.",
solution:"Provide clear photos and accurate medical history during consultations.",
prevention:"Seek in-person care if urgent symptoms develop."
};

skincareKnowledge.evidencebasedskincare = {
title:"Evidence-Based Skincare",
explanation:"Evidence-based skincare relies on scientific research rather than trends or marketing claims.",
causes:"Clinical research and dermatology studies.",
solution:"Choose products supported by high-quality scientific evidence.",
prevention:"Be cautious of exaggerated skincare claims."
};

skincareKnowledge.healthy_skin = {
title:"Healthy Skin Habits",
explanation:"Healthy skin is supported by daily sunscreen use, gentle cleansing, moisturization, nutritious eating, quality sleep, regular exercise, stress management, and avoiding smoking.",
causes:"Consistent healthy lifestyle habits.",
solution:"Focus on long-term consistency instead of quick fixes.",
prevention:"Build sustainable skincare and wellness habits every day."
};

skincareKnowledge.lichenNitidus = {
title:"Lichen Nitidus",
explanation:"Lichen nitidus is a rare inflammatory skin condition that causes tiny, shiny, flesh-colored bumps on the skin.",
causes:"Unknown immune system reaction.",
solution:"Usually resolves on its own. Topical corticosteroids may help if symptoms persist.",
prevention:"There is no known prevention, but maintaining healthy skin may reduce irritation."
};

skincareKnowledge.pityriasisRubraPilaris = {
title:"Pityriasis Rubra Pilaris",
explanation:"A rare skin disorder that causes reddish-orange scaly patches and thickened skin on the palms and soles.",
causes:"Unknown, sometimes linked to genetic mutations.",
solution:"Treatment includes retinoids, moisturizers and immunosuppressive medications.",
prevention:"No specific prevention is known."
};

skincareKnowledge.elastosisPerforansSerpiginosa = {
title:"Elastosis Perforans Serpiginosa",
explanation:"A rare disorder where abnormal elastic fibers are pushed through the skin, creating ring-shaped bumps.",
causes:"Inherited disorders or certain medications.",
solution:"Dermatological treatments include cryotherapy or laser therapy.",
prevention:"No known prevention."
};

skincareKnowledge.keratosisPilarisRubra = {
title:"Keratosis Pilaris Rubra",
explanation:"A form of keratosis pilaris that causes rough bumps accompanied by persistent redness.",
causes:"Excess keratin buildup around hair follicles.",
solution:"Use moisturizers, exfoliants and gentle skincare.",
prevention:"Maintain regular skin hydration."
};

skincareKnowledge.papularMucinosis = {
title:"Papular Mucinosis",
explanation:"A rare disorder characterized by waxy papules caused by excess mucin deposits in the skin.",
causes:"Abnormal mucin production.",
solution:"Treatment depends on severity and underlying conditions.",
prevention:"No known prevention."
};

skincareKnowledge.porokeratosis = {
title:"Porokeratosis",
explanation:"A group of skin disorders that produce ring-shaped lesions with raised borders.",
causes:"Genetic factors, sun exposure and immune suppression.",
solution:"Cryotherapy, topical medications or laser treatment.",
prevention:"Use sunscreen and avoid excessive sun exposure."
};

skincareKnowledge.nevusSebaceus = {
title:"Nevus Sebaceus",
explanation:"A congenital birthmark composed of overgrown sebaceous glands, usually found on the scalp or face.",
causes:"Developmental skin abnormality before birth.",
solution:"Surgical removal may be recommended if changes occur.",
prevention:"Cannot be prevented."
};

skincareKnowledge.cutaneousAmyloidosis = {
title:"Cutaneous Amyloidosis",
explanation:"A skin disorder caused by abnormal protein deposits that result in itchy or pigmented patches.",
causes:"Protein accumulation within the skin.",
solution:"Topical steroids, antihistamines and laser therapy.",
prevention:"Reduce chronic scratching when possible."
};

skincareKnowledge.calcinosisCutis = {
title:"Calcinosis Cutis",
explanation:"A condition where calcium deposits develop within the skin and underlying tissues.",
causes:"Autoimmune disease, injury or metabolic disorders.",
solution:"Treat the underlying cause; surgery may remove deposits.",
prevention:"Manage underlying medical conditions."
};

skincareKnowledge.subcornealPustularDermatosis = {
title:"Subcorneal Pustular Dermatosis",
explanation:"A rare chronic skin disease marked by recurring pus-filled blisters.",
causes:"Immune system dysfunction.",
solution:"Usually treated with dapsone under medical supervision.",
prevention:"No known prevention."
};

skincareKnowledge.acrodermatitisChronicaAtrophicans = {
title:"Acrodermatitis Chronica Atrophicans",
explanation:"A late skin manifestation of Lyme disease causing bluish discoloration and thinning of the skin.",
causes:"Untreated Borrelia infection.",
solution:"Long-term antibiotics prescribed by a physician.",
prevention:"Prevent tick bites and treat Lyme disease early."
};

skincareKnowledge.pyodermaGangrenosum = {
title:"Pyoderma Gangrenosum",
explanation:"A rare inflammatory condition that causes painful skin ulcers.",
causes:"Immune system abnormalities often linked to systemic disease.",
solution:"Immunosuppressive medications and wound care.",
prevention:"Control underlying inflammatory diseases."
};

skincareKnowledge.necrobiosisLipoidica = {
title:"Necrobiosis Lipoidica",
explanation:"A chronic skin disorder causing yellow-brown patches, commonly on the shins.",
causes:"Often associated with diabetes.",
solution:"Topical steroids and careful wound management.",
prevention:"Good diabetes management may reduce risk."
};

skincareKnowledge.linearIgADermatosis = {
title:"Linear IgA Dermatosis",
explanation:"An autoimmune blistering disease characterized by tense blisters arranged in rings.",
causes:"Abnormal IgA antibody deposits.",
solution:"Usually treated with dapsone and corticosteroids.",
prevention:"No known prevention."
};

skincareKnowledge.eosinophilicFolliculitis = {
title:"Eosinophilic Folliculitis",
explanation:"An itchy inflammatory condition affecting hair follicles.",
causes:"Immune dysfunction, especially in immunocompromised individuals.",
solution:"Topical steroids and antihistamines.",
prevention:"Manage underlying immune conditions."
};

skincareKnowledge.granulomaFaciale = {
title:"Granuloma Faciale",
explanation:"A rare chronic skin disorder causing reddish-brown plaques on the face.",
causes:"Unknown inflammatory process.",
solution:"Laser therapy, corticosteroids or surgery.",
prevention:"No known prevention."
};

skincareKnowledge.reactivePerforatingCollagenosis = {
title:"Reactive Perforating Collagenosis",
explanation:"A disorder in which damaged collagen is expelled through the skin.",
causes:"Genetic factors or chronic diseases such as diabetes.",
solution:"Topical retinoids and treatment of underlying disease.",
prevention:"Control chronic health conditions."
};

skincareKnowledge.erythromelalgia = {
title:"Erythromelalgia",
explanation:"A condition causing episodes of burning pain, redness and warmth in the hands or feet.",
causes:"Nerve dysfunction or blood vessel abnormalities.",
solution:"Cooling measures and medications prescribed by a physician.",
prevention:"Avoid overheating and known triggers."
};

skincareKnowledge.trichodysplasiaSpinulosa = {
title:"Trichodysplasia Spinulosa",
explanation:"A rare viral skin disease seen mainly in immunosuppressed individuals, causing tiny facial spines.",
causes:"Trichodysplasia spinulosa-associated polyomavirus.",
solution:"Reduce immunosuppression if possible and use antiviral therapy.",
prevention:"Careful monitoring in immunocompromised patients."
};

skincareKnowledge.angiokeratoma = {
title:"Angiokeratoma",
explanation:"A benign skin lesion made up of enlarged blood vessels covered by thickened skin.",
causes:"Dilated superficial blood vessels.",
solution:"Laser treatment or surgical removal if necessary.",
prevention:"There is no known prevention."
};

skincareKnowledge.dermatofibrosarcomaProtuberans = {
title:"Dermatofibrosarcoma Protuberans",
explanation:"A rare, slow-growing skin cancer that begins in the deeper layers of the skin and surrounding tissues.",
causes:"Genetic mutations involving skin cells.",
solution:"Wide surgical excision or Mohs surgery is the preferred treatment.",
prevention:"No known prevention, but early detection improves outcomes."
},

skincareKnowledge.epidermolysisBullosa = {
title:"Epidermolysis Bullosa",
explanation:"A group of inherited disorders that cause extremely fragile skin and frequent blistering.",
causes:"Inherited gene mutations affecting skin structure.",
solution:"Protect the skin, prevent infections and receive specialized wound care.",
prevention:"Cannot be prevented because it is genetic."
},

skincareKnowledge.harlequinIchthyosis = {
title:"Harlequin Ichthyosis",
explanation:"A rare, severe genetic disorder causing thick, hard skin plates covering the body at birth.",
causes:"Mutations in the ABCA12 gene.",
solution:"Requires intensive neonatal care and lifelong dermatologic management.",
prevention:"Genetic counseling for affected families."
},

skincareKnowledge.incontinentiaPigmenti = {
title:"Incontinentia Pigmenti",
explanation:"A rare inherited disorder affecting the skin, hair, teeth and nervous system.",
causes:"Mutation in the IKBKG gene.",
solution:"Manage symptoms with regular medical follow-up.",
prevention:"Cannot be prevented."
},

skincareKnowledge.kindlerSyndrome = {
title:"Kindler Syndrome",
explanation:"A rare inherited disorder characterized by skin blistering, photosensitivity and premature aging.",
causes:"Genetic mutation affecting skin integrity.",
solution:"Sun protection and wound care are essential.",
prevention:"Genetic counseling is recommended."
},

skincareKnowledge.mastocytosis = {
title:"Mastocytosis",
explanation:"A condition involving excessive mast cells in the skin, causing itching, flushing and lesions.",
causes:"Abnormal mast cell accumulation.",
solution:"Antihistamines and medications to stabilize mast cells.",
prevention:"No known prevention."
},

skincareKnowledge.nevusComedonicus = {
title:"Nevus Comedonicus",
explanation:"A rare birthmark made up of groups of enlarged hair follicles filled with keratin.",
causes:"Developmental abnormality of hair follicles.",
solution:"Topical retinoids or surgical removal if necessary.",
prevention:"Cannot be prevented."
};

skincareKnowledge.pachyonychiaCongenita = {
title:"Pachyonychia Congenita",
explanation:"A rare inherited condition affecting nails, skin and the soles of the feet.",
causes:"Mutations in keratin genes.",
solution:"Reduce pressure on the feet and manage thickened nails.",
prevention:"Genetic counseling."
};

skincareKnowledge.peelingSkinSyndrome = {
title:"Peeling Skin Syndrome",
explanation:"A rare genetic disorder in which the outer skin layers peel continuously.",
causes:"Inherited mutations affecting skin adhesion.",
solution:"Moisturizers and gentle skin care.",
prevention:"Cannot be prevented."
};

skincareKnowledge.pigmentedPurpuricDermatosis = {
title:"Pigmented Purpuric Dermatosis",
explanation:"A chronic skin condition causing tiny reddish-brown spots on the lower legs.",
causes:"Leakage of small blood vessels.",
solution:"Compression stockings and topical corticosteroids may help.",
prevention:"Avoid prolonged standing if possible."
};

skincareKnowledge.porphyriaCutaneaTarda = {
title:"Porphyria Cutanea Tarda",
explanation:"A metabolic disorder causing fragile skin and blistering after sun exposure.",
causes:"Enzyme deficiency affecting porphyrin metabolism.",
solution:"Phlebotomy, medication and strict sun protection.",
prevention:"Avoid alcohol and excessive sun exposure."
};

skincareKnowledge.prurigoPigmentosa = {
title:"Prurigo Pigmentosa",
explanation:"A rare inflammatory rash that leaves net-like pigmentation after healing.",
causes:"May be associated with ketosis and metabolic changes.",
solution:"Antibiotics such as doxycycline are often effective.",
prevention:"Maintain balanced nutrition."
};

skincareKnowledge.reticularErythematousMucinosis = {
title:"Reticular Erythematous Mucinosis",
explanation:"A rare skin disorder producing net-like red patches on the chest or back.",
causes:"Unknown immune-related mechanism.",
solution:"Antimalarial medications and sun protection.",
prevention:"Avoid excessive UV exposure."
};

skincareKnowledge.scleredema = {
title:"Scleredema",
explanation:"A condition causing thickening and hardening of the skin, especially on the neck and upper back.",
causes:"Diabetes, infections or unknown factors.",
solution:"Treat underlying disease and consider phototherapy.",
prevention:"Good diabetes control."
};

skincareKnowledge.sebaceousHyperplasia = {
  title:"Sebaceous Hyperplasia",
  explanation:"A harmless enlargement of oil glands appearing as small yellowish bumps.",
  causes:"Overgrowth of sebaceous glands with age.",
  solution:"Electrocautery, laser therapy or topical treatments.",
  prevention:"No guaranteed prevention."
};

skincareKnowledge.sweetSyndrome = {
  title:"Sweet Syndrome",
  explanation:"An inflammatory disorder causing painful red plaques accompanied by fever.",
  causes:"Immune system overreaction, infections or cancer.",
  solution:"Systemic corticosteroids are usually very effective.",
  prevention:"Treat underlying triggers."
};

skincareKnowledge.tuftedAngioma = {
  title:"Tufted Angioma",
  explanation:"A rare benign vascular tumor appearing as reddish-purple patches or nodules.",
  causes:"Abnormal blood vessel growth.",
  solution:"Observation or laser treatment depending on symptoms.",
  prevention:"Cannot be prevented."
};

skincareKnowledge.urticariaPigmentosa = {
  title:"Urticaria Pigmentosa",
  explanation:"The most common form of cutaneous mastocytosis, causing brown itchy spots.",
  causes:"Accumulation of mast cells in the skin.",
  solution:"Antihistamines and avoidance of known triggers.",
  prevention:"No known prevention."
};

skincareKnowledge.xerodermaPigmentosum = {
  title:"Xeroderma Pigmentosum",
  explanation:"A rare inherited disorder causing extreme sensitivity to ultraviolet light and greatly increased skin cancer risk.",
  causes:"Defective DNA repair genes.",
  solution:"Strict lifelong UV protection and regular skin examinations.",
  prevention:"Cannot be prevented genetically."
};

skincareKnowledge.zincDeficiencyDermatitis = {
  title:"Zinc Deficiency Dermatitis",
  explanation:"A skin condition caused by inadequate zinc levels, leading to rashes around the mouth, hands and feet.",
  causes:"Poor dietary intake, malabsorption or inherited disorders.",
  solution:"Zinc supplementation and correction of the underlying cause.",
  prevention:"Maintain adequate dietary zinc intake."
};

skincareKnowledge.livedoReticularis = {
title:"Livedo Reticularis",
explanation:"A skin condition that causes a bluish-purple, net-like discoloration, usually on the legs due to reduced blood flow.",
causes:"Cold temperatures, autoimmune diseases, blood vessel disorders or unknown causes.",
solution:"Treat the underlying cause and keep the affected areas warm.",
prevention:"Avoid prolonged exposure to cold and manage underlying medical conditions."
};

skincareKnowledge.livedoRacemosa = {
title:"Livedo Racemosa",
explanation:"A persistent, irregular net-like skin discoloration often associated with serious vascular disorders.",
causes:"Blood vessel abnormalities and autoimmune diseases.",
solution:"Medical evaluation and treatment of the underlying condition.",
prevention:"Control diseases affecting blood circulation."
};

skincareKnowledge.anetoderma = {
title:"Anetoderma",
explanation:"A rare skin disorder where localized areas of skin become loose due to loss of elastic tissue.",
causes:"Unknown, autoimmune diseases or previous skin inflammation.",
solution:"There is no definitive cure; cosmetic treatments may help.",
prevention:"No known prevention."
};

skincareKnowledge.midDermalElastolysis = {
title:"Mid-Dermal Elastolysis",
explanation:"A rare condition causing fine wrinkling due to loss of elastic fibers in the middle layer of the skin.",
causes:"Unknown, possibly autoimmune or sun-related damage.",
solution:"Sun protection and supportive skincare.",
prevention:"Protect the skin from excessive UV exposure."
};

skincareKnowledge.morpheaProfunda = {
title:"Morphea Profunda",
explanation:"A deep form of localized scleroderma affecting the skin and tissues beneath it.",
causes:"Immune system dysfunction.",
solution:"Immunosuppressive medications and physical therapy.",
prevention:"No known prevention."
};

skincareKnowledge.lichenAureus = {
title:"Lichen Aureus",
explanation:"A rare pigmented skin condition producing golden-brown patches, usually on the legs.",
causes:"Inflammation of small blood vessels.",
solution:"Topical corticosteroids and observation.",
prevention:"No known prevention."
};

skincareKnowledge.erythemaInduratum = {
title:"Erythema Induratum",
explanation:"A chronic inflammatory condition causing painful nodules on the lower legs.",
causes:"Often associated with tuberculosis or immune reactions.",
solution:"Treat the underlying infection or inflammation.",
prevention:"Prompt treatment of tuberculosis where applicable."
};

skincareKnowledge.erythemaElevatumDiutinum = {
title:"Erythema Elevatum Diutinum",
explanation:"A rare chronic vasculitis presenting with firm reddish-purple nodules over joints.",
causes:"Immune complex deposition.",
solution:"Dapsone and treatment of underlying disease.",
prevention:"No specific prevention."
};

skincareKnowledge.cutaneousLarvaMigrans = {
title:"Cutaneous Larva Migrans",
explanation:"A parasitic skin infection characterized by winding, itchy tracks beneath the skin.",
causes:"Hookworm larvae from contaminated sand or soil.",
solution:"Antiparasitic medications such as ivermectin or albendazole.",
prevention:"Wear footwear and avoid walking barefoot on contaminated ground."
};

skincareKnowledge.cutaneousLeishmaniasis = {
title:"Cutaneous Leishmaniasis",
explanation:"A parasitic disease causing chronic skin ulcers after sandfly bites.",
causes:"Leishmania parasites transmitted by sandflies.",
solution:"Antiparasitic medications prescribed by a physician.",
prevention:"Use insect repellents and protective clothing."
};

skincareKnowledge.mycetoma = {
title:"Mycetoma",
explanation:"A chronic infection causing swelling, draining sinuses and tissue destruction.",
causes:"Fungi or bacteria entering through skin injuries.",
solution:"Long-term antifungal or antibiotic therapy and sometimes surgery.",
prevention:"Wear protective footwear and avoid skin injuries."
},

skincareKnowledge.noma = {
title:"Noma",
explanation:"A severe gangrenous disease affecting the face, primarily in malnourished children.",
causes:"Malnutrition, poor hygiene and bacterial infection.",
solution:"Urgent antibiotics, nutrition and reconstructive surgery.",
prevention:"Good nutrition, oral hygiene and vaccination."
},

skincareKnowledge.rhinoscleroma = {
title:"Rhinoscleroma",
explanation:"A chronic bacterial infection affecting the nose and upper respiratory tract with skin involvement.",
causes:"Klebsiella rhinoscleromatis infection.",
solution:"Long-term antibiotics.",
prevention:"Prompt treatment of respiratory infections."
},

skincareKnowledge.chromoblastomycosis = {
title:"Chromoblastomycosis",
explanation:"A chronic fungal infection producing wart-like skin lesions.",
causes:"Traumatic implantation of fungi into the skin.",
solution:"Long-term antifungal therapy and surgery if needed.",
prevention:"Wear protective clothing when handling vegetation."
};

skincareKnowledge.lobomycosis = {
title:"Lobomycosis",
explanation:"A rare chronic fungal skin infection causing firm nodules and plaques.",
causes:"Lacazia loboi fungal infection.",
solution:"Surgical removal combined with antifungal treatment.",
prevention:"Avoid skin trauma in endemic regions."
};

skincareKnowledge.blastomycosisOfSkin = {
title:"Blastomycosis of the Skin",
explanation:"A fungal infection that spreads to the skin causing ulcers or wart-like lesions.",
causes:"Blastomyces fungal infection.",
solution:"Prescription antifungal medications.",
prevention:"Avoid exposure in endemic areas when possible."
};

skincareKnowledge.paracoccidioidomycosis = {
title:"Paracoccidioidomycosis",
explanation:"A fungal disease affecting the skin and mucous membranes.",
causes:"Paracoccidioides fungal infection.",
solution:"Long-term antifungal treatment.",
prevention:"Reduce exposure to contaminated soil in endemic regions."
};

skincareKnowledge.sporotrichoidLymphangitis = {
title:"Sporotrichoid Lymphangitis",
explanation:"A skin infection spreading along lymphatic vessels producing nodules.",
causes:"Usually Sporothrix fungus or certain bacteria.",
solution:"Appropriate antifungal or antibiotic therapy.",
prevention:"Wear gloves when gardening or handling plants."
};

skincareKnowledge.bacillaryAngiomatosis = {
title:"Bacillary Angiomatosis",
explanation:"A bacterial infection causing red vascular skin lesions, mainly in immunocompromised individuals.",
causes:"Bartonella bacterial infection.",
solution:"Long-term antibiotic treatment.",
prevention:"Avoid cat scratches and manage immune disorders."
};

skincareKnowledge.trichomycosisAxillaris = {
title:"Trichomycosis Axillaris",
explanation:"A bacterial infection affecting underarm hair, causing yellow, red or black deposits.",
causes:"Corynebacterium bacteria.",
solution:"Shaving the affected hair and using topical antibiotics.",
prevention:"Maintain good hygiene and keep the underarms dry."
};

skincareKnowledge.actinicPrurigo = {
title:"Actinic Prurigo",
explanation:"A chronic itchy skin condition triggered by sunlight, often affecting the face, lips and arms.",
causes:"Abnormal immune response to ultraviolet radiation.",
solution:"Use broad-spectrum sunscreen, protective clothing and prescribed corticosteroids.",
prevention:"Limit sun exposure and wear protective clothing."
};

skincareKnowledge.aquagenicPruritus = {
title:"Aquagenic Pruritus",
explanation:"An intense itching sensation that occurs after contact with water without any visible rash.",
causes:"Unknown, but sometimes associated with blood disorders.",
solution:"Antihistamines, phototherapy and treating any underlying condition.",
prevention:"Use lukewarm water and moisturize after bathing."
};

skincareKnowledge.aquagenicUrticaria = {
title:"Aquagenic Urticaria",
explanation:"A rare condition where contact with water causes itchy hives regardless of the water temperature.",
causes:"Rare allergic-type reaction to water contact.",
solution:"Antihistamines and barrier creams before water exposure.",
prevention:"Minimize prolonged water exposure."
};

skincareKnowledge.blackHeel = {
title:"Black Heel",
explanation:"A harmless condition causing dark spots on the heel due to tiny blood vessel bleeding.",
causes:"Repeated friction or trauma during sports.",
solution:"Reduce friction and allow the skin to heal naturally.",
prevention:"Wear properly fitted footwear."
};

skincareKnowledge.carotenemia = {
title:"Carotenemia",
explanation:"A yellow-orange discoloration of the skin caused by excessive intake of carotene-rich foods.",
causes:"High consumption of carrots, pumpkins and sweet potatoes.",
solution:"Reduce carotene-rich foods if necessary.",
prevention:"Maintain a balanced diet."
};

skincareKnowledge.chilblainLupus = {
title:"Chilblain Lupus",
explanation:"A rare form of lupus causing painful red or purple skin lesions after exposure to cold.",
causes:"Autoimmune disease triggered by cold temperatures.",
solution:"Keep warm and use medications prescribed for lupus.",
prevention:"Protect the skin from cold environments."
};

skincareKnowledge.cutaneousCrohnsDisease = {
title:"Cutaneous Crohn's Disease",
explanation:"A skin manifestation of Crohn's disease causing ulcers, swelling and inflamed skin.",
causes:"Inflammatory bowel disease.",
solution:"Treat the underlying Crohn's disease and manage skin lesions.",
prevention:"Control Crohn's disease with medical treatment."
};

skincareKnowledge.degosDisease = {
title:"Degos Disease",
explanation:"A rare vascular disorder causing porcelain-white skin lesions and possible internal organ involvement.",
causes:"Abnormal blood vessel blockage.",
solution:"Supportive care and specialist management.",
prevention:"No known prevention."
};

skincareKnowledge.discoidLupusErythematosus = {
title:"Discoid Lupus Erythematosus",
explanation:"A chronic autoimmune skin disease causing red, scaly patches that may scar.",
causes:"Autoimmune dysfunction with genetic and environmental factors.",
solution:"Topical corticosteroids, sun protection and immune-modulating medications.",
prevention:"Avoid excessive UV exposure."
};

skincareKnowledge.erythemaAbIgne = {
title:"Erythema Ab Igne",
explanation:"A skin discoloration caused by repeated exposure to moderate heat.",
causes:"Frequent use of heating pads, laptops or heaters.",
solution:"Remove the heat source and monitor skin changes.",
prevention:"Avoid prolonged heat exposure."
};

skincareKnowledge.erythrasma = {
title:"Erythrasma",
explanation:"A superficial bacterial skin infection causing reddish-brown patches in skin folds.",
causes:"Corynebacterium minutissimum infection.",
solution:"Topical or oral antibiotics as prescribed.",
prevention:"Keep skin folds clean and dry."
};

skincareKnowledge.focalDermalHypoplasia = {
title:"Focal Dermal Hypoplasia",
explanation:"A rare genetic disorder affecting the skin, bones and eyes.",
causes:"Mutation in the PORCN gene.",
solution:"Multidisciplinary medical care based on symptoms.",
prevention:"Genetic counseling."
};

skincareKnowledge.granulomaGlutealeInfantum = {
title:"Granuloma Gluteale Infantum",
explanation:"A rare diaper-area condition characterized by reddish-purple nodules in infants.",
causes:"Severe diaper irritation and prolonged moisture.",
solution:"Improve diaper hygiene and treat skin irritation.",
prevention:"Frequent diaper changes and barrier creams."
};

skincareKnowledge.hereditaryHemorrhagicTelangiectasia = {
title:"Hereditary Hemorrhagic Telangiectasia",
explanation:"An inherited disorder causing fragile blood vessels and small red skin spots.",
causes:"Inherited gene mutations affecting blood vessels.",
solution:"Laser treatment and management of bleeding episodes.",
prevention:"Cannot be prevented genetically."
};

skincareKnowledge.ichthyosisLinearisCircumflexa = {
title:"Ichthyosis Linearis Circumflexa",
explanation:"A rare skin disorder producing red, scaly patches with double-edged scaling.",
causes:"Usually associated with Netherton syndrome.",
solution:"Moisturizers and careful dermatologic care.",
prevention:"Cannot be prevented."
};

skincareKnowledge.juvenileXanthogranuloma = {
title:"Juvenile Xanthogranuloma",
explanation:"A benign skin condition causing yellow-orange nodules in infants and young children.",
causes:"Unknown accumulation of immune cells.",
solution:"Most lesions disappear without treatment.",
prevention:"No known prevention."
};

skincareKnowledge.keratodermaBlennorrhagicum = {
title:"Keratoderma Blennorrhagicum",
explanation:"A skin condition associated with reactive arthritis causing thick, scaly lesions on the palms and soles.",
causes:"Reactive arthritis following infection.",
solution:"Treat the underlying arthritis and use topical therapies.",
prevention:"Prompt treatment of triggering infections."
};

skincareKnowledge.lipoidProteinosis = {
title:"Lipoid Proteinosis",
explanation:"A rare inherited disorder causing thickened skin, hoarseness and beaded eyelid papules.",
causes:"Mutation in the ECM1 gene.",
solution:"Symptom management and dermatologic follow-up.",
prevention:"Genetic counseling."
};

skincareKnowledge.miliariaProfunda = {
title:"Miliaria Profunda",
explanation:"A deeper form of heat rash causing flesh-colored bumps after repeated sweating.",
causes:"Blocked sweat ducts.",
solution:"Stay cool and avoid excessive heat.",
prevention:"Wear lightweight clothing and prevent overheating."
};

skincareKnowledge.necrolyticMigratoryErythema = {
title:"Necrolytic Migratory Erythema",
explanation:"A distinctive skin rash often associated with glucagon-producing tumors.",
causes:"Glucagonoma and nutritional deficiencies.",
solution:"Treat the underlying tumor and correct nutritional deficiencies.",
prevention:"Early diagnosis and management of underlying disease."
};

skincareKnowledge.acrocyanosis = {
title:"Acrocyanosis",
explanation:"A condition characterized by persistent bluish discoloration of the hands and feet due to reduced oxygen in small blood vessels.",
causes:"Cold exposure, poor circulation or nervous system dysfunction.",
solution:"Keep the body warm and treat any underlying circulatory disorder.",
prevention:"Protect the hands and feet from cold temperatures."
};

skincareKnowledge.angiomaSerpiginosum = {
title:"Angioma Serpiginosum",
explanation:"A rare vascular disorder causing tiny red spots that gradually spread in a serpentine pattern.",
causes:"Abnormal development of superficial blood vessels.",
solution:"Laser therapy can improve the appearance.",
prevention:"There is no known prevention."
};

skincareKnowledge.atrophodermaOfPasiniPierini = {
title:"Atrophoderma of Pasini-Pierini",
explanation:"A rare skin disorder causing depressed, darkened patches without significant inflammation.",
causes:"Unknown, possibly related to localized scleroderma.",
solution:"Observation or dermatologic treatment if symptoms develop.",
prevention:"No known prevention."
};

skincareKnowledge.blueRubberBlebNevusSyndrome = {
title:"Blue Rubber Bleb Nevus Syndrome",
explanation:"A rare condition involving soft blue vascular lesions on the skin and internal organs.",
causes:"Congenital blood vessel abnormalities.",
solution:"Laser therapy or surgery for problematic lesions.",
prevention:"Cannot be prevented."
};

skincareKnowledge.cutaneousHorn = {
title:"Cutaneous Horn",
explanation:"A cone-shaped projection of hardened keratin that develops on the skin.",
causes:"Sun damage, warts or underlying skin tumors.",
solution:"Surgical removal and examination of the base.",
prevention:"Protect the skin from excessive sun exposure."
};

skincareKnowledge.elastoderma = {
title:"Elastoderma",
explanation:"A rare disorder causing loose, sagging skin due to excessive elastic tissue.",
causes:"Abnormal accumulation of elastic fibers.",
solution:"Surgical correction if necessary.",
prevention:"No known prevention."
};

skincareKnowledge.fibrokeratoma = {
title:"Fibrokeratoma",
explanation:"A small benign skin growth commonly found on fingers or toes.",
causes:"Unknown, sometimes related to minor trauma.",
solution:"Simple surgical removal.",
prevention:"Avoid repeated injury to the skin."
};

skincareKnowledge.generalizedEssentialTelangiectasia = {
title:"Generalized Essential Telangiectasia",
explanation:"A condition causing widespread visible small blood vessels across the skin.",
causes:"Unknown abnormalities of superficial blood vessels.",
solution:"Laser treatment may reduce visibility.",
prevention:"No specific prevention."
};

skincareKnowledge.hebraPrurigo = {
title:"Hebra Prurigo",
explanation:"A chronic itchy skin disorder marked by firm papules and intense scratching.",
causes:"Unknown, possibly related to chronic allergic reactions.",
solution:"Topical corticosteroids and antihistamines.",
prevention:"Avoid scratching and control allergies."
};

skincareKnowledge.idiopathicGuttateHypomelanosis = {
title:"Idiopathic Guttate Hypomelanosis",
explanation:"Small white spots that commonly appear on sun-exposed skin with aging.",
causes:"Sun damage and aging.",
solution:"Usually no treatment is required, though cosmetic therapies are available.",
prevention:"Regular sunscreen use."
};

skincareKnowledge.keratoacanthoma = {
title:"Keratoacanthoma",
explanation:"A rapidly growing skin tumor that often resembles squamous cell carcinoma.",
causes:"Sun exposure and genetic susceptibility.",
solution:"Surgical removal is recommended.",
prevention:"Protect the skin from UV radiation."
};

skincareKnowledge.lipodermatosclerosis = {
title:"Lipodermatosclerosis",
explanation:"A chronic inflammatory condition of the lower legs associated with poor venous circulation.",
causes:"Chronic venous insufficiency.",
solution:"Compression therapy and treatment of venous disease.",
prevention:"Maintain healthy circulation and avoid prolonged standing."
};

skincareKnowledge.mucinosisFollicularis = {
    title:"Mucinosis Follicularis",
    explanation:"A rare disorder where mucin accumulates around hair follicles, causing patches of hair loss.",
    causes:"Unknown inflammatory process.",
    solution:"Topical corticosteroids or treatment of underlying disease.",
    prevention:"No known prevention."
};

skincareKnowledge.nevusAnemicus = {
    title:"Nevus Anemicus",
    explanation:"A congenital pale skin patch caused by localized blood vessel sensitivity.",
    causes:"Developmental vascular abnormality.",
    solution:"No treatment is usually necessary.",
    prevention:"Cannot be prevented."
};

skincareKnowledge.papularElastorrhexis = {
    title:"Papular Elastorrhexis",
    explanation:"A rare disorder causing multiple small white or flesh-colored papules due to loss of elastic fibers.",
    causes:"Unknown.",
    solution:"Usually requires no treatment.",
    prevention:"No known prevention."
};

skincareKnowledge.reticulateAcropigmentationOfKitamura = {
    title:"Reticulate Acropigmentation of Kitamura",
    explanation:"A rare inherited pigmentation disorder affecting the backs of the hands and feet.",
    causes:"Genetic mutation.",
    solution:"Laser therapy may improve cosmetic appearance.",
    prevention:"Cannot be prevented."
};

skincareKnowledge.scleredemaAdultorum = {
    title:"Scleredema Adultorum",
    explanation:"A connective tissue disorder causing thick, stiff skin over the neck and upper body.",
    causes:"Diabetes, infections or unknown factors.",
    solution:"Treat underlying disease and consider phototherapy.",
    prevention:"Good control of diabetes may reduce risk."
};

skincareKnowledge.terraFirmaFormeDermatosis = {
    title:"Terra Firma-Forme Dermatosis",
    explanation:"A harmless skin condition where dirt-like brown patches persist despite normal washing.",
    causes:"Delayed skin cell shedding.",
    solution:"Clean the affected area with 70% isopropyl alcohol.",
    prevention:"Maintain regular skin hygiene."
};

skincareKnowledge.whiteFibrousPapulosisOfTheNeck = {
    title:"White Fibrous Papulosis of the Neck",
    explanation:"A benign condition causing small white papules on the neck in older adults.",
    causes:"Age-related changes in collagen and elastic fibers.",
    solution:"Usually no treatment is required, though laser therapy may help cosmetically.",
    prevention:"There is no known prevention."
};

skincareKnowledge.acrodermatitisEnteropathica = {
    title:"Acrodermatitis Enteropathica",
    explanation:"A rare inherited disorder that causes zinc deficiency, resulting in skin rashes, hair loss and diarrhea.",
    causes:"Inherited inability to absorb zinc or severe zinc deficiency.",
    solution:"Lifelong zinc supplementation under medical supervision.",
    prevention:"Early diagnosis and consistent zinc supplementation."
};

skincareKnowledge.amyloidosisCutisDyschromica = {
    title:"Amyloidosis Cutis Dyschromica",
    explanation:"A rare inherited form of skin amyloidosis causing mottled dark and light pigmentation.",
    causes:"Genetic mutations leading to amyloid deposits in the skin.",
    solution:"Sun protection and supportive dermatologic care.",
    prevention:"Cannot be prevented genetically."
};

skincareKnowledge.basalCellNevusSyndrome = {
    title:"Basal Cell Nevus Syndrome",
    explanation:"A genetic disorder characterized by multiple basal cell carcinomas and developmental abnormalities.",
    causes:"Mutation in the PTCH1 gene.",
    solution:"Regular skin examinations and early treatment of skin cancers.",
    prevention:"Genetic counseling and sun protection."
};

skincareKnowledge.calciphylaxis = {
    title:"Calciphylaxis",
    explanation:"A rare, life-threatening condition causing painful skin ulcers due to calcium buildup in blood vessels.",
    causes:"Kidney disease, calcium imbalance and certain medications.",
    solution:"Urgent medical treatment, wound care and correction of calcium metabolism.",
    prevention:"Careful management of kidney disease and mineral balance."
};

skincareKnowledge.confluentReticulatedPapillomatosis = {
    title:"Confluent Reticulated Papillomatosis",
    explanation:"A skin disorder causing brown, scaly patches that merge into a net-like pattern.",
    causes:"Unknown, possibly abnormal keratinization or bacterial involvement.",
    solution:"Oral antibiotics such as minocycline are often effective.",
    prevention:"Maintain healthy skin hygiene."
};

skincareKnowledge.cutaneousEndometriosis = {
    title:"Cutaneous Endometriosis",
    explanation:"A rare condition where endometrial tissue grows within the skin, often near surgical scars.",
    causes:"Implantation of endometrial cells during surgery.",
    solution:"Surgical removal and hormonal therapy when appropriate.",
    prevention:"Careful surgical techniques may reduce risk."
};

skincareKnowledge.disseminatedSuperficialActinicPorokeratosis = {
    title:"Disseminated Superficial Actinic Porokeratosis",
    explanation:"A common form of porokeratosis producing numerous scaly lesions on sun-exposed skin.",
    causes:"Genetic predisposition and chronic sun exposure.",
    solution:"Cryotherapy, topical medications or laser therapy.",
    prevention:"Use sunscreen daily."
};

skincareKnowledge.eccrineAngiomatousHamartoma = {
    title:"Eccrine Angiomatous Hamartoma",
    explanation:"A rare benign skin lesion containing excess sweat glands and blood vessels.",
    causes:"Congenital developmental abnormality.",
    solution:"Surgical removal if painful or bothersome.",
    prevention:"Cannot be prevented."
};

skincareKnowledge.epidermodysplasiaVerruciformis = {
    title:"Epidermodysplasia Verruciformis",
    explanation:"A rare inherited disorder causing widespread HPV infections and increased skin cancer risk.",
    causes:"Genetic susceptibility to specific HPV types.",
    solution:"Regular skin monitoring and removal of suspicious lesions.",
    prevention:"Sun protection and dermatologic follow-up."
};

skincareKnowledge.familialBenignPemphigus = {
    title:"Familial Benign Pemphigus",
    explanation:"Also known as Hailey-Hailey disease, it causes recurrent blisters and erosions in skin folds.",
    causes:"Mutation in the ATP2C1 gene.",
    solution:"Topical corticosteroids, antibiotics and gentle skin care.",
    prevention:"Reduce friction, sweating and heat exposure."
};

skincareKnowledge.giantCongenitalMelanocyticNevus = {
    title:"Giant Congenital Melanocytic Nevus",
    explanation:"A large pigmented birthmark present at birth with an increased melanoma risk.",
    causes:"Abnormal growth of melanocytes during fetal development.",
    solution:"Regular monitoring and surgical management when appropriate.",
    prevention:"Cannot be prevented."
};

skincareKnowledge.hypomelanosisOfIto = {
    title:"Hypomelanosis of Ito",
    explanation:"A rare condition causing streaks or patches of lighter skin following developmental skin patterns.",
    causes:"Genetic mosaicism.",
    solution:"Supportive care and monitoring for associated conditions.",
    prevention:"Cannot be prevented."
};

skincareKnowledge.lichenSpinulosus = {
    title:"Lichen Spinulosus",
    explanation:"A rare skin disorder producing groups of tiny rough, spiny papules.",
    causes:"Unknown, possibly related to abnormal keratinization.",
    solution:"Moisturizers and keratolytic creams.",
    prevention:"Maintain good skin hydration."
};

skincareKnowledge.multicentricReticulohistiocytosis = {
    title:"Multicentric Reticulohistiocytosis",
    explanation:"A rare inflammatory disease affecting the skin and joints with reddish-brown nodules.",
    causes:"Unknown immune-mediated process.",
    solution:"Immunosuppressive medications and rheumatologic care.",
    prevention:"No known prevention."
};

skincareKnowledge.papulonecroticTuberculid = {
    title:"Papulonecrotic Tuberculid",
    explanation:"A hypersensitivity reaction to tuberculosis causing recurring necrotic papules.",
    causes:"Immune response to Mycobacterium tuberculosis.",
    solution:"Anti-tuberculosis treatment.",
    prevention:"Early diagnosis and treatment of tuberculosis."
};

skincareKnowledge.perforatingFolliculitis = {
    title:"Perforating Folliculitis",
    explanation:"A skin disorder where damaged material is expelled through hair follicles.",
    causes:"Diabetes, kidney disease or unknown factors.",
    solution:"Topical retinoids and treatment of underlying illness.",
    prevention:"Control chronic medical conditions."
};

skincareKnowledge.phytophotodermatitis = {
    title:"Phytophotodermatitis",
    explanation:"A skin reaction caused when certain plant chemicals combine with sunlight.",
    causes:"Contact with citrus fruits, celery or other plants followed by UV exposure.",
    solution:"Cool compresses, topical steroids and sun protection.",
    prevention:"Wash the skin after plant contact and avoid sun exposure."
};

skincareKnowledge.pseudoxanthomaElasticum = {
    title:"Pseudoxanthoma Elasticum",
    explanation:"A genetic disorder affecting elastic fibers in the skin, eyes and blood vessels.",
    causes:"Mutation in the ABCC6 gene.",
    solution:"Regular monitoring by dermatologists, ophthalmologists and cardiologists.",
    prevention:"Cannot be prevented genetically."
};

skincareKnowledge.transientAcantholyticDermatosis = {
    title:"Transient Acantholytic Dermatosis",
    explanation:"Also called Grover's disease, it causes itchy red bumps mainly on the chest and back.",
    causes:"Heat, sweating and dry skin may trigger it.",
    solution:"Topical corticosteroids and keeping the skin cool.",
    prevention:"Avoid excessive heat and sweating."
};

skincareKnowledge.xanthomaDisseminatum = {
    title:"Xanthoma Disseminatum",
    explanation:"A rare disorder characterized by widespread yellow-brown nodules caused by lipid-laden immune cells.",
    causes:"Abnormal proliferation of histiocytes.",
    solution:"Treatment depends on severity and may include immunosuppressive therapy.",
    prevention:"No known prevention."
};

skincareKnowledge.acrodermatitisEnteropathica = {
title:"Acrodermatitis Enteropathica",
explanation:"A rare inherited disorder that causes zinc deficiency, resulting in skin rashes, hair loss and diarrhea.",
causes:"Inherited inability to absorb zinc or severe zinc deficiency.",
solution:"Lifelong zinc supplementation under medical supervision.",
prevention:"Early diagnosis and consistent zinc supplementation."
};

skincareKnowledge.amyloidosisCutisDyschromica = {
    title:"Amyloidosis Cutis Dyschromica",
    explanation:"A rare inherited form of skin amyloidosis causing mottled dark and light pigmentation.",
    causes:"Genetic mutations leading to amyloid deposits in the skin.",
    solution:"Sun protection and supportive dermatologic care.",
    prevention:"Cannot be prevented genetically."
};

skincareKnowledge.basalCellNevusSyndrome = {
    title:"Basal Cell Nevus Syndrome",
    explanation:"A genetic disorder characterized by multiple basal cell carcinomas and developmental abnormalities.",
    causes:"Mutation in the PTCH1 gene.",
    solution:"Regular skin examinations and early treatment of skin cancers.",
    prevention:"Genetic counseling and sun protection."
};

skincareKnowledge.calciphylaxis = {
    title:"Calciphylaxis",
    explanation:"A rare, life-threatening condition causing painful skin ulcers due to calcium buildup in blood vessels.",
    causes:"Kidney disease, calcium imbalance and certain medications.",
    solution:"Urgent medical treatment, wound care and correction of calcium metabolism.",
    prevention:"Careful management of kidney disease and mineral balance."
};

skincareKnowledge.confluentReticulatedPapillomatosis = {
    title:"Confluent Reticulated Papillomatosis",
    explanation:"A skin disorder causing brown, scaly patches that merge into a net-like pattern.",
    causes:"Unknown, possibly abnormal keratinization or bacterial involvement.",
    solution:"Oral antibiotics such as minocycline are often effective.",
    prevention:"Maintain healthy skin hygiene."
};

skincareKnowledge.cutaneousEndometriosis = {
    title:"Cutaneous Endometriosis",
    explanation:"A rare condition where endometrial tissue grows within the skin, often near surgical scars.",
    causes:"Implantation of endometrial cells during surgery.",
    solution:"Surgical removal and hormonal therapy when appropriate.",
    prevention:"Careful surgical techniques may reduce risk."
};

skincareKnowledge.disseminatedSuperficialActinicPorokeratosis = {
    title:"Disseminated Superficial Actinic Porokeratosis",
    explanation:"A common form of porokeratosis producing numerous scaly lesions on sun-exposed skin.",
    causes:"Genetic predisposition and chronic sun exposure.",
    solution:"Cryotherapy, topical medications or laser therapy.",
    prevention:"Use sunscreen daily."
};

skincareKnowledge.eccrineAngiomatousHamartoma = {
    title:"Eccrine Angiomatous Hamartoma",
    explanation:"A rare benign skin lesion containing excess sweat glands and blood vessels.",
    causes:"Congenital developmental abnormality.",
    solution:"Surgical removal if painful or bothersome.",
    prevention:"Cannot be prevented."
};

skincareKnowledge.epidermodysplasiaVerruciformis = {
    title:"Epidermodysplasia Verruciformis",
    explanation:"A rare inherited disorder causing widespread HPV infections and increased skin cancer risk.",
    causes:"Genetic susceptibility to specific HPV types.",
    solution:"Regular skin monitoring and removal of suspicious lesions.",
    prevention:"Sun protection and dermatologic follow-up."
};

skincareKnowledge.familialBenignPemphigus = {
    title:"Familial Benign Pemphigus",
    explanation:"Also known as Hailey-Hailey disease, it causes recurrent blisters and erosions in skin folds.",
    causes:"Mutation in the ATP2C1 gene.",
    solution:"Topical corticosteroids, antibiotics and gentle skin care.",
    prevention:"Reduce friction, sweating and heat exposure."
};

skincareKnowledge.giantCongenitalMelanocyticNevus = {
    title:"Giant Congenital Melanocytic Nevus",
    explanation:"A large pigmented birthmark present at birth with an increased melanoma risk.",
    causes:"Abnormal growth of melanocytes during fetal development.",
    solution:"Regular monitoring and surgical management when appropriate.",
    prevention:"Cannot be prevented."
};

skincareKnowledge.hypomelanosisOfIto = {
    title:"Hypomelanosis of Ito",
    explanation:"A rare condition causing streaks or patches of lighter skin following developmental skin patterns.",
    causes:"Genetic mosaicism.",
    solution:"Supportive care and monitoring for associated conditions.",
    prevention:"Cannot be prevented."
};

skincareKnowledge.lichenSpinulosus = {
    title:"Lichen Spinulosus",
    explanation:"A rare skin disorder producing groups of tiny rough, spiny papules.",
    causes:"Unknown, possibly related to abnormal keratinization.",
    solution:"Moisturizers and keratolytic creams.",
    prevention:"Maintain good skin hydration."
};

skincareKnowledge.multicentricReticulohistiocytosis = {
    title:"Multicentric Reticulohistiocytosis",
    explanation:"A rare inflammatory disease affecting the skin and joints with reddish-brown nodules.",
    causes:"Unknown immune-mediated process.",
    solution:"Immunosuppressive medications and rheumatologic care.",
    prevention:"No known prevention."
};

skincareKnowledge.papulonecroticTuberculid = {
    title:"Papulonecrotic Tuberculid",
    explanation:"A hypersensitivity reaction to tuberculosis causing recurring necrotic papules.",
    causes:"Immune response to Mycobacterium tuberculosis.",
    solution:"Anti-tuberculosis treatment.",
    prevention:"Early diagnosis and treatment of tuberculosis."
};

skincareKnowledge.perforatingFolliculitis = {
    title:"Perforating Folliculitis",
    explanation:"A skin disorder where damaged material is expelled through hair follicles.",
    causes:"Diabetes, kidney disease or unknown factors.",
    solution:"Topical retinoids and treatment of underlying illness.",
    prevention:"Control chronic medical conditions."
};

skincareKnowledge.phytophotodermatitis = {
    title:"Phytophotodermatitis",
    explanation:"A skin reaction caused when certain plant chemicals combine with sunlight.",
    causes:"Contact with citrus fruits, celery or other plants followed by UV exposure.",
    solution:"Cool compresses, topical steroids and sun protection.",
    prevention:"Wash the skin after plant contact and avoid sun exposure."
};

skincareKnowledge.pseudoxanthomaElasticum = {
    title:"Pseudoxanthoma Elasticum",
    explanation:"A genetic disorder affecting elastic fibers in the skin, eyes and blood vessels.",
    causes:"Mutation in the ABCC6 gene.",
    solution:"Regular monitoring by dermatologists, ophthalmologists and cardiologists.",
    prevention:"Cannot be prevented genetically."
};

skincareKnowledge.transientAcantholyticDermatosis = {
    title:"Transient Acantholytic Dermatosis",
    explanation:"Also called Grover's disease, it causes itchy red bumps mainly on the chest and back.",
    causes:"Heat, sweating and dry skin may trigger it.",
    solution:"Topical corticosteroids and keeping the skin cool.",
    prevention:"Avoid excessive heat and sweating."
};

skincareKnowledge.xanthomaDisseminatum = {
    title:"Xanthoma Disseminatum",
    explanation:"A rare disorder characterized by widespread yellow-brown nodules caused by lipid-laden immune cells.",
    causes:"Abnormal proliferation of histiocytes.",
    solution:"Treatment depends on severity and may include immunosuppressive therapy.",
    prevention:"No known prevention."
};

skincareKnowledge.acroangiodermatitis = {
title:"Acroangiodermatitis",
explanation:"A benign vascular skin condition that resembles Kaposi sarcoma and usually develops on the lower legs due to poor circulation.",
causes:"Chronic venous insufficiency or arteriovenous malformations.",
solution:"Compression therapy, improving circulation and treating the underlying vascular condition.",
prevention:"Maintain healthy circulation and manage venous disease."
};

skincareKnowledge.annularElastolyticGiantCellGranuloma = {
title:"Annular Elastolytic Giant Cell Granuloma",
explanation:"A rare inflammatory skin disorder causing ring-shaped plaques, usually on sun-exposed areas.",
causes:"Sun damage and abnormal immune response.",
solution:"Topical corticosteroids, hydroxychloroquine or observation.",
prevention:"Use sunscreen and avoid excessive UV exposure."
};

skincareKnowledge.aplasiaCutisCongenita = {
title:"Aplasia Cutis Congenita",
explanation:"A rare condition where a baby is born with an area of missing skin, usually on the scalp.",
causes:"Genetic factors, vascular disruption or certain medications during pregnancy.",
solution:"Wound care or surgical repair depending on severity.",
prevention:"Genetic counseling when appropriate."
};

skincareKnowledge.calcifiedNoduleOfTheSkin = {
title:"Calcified Nodule of the Skin",
explanation:"A harmless skin lesion formed by calcium deposits within the skin.",
causes:"Localized calcium accumulation after minor injury or unknown causes.",
solution:"Surgical removal if symptomatic.",
prevention:"There is no known prevention."
};

skincareKnowledge.cutaneousCiliatedCyst = {
title:"Cutaneous Ciliated Cyst",
explanation:"A rare benign cyst lined with ciliated cells, usually occurring on the legs of young women.",
causes:"Developmental abnormalities.",
solution:"Simple surgical excision.",
prevention:"Cannot be prevented."
};

skincareKnowledge.eccrineNevus = {
    title:"Eccrine Nevus",
    explanation:"A rare benign overgrowth of sweat glands causing excessive sweating in a localized area.",
    causes:"Congenital overdevelopment of eccrine glands.",
    solution:"Botulinum toxin injections or surgical removal if severe.",
    prevention:"There is no known prevention."
};

skincareKnowledge.eruptiveSeborrheicKeratoses = {
    title:"Eruptive Seborrheic Keratoses",
    explanation:"A sudden appearance of multiple seborrheic keratoses that may occasionally indicate an underlying illness.",
    causes:"Aging, genetics or rarely internal malignancy.",
    solution:"Dermatologic evaluation and treatment if necessary.",
    prevention:"Routine skin examinations."
};

skincareKnowledge.familialCylindromatosis = {
    title:"Familial Cylindromatosis",
    explanation:"A genetic disorder causing multiple benign tumors on the scalp and face.",
    causes:"Mutation in the CYLD gene.",
    solution:"Surgical removal or laser treatment.",
    prevention:"Genetic counseling."
};

skincareKnowledge.fibrousPapuleOfTheNose = {
    title:"Fibrous Papule of the Nose",
    explanation:"A common benign skin-colored bump usually found on the nose.",
    causes:"Localized fibrous tissue overgrowth.",
    solution:"Laser therapy or simple removal if desired.",
    prevention:"No known prevention."
};

skincareKnowledge.granularParakeratosis = {
    title:"Granular Parakeratosis",
    explanation:"A rare skin disorder affecting body folds with thickened, reddish-brown patches.",
    causes:"Abnormal keratinization, friction and irritation.",
    solution:"Topical corticosteroids and reducing friction.",
    prevention:"Keep skin folds dry and minimize irritation."
};

skincareKnowledge.hemosiderinStaining = {
    title:"Hemosiderin Staining",
    explanation:"Brown discoloration of the skin caused by iron deposits after blood leaks from small vessels.",
    causes:"Chronic venous insufficiency or bruising.",
    solution:"Treat the underlying circulation problem and use compression therapy.",
    prevention:"Maintain healthy leg circulation."
};

skincareKnowledge.juvenileHyalineFibromatosis = {
    title:"Juvenile Hyaline Fibromatosis",
    explanation:"A rare inherited disorder causing skin nodules, joint contractures and gum overgrowth.",
    causes:"Mutation in the ANTXR2 gene.",
    solution:"Supportive care and surgical removal of problematic nodules.",
    prevention:"Genetic counseling."
};

skincareKnowledge.linearAtrophodermaOfMoulin = {
    title:"Linear Atrophoderma of Moulin",
    explanation:"A rare condition causing linear bands of dark, slightly depressed skin.",
    causes:"Unknown developmental abnormality.",
    solution:"Usually no treatment is required.",
    prevention:"There is no known prevention."
};

skincareKnowledge.multipleGlomusTumors = {
    title:"Multiple Glomus Tumors",
    explanation:"Rare painful benign tumors arising from temperature-regulating blood vessels.",
    causes:"Inherited genetic mutations or sporadic development.",
    solution:"Surgical removal of painful lesions.",
    prevention:"Cannot be prevented."
};

skincareKnowledge.nevusOfOta = {
    title:"Nevus of Ota",
    explanation:"A bluish-gray pigmentation affecting the face around the eye due to excess melanocytes.",
    causes:"Congenital dermal melanocyte accumulation.",
    solution:"Q-switched laser therapy for cosmetic improvement.",
    prevention:"Cannot be prevented."
};

skincareKnowledge.papularMastocytosis = {
    title:"Papular Mastocytosis",
    explanation:"A form of mastocytosis characterized by multiple itchy brown papules.",
    causes:"Accumulation of mast cells within the skin.",
    solution:"Antihistamines and avoidance of known triggers.",
    prevention:"There is no known prevention."
};

skincareKnowledge.progressiveMacularHypomelanosis = {
    title:"Progressive Macular Hypomelanosis",
    explanation:"A condition causing gradually spreading pale patches, usually on the trunk.",
    causes:"Possibly linked to Cutibacterium acnes bacteria.",
    solution:"Phototherapy and topical antibacterial treatment.",
    prevention:"Maintain healthy skin hygiene."
};

skincareKnowledge.sebaceousNevusSyndrome = {
    title:"Sebaceous Nevus Syndrome",
    explanation:"A rare congenital syndrome involving sebaceous nevi with neurological and eye abnormalities.",
    causes:"Genetic mosaic mutations.",
    solution:"Multidisciplinary medical care and monitoring.",
    prevention:"Cannot be prevented."
};

skincareKnowledge.woollyHairNevus = {
    title:"Woolly Hair Nevus",
    explanation:"A localized patch of tightly curled hair differing from the surrounding hair.",
    causes:"Congenital developmental abnormality.",
    solution:"Usually no treatment is required.",
    prevention:"There is no known prevention."
};

skincareKnowledge.acroosteolysis = {
  title:"Acroosteolysis",
  explanation:"A rare condition involving the gradual breakdown of the bones at the tips of the fingers or toes, often accompanied by skin changes.",
  causes:"Genetic disorders, trauma, autoimmune diseases or occupational exposure.",
  solution:"Treat the underlying cause, protect the affected digits and receive specialist care.",
  prevention:"Avoid repeated trauma and manage underlying medical conditions."
};

skincareKnowledge.angiolymphoidHyperplasiaWithEosinophilia = {
  title:"Angiolymphoid Hyperplasia with Eosinophilia",
  explanation:"A rare benign vascular disorder causing red or brown nodules on the head and neck.",
  causes:"Abnormal blood vessel growth with immune cell involvement.",
  solution:"Surgical removal, laser therapy or corticosteroid injections.",
  prevention:"No known prevention."
};

skincareKnowledge.atrophieBlanche = {
  title:"Atrophie Blanche",
  explanation:"A skin condition characterized by painful ulcers that heal into smooth white scars on the lower legs.",
  causes:"Poor blood circulation and small blood vessel disease.",
  solution:"Compression therapy, wound care and treatment of vascular disease.",
  prevention:"Maintain healthy circulation and manage venous disorders."
};

skincareKnowledge.cutaneousMetastasis = {
  title:"Cutaneous Metastasis",
  explanation:"The spread of cancer cells from an internal organ to the skin, producing nodules or plaques.",
  causes:"Metastatic cancer.",
  solution:"Treatment depends on the underlying cancer and may include surgery, chemotherapy or radiotherapy.",
  prevention:"Early detection and treatment of primary cancers."
};

skincareKnowledge.dermatitisNeglecta = {
  title:"Dermatitis Neglecta",
  explanation:"A skin condition caused by inadequate cleansing, leading to the buildup of sweat, oil and dead skin.",
  causes:"Poor skin hygiene due to pain, disability or neglect.",
  solution:"Gentle cleansing with soap, water or alcohol wipes.",
  prevention:"Maintain regular skin hygiene."
};

skincareKnowledge.eccrineSpiradenoma = {
  title:"Eccrine Spiradenoma",
  explanation:"A rare benign sweat gland tumor that often presents as a painful skin nodule.",
  causes:"Abnormal growth of eccrine sweat gland cells.",
  solution:"Surgical removal.",
  prevention:"No known prevention."
};

skincareKnowledge.epidermalNevusSyndrome = {
  title:"Epidermal Nevus Syndrome",
  explanation:"A group of disorders involving epidermal nevi along with neurological, skeletal or eye abnormalities.",
  causes:"Genetic mosaic mutations.",
  solution:"Multidisciplinary management and surgical treatment when needed.",
  prevention:"Cannot be prevented."
};

skincareKnowledge.eruptiveCollagenoma = {
  title:"Eruptive Collagenoma",
  explanation:"A rare connective tissue disorder causing multiple firm skin-colored nodules.",
  causes:"Abnormal collagen accumulation.",
  solution:"Usually no treatment is necessary unless for cosmetic reasons.",
  prevention:"No known prevention."
};

skincareKnowledge.fibromatosisColli = {
  title:"Fibromatosis Colli",
  explanation:"A benign fibrous swelling of the neck muscle seen in newborns.",
  causes:"Birth trauma or injury to the sternocleidomastoid muscle.",
  solution:"Physical therapy and gentle stretching exercises.",
  prevention:"Careful obstetric management."
};

skincareKnowledge.glomuvenousMalformation = {
  title:"Glomuvenous Malformation",
  explanation:"A rare inherited vascular malformation appearing as bluish painful skin lesions.",
  causes:"Mutation in the GLMN gene.",
  solution:"Laser therapy or surgical removal if symptomatic.",
  prevention:"Genetic counseling."
};

skincareKnowledge.hyperkeratosisLenticularisPerstans = {
title:"Hyperkeratosis Lenticularis Perstans",
explanation:"Also known as Flegel disease, this rare condition causes small rough reddish-brown papules on the legs.",
causes:"Inherited abnormal keratinization.",
solution:"Topical retinoids and keratolytic creams.",
prevention:"No known prevention."
};

skincareKnowledge.infantileDigitalFibromatosis = {
title:"Infantile Digital Fibromatosis",
explanation:"A rare benign tumor affecting the fingers or toes of infants.",
causes:"Unknown abnormal fibrous tissue growth.",
solution:"Observation or surgical removal if function is affected.",
prevention:"Cannot be prevented."
};

skincareKnowledge.juvenileSpringEruption = {
title:"Juvenile Spring Eruption",
explanation:"A seasonal sun-induced skin eruption affecting the ears of children and adolescents.",
causes:"Sensitivity to spring sunlight.",
solution:"Topical corticosteroids and sun protection.",
prevention:"Wear hats and use sunscreen during spring."
};

skincareKnowledge.kyrleDisease = {
title:"Kyrle Disease",
explanation:"A perforating skin disorder causing large itchy papules with central keratin plugs.",
causes:"Often associated with diabetes and chronic kidney disease.",
solution:"Topical retinoids, keratolytics and treatment of underlying disease.",
prevention:"Control diabetes and kidney disease."
};

skincareKnowledge.lymphangiomaCircumscriptum = {
title:"Lymphangioma Circumscriptum",
explanation:"A benign lymphatic malformation appearing as clusters of small translucent blisters.",
causes:"Congenital lymphatic vessel abnormalities.",
solution:"Laser therapy or surgical removal.",
prevention:"Cannot be prevented."
};

skincareKnowledge.microcysticLymphaticMalformation = {
 title:"Microcystic Lymphatic Malformation",
 explanation:"A congenital disorder involving abnormal lymphatic vessels forming tiny fluid-filled cysts in the skin.",
 causes:"Developmental abnormalities of the lymphatic system.",
 solution:"Laser therapy, surgery or sclerotherapy.",
 prevention:"No known prevention."
};

skincareKnowledge.nevusComedonicusSyndrome = {
 title:"Nevus Comedonicus Syndrome",
 explanation:"A rare syndrome combining nevus comedonicus with skeletal, eye or neurological abnormalities.",
 causes:"Genetic mosaic mutations.",
 solution:"Treat skin lesions and associated systemic abnormalities.",
 prevention:"Cannot be prevented."
};

skincareKnowledge.papularAcantholyticDyskeratosis = {
 title:"Papular Acantholytic Dyskeratosis",
 explanation:"A rare skin disorder producing itchy papules in the genital or groin region.",
 causes:"Abnormal skin cell adhesion.",
 solution:"Topical corticosteroids or retinoids.",
 prevention:"Reduce friction and irritation."
};

skincareKnowledge.reticularPigmentedAnomalyOfTheFlexures = {
 title:"Reticular Pigmented Anomaly of the Flexures",
 explanation:"A rare inherited pigmentation disorder causing net-like dark patches in body folds.",
 causes:"Genetic mutation affecting pigmentation.",
 solution:"Usually supportive care only.",
 prevention:"Cannot be prevented."
};

skincareKnowledge.verruciformXanthoma = {
 title:"Verruciform Xanthoma",
 explanation:"A rare benign lesion appearing as a wart-like plaque, commonly inside the mouth or on genital skin.",
 causes:"Unknown, possibly chronic inflammation.",
 solution:"Simple surgical excision.",
 prevention:"Maintain good skin and oral hygiene."
};

skincareKnowledge.acrodermatitisContinuaOfHallopeau = {
title:"Acrodermatitis Continua of Hallopeau",
explanation:"A rare chronic form of pustular psoriasis affecting the fingertips and nails, causing painful pustules and nail destruction.",
causes:"Immune system dysfunction associated with pustular psoriasis.",
solution:"Biologic medications, topical corticosteroids and systemic therapy prescribed by a dermatologist.",
prevention:"There is no known prevention, but avoiding psoriasis triggers may help."
};

skincareKnowledge.angiokeratomaCorporisDiffusum = {
title:"Angiokeratoma Corporis Diffusum",
explanation:"A rare condition marked by widespread dark red vascular skin lesions, often associated with inherited metabolic disorders.",
causes:"Genetic lysosomal storage diseases such as Fabry disease.",
solution:"Treat the underlying metabolic disorder and consider laser therapy for skin lesions.",
prevention:"Genetic counseling for affected families."
};

skincareKnowledge.atrophodermaVermiculatum = {
title:"Atrophoderma Vermiculatum",
explanation:"A rare skin disorder causing honeycomb-like depressions on the cheeks due to follicular damage.",
causes:"Inherited abnormal keratinization.",
solution:"Topical retinoids and laser resurfacing may improve appearance.",
prevention:"No known prevention."
};

skincareKnowledge.calcinosisUniversalis = {
title:"Calcinosis Universalis",
explanation:"A severe form of calcinosis with widespread calcium deposits in the skin, muscles and connective tissues.",
causes:"Autoimmune connective tissue diseases such as dermatomyositis.",
solution:"Treat the underlying autoimmune disease and manage calcium deposits.",
prevention:"Control connective tissue disorders early."
};

skincareKnowledge.cutaneousBCellLymphoma = {
title:"Cutaneous B-Cell Lymphoma",
explanation:"A rare type of lymphoma that begins in the skin's B lymphocytes.",
causes:"Abnormal growth of B-cells.",
solution:"Radiotherapy, surgery, immunotherapy or chemotherapy depending on the subtype.",
prevention:"No known prevention."
};

skincareKnowledge.cutaneousTCellLymphoma = {
title:"Cutaneous T-Cell Lymphoma",
explanation:"A group of cancers that originate from T-cells in the skin, including mycosis fungoides.",
causes:"Abnormal proliferation of T lymphocytes.",
solution:"Phototherapy, topical treatments, biologics or systemic therapy.",
prevention:"No known prevention."
};

skincareKnowledge.digitalPapillaryAdenocarcinoma = {
title:"Digital Papillary Adenocarcinoma",
explanation:"A rare malignant sweat gland tumor usually occurring on the fingers or toes.",
causes:"Cancerous transformation of sweat gland cells.",
solution:"Wide surgical removal and long-term follow-up.",
prevention:"Early evaluation of persistent finger or toe lumps."
};

skincareKnowledge.eccrineCarcinoma = {
title:"Eccrine Carcinoma",
explanation:"A rare cancer arising from eccrine sweat glands.",
causes:"Malignant transformation of sweat gland tissue.",
solution:"Surgical excision with possible radiotherapy.",
prevention:"Early dermatologic evaluation of suspicious skin growths."
};

skincareKnowledge.eruptiveXanthomas = {
title:"Eruptive Xanthomas",
explanation:"Small yellow bumps that suddenly appear on the skin due to very high blood fat levels.",
causes:"Severe hypertriglyceridemia and uncontrolled diabetes.",
solution:"Lower blood lipid levels and manage diabetes.",
prevention:"Maintain healthy cholesterol and triglyceride levels."
};

skincareKnowledge.familialAmyloidosisCutis = {
title:"Familial Amyloidosis Cutis",
explanation:"An inherited condition involving abnormal amyloid protein deposits in the skin.",
causes:"Genetic mutations affecting protein metabolism.",
solution:"Supportive dermatologic treatment and itch control.",
prevention:"Genetic counseling."
};

skincareKnowledge.fibrousHamartomaOfInfancy = {
title:"Fibrous Hamartoma of Infancy",
explanation:"A rare benign soft tissue tumor occurring during the first two years of life.",
causes:"Developmental abnormality of fibrous tissue.",
solution:"Surgical removal if necessary.",
prevention:"Cannot be prevented."
};

skincareKnowledge.graftVersusHostSkinDisease = {
title:"Graft-versus-Host Skin Disease",
explanation:"A skin complication following bone marrow transplantation where donor immune cells attack the recipient's skin.",
causes:"Immune reaction after stem cell transplantation.",
solution:"Immunosuppressive therapy and supportive skin care.",
prevention:"Careful donor matching and preventive medications."
};

skincareKnowledge.histiocytoidHemangioma = {
title:"Histiocytoid Hemangioma",
explanation:"A rare benign vascular tumor presenting as reddish nodules on the skin.",
causes:"Abnormal blood vessel growth.",
solution:"Surgical excision or laser therapy.",
prevention:"No known prevention."
};

skincareKnowledge.interstitialGranulomatousDermatitis = {
title:"Interstitial Granulomatous Dermatitis",
explanation:"An inflammatory skin disorder producing red plaques and cord-like lesions.",
causes:"Autoimmune diseases or medication reactions.",
solution:"Treat the underlying disease and use corticosteroids.",
prevention:"Manage autoimmune disorders appropriately."
};

skincareKnowledge.juvenileColloidMilium = {
title:"Juvenile Colloid Milium",
explanation:"A rare disorder causing translucent yellow papules due to abnormal protein deposits in the skin.",
causes:"Inherited abnormalities.",
solution:"Laser treatment or dermabrasion for cosmetic improvement.",
prevention:"No known prevention."
};

skincareKnowledge.keratosisFollicularisSpinulosaDecalvans = {
title:"Keratosis Follicularis Spinulosa Decalvans",
explanation:"A rare inherited disorder causing follicular keratosis and progressive scarring hair loss.",
causes:"Genetic mutation affecting hair follicles.",
solution:"Retinoids, antibiotics and supportive dermatologic care.",
prevention:"Cannot be prevented genetically."
};

skincareKnowledge.lymphocytomaCutis = {
title:"Lymphocytoma Cutis",
explanation:"A benign accumulation of lymphocytes in the skin forming soft red or purple nodules.",
causes:"Insect bites, infections or medications.",
solution:"Treat the underlying trigger and use corticosteroids if necessary.",
prevention:"Avoid known triggers when possible."
};

skincareKnowledge.multifocalLymphangioendotheliomatosis = {
title:"Multifocal Lymphangioendotheliomatosis",
explanation:"A rare vascular disorder causing multiple skin lesions and gastrointestinal bleeding.",
causes:"Abnormal lymphatic blood vessel growth.",
solution:"Multidisciplinary medical care and treatment of complications.",
prevention:"No known prevention."
};

skincareKnowledge.necrobioticXanthogranuloma = {
title:"Necrobiotic Xanthogranuloma",
explanation:"A rare inflammatory disorder causing yellow plaques and nodules, often around the eyes.",
causes:"Often associated with blood protein abnormalities.",
solution:"Treat the underlying blood disorder and use immunosuppressive therapy.",
prevention:"Regular monitoring of associated medical conditions."
},

skincareKnowledge.papularPurpuricGlovesAndSocksSyndrome = {
title:"Papular Purpuric Gloves and Socks Syndrome",
explanation:"A viral skin eruption causing painful redness and purple spots on the hands and feet.",
causes:"Most commonly Parvovirus B19 infection.",
solution:"Supportive care, hydration and symptom relief.",
prevention:"Good hygiene practices may reduce viral spread."
},

skincareKnowledge.poikilodermaOfCivatte = {
title:"Poikiloderma of Civatte",
explanation:"A chronic skin condition causing reddish-brown pigmentation, visible blood vessels and skin thinning on the sides of the neck.",
causes:"Long-term sun exposure, aging and hormonal changes.",
solution:"Use sunscreen daily, topical retinoids and laser therapy if needed.",
prevention:"Protect the neck from UV exposure."
},

skincareKnowledge.porocarcinoma = {
title:"Porocarcinoma",
explanation:"A rare malignant tumor arising from sweat glands that may appear as a slow-growing nodule.",
causes:"Cancerous transformation of eccrine sweat gland cells.",
solution:"Wide surgical excision and regular follow-up.",
prevention:"Seek early evaluation of persistent skin growths."
},

skincareKnowledge.progressiveNodularHistiocytosis = {
title:"Progressive Nodular Histiocytosis",
explanation:"A rare non-Langerhans cell histiocytosis causing multiple skin nodules that gradually increase in number.",
causes:"Abnormal proliferation of histiocytes.",
solution:"Surgical removal of symptomatic lesions and specialist care.",
prevention:"No known prevention."
},

skincareKnowledge.pseudolymphomaOfTheSkin = {
title:"Pseudolymphoma of the Skin",
explanation:"A benign lymphoid skin reaction that resembles cutaneous lymphoma.",
causes:"Insect bites, tattoos, medications or infections.",
solution:"Remove the triggering factor and use corticosteroids if needed.",
prevention:"Avoid known triggers."
},

skincareKnowledge.pyogenicGranulomaOfPregnancy = {
title:"Pyogenic Granuloma of Pregnancy",
explanation:"A rapidly growing benign vascular lesion that commonly develops during pregnancy.",
causes:"Hormonal changes and minor skin trauma.",
solution:"Observation during pregnancy or surgical removal if necessary.",
prevention:"Avoid unnecessary skin trauma."
},

skincareKnowledge.retiformHemangioendothelioma = {
title:"Retiform Hemangioendothelioma",
explanation:"A rare low-grade vascular tumor with a tendency to recur locally.",
causes:"Abnormal blood vessel cell growth.",
solution:"Wide surgical removal and long-term monitoring.",
prevention:"No known prevention."
},

skincareKnowledge.scleromyxedema = {
title:"Scleromyxedema",
explanation:"A rare connective tissue disorder causing widespread waxy papules and skin thickening.",
causes:"Abnormal mucin deposition often associated with blood protein disorders.",
solution:"Immunotherapy and management of the underlying condition.",
prevention:"No known prevention."
},

skincareKnowledge.sebaceousCarcinoma = {
title:"Sebaceous Carcinoma",
explanation:"A rare aggressive cancer arising from sebaceous glands, often around the eyelids.",
causes:"Malignant transformation of sebaceous gland cells.",
solution:"Early surgical removal with clear margins.",
prevention:"Prompt evaluation of persistent eyelid lumps."
},

skincareKnowledge.skinTagSyndrome = {
title:"Skin Tag Syndrome",
explanation:"A condition involving numerous skin tags that may be associated with metabolic disorders.",
causes:"Obesity, insulin resistance and friction.",
solution:"Removal by a healthcare professional if desired.",
prevention:"Maintain a healthy weight and reduce skin friction."
},

skincareKnowledge.subcutaneousFatNecrosisOfTheNewborn = {
title:"Subcutaneous Fat Necrosis of the Newborn",
explanation:"A rare condition causing firm nodules beneath the skin of newborns after birth stress.",
causes:"Birth trauma, hypothermia or oxygen deprivation.",
solution:"Usually resolves spontaneously with monitoring.",
prevention:"Careful management of high-risk deliveries."
},

skincareKnowledge.syringocystadenomaPapilliferum = {
title:"Syringocystadenoma Papilliferum",
explanation:"A rare benign sweat gland tumor often present at birth or childhood.",
causes:"Congenital abnormality of sweat glands.",
solution:"Surgical removal is recommended.",
prevention:"Cannot be prevented."
},

skincareKnowledge.trichoepithelioma = {
title:"Trichoepithelioma",
explanation:"A benign hair follicle tumor appearing as small flesh-colored papules on the face.",
causes:"Inherited genetic mutations or sporadic development.",
solution:"Laser therapy or surgical removal if desired.",
prevention:"Genetic counseling when hereditary."
},

skincareKnowledge.trichofolliculoma = {
title:"Trichofolliculoma",
explanation:"A rare benign hair follicle tumor often presenting as a small bump with a central tuft of hair.",
causes:"Abnormal hair follicle development.",
solution:"Simple surgical excision.",
prevention:"No known prevention."
},

skincareKnowledge.verrucousHemangioma = {
title:"Verrucous Hemangioma",
explanation:"A congenital vascular malformation with thick, wart-like skin changes.",
causes:"Developmental abnormality of blood vessels.",
solution:"Complete surgical removal is usually required.",
prevention:"Cannot be prevented."
},

skincareKnowledge.xanthogranulomaAdult = {
title:"Adult Xanthogranuloma",
explanation:"A rare benign disorder causing yellow-orange skin nodules in adults.",
causes:"Abnormal accumulation of histiocytes.",
solution:"Observation or surgical removal if symptomatic.",
prevention:"No known prevention."
},

skincareKnowledge.yellowNailSyndrome = {
title:"Yellow Nail Syndrome",
explanation:"A rare disorder involving yellow thickened nails, swelling and respiratory problems.",
causes:"Abnormal lymphatic function.",
solution:"Treat respiratory disease and manage lymphedema.",
prevention:"No known prevention."
},

skincareKnowledge.zosterSineHerpete = {
title:"Zoster Sine Herpete",
explanation:"A form of shingles causing nerve pain without the typical skin rash.",
causes:"Reactivation of the varicella-zoster virus.",
solution:"Early antiviral medication and pain management.",
prevention:"Shingles vaccination in eligible adults."
},

skincareKnowledge.actinicGranuloma = {
title:"Actinic Granuloma",
explanation:"A rare inflammatory skin disorder producing ring-shaped lesions on sun-exposed skin.",
causes:"Sun-damaged elastic fibers triggering an immune response.",
solution:"Sun protection and topical corticosteroids.",
prevention:"Use broad-spectrum sunscreen daily."
},

skincareKnowledge.cutaneousRosaiDorfmanDisease = {
title:"Cutaneous Rosai-Dorfman Disease",
explanation:"A rare disorder involving painless red or yellow skin nodules without lymph node involvement.",
causes:"Abnormal accumulation of histiocytes.",
solution:"Observation, corticosteroids or surgical removal depending on severity.",
prevention:"No known prevention."
},

skincareKnowledge.eruptivePseudoangiomatosis = {
title:"Eruptive Pseudoangiomatosis",
explanation:"A rare viral-associated eruption causing small red papules surrounded by pale halos.",
causes:"Viral infections and insect bites.",
solution:"Usually resolves without treatment.",
prevention:"Avoid insect bites and maintain good hygiene."
},

skincareKnowledge.angiomaRepens = {
title:"Angioma Repens",
explanation:"A rare vascular skin condition causing clusters of tiny red spots that slowly spread over time.",
causes:"Abnormal growth of superficial blood vessels.",
solution:"Laser therapy can improve cosmetic appearance.",
prevention:"No known prevention."
},

skincareKnowledge.balloonCellNevus = {
title:"Balloon Cell Nevus",
explanation:"A rare benign mole containing enlarged balloon-like melanocytes.",
causes:"Abnormal development of melanocytes.",
solution:"Usually no treatment is needed unless diagnosis is uncertain.",
prevention:"Routine skin examinations."
},

skincareKnowledge.calcifiedEpidermoidCyst = {
title:"Calcified Epidermoid Cyst",
explanation:"An epidermoid cyst that develops calcium deposits, making it feel unusually hard.",
causes:"Long-standing epidermoid cysts.",
solution:"Surgical removal if symptomatic.",
prevention:"Early treatment of enlarging cysts."
},

skincareKnowledge.cutaneousMyxoma = {
title:"Cutaneous Myxoma",
explanation:"A rare benign tumor composed of gelatinous connective tissue.",
causes:"Abnormal connective tissue growth, sometimes associated with Carney complex.",
solution:"Surgical excision.",
prevention:"Genetic counseling in inherited cases."
},

skincareKnowledge.dermatofibrosarcomaProtuberans = {
title:"Dermatofibrosarcoma Protuberans",
explanation:"A rare slow-growing skin cancer that begins in the dermis and can invade surrounding tissue.",
causes:"Genetic mutation involving the COL1A1 and PDGFB genes.",
solution:"Wide surgical excision or Mohs surgery.",
prevention:"Early diagnosis of persistent skin lumps."
},

skincareKnowledge.eccrineAngiomatousNevus = {
title:"Eccrine Angiomatous Nevus",
explanation:"A rare congenital lesion containing excess sweat glands and blood vessels.",
causes:"Developmental abnormality before birth.",
solution:"Surgical removal if painful or associated with excessive sweating.",
prevention:"Cannot be prevented."
},

skincareKnowledge.elastosisPerforansSerpiginosa = {
title:"Elastosis Perforans Serpiginosa",
explanation:"A rare disorder where abnormal elastic fibers are pushed through the skin.",
causes:"Inherited connective tissue disorders or medication side effects.",
solution:"Topical retinoids, cryotherapy or laser treatment.",
prevention:"Monitor medications associated with the condition."
},

skincareKnowledge.fibromaMolle = {
title:"Fibroma Molle",
explanation:"Another name for a soft fibroma or skin tag, a common benign skin growth.",
causes:"Skin friction, aging and genetics.",
solution:"Simple removal if desired.",
prevention:"Reduce chronic skin friction."
},

skincareKnowledge.giantCellFibroblastoma = {
title:"Giant Cell Fibroblastoma",
explanation:"A rare soft tissue tumor occurring mainly in children.",
causes:"Genetic abnormalities similar to dermatofibrosarcoma protuberans.",
solution:"Complete surgical removal.",
prevention:"No known prevention."
},

skincareKnowledge.hyperplasticLichenPlanus = {
title:"Hyperplastic Lichen Planus",
explanation:"A thickened, wart-like form of lichen planus commonly affecting the legs.",
causes:"Autoimmune inflammation.",
solution:"Potent topical corticosteroids and immunomodulators.",
prevention:"Manage chronic inflammation."
},

skincareKnowledge.intradermalSpitzNevus = {
title:"Intradermal Spitz Nevus",
explanation:"A benign mole composed of Spitz cells located within the dermis.",
causes:"Benign melanocyte proliferation.",
solution:"Observation or surgical removal if diagnosis is uncertain.",
prevention:"Routine skin monitoring."
},

skincareKnowledge.keratoelastoidosisMarginalis = {
title:"Keratoelastoidosis Marginalis",
explanation:"A rare skin disorder producing firm yellow papules along the edges of the hands.",
causes:"Chronic sun exposure and aging.",
solution:"Protect from UV light and use moisturizers.",
prevention:"Wear sunscreen and protective gloves outdoors."
},

skincareKnowledge.lichenAureus = {
title:"Lichen Aureus",
explanation:"A localized form of pigmented purpuric dermatosis presenting as golden-brown patches.",
causes:"Leaking capillaries and chronic inflammation.",
solution:"Topical corticosteroids or observation.",
prevention:"Maintain healthy circulation."
},

skincareKnowledge.microvenularHemangioma = {
title:"Microvenular Hemangioma",
explanation:"A rare benign vascular tumor presenting as small red or purple plaques.",
causes:"Benign proliferation of tiny veins.",
solution:"Surgical removal if necessary.",
prevention:"No known prevention."
},

skincareKnowledge.nevusSebaceusOfJadassohn = {
title:"Nevus Sebaceus of Jadassohn",
explanation:"A congenital hairless plaque containing abnormal sebaceous glands, usually on the scalp.",
causes:"Developmental mosaic mutation.",
solution:"Regular monitoring or surgical removal.",
prevention:"Cannot be prevented."
},

skincareKnowledge.papularMucinosis = {
title:"Papular Mucinosis",
explanation:"A group of disorders characterized by mucin deposits forming waxy skin papules.",
causes:"Unknown, sometimes linked to blood disorders.",
solution:"Treat the underlying disease and use immunotherapy if necessary.",
prevention:"No known prevention."
},

skincareKnowledge.reactivePerforatingCollagenosis = {
title:"Reactive Perforating Collagenosis",
explanation:"A skin disorder where damaged collagen is eliminated through the epidermis after minor injury.",
causes:"Genetics, diabetes or chronic kidney disease.",
solution:"Topical retinoids and treatment of underlying illness.",
prevention:"Protect the skin from repeated trauma."
},

skincareKnowledge.sebaceousHyperplasia = {
title:"Sebaceous Hyperplasia",
explanation:"A harmless enlargement of sebaceous glands appearing as small yellow bumps on the face.",
causes:"Aging, hormones and genetics.",
solution:"Laser treatment, electrocautery or observation.",
prevention:"No known prevention."
},

skincareKnowledge.tuftedAngioma = {
title:"Tufted Angioma",
explanation:"A rare benign vascular tumor often appearing in childhood as a painful red-purple plaque.",
causes:"Abnormal blood vessel growth.",
solution:"Laser therapy, surgery or observation depending on symptoms.",
prevention:"Cannot be prevented."
},

skincareKnowledge.winerDilatedPore = {
title:"Winer Dilated Pore",
explanation:"A large open comedone caused by an enlarged hair follicle filled with keratin.",
causes:"Blocked hair follicles and aging.",
solution:"Professional extraction or surgical removal.",
prevention:"Maintain healthy skin cleansing habits."

};

skincareKnowledge.acrocyanosis = {
title:"Acrocyanosis",
explanation:"A condition causing persistent bluish discoloration of the hands and feet due to reduced oxygen delivery to the skin.",
causes:"Constriction of small blood vessels, cold exposure or circulatory disorders.",
solution:"Keep the body warm and treat any underlying circulatory condition.",
prevention:"Avoid prolonged cold exposure and wear warm clothing."
},

skincareKnowledge.anetoderma = {
title:"Anetoderma",
explanation:"A rare skin disorder where patches of skin become loose or wrinkled due to the loss of elastic fibers.",
causes:"Autoimmune diseases, infections or unknown causes.",
solution:"There is no cure, but cosmetic treatments may improve appearance.",
prevention:"Manage associated medical conditions early."
},

skincareKnowledge.bullousLupusErythematosus = {
title:"Bullous Lupus Erythematosus",
explanation:"A rare blistering form of systemic lupus causing tense blisters on the skin.",
causes:"Autoimmune attack associated with lupus.",
solution:"Dapsone, corticosteroids and treatment of lupus.",
prevention:"Proper lupus management reduces flare-ups."
};

skincareKnowledge.cutaneousHorn = {
title:"Cutaneous Horn",
explanation:"A hard cone-shaped growth made of keratin that develops on the skin.",
causes:"Sun damage, warts or underlying skin cancers.",
solution:"Surgical removal and biopsy of the base.",
prevention:"Protect skin from excessive sun exposure."
};

skincareKnowledge.discoidLupusErythematosus = {
title:"Discoid Lupus Erythematosus",
explanation:"A chronic autoimmune skin disease causing red scaly plaques that may leave scars.",
causes:"Autoimmune dysfunction and sun exposure.",
solution:"Topical steroids, antimalarial drugs and sunscreen.",
prevention:"Avoid excessive UV exposure."
};

skincareKnowledge.elastofibromaDorsi = {
title:"Elastofibroma Dorsi",
explanation:"A rare benign soft tissue growth usually found beneath the shoulder blade.",
causes:"Repeated mechanical friction and aging.",
solution:"Observation or surgical removal if painful.",
prevention:"No known prevention."
};

skincareKnowledge.epidermolyticAcanthoma = {
title:"Epidermolytic Acanthoma",
explanation:"A harmless wart-like skin lesion commonly found on the trunk or genital area.",
causes:"Localized abnormal keratinization.",
solution:"Usually no treatment is required.",
prevention:"No known prevention."
};

skincareKnowledge.familialMultipleLipomatosis = {
title:"Familial Multiple Lipomatosis",
explanation:"An inherited disorder causing numerous soft fatty lumps beneath the skin.",
causes:"Genetic inheritance.",
solution:"Surgical removal of symptomatic lipomas.",
prevention:"Genetic counseling."
};

skincareKnowledge.granulomatousSlackSkin = {
title:"Granulomatous Slack Skin",
explanation:"A rare variant of cutaneous T-cell lymphoma causing loose hanging skin folds.",
causes:"Abnormal T-cell proliferation.",
solution:"Dermatology and oncology management.",
prevention:"No known prevention."
};

skincareKnowledge.hereditaryLeiomyomatosis = {
title:"Hereditary Leiomyomatosis",
explanation:"A genetic disorder causing painful smooth muscle tumors in the skin.",
causes:"Mutation in the FH gene.",
solution:"Pain management and surgical removal when necessary.",
prevention:"Genetic counseling."
};

skincareKnowledge.incontinentiaPigmenti = {
title:"Incontinentia Pigmenti",
explanation:"A rare inherited disorder affecting the skin, hair, teeth and nervous system.",
causes:"Mutation in the IKBKG gene.",
solution:"Supportive multidisciplinary care.",
prevention:"Genetic counseling for affected families."
};

skincareKnowledge.keratosisPilarisRubra = {
title:"Keratosis Pilaris Rubra",
explanation:"A form of keratosis pilaris characterized by persistent redness around rough bumps.",
causes:"Excess keratin blocking hair follicles.",
solution:"Moisturizers, exfoliants and topical retinoids.",
prevention:"Keep the skin moisturized."
};

skincareKnowledge.lipedematousScalp = {
title:"Lipedematous Scalp",
explanation:"A rare condition where the scalp becomes unusually thick due to excess fatty tissue.",
causes:"Unknown.",
solution:"Observation or surgical treatment in severe cases.",
prevention:"No known prevention."
};

skincareKnowledge.morpheaProfunda = {
title:"Morphea Profunda",
explanation:"A deep form of localized scleroderma affecting the skin and underlying tissues.",
causes:"Autoimmune inflammation.",
solution:"Immunosuppressive therapy and physical therapy.",
prevention:"No known prevention."
};

skincareKnowledge.nevusAnemicus = {
title:"Nevus Anemicus",
explanation:"A congenital pale skin patch caused by permanently narrowed blood vessels.",
causes:"Developmental vascular abnormality.",
solution:"No treatment is usually necessary.",
prevention:"Cannot be prevented."
};

skincareKnowledge.perforatingCalcificElastosis = {
title:"Perforating Calcific Elastosis",
explanation:"A rare disorder where calcified elastic fibers are eliminated through the skin.",
causes:"Abnormal calcium deposition in elastic tissue.",
solution:"Treat symptoms and associated disorders.",
prevention:"No known prevention."
};

skincareKnowledge.reticulateAcropigmentationOfKitamura = {
title:"Reticulate Acropigmentation of Kitamura",
explanation:"A rare inherited pigmentation disorder causing net-like dark spots on the hands and feet.",
causes:"Genetic mutation.",
solution:"Sun protection and cosmetic treatment if desired.",
prevention:"Cannot be prevented genetically."
};

skincareKnowledge.scleredemaAdultorum = {
title:"Scleredema Adultorum",
explanation:"A connective tissue disorder causing thickened, stiff skin of the neck and upper back.",
causes:"Diabetes, infections or unknown causes.",
solution:"Treat underlying disease and consider phototherapy.",
prevention:"Control diabetes effectively."
};

skincareKnowledge.tumidLupus = {
title:"Tumid Lupus",
explanation:"A rare form of cutaneous lupus producing smooth swollen red plaques without scarring.",
causes:"Autoimmune disease and UV exposure.",
solution:"Antimalarial medications and strict sun protection.",
prevention:"Avoid excessive sunlight."
};

skincareKnowledge.verruciformEpidermalNevus = {
title:"Verruciform Epidermal Nevus",
explanation:"A congenital wart-like skin lesion following developmental skin lines.",
causes:"Genetic mosaic mutation.",
solution:"Laser therapy or surgical removal if necessary.",
prevention:"Cannot be prevented."
};

skincareKnowledge.acquiredPerforatingDermatosis = {
title:"Acquired Perforating Dermatosis",
explanation:"A skin disorder in which damaged collagen and elastic fibers are eliminated through the epidermis, producing itchy bumps.",
causes:"Chronic kidney disease, diabetes mellitus and skin trauma.",
solution:"Treat the underlying disease, use topical corticosteroids, retinoids and moisturizers.",
prevention:"Good control of diabetes and kidney disease."
};

skincareKnowledge.angiokeratomaOfFordyce = {
title:"Angiokeratoma of Fordyce",
explanation:"Small dark red or purple vascular bumps usually found on the scrotum or vulva.",
causes:"Dilated superficial blood vessels and increased venous pressure.",
solution:"Usually no treatment is needed; laser therapy or electrocautery for bleeding lesions.",
prevention:"No known prevention."
};

skincareKnowledge.atrophodermaOfPasiniPierini = {
title:"Atrophoderma of Pasini-Pierini",
explanation:"A rare skin condition causing sharply defined depressed patches with slight dark pigmentation.",
causes:"Unknown; possibly related to localized scleroderma.",
solution:"Observation or dermatologic treatment if associated with morphea.",
prevention:"No known prevention."
};

skincareKnowledge.basaloidFollicularHamartoma = {
title:"Basaloid Follicular Hamartoma",
explanation:"A rare benign tumor arising from hair follicles.",
causes:"Genetic mutations or sporadic development.",
solution:"Observation or surgical removal if symptomatic.",
prevention:"No known prevention."
};

skincareKnowledge.blueRubberBlebNevusSyndrome = {
title:"Blue Rubber Bleb Nevus Syndrome",
explanation:"A rare disorder causing multiple soft blue vascular malformations of the skin and digestive tract.",
causes:"Congenital venous malformations.",
solution:"Laser therapy, surgery or treatment of gastrointestinal bleeding.",
prevention:"Cannot be prevented."
};

skincareKnowledge.calcinosisCircumscripta = {
title:"Calcinosis Circumscripta",
explanation:"Localized calcium deposits forming hard nodules beneath the skin.",
causes:"Connective tissue diseases or repeated trauma.",
solution:"Surgical removal if painful and management of underlying disease.",
prevention:"Treat connective tissue disorders promptly."
};

skincareKnowledge.clearCellAcanthoma = {
title:"Clear Cell Acanthoma",
explanation:"A rare benign skin tumor appearing as a slow-growing pink or red plaque.",
causes:"Unknown.",
solution:"Simple surgical removal.",
prevention:"No known prevention."
};

skincareKnowledge.cutaneousPlasmacytosis = {
title:"Cutaneous Plasmacytosis",
explanation:"A rare disorder involving excessive plasma cells within the skin causing reddish-brown patches.",
causes:"Unknown immune dysfunction.",
solution:"Corticosteroids, phototherapy or immunomodulatory treatment.",
prevention:"No known prevention."
};

skincareKnowledge.degosDisease = {
title:"Degos Disease",
explanation:"A rare vascular disease causing porcelain-white skin lesions and possible internal organ involvement.",
causes:"Abnormal blood vessel blockage.",
solution:"Supportive care and specialist management.",
prevention:"No known prevention."
};

skincareKnowledge.disseminatedPorokeratosis = {
title:"Disseminated Porokeratosis",
explanation:"A group of inherited disorders causing multiple scaly lesions with raised borders.",
causes:"Genetics and ultraviolet radiation.",
solution:"Cryotherapy, topical retinoids and sun protection.",
prevention:"Use sunscreen and avoid excessive UV exposure."
};

skincareKnowledge.eccrineHidrocystoma = {
title:"Eccrine Hidrocystoma",
explanation:"A harmless sweat gland cyst usually occurring around the eyelids.",
causes:"Blocked eccrine sweat ducts.",
solution:"Drainage, laser treatment or surgical removal.",
prevention:"Reduce excessive sweating when possible."
};

skincareKnowledge.epithelioidHemangioma = {
title:"Epithelioid Hemangioma",
explanation:"A benign vascular tumor presenting as reddish nodules on the head and neck.",
causes:"Abnormal blood vessel growth.",
solution:"Surgical excision or laser therapy.",
prevention:"No known prevention."
};

skincareKnowledge.fibrokeratoma = {
title:"Fibrokeratoma",
explanation:"A small benign fibrous growth usually found on fingers or toes.",
causes:"Minor trauma or unknown factors.",
solution:"Simple surgical removal.",
prevention:"Protect the skin from repeated injury."
};

skincareKnowledge.generalizedEssentialTelangiectasia = {
title:"Generalized Essential Telangiectasia",
explanation:"A rare disorder involving widespread visible dilated blood vessels.",
causes:"Unknown.",
solution:"Laser therapy for cosmetic improvement.",
prevention:"No known prevention."
};

skincareKnowledge.haloNevus = {
title:"Halo Nevus",
explanation:"A mole surrounded by a ring of lighter skin due to immune destruction of pigment cells.",
causes:"Autoimmune response against melanocytes.",
solution:"Usually observation unless melanoma is suspected.",
prevention:"Routine skin examinations."
};

skincareKnowledge.ichthyosisHystrix = {
title:"Ichthyosis Hystrix",
explanation:"A very rare inherited disorder causing thick, spiny scales over large areas of the body.",
causes:"Genetic mutations affecting keratin production.",
solution:"Daily moisturizers, keratolytic agents and retinoids.",
prevention:"Genetic counseling."
};

skincareKnowledge.juvenileXanthogranuloma = {
title:"Juvenile Xanthogranuloma",
explanation:"A benign childhood condition causing yellow-orange skin nodules.",
causes:"Accumulation of histiocytes.",
solution:"Usually resolves spontaneously without treatment.",
prevention:"No known prevention."
};

skincareKnowledge.keratoacanthomaCentrifugumMarginatum = {
title:"Keratoacanthoma Centrifugum Marginatum",
explanation:"A rare variant of keratoacanthoma that enlarges outward without spontaneous regression.",
causes:"Sun exposure and abnormal keratinocyte growth.",
solution:"Complete surgical excision.",
prevention:"Practice sun protection."
};

skincareKnowledge.lichenScrofulosorum = {
title:"Lichen Scrofulosorum",
explanation:"A rare skin eruption associated with tuberculosis, producing tiny grouped papules.",
causes:"Hypersensitivity reaction to Mycobacterium tuberculosis.",
solution:"Treat the underlying tuberculosis infection.",
prevention:"Early diagnosis and treatment of tuberculosis."
};

skincareKnowledge.melanocyticNevus = {
title:"Melanocytic Nevus",
explanation:"A common benign mole formed by clusters of pigment-producing melanocytes.",
causes:"Genetics and sun exposure.",
solution:"Usually no treatment unless suspicious for melanoma.",
prevention:"Protect skin from excessive UV exposure and monitor changing moles."
};

skincareKnowledge.mucinosisFollicularis = {
    title:"Mucinosis Follicularis",
    explanation:"A rare inflammatory skin disorder where mucin accumulates around hair follicles, causing red plaques and hair loss.",
    causes:"Unknown; may occur alone or with lymphoma.",
    solution:"Topical corticosteroids, phototherapy and treatment of any underlying disease.",
    prevention:"No known prevention."
};

skincareKnowledge.necrobiosisLipoidicaDiabeticorum = {
    title:"Necrobiosis Lipoidica Diabeticorum",
    explanation:"A chronic skin disease producing shiny yellow-brown plaques, usually on the shins.",
    causes:"Diabetes-related blood vessel damage and inflammation.",
    solution:"Control blood sugar, topical corticosteroids and protect affected skin.",
    prevention:"Maintain good diabetes management."
};

skincareKnowledge.nodularElastosis = {
    title:"Nodular Elastosis",
    explanation:"A rare condition characterized by nodules formed from damaged elastic tissue due to chronic sun exposure.",
    causes:"Long-term ultraviolet radiation.",
    solution:"Sun protection and surgical removal if needed.",
    prevention:"Wear sunscreen and protective clothing."
};

skincareKnowledge.onychomatricoma = {
    title:"Onychomatricoma",
    explanation:"A rare benign nail matrix tumor causing thickened, distorted nails.",
    causes:"Abnormal growth of nail matrix cells.",
    solution:"Complete surgical removal.",
    prevention:"No known prevention."
};

skincareKnowledge.papularElastorrhexis = {
    title:"Papular Elastorrhexis",
    explanation:"A rare connective tissue disorder causing multiple small white papules on the trunk and arms.",
    causes:"Loss of elastic fibers in the skin.",
    solution:"Usually no treatment is necessary.",
    prevention:"No known prevention."
};

skincareKnowledge.palisadedNeutrophilicGranulomatousDermatitis = {
    title:"Palisaded Neutrophilic Granulomatous Dermatitis",
    explanation:"A rare inflammatory skin disease associated with autoimmune disorders.",
    causes:"Rheumatoid arthritis, lupus and other autoimmune diseases.",
    solution:"Treat the underlying autoimmune disease and use corticosteroids.",
    prevention:"Proper management of autoimmune conditions."
};

skincareKnowledge.perforatingFolliculitis = {
    title:"Perforating Folliculitis",
    explanation:"A disorder in which damaged follicular material is expelled through the skin, causing itchy bumps.",
    causes:"Diabetes, kidney disease and chronic scratching.",
    solution:"Topical retinoids and treatment of the underlying condition.",
    prevention:"Control diabetes and avoid scratching."
};

skincareKnowledge.pigmentedPurgeicDermatosisLichenPlanusLike = {
    title:"Lichen Planus-like Pigmented Purpuric Dermatosis",
    explanation:"A rare subtype of pigmented purpuric dermatosis combining features of lichen planus and capillary leakage.",
    causes:"Unknown immune-mediated inflammation.",
    solution:"Topical corticosteroids and compression if leg circulation is poor.",
    prevention:"Maintain healthy circulation."
};

skincareKnowledge.porokeratoticEccrineOstialDermalDuctNevus = {
    title:"Porokeratotic Eccrine Ostial and Dermal Duct Nevus",
    explanation:"A rare congenital skin disorder producing linear keratotic papules.",
    causes:"Developmental abnormality of sweat ducts.",
    solution:"Laser therapy, topical retinoids or surgery.",
    prevention:"Cannot be prevented."
};

skincareKnowledge.primaryCutaneousAmyloidosisMacular = {
    title:"Macular Primary Cutaneous Amyloidosis",
    explanation:"A form of skin amyloidosis presenting as rippled brown pigmentation.",
    causes:"Repeated friction and abnormal protein deposition.",
    solution:"Reduce friction and use topical corticosteroids.",
    prevention:"Avoid chronic rubbing of the skin."
};

skincareKnowledge.pseudoxanthomaElasticumLikePapillaryDermalElastolysis = {
    title:"Pseudoxanthoma Elasticum-like Papillary Dermal Elastolysis",
    explanation:"A rare aging-related disorder causing tiny yellow papules on the neck.",
    causes:"Loss of elastic fibers due to aging and sun damage.",
    solution:"Sun protection and cosmetic treatment if desired.",
    prevention:"Protect skin from UV exposure."
};

skincareKnowledge.reticularErythematousMucinosis = {
    title:"Reticular Erythematous Mucinosis",
    explanation:"A chronic skin disease producing red net-like plaques on the chest and back.",
    causes:"Unknown; possibly autoimmune.",
    solution:"Hydroxychloroquine and sun protection.",
    prevention:"Avoid excessive sunlight."
};

skincareKnowledge.scleroticFibroma = {
    title:"Sclerotic Fibroma",
    explanation:"A rare benign connective tissue tumor appearing as a firm skin-colored nodule.",
    causes:"Abnormal collagen production.",
    solution:"Simple surgical excision.",
    prevention:"No known prevention."
};

skincareKnowledge.sebaceousAdenoma = {
    title:"Sebaceous Adenoma",
    explanation:"A benign tumor of sebaceous glands that may be associated with Muir-Torre syndrome.",
    causes:"Abnormal sebaceous gland growth.",
    solution:"Surgical removal if needed.",
    prevention:"Genetic evaluation in hereditary cases."
};

skincareKnowledge.superficialActinicPorokeratosis = {
    title:"Superficial Actinic Porokeratosis",
    explanation:"A sun-related skin disorder causing multiple ring-shaped scaly lesions.",
    causes:"Ultraviolet exposure and genetic susceptibility.",
    solution:"Sun protection, cryotherapy and topical medications.",
    prevention:"Use sunscreen consistently."
};

skincareKnowledge.trichoblastoma = {
    title:"Trichoblastoma",
    explanation:"A rare benign hair follicle tumor usually appearing on the scalp or face.",
    causes:"Benign follicular cell proliferation.",
    solution:"Surgical removal if diagnosis is uncertain.",
    prevention:"No known prevention."
};

skincareKnowledge.trichilemmoma = {
    title:"Trichilemmoma",
    explanation:"A benign tumor originating from the outer root sheath of hair follicles.",
    causes:"Genetic mutations or sporadic occurrence.",
    solution:"Observation or surgical removal.",
    prevention:"No known prevention."
};

skincareKnowledge.urticariaPigmentosaAdult = {
    title:"Adult Urticaria Pigmentosa",
    explanation:"A form of cutaneous mastocytosis causing brown itchy spots that become swollen when rubbed.",
    causes:"Accumulation of mast cells in the skin.",
    solution:"Antihistamines and avoidance of triggers.",
    prevention:"Avoid heat, friction and medications that trigger mast cell release."
};

skincareKnowledge.verrucousCarcinoma = {
    title:"Verrucous Carcinoma",
    explanation:"A slow-growing, well-differentiated form of squamous cell carcinoma with a wart-like appearance.",
    causes:"Human papillomavirus, tobacco use and chronic irritation.",
    solution:"Wide surgical excision.",
    prevention:"HPV prevention and avoidance of chronic irritation."
};

skincareKnowledge.xanthomaDisseminatum = {
    title:"Xanthoma Disseminatum",
    explanation:"A rare non-Langerhans cell histiocytosis causing numerous yellow-brown nodules on the skin and mucous membranes.",
    causes:"Abnormal histiocyte proliferation.",
    solution:"Specialist management with immunosuppressive therapy when necessary.",
    prevention:"No known prevention."
};

skincareKnowledge.xerodermaPigmentosumVariant = {
title:"Xeroderma Pigmentosum Variant",
explanation:"A rare inherited disorder in which the skin cannot properly repair damage caused by ultraviolet light, greatly increasing the risk of skin cancer.",
causes:"Genetic mutations affecting DNA repair.",
solution:"Strict sun protection, regular skin examinations and early treatment of suspicious lesions.",
prevention:"Genetic counseling and lifelong UV protection."
};

skincareKnowledge.acanthomaFissuratum = {
title:"Acanthoma Fissuratum",
explanation:"A benign skin growth caused by chronic pressure or friction, commonly from eyeglasses.",
causes:"Repeated mechanical irritation.",
solution:"Remove the source of friction and use topical corticosteroids if inflamed.",
prevention:"Ensure properly fitted eyewear."
};

skincareKnowledge.amyloidosisCutisDyschromica = {
title:"Amyloidosis Cutis Dyschromica",
explanation:"A rare inherited form of cutaneous amyloidosis causing mottled dark and light skin patches.",
causes:"Genetic mutations with abnormal amyloid deposition.",
solution:"Sun protection and dermatologist-directed therapy.",
prevention:"Genetic counseling."
};

skincareKnowledge.angiolipoma = {
title:"Angiolipoma",
explanation:"A benign fatty tumor containing many small blood vessels that is often painful when pressed.",
causes:"Unknown; may have a hereditary component.",
solution:"Surgical removal if painful.",
prevention:"No known prevention."
};

skincareKnowledge.calciphylaxis = {
title:"Calciphylaxis",
explanation:"A life-threatening condition where calcium accumulates in small blood vessels, causing painful skin ulcers.",
causes:"Advanced kidney disease, high calcium-phosphate levels and certain medications.",
solution:"Emergency specialist treatment, wound care and correction of mineral imbalance.",
prevention:"Careful management of kidney disease and mineral metabolism."
};

skincareKnowledge.cutaneousCrohnsDisease = {
title:"Cutaneous Crohn's Disease",
explanation:"A rare skin manifestation of Crohn's disease causing ulcers, swelling and nodules.",
causes:"Inflammation associated with Crohn's disease.",
solution:"Treat the underlying Crohn's disease with appropriate medications.",
prevention:"Maintain good control of Crohn's disease."
};

skincareKnowledge.diffusePlaneXanthoma = {
title:"Diffuse Plane Xanthoma",
explanation:"Flat yellow patches on the skin caused by cholesterol deposits, sometimes linked to blood disorders.",
causes:"Abnormal lipid metabolism or blood protein disorders.",
solution:"Treat the underlying condition and manage cholesterol levels.",
prevention:"Regular monitoring of blood lipid levels."
};

skincareKnowledge.eccrineNevoidHyperhidrosis = {
title:"Eccrine Nevoid Hyperhidrosis",
explanation:"A rare disorder causing excessive sweating in a localized area of the body.",
causes:"Localized overgrowth of eccrine sweat glands.",
solution:"Botulinum toxin injections or surgical treatment if severe.",
prevention:"No known prevention."
};

skincareKnowledge.fibromaOfTendonSheath = {
title:"Fibroma of Tendon Sheath",
explanation:"A rare benign fibrous tumor attached to tendons, usually affecting the hands.",
causes:"Unknown.",
solution:"Surgical excision if painful or limiting movement.",
prevention:"No known prevention."
};

skincareKnowledge.granulomaGlutealeInfantum = {
title:"Granuloma Gluteale Infantum",
explanation:"A rare diaper area condition causing reddish-purple nodules in infants.",
causes:"Chronic irritation, occlusion and prolonged diaper rash.",
solution:"Improve diaper hygiene and treat underlying irritation.",
prevention:"Keep the diaper area clean and dry."
};

skincareKnowledge.hidroacanthomaSimplex = {
title:"Hidroacanthoma Simplex",
explanation:"A rare benign sweat gland tumor presenting as a slowly growing plaque.",
causes:"Benign proliferation of sweat gland cells.",
solution:"Surgical removal.",
prevention:"No known prevention."
};

skincareKnowledge.idiopathicGuttateHypomelanosis = {
title:"Idiopathic Guttate Hypomelanosis",
explanation:"Small white spots that develop on sun-exposed skin with aging.",
causes:"Sun damage and natural aging.",
solution:"Usually no treatment is necessary; cosmetic therapies may help.",
prevention:"Consistent sunscreen use."
};

skincareKnowledge.juvenilePapillomatosisOfTheSkin = {
title:"Juvenile Papillomatosis of the Skin",
explanation:"A rare benign papillomatous skin growth occurring in children.",
causes:"Unknown developmental abnormality.",
solution:"Surgical removal if necessary.",
prevention:"No known prevention."
};

skincareKnowledge.keratosisObturans = {
title:"Keratosis Obturans",
explanation:"A rare condition involving the accumulation of keratin within the ear canal.",
causes:"Abnormal skin shedding in the ear canal.",
solution:"Professional removal of keratin and regular follow-up.",
prevention:"Routine ear care under medical supervision."
};

skincareKnowledge.lichenSpinulosus = {
title:"Lichen Spinulosus",
explanation:"A rare skin disorder causing groups of tiny rough follicular bumps with spiny projections.",
causes:"Unknown; possibly related to immune dysfunction.",
solution:"Moisturizers, keratolytic creams and topical retinoids.",
prevention:"Maintain skin hydration."
};

skincareKnowledge.miliaEnPlaque = {
title:"Milia en Plaque",
explanation:"A rare condition where numerous milia develop within an inflamed skin plaque.",
causes:"Unknown; may follow skin injury.",
solution:"Topical retinoids, laser therapy or surgical extraction.",
prevention:"Avoid unnecessary skin trauma."
};

skincareKnowledge.nevusLipomatosusCutaneousSuperficialis = {
title:"Nevus Lipomatosus Cutaneous Superficialis",
explanation:"A rare benign skin lesion containing fat cells within the dermis.",
causes:"Congenital developmental abnormality.",
solution:"Surgical removal for cosmetic reasons if desired.",
prevention:"Cannot be prevented."
};

skincareKnowledge.papularMucinosisLocalized = {
title:"Localized Papular Mucinosis",
explanation:"A localized form of papular mucinosis characterized by waxy papules due to mucin deposits.",
causes:"Unknown.",
solution:"Observation or dermatologist-directed treatment.",
prevention:"No known prevention."
};

skincareKnowledge.rheumatoidNeutrophilicDermatitis = {
title:"Rheumatoid Neutrophilic Dermatitis",
explanation:"A rare skin manifestation of rheumatoid arthritis causing red plaques and nodules.",
causes:"Inflammation associated with rheumatoid arthritis.",
solution:"Treat the underlying rheumatoid arthritis and use corticosteroids when appropriate.",
prevention:"Maintain good control of rheumatoid arthritis."
};

skincareKnowledge.subcornealPustularDermatosis = {
title:"Subcorneal Pustular Dermatosis",
explanation:"A chronic skin disease producing recurrent sterile pustules, mainly in middle-aged women.",
causes:"Abnormal immune response and neutrophil accumulation.",
solution:"Dapsone is commonly effective, along with dermatologist-guided therapy.",
prevention:"No known prevention."
};

skincareKnowledge.teleangiectasiaMacularisEruptivaPerstans = {
title:"Telangiectasia Macularis Eruptiva Perstans",
explanation:"A rare form of cutaneous mastocytosis causing reddish-brown patches with tiny visible blood vessels.",
causes:"Abnormal accumulation of mast cells in the skin.",
solution:"Antihistamines, avoidance of triggers and dermatologist-guided treatment.",
prevention:"Avoid heat, alcohol and medications that trigger mast cell release."
};

skincareKnowledge.transepidermalEliminationDisorder = {
title:"Transepidermal Elimination Disorder",
explanation:"A group of skin disorders where damaged tissue is expelled through the epidermis.",
causes:"Diabetes, kidney disease and connective tissue disorders.",
solution:"Treat the underlying disease and use topical therapies.",
prevention:"Manage chronic medical conditions effectively."
};

skincareKnowledge.tuftedHairFolliculitis = {
title:"Tufted Hair Folliculitis",
explanation:"A rare scalp disorder where several hairs emerge from a single follicle due to chronic inflammation.",
causes:"Chronic bacterial infection and follicular damage.",
solution:"Antibiotics and anti-inflammatory medications.",
prevention:"Treat scalp infections promptly."
};

skincareKnowledge.unilateralLaterothoracicExanthem = {
title:"Unilateral Laterothoracic Exanthem",
explanation:"A self-limiting childhood rash beginning on one side of the body.",
causes:"Likely viral infections.",
solution:"Supportive care and anti-itch medication if needed.",
prevention:"Good hygiene may reduce viral spread."
};

skincareKnowledge.urticarialVasculitis = {
title:"Urticarial Vasculitis",
explanation:"A condition where hives last longer than 24 hours due to inflammation of small blood vessels.",
causes:"Autoimmune disease, infections or medications.",
solution:"Antihistamines, corticosteroids and treatment of the underlying cause.",
prevention:"Avoid known medication triggers."
};

skincareKnowledge.vascularEctasia = {
title:"Vascular Ectasia",
explanation:"An abnormal widening of superficial blood vessels causing visible red skin lesions.",
causes:"Aging, sun damage or vascular disorders.",
solution:"Laser therapy for cosmetic improvement.",
prevention:"Protect skin from excessive sun exposure."
};

skincareKnowledge.wartsEpidermodysplasiaVerruciformis = {
title:"Epidermodysplasia Verruciformis",
explanation:"A rare inherited disorder causing persistent HPV infections and widespread wart-like lesions.",
causes:"Genetic mutations affecting immune response to HPV.",
solution:"Regular skin monitoring, lesion removal and sun protection.",
prevention:"Genetic counseling and UV protection."
};

skincareKnowledge.xanthomaStriatumPalmare = {
title:"Xanthoma Striatum Palmare",
explanation:"Yellow cholesterol deposits appearing along the creases of the palms.",
causes:"Familial dysbetalipoproteinemia and abnormal cholesterol metabolism.",
solution:"Control blood lipids and treat the underlying disorder.",
prevention:"Maintain healthy cholesterol levels."
};

skincareKnowledge.zincResponsiveDermatosis = {
title:"Zinc Responsive Dermatosis",
explanation:"A skin condition that improves significantly with zinc supplementation.",
causes:"Zinc deficiency or impaired zinc absorption.",
solution:"Oral zinc replacement under medical supervision.",
prevention:"Maintain adequate dietary zinc intake."
};

skincareKnowledge.acralPersistentPapularMucinosis = {
title:"Acral Persistent Papular Mucinosis",
explanation:"A rare disorder causing persistent waxy papules on the backs of the hands and wrists.",
causes:"Localized mucin deposition.",
solution:"Usually no treatment is required; topical therapies may help.",
prevention:"No known prevention."
};

skincareKnowledge.benignCephalicHistiocytosis = {
title:"Benign Cephalic Histiocytosis",
explanation:"A rare childhood disorder causing small yellow-brown papules on the face.",
causes:"Benign proliferation of histiocytes.",
solution:"Usually resolves spontaneously without treatment.",
prevention:"No known prevention."
};

skincareKnowledge.connectiveTissueNevus = {
title:"Connective Tissue Nevus",
explanation:"A benign hamartoma composed of collagen or elastic tissue.",
causes:"Congenital connective tissue overgrowth.",
solution:"Observation or surgical removal if necessary.",
prevention:"Cannot be prevented."
};

skincareKnowledge.digitalMucousCyst = {
title:"Digital Mucous Cyst",
explanation:"A small fluid-filled cyst usually found near the fingernails in older adults.",
causes:"Degenerative joint disease and leakage of joint fluid.",
solution:"Drainage or surgical removal.",
prevention:"Manage osteoarthritis when present."
};

skincareKnowledge.elastoma = {
title:"Elastoma",
explanation:"A rare connective tissue nevus characterized by excessive elastic fibers.",
causes:"Congenital abnormality of elastic tissue.",
solution:"Usually no treatment is needed.",
prevention:"Cannot be prevented."
};

skincareKnowledge.fibrousHamartoma = {
title:"Fibrous Hamartoma",
explanation:"A benign overgrowth of fibrous tissue occurring beneath the skin.",
causes:"Developmental abnormality.",
solution:"Surgical removal if symptomatic.",
prevention:"No known prevention."
};

skincareKnowledge.granulomaFaciale = {
title:"Granuloma Faciale",
explanation:"A chronic inflammatory disorder causing reddish-brown plaques on the face.",
causes:"Unknown; associated with chronic inflammation of blood vessels.",
solution:"Topical corticosteroids, laser therapy or surgery.",
prevention:"No known prevention."
};

skincareKnowledge.hyperkeratosisPalmarisEtPlantaris = {
title:"Hyperkeratosis Palmaris et Plantaris",
explanation:"A disorder causing excessive thickening of the skin on the palms and soles.",
causes:"Inherited conditions, friction or chronic skin diseases.",
solution:"Keratolytic creams, moisturizers and retinoids.",
prevention:"Reduce repeated friction and maintain skin hydration."
};

skincareKnowledge.intravascularPapillaryEndothelialHyperplasia = {
title:"Intravascular Papillary Endothelial Hyperplasia",
explanation:"A rare benign vascular lesion formed by excessive growth of endothelial cells inside blood vessels.",
causes:"Reaction to blood clots within vessels.",
solution:"Complete surgical removal.",
prevention:"No known prevention."
};

skincareKnowledge.lichenNitidusGeneralized = {
title:"Generalized Lichen Nitidus",
explanation:"A widespread form of lichen nitidus producing numerous tiny shiny skin-colored papules.",
causes:"Unknown immune-mediated inflammation.",
solution:"Phototherapy, topical corticosteroids and moisturizers.",
prevention:"No known prevention."
};

skincareKnowledge.mucinousNevus = {
title:"Mucinous Nevus",
explanation:"A rare congenital skin lesion characterized by localized mucin accumulation in the skin.",
causes:"Developmental abnormality.",
solution:"Surgical removal if cosmetically desired.",
prevention:"Cannot be prevented."
};

skincareKnowledge.nevusComedonicus = {
title:"Nevus Comedonicus",
explanation:"A rare congenital skin disorder characterized by groups of enlarged hair follicles filled with keratin, resembling blackheads.",
causes:"Developmental abnormality of hair follicles caused by genetic mosaicism.",
solution:"Topical retinoids, surgical removal or laser therapy depending on severity.",
prevention:"Cannot be prevented."
};

skincareKnowledge.papularXanthoma = {
title:"Papular Xanthoma",
explanation:"A rare benign disorder causing multiple yellow-orange papules due to lipid-filled immune cells.",
causes:"Abnormal accumulation of histiocytes containing lipids.",
solution:"Usually observation; treat associated lipid disorders if present.",
prevention:"Maintain healthy cholesterol levels."
};

skincareKnowledge.perianalStreptococcalDermatitis = {
title:"Perianal Streptococcal Dermatitis",
explanation:"A bacterial skin infection around the anus causing redness, pain and itching, especially in children.",
causes:"Group A Streptococcus infection.",
solution:"Oral antibiotics prescribed by a healthcare provider.",
prevention:"Good hand hygiene and prompt treatment of strep infections."
};

skincareKnowledge.phakomatosisPigmentovascularis = {
title:"Phakomatosis Pigmentovascularis",
explanation:"A rare congenital syndrome involving both pigmentary birthmarks and vascular malformations.",
causes:"Genetic mosaic mutations during fetal development.",
solution:"Laser therapy and multidisciplinary management depending on associated abnormalities.",
prevention:"Cannot be prevented."
};

skincareKnowledge.pilomatricoma = {
title:"Pilomatricoma",
explanation:"A benign skin tumor arising from hair matrix cells, often presenting as a hard lump under the skin.",
causes:"Mutation affecting hair follicle cells.",
solution:"Complete surgical removal.",
prevention:"No known prevention."
};

skincareKnowledge.porokeratosisPtychotropica = {
title:"Porokeratosis Ptychotropica",
explanation:"A rare form of porokeratosis affecting the buttocks and genital folds with itchy wart-like plaques.",
causes:"Abnormal keratinization and genetic susceptibility.",
solution:"Cryotherapy, laser treatment or topical retinoids.",
prevention:"Protect affected skin and seek early treatment."
};

skincareKnowledge.primaryLocalizedCutaneousNodularAmyloidosis = {
title:"Primary Localized Cutaneous Nodular Amyloidosis",
explanation:"A rare disorder where amyloid proteins accumulate in localized skin nodules.",
causes:"Localized plasma cell abnormalities.",
solution:"Surgical removal or laser therapy.",
prevention:"No known prevention."
};

skincareKnowledge.pseudocystOfTheAuricle = {
title:"Pseudocyst of the Auricle",
explanation:"A painless fluid-filled swelling within the cartilage of the outer ear.",
causes:"Minor trauma or cartilage degeneration.",
solution:"Drainage combined with compression dressing.",
prevention:"Avoid repeated ear trauma."
};

skincareKnowledge.pyodermaGangrenosumVegetans = {
title:"Pyoderma Gangrenosum Vegetans",
explanation:"A superficial variant of pyoderma gangrenosum producing slow-growing ulcers and plaques.",
causes:"Immune system dysfunction.",
solution:"Topical corticosteroids and treatment of underlying disease.",
prevention:"Manage associated inflammatory disorders."
};

skincareKnowledge.reticulatePigmentationOfDohi = {
title:"Reticulate Pigmentation of Dohi",
explanation:"A rare inherited pigment disorder causing mixed dark and light spots in a net-like pattern.",
causes:"Genetic mutation affecting pigmentation.",
solution:"Usually no treatment is required.",
prevention:"Cannot be prevented."
};

skincareKnowledge.sebaceousNevus = {
title:"Sebaceous Nevus",
explanation:"A congenital yellow-orange hairless plaque commonly found on the scalp or face.",
causes:"Developmental abnormality of sebaceous glands.",
solution:"Regular monitoring and surgical removal if necessary.",
prevention:"Cannot be prevented."
};

skincareKnowledge.skinMetastases = {
title:"Skin Metastases",
explanation:"Cancer that has spread from an internal organ to the skin, producing firm nodules or plaques.",
causes:"Advanced internal cancers.",
solution:"Treatment focuses on the underlying cancer.",
prevention:"Early detection and treatment of primary cancers."
};

skincareKnowledge.solarElastosis = {
title:"Solar Elastosis",
explanation:"Premature aging of the skin caused by chronic sun exposure, leading to thick, yellow, wrinkled skin.",
causes:"Long-term ultraviolet radiation.",
solution:"Retinoids, moisturizers and laser resurfacing.",
prevention:"Daily sunscreen and protective clothing."
};

skincareKnowledge.steatocystomaMultiplex = {
title:"Steatocystoma Multiplex",
explanation:"A condition characterized by numerous oil-filled cysts beneath the skin.",
causes:"Inherited mutation of keratin genes.",
solution:"Drainage, laser therapy or surgical removal.",
prevention:"Genetic counseling where appropriate."
};

skincareKnowledge.subepidermalCalcifiedNodule = {
title:"Subepidermal Calcified Nodule",
explanation:"A rare benign calcium deposit appearing as a hard white nodule, usually in children.",
causes:"Localized calcium deposition.",
solution:"Simple surgical excision.",
prevention:"No known prevention."
};

skincareKnowledge.trichoadenoma = {
title:"Trichoadenoma",
explanation:"A rare benign tumor originating from hair follicle structures.",
causes:"Abnormal follicular differentiation.",
solution:"Complete surgical removal.",
prevention:"No known prevention."
};

skincareKnowledge.trichodiscoma = {
title:"Trichodiscoma",
explanation:"A rare benign hair follicle tumor that may occur as part of inherited syndromes.",
causes:"Genetic mutations affecting follicular growth.",
solution:"Observation or surgical removal.",
prevention:"Genetic counseling in hereditary cases."
};

skincareKnowledge.verruciformXanthomaOfOralMucosa = {
title:"Verruciform Xanthoma of the Oral Mucosa",
explanation:"A rare benign wart-like lesion that develops inside the mouth.",
causes:"Chronic inflammation and localized immune response.",
solution:"Simple surgical removal.",
prevention:"Maintain good oral hygiene."
};

skincareKnowledge.whiteFibrousPapulosisOfTheNeck = {
title:"White Fibrous Papulosis of the Neck",
explanation:"A benign aging-related condition producing small white papules on the neck.",
causes:"Age-related changes in collagen and elastic fibers.",
solution:"Usually no treatment is required; laser therapy for cosmetic improvement.",
prevention:"Protect skin from chronic sun exposure."
};

skincareKnowledge.xanthomaTuberosum = {
title:"Tuberous Xanthoma",
explanation:"Firm yellow nodules over joints caused by severe cholesterol abnormalities.",
causes:"Familial hypercholesterolemia and other lipid disorders.",
solution:"Aggressive cholesterol-lowering therapy and treatment of the underlying condition.",
prevention:"Maintain healthy lipid levels and undergo regular cholesterol screening."
};

skincareKnowledge.acrodermatitisParaneoplastica = {
title:"Acrodermatitis Paraneoplastica",
explanation:"Also known as Bazex syndrome, it is a rare skin disorder associated with internal cancers, especially of the upper respiratory tract.",
causes:"Paraneoplastic reaction triggered by an underlying cancer.",
solution:"Treat the underlying cancer; skin lesions often improve afterward.",
prevention:"Early detection and treatment of associated cancers."
};

skincareKnowledge.angiokeratomaOfMibelli = {
title:"Angiokeratoma of Mibelli",
explanation:"A rare vascular skin condition causing dark wart-like bumps on the fingers, toes, ears or knees.",
causes:"Chronic cold exposure and abnormal superficial blood vessels.",
solution:"Laser therapy, electrocautery or observation if asymptomatic.",
prevention:"Protect extremities from cold injury."
};

skincareKnowledge.atrophicDermatofibroma = {
title:"Atrophic Dermatofibroma",
explanation:"A rare variant of dermatofibroma that appears as a depressed scar-like patch.",
causes:"Benign fibrous skin growth with tissue thinning.",
solution:"Usually no treatment is needed; surgical removal if diagnosis is uncertain.",
prevention:"No known prevention."
};

skincareKnowledge.cutaneousMeningioma = {
title:"Cutaneous Meningioma",
explanation:"A rare skin lesion containing meningothelial cells, often present from birth or after surgery.",
causes:"Developmental abnormalities or extension of a meningioma.",
solution:"Surgical excision and neurologic evaluation if necessary.",
prevention:"Cannot be prevented."
};

skincareKnowledge.dermatitisArtefacta = {
title:"Dermatitis Artefacta",
explanation:"A condition in which skin lesions are self-inflicted, often unconsciously, due to psychological distress.",
causes:"Underlying psychiatric or emotional disorders.",
solution:"Psychological support, counseling and gentle skin care.",
prevention:"Address emotional and mental health concerns early."
};

skincareKnowledge.eccrineSyringofibroadenoma = {
title:"Eccrine Syringofibroadenoma",
explanation:"A rare benign tumor arising from sweat ducts, often appearing as a wart-like plaque.",
causes:"Abnormal eccrine duct proliferation.",
solution:"Surgical removal is usually recommended.",
prevention:"No known prevention."
};

skincareKnowledge.epidermolyticPalmoplantarKeratoderma = {
title:"Epidermolytic Palmoplantar Keratoderma",
explanation:"An inherited disorder causing thickened skin on the palms and soles with blistering.",
causes:"Mutations in keratin genes.",
solution:"Keratolytic creams, retinoids and protective footwear.",
prevention:"Genetic counseling."
};

skincareKnowledge.eruptiveSyringomas = {
title:"Eruptive Syringomas",
explanation:"Multiple small sweat gland tumors that appear suddenly on the chest, neck or eyelids.",
causes:"Benign overgrowth of eccrine sweat ducts.",
solution:"Laser therapy, electrocautery or topical retinoids for cosmetic improvement.",
prevention:"No known prevention."
};

skincareKnowledge.fibrolipomatousHamartoma = {
title:"Fibrolipomatous Hamartoma",
explanation:"A rare overgrowth of fibrous and fatty tissue around a nerve, often affecting the hand.",
causes:"Congenital developmental abnormality.",
solution:"Observation or surgery if nerve compression occurs.",
prevention:"Cannot be prevented."
};

skincareKnowledge.generalizedLichenAmyloidosis = {
title:"Generalized Lichen Amyloidosis",
explanation:"A widespread form of cutaneous amyloidosis causing intensely itchy, rough papules.",
causes:"Abnormal amyloid deposition often worsened by chronic scratching.",
solution:"Topical steroids, antihistamines and reducing skin friction.",
prevention:"Avoid chronic scratching and rubbing."
};

skincareKnowledge.hidradenitisSuppurativaFulminans = {
title:"Hidradenitis Suppurativa Fulminans",
explanation:"A severe aggressive form of hidradenitis suppurativa with widespread painful abscesses and systemic symptoms.",
causes:"Severe inflammatory dysregulation of hair follicles.",
solution:"Biologic therapy, systemic medications and specialist care.",
prevention:"Early treatment of hidradenitis suppurativa may reduce progression."
};

skincareKnowledge.interstitialGranulomatousDrugReaction = {
title:"Interstitial Granulomatous Drug Reaction",
explanation:"A rare inflammatory skin reaction triggered by certain medications.",
causes:"Drug-induced immune reaction.",
solution:"Stop the offending medication and use anti-inflammatory treatment.",
prevention:"Review medication history and monitor for reactions."
};

skincareKnowledge.juvenileXanthogranulomaDisseminated = {
title:"Disseminated Juvenile Xanthogranuloma",
explanation:"A rare widespread form of juvenile xanthogranuloma with numerous skin lesions.",
causes:"Excess accumulation of histiocytes.",
solution:"Usually observation; systemic therapy in severe cases.",
prevention:"No known prevention."
};

skincareKnowledge.keratosisPilarisAtrophicans = {
title:"Keratosis Pilaris Atrophicans",
explanation:"A group of inherited disorders causing rough follicular bumps and permanent scarring.",
causes:"Abnormal keratinization around hair follicles.",
solution:"Moisturizers, retinoids and early dermatologic care.",
prevention:"Cannot be prevented genetically."
};

skincareKnowledge.lipedematousAlopecia = {
title:"Lipedematous Alopecia",
explanation:"A rare condition with an unusually thick scalp accompanied by hair loss.",
causes:"Unknown; possibly abnormal fat deposition in the scalp.",
solution:"Supportive dermatologic management.",
prevention:"No known prevention."
};

skincareKnowledge.multipleFamilialTrichoepithelioma = {
title:"Multiple Familial Trichoepithelioma",
explanation:"An inherited disorder causing numerous benign hair follicle tumors on the face.",
causes:"Autosomal dominant genetic mutation.",
solution:"Laser therapy, electrosurgery or surgical removal for cosmetic reasons.",
prevention:"Genetic counseling."
};

skincareKnowledge.nevusSebaceusSyndrome = {
title:"Nevus Sebaceus Syndrome",
explanation:"A congenital syndrome involving sebaceous nevi with neurologic, eye or skeletal abnormalities.",
causes:"Genetic mosaic mutations during development.",
solution:"Multidisciplinary evaluation and treatment of associated abnormalities.",
prevention:"Cannot be prevented."
};

skincareKnowledge.papularPurpuricGlovesAndSocksSyndrome = {
title:"Papular Purpuric Gloves and Socks Syndrome",
explanation:"A viral rash causing painful redness and purple spots on the hands and feet.",
causes:"Most commonly Parvovirus B19 infection.",
solution:"Supportive care, hydration and pain relief.",
prevention:"Good hygiene practices may reduce viral spread."
};

skincareKnowledge.reticulatePigmentationOfKitamura = {
title:"Reticulate Pigmentation of Kitamura",
explanation:"A rare inherited disorder causing net-like dark pigmentation on the hands and feet.",
causes:"Genetic mutation affecting pigmentation.",
solution:"Usually no treatment is required; sun protection may help.",
prevention:"Cannot be prevented genetically."
};

skincareKnowledge.syringomaEruptiveFamilial = {
title:"Familial Eruptive Syringoma",
explanation:"An inherited tendency to develop multiple small sweat gland tumors in adolescence or adulthood.",
causes:"Genetic predisposition affecting eccrine ducts.",
solution:"Laser therapy or electrocautery for cosmetic improvement.",
prevention:"No known prevention."
};

skincareKnowledge.syringoma = {
title:"Syringoma",
explanation:"A benign sweat gland tumor that appears as small flesh-colored or yellowish bumps, commonly around the eyes.",
causes:"Overgrowth of eccrine sweat gland ducts; genetics may play a role.",
solution:"Usually no treatment is necessary. Laser therapy, electrocautery or surgical removal may be performed for cosmetic reasons.",
prevention:"No known prevention."
};

skincareKnowledge.papularAcrodermatitisOfChildhood = {
title:"Papular Acrodermatitis of Childhood",
explanation:"Also known as Gianotti-Crosti syndrome, this condition causes itchy papules on the arms, legs and face in children.",
causes:"Usually follows viral infections such as Epstein-Barr virus or hepatitis B.",
solution:"Supportive care, moisturizers and antihistamines for itching.",
prevention:"Good hygiene and vaccination against preventable viral infections."
};

skincareKnowledge.pigmentedBasalCellCarcinoma = {
title:"Pigmented Basal Cell Carcinoma",
explanation:"A darker variant of basal cell carcinoma that may resemble melanoma.",
causes:"Chronic ultraviolet radiation exposure.",
solution:"Surgical removal, Mohs surgery or dermatologist-directed treatment.",
prevention:"Daily sunscreen and routine skin examinations."
};

skincareKnowledge.proliferatingTrichilemmalTumor = {
title:"Proliferating Trichilemmal Tumor",
explanation:"A rare hair follicle tumor that usually develops from a scalp cyst.",
causes:"Growth of trichilemmal cyst cells.",
solution:"Complete surgical excision.",
prevention:"Treat enlarging scalp cysts early."
};

skincareKnowledge.pseudoepitheliomatousHyperplasia = {
title:"Pseudoepitheliomatous Hyperplasia",
explanation:"A benign overgrowth of the epidermis that can resemble squamous cell carcinoma.",
causes:"Chronic inflammation, infections or trauma.",
solution:"Treat the underlying cause and biopsy when diagnosis is uncertain.",
prevention:"Prompt treatment of chronic skin inflammation."
};

skincareKnowledge.pyogenicGranuloma = {
title:"Pyogenic Granuloma",
explanation:"A rapidly growing benign vascular lesion that bleeds easily after minor trauma.",
causes:"Minor injury, pregnancy or certain medications.",
solution:"Laser therapy, cauterization or surgical removal.",
prevention:"Protect skin from repeated injury."
};

skincareKnowledge.retiformPurpura = {
    title:"Retiform Purpura",
    explanation:"A net-like pattern of purple skin discoloration caused by blockage or inflammation of blood vessels.",
    causes:"Vasculitis, clotting disorders or severe infections.",
    solution:"Urgent treatment of the underlying medical condition.",
    prevention:"Manage clotting disorders and autoimmune diseases."
};

skincareKnowledge.rhinophyma = {
    title:"Rhinophyma",
    explanation:"A severe form of rosacea causing enlargement and thickening of the nose.",
    causes:"Long-standing untreated rosacea.",
    solution:"Laser resurfacing or surgical reduction.",
    prevention:"Early treatment of rosacea."
};

skincareKnowledge.sclerodermaEnCoupDeSabre = {
    title:"Scleroderma En Coup de Sabre",
    explanation:"A localized form of scleroderma causing a linear scar-like groove on the forehead or scalp.",
    causes:"Autoimmune inflammation.",
    solution:"Immunosuppressive therapy and dermatologist follow-up.",
    prevention:"No known prevention."
};

skincareKnowledge.sebaceousEpithelioma = {
    title:"Sebaceous Epithelioma",
    explanation:"A rare benign or low-grade sebaceous gland tumor that may be associated with hereditary syndromes.",
    causes:"Abnormal sebaceous gland growth.",
    solution:"Surgical removal and genetic evaluation if indicated.",
    prevention:"Regular skin examinations."
};

skincareKnowledge.superficialEpitheliomaWithSebaceousDifferentiation = {
    title:"Superficial Epithelioma with Sebaceous Differentiation",
    explanation:"A rare benign skin tumor showing sebaceous gland differentiation.",
    causes:"Unknown.",
    solution:"Simple surgical excision.",
    prevention:"No known prevention."
};

skincareKnowledge.trichilemmalCyst = {
    title:"Trichilemmal Cyst",
    explanation:"A common benign cyst that develops from hair follicles, especially on the scalp.",
    causes:"Blocked hair follicles and genetic predisposition.",
    solution:"Surgical removal if painful or infected.",
    prevention:"No known prevention."
};

skincareKnowledge.verruciformEpidermodysplasia = {
    title:"Verruciform Epidermodysplasia",
    explanation:"A wart-like skin condition associated with abnormal susceptibility to human papillomavirus.",
    causes:"Inherited immune defects.",
    solution:"Regular dermatologic monitoring and lesion removal.",
    prevention:"Sun protection and genetic counseling."
};

skincareKnowledge.xanthoastrocytomaCutaneousAssociation = {
    title:"Cutaneous Association with Pleomorphic Xanthoastrocytoma",
    explanation:"Rare skin findings occasionally reported alongside pleomorphic xanthoastrocytoma syndromes.",
    causes:"Rare genetic associations.",
    solution:"Multidisciplinary specialist care.",
    prevention:"No known prevention."
};

skincareKnowledge.yellowUrticaria = {
    title:"Yellow Urticaria",
    explanation:"A rare form of hives appearing yellow because of elevated bilirubin levels.",
    causes:"Liver disease causing jaundice.",
    solution:"Treat the underlying liver disorder and manage urticaria.",
    prevention:"Maintain liver health and seek early treatment for liver disease."
};

skincareKnowledge.zoonBalanitis = {
    title:"Zoon Balanitis",
    explanation:"A chronic inflammatory condition causing shiny red patches on the glans penis in uncircumcised men.",
    causes:"Chronic irritation and moisture.",
    solution:"Improved hygiene, topical medications or circumcision in persistent cases.",
    prevention:"Good genital hygiene."
};

skincareKnowledge.acroangiodermatitis = {
  title: "Acroangiodermatitis",
  explanation: "A benign vascular condition resembling Kaposi sarcoma that develops due to poor circulation.",
  causes: "Chronic venous insufficiency or arteriovenous malformations.",
  solution: "Compression therapy and treatment of venous disease.",
  prevention: "Maintain healthy circulation."
};

skincareKnowledge.balloonCellMelanoma = {
  title: "Balloon Cell Melanoma",
  explanation: "A rare subtype of melanoma composed of balloon-like pigment cells.",
  causes: "Malignant transformation of melanocytes.",
  solution: "Early surgical removal and oncology management.",
  prevention: "Routine mole checks and UV protection."
};

skincareKnowledge.cutaneousCholesterolGranuloma = {
  title: "Cutaneous Cholesterol Granuloma",
  explanation: "A rare inflammatory lesion containing cholesterol crystals within the skin.",
  causes: "Chronic tissue injury and inflammation.",
  solution: "Surgical removal if symptomatic.",
  prevention: "Prompt treatment of chronic skin injuries."
};

skincareKnowledge.acrodermatitisEnteropathicaAcquired = {
  title:"Acquired Acrodermatitis Enteropathica",
  explanation:"A zinc deficiency disorder in adults causing dermatitis, diarrhea and hair loss.",
  causes:"Poor nutrition, intestinal disease or impaired zinc absorption.",
  solution:"Oral zinc supplementation and treatment of the underlying cause.",
  prevention:"Maintain adequate dietary zinc intake."
};

skincareKnowledge.adnexalCarcinoma = {
  title:"Adnexal Carcinoma",
  explanation:"A rare skin cancer arising from sweat, sebaceous or hair follicle glands.",
  causes:"Malignant transformation of skin appendage cells.",
  solution:"Wide surgical excision and oncology follow-up.",
  prevention:"Early evaluation of persistent skin tumors."
};

skincareKnowledge.angiomaSerpiginosum = {
  title:"Angioma Serpiginosum",
  explanation:"A rare vascular disorder producing clusters of tiny red spots in a serpentine pattern.",
  causes:"Abnormal capillary development.",
  solution:"Pulsed dye laser for cosmetic improvement.",
  prevention:"No known prevention."
};

skincareKnowledge.atrophieBlanche = {
  title:"Atrophie Blanche",
  explanation:"White scar-like patches on the legs caused by poor blood circulation and healed ulcers.",
  causes:"Chronic venous disease or small blood vessel disorders.",
  solution:"Compression therapy and wound management.",
  prevention:"Treat venous insufficiency early."
};

skincareKnowledge.calcinosisCutisUniversalis = {
  title:"Calcinosis Cutis Universalis",
  explanation:"Extensive calcium deposits affecting large areas of the skin and soft tissues.",
  causes:"Autoimmune connective tissue diseases.",
  solution:"Treat the underlying disease and remove painful deposits when necessary.",
  prevention:"Manage connective tissue disorders promptly."
};

skincareKnowledge.chilblainLupus = {
  title:"Chilblain Lupus",
  explanation:"A rare form of cutaneous lupus causing painful purple lesions after cold exposure.",
  causes:"Autoimmune disease triggered by cold temperatures.",
  solution:"Keep warm, use corticosteroids and antimalarial medication.",
  prevention:"Avoid prolonged cold exposure."
};

skincareKnowledge.clearCellHidradenoma = {
  title:"Clear Cell Hidradenoma",
  explanation:"A benign sweat gland tumor presenting as a slow-growing skin nodule.",
  causes:"Benign proliferation of sweat gland cells.",
  solution:"Complete surgical excision.",
  prevention:"No known prevention."
};

skincareKnowledge.cutaneousLarvaMigrans = {
  title:"Cutaneous Larva Migrans",
  explanation:"A parasitic skin infection producing winding itchy tracks beneath the skin.",
  causes:"Hookworm larvae penetrating the skin from contaminated sand or soil.",
  solution:"Antiparasitic medications such as ivermectin or albendazole.",
  prevention:"Wear footwear and avoid sitting on contaminated beaches."
};

skincareKnowledge.degenerativeCollagenousPlaques = {
  title:"Degenerative Collagenous Plaques",
  explanation:"Yellowish thickened plaques occurring mainly on the hands and feet of older adults.",
  causes:"Chronic pressure, aging and collagen degeneration.",
  solution:"Moisturizers and reduction of mechanical stress.",
  prevention:"Protect pressure-prone skin."
};

skincareKnowledge.disseminatedSuperficialActinicPorokeratosis = {
  title:"Disseminated Superficial Actinic Porokeratosis",
  explanation:"A common inherited form of porokeratosis producing multiple sun-induced scaly rings.",
  causes:"Genetics and chronic ultraviolet exposure.",
  solution:"Topical retinoids, cryotherapy and sun protection.",
  prevention:"Daily sunscreen use."
};

skincareKnowledge.eccrineSpiradenoma = {
  title:"Eccrine Spiradenoma",
  explanation:"A rare benign sweat gland tumor that is often painful to touch.",
  causes:"Benign sweat gland proliferation.",
  solution:"Surgical removal.",
  prevention:"No known prevention."
};

skincareKnowledge.epidermolysisBullosaSimplex = {
  title:"Epidermolysis Bullosa Simplex",
  explanation:"An inherited blistering disorder where mild friction causes skin blisters.",
  causes:"Mutations in keratin genes.",
  solution:"Protect the skin, wound care and infection prevention.",
  prevention:"Genetic counseling."
};

skincareKnowledge.fibroelastolyticPapulosis = {
  title:"Fibroelastolytic Papulosis",
  explanation:"A rare aging-related disorder causing tiny white papules on the neck.",
  causes:"Loss of elastic fibers with aging.",
  solution:"Usually no treatment is necessary.",
  prevention:"Protect skin from excessive sun exposure."
};

skincareKnowledge.granulomaAnnularePerforating = {
  title:"Perforating Granuloma Annulare",
  explanation:"A rare subtype of granuloma annulare where damaged tissue is expelled through the skin.",
  causes:"Unknown immune-mediated inflammation.",
  solution:"Topical corticosteroids or intralesional injections.",
  prevention:"No known prevention."
};

skincareKnowledge.hidradenomaPapilliferum = {
  title:"Hidradenoma Papilliferum",
  explanation:"A rare benign sweat gland tumor occurring mainly in the genital region of women.",
  causes:"Apocrine gland proliferation.",
  solution:"Complete surgical excision.",
  prevention:"No known prevention."
};

skincareKnowledge.incontinentiaPigmentiAchromians = {
  title:"Incontinentia Pigmenti Achromians",
  explanation:"A pigmentary disorder producing streaks of lighter skin following Blaschko's lines.",
  causes:"Genetic mosaicism.",
  solution:"Usually supportive care only.",
  prevention:"Cannot be prevented."
};

skincareKnowledge.juvenileSpringEruption = {
  title:"Juvenile Spring Eruption",
  explanation:"A seasonal sun-induced eruption affecting the ears of children.",
  causes:"Sensitivity to ultraviolet light.",
  solution:"Topical corticosteroids and sun protection.",
  prevention:"Wear hats and apply sunscreen."
};

skincareKnowledge.keratosisPunctataPalmarisEtPlantaris = {
  title:"Keratosis Punctata Palmaris et Plantaris",
  explanation:"A rare inherited disorder causing multiple tiny keratotic pits on the palms and soles.",
  causes:"Genetic abnormalities affecting keratinization.",
  solution:"Keratolytic creams and moisturizers.",
  prevention:"Genetic counseling."
};

skincareKnowledge.lipomembranousFatNecrosis = {
  title:"Lipomembranous Fat Necrosis",
  explanation:"A microscopic pattern of fat degeneration associated with poor circulation.",
  causes:"Venous insufficiency and chronic ischemia.",
  solution:"Treat the underlying vascular disease.",
  prevention:"Maintain healthy circulation."
};

skincareKnowledge.melanosisRiehl = {
  title:"Riehl's Melanosis",
  explanation:"A form of facial hyperpigmentation caused by repeated exposure to allergens or cosmetics.",
  causes:"Pigmented contact dermatitis.",
  solution:"Avoid triggering products, use sunscreen and dermatologist-guided treatment.",
  prevention:"Patch test new skincare and cosmetic products."
};

skincareKnowledge.myxoidCyst = {
title:"Myxoid Cyst",
explanation:"A small, jelly-like cyst usually found near the end joints of the fingers or toes, often associated with arthritis.",
causes:"Degeneration of connective tissue and osteoarthritis.",
solution:"Drainage, steroid injection or surgical removal.",
prevention:"Manage underlying joint disease."
},

skincareKnowledge.nevusAnemicusSyndrome = {
title:"Nevus Anemicus Syndrome",
explanation:"A rare condition where pale skin patches occur alongside neurological or developmental abnormalities.",
causes:"Congenital vascular abnormalities.",
solution:"Supportive care based on associated conditions.",
prevention:"Cannot be prevented."
},

skincareKnowledge.nodularAmyloidosis = {
title:"Nodular Amyloidosis",
explanation:"A localized form of amyloidosis where firm waxy nodules develop due to protein deposits in the skin.",
causes:"Localized plasma cell abnormalities.",
solution:"Surgical removal or laser therapy when needed.",
prevention:"No known prevention."
},

skincareKnowledge.papillomatosisCutisLymphostatica = {
title:"Papillomatosis Cutis Lymphostatica",
explanation:"A rare skin condition causing wart-like growths due to chronic lymphedema.",
causes:"Long-standing lymphatic obstruction.",
solution:"Compression therapy and treatment of lymphedema.",
prevention:"Early management of chronic swelling."
},

skincareKnowledge.pigmentedContactDermatitis = {
title:"Pigmented Contact Dermatitis",
explanation:"A form of contact dermatitis causing persistent dark pigmentation with little inflammation.",
causes:"Repeated exposure to allergens in cosmetics, fragrances or dyes.",
solution:"Avoid allergens and use dermatologist-prescribed treatments.",
prevention:"Patch test new skincare and cosmetic products."
},

skincareKnowledge.porokeratoma = {
title:"Porokeratoma",
explanation:"A rare benign skin lesion sharing features of porokeratosis and keratoma.",
causes:"Abnormal keratinization.",
solution:"Surgical removal if symptomatic.",
prevention:"No known prevention."
},

skincareKnowledge.progressiveCribriformZosteriformHyperpigmentation = {
title:"Progressive Cribriform Zosteriform Hyperpigmentation",
explanation:"A rare pigmentary disorder producing net-like streaks of dark skin following Blaschko's lines.",
causes:"Genetic mosaicism.",
solution:"Usually no treatment is required.",
prevention:"Cannot be prevented."
},

skincareKnowledge.pustularBacterid = {
title:"Pustular Bacterid",
explanation:"A rare eruption of sterile pustules on the palms and soles associated with bacterial infections elsewhere in the body.",
causes:"Immune response to distant bacterial infection.",
solution:"Treat the underlying infection.",
prevention:"Prompt treatment of bacterial infections."
},

skincareKnowledge.reticularErythematousMucinosisSyndrome = {
title:"Reticular Erythematous Mucinosis Syndrome",
explanation:"A chronic skin disorder characterized by red net-like patches due to mucin accumulation.",
causes:"Unknown autoimmune mechanisms.",
solution:"Hydroxychloroquine and sun protection.",
prevention:"Avoid excessive UV exposure."
},

skincareKnowledge.scleromyxedemaLocalized = {
title:"Localized Scleromyxedema",
explanation:"A localized variant of scleromyxedema causing firm waxy papules in limited areas.",
causes:"Abnormal mucin deposition.",
solution:"Dermatologist-directed immunotherapy.",
prevention:"No known prevention."
},

skincareKnowledge.sebaceousHamartoma = {
title:"Sebaceous Hamartoma",
explanation:"A benign overgrowth of sebaceous glands present from birth.",
causes:"Congenital developmental abnormality.",
solution:"Observation or surgical removal.",
prevention:"Cannot be prevented."
},

skincareKnowledge.skinFragilitySyndrome = {
title:"Skin Fragility Syndrome",
explanation:"A group of disorders in which the skin tears or blisters easily after minimal trauma.",
causes:"Inherited connective tissue disorders or chronic corticosteroid use.",
solution:"Protective skin care and treatment of the underlying condition.",
prevention:"Avoid unnecessary skin trauma."
},

skincareKnowledge.syringofibroadenoma = {
title:"Syringofibroadenoma",
explanation:"A rare benign tumor arising from eccrine sweat ducts.",
causes:"Abnormal sweat gland proliferation.",
solution:"Complete surgical excision.",
prevention:"No known prevention."
},

skincareKnowledge.telangiectaticMastocytosis = {
title:"Telangiectatic Mastocytosis",
explanation:"A rare form of mastocytosis characterized by reddish-brown patches with visible blood vessels.",
causes:"Accumulation of mast cells in the skin.",
solution:"Antihistamines and avoidance of triggers.",
prevention:"Avoid heat, alcohol and medications that trigger mast cell activation."
},

skincareKnowledge.transepidermalElastosis = {
title:"Transepidermal Elastosis",
explanation:"A rare disorder where damaged elastic fibers are expelled through the skin.",
causes:"Connective tissue degeneration.",
solution:"Topical retinoids and treatment of associated disorders.",
prevention:"No known prevention."
},

skincareKnowledge.verrucousEpidermalHamartoma = {
title:"Verrucous Epidermal Hamartoma",
explanation:"A congenital wart-like overgrowth of epidermal tissue.",
causes:"Genetic mosaic mutation.",
solution:"Laser therapy or surgical removal.",
prevention:"Cannot be prevented."
},

skincareKnowledge.xanthomatousDermatitis = {
title:"Xanthomatous Dermatitis",
explanation:"An inflammatory skin condition accompanied by yellow lipid-filled lesions.",
causes:"Abnormal lipid metabolism and chronic inflammation.",
solution:"Treat the underlying lipid disorder.",
prevention:"Maintain healthy cholesterol levels."
},

skincareKnowledge.zincDeficiencyDermatitis = {
title:"Zinc Deficiency Dermatitis",
explanation:"An inflammatory rash caused by insufficient zinc levels in the body.",
causes:"Poor nutrition, malabsorption or chronic illness.",
solution:"Oral zinc supplementation and dietary improvement.",
prevention:"Consume zinc-rich foods regularly."
},

skincareKnowledge.annularElastolyticGiantCellGranuloma = {
title:"Annular Elastolytic Giant Cell Granuloma",
explanation:"A rare inflammatory disorder producing ring-shaped plaques on sun-exposed skin.",
causes:"Immune destruction of sun-damaged elastic fibers.",
solution:"Topical corticosteroids, antimalarials and sun protection.",
prevention:"Limit excessive sun exposure."
},

skincareKnowledge.papularAcantholyticDyskeratosis = {
title:"Papular Acantholytic Dyskeratosis",
explanation:"A rare skin disorder causing itchy papules in the genital or groin region due to abnormal skin cell adhesion.",
causes:"Abnormal keratinocyte differentiation.",
solution:"Topical corticosteroids, retinoids or laser therapy.",
prevention:"Reduce friction and irritation in affected areas."
},

skincareKnowledge.acrodermatitisContinuaOfHallopeau = {
title:"Acrodermatitis Continua of Hallopeau",
explanation:"A rare chronic form of pustular psoriasis affecting the fingertips and nails, leading to painful pustules and nail destruction.",
causes:"Autoimmune inflammation related to pustular psoriasis.",
solution:"Biologic medications, retinoids and dermatologist-directed therapy.",
prevention:"Early treatment helps reduce progression."
};

skincareKnowledge.acquiredPerforatingDermatosis = {
title:"Acquired Perforating Dermatosis",
explanation:"A skin disorder where damaged collagen or elastic fibers are expelled through the skin, causing itchy bumps.",
causes:"Diabetes, chronic kidney disease and repetitive scratching.",
solution:"Treat the underlying condition and use topical retinoids or corticosteroids.",
prevention:"Control chronic diseases and avoid scratching."
};

skincareKnowledge.angiokeratomaCorporisDiffusum = {
title:"Angiokeratoma Corporis Diffusum",
explanation:"A rare disorder with widespread dark red vascular papules associated with inherited metabolic diseases.",
causes:"Genetic lysosomal storage disorders such as Fabry disease.",
solution:"Treat the underlying disease and remove symptomatic lesions.",
prevention:"Genetic counseling for affected families."
};

skincareKnowledge.atrophodermaOfPasiniPierini = {
title:"Atrophoderma of Pasini-Pierini",
explanation:"A rare skin disorder causing sharply defined depressed patches of darker skin.",
causes:"Unknown; may be related to localized scleroderma.",
solution:"Observation or dermatologist-guided therapy.",
prevention:"No known prevention."
};

skincareKnowledge.basaloidFollicularHamartoma = {
title:"Basaloid Follicular Hamartoma",
explanation:"A rare benign hair follicle tumor that may occur alone or with inherited syndromes.",
causes:"Genetic mutations affecting follicle development.",
solution:"Observation or surgical removal if needed.",
prevention:"No known prevention."
};

skincareKnowledge.calcifiedEpidermoidCyst = {
title:"Calcified Epidermoid Cyst",
explanation:"An epidermoid cyst that has hardened due to calcium deposition over time.",
causes:"Long-standing epidermoid cyst.",
solution:"Complete surgical excision.",
prevention:"Treat enlarging cysts early."
};

skincareKnowledge.cutaneousFocalMucinosis = {
title:"Cutaneous Focal Mucinosis",
explanation:"A rare benign skin lesion caused by localized mucin accumulation.",
causes:"Unknown.",
solution:"Simple surgical removal if necessary.",
prevention:"No known prevention."
};

skincareKnowledge.dermatofibrosarcomaProtuberansPigmented = {
title:"Pigmented Dermatofibrosarcoma Protuberans",
explanation:"A rare pigmented variant of dermatofibrosarcoma protuberans known as Bednar tumor.",
causes:"Genetic chromosomal translocation.",
solution:"Wide surgical excision or Mohs surgery.",
prevention:"Early diagnosis improves outcomes."
};

skincareKnowledge.eccrineAngiomatousHamartoma = {
title:"Eccrine Angiomatous Hamartoma",
explanation:"A rare benign lesion containing excess sweat glands and blood vessels, often painful.",
causes:"Congenital developmental abnormality.",
solution:"Surgical removal if symptomatic.",
prevention:"Cannot be prevented."
};

skincareKnowledge.eruptivePseudoangiomatosis = {
title:"Eruptive Pseudoangiomatosis",
explanation:"A self-limited viral-associated rash consisting of tiny red papules with pale halos.",
causes:"Viral infections.",
solution:"Supportive care until spontaneous resolution.",
prevention:"Practice good hygiene to reduce viral spread."
};

skincareKnowledge.fibrokeratomaAcquiredDigital = {
title:"Acquired Digital Fibrokeratoma",
explanation:"A small benign horn-like growth commonly found on fingers or toes.",
causes:"Minor trauma or unknown factors.",
solution:"Simple surgical excision.",
prevention:"Protect digits from repeated injury."
};

skincareKnowledge.generalizedEssentialTelangiectasia = {
title:"Generalized Essential Telangiectasia",
explanation:"A rare disorder causing widespread dilated superficial blood vessels without systemic disease.",
causes:"Unknown.",
solution:"Laser therapy for cosmetic improvement.",
prevention:"No known prevention."
};

skincareKnowledge.hyperkeratosisLenticularisPerstans = {
title:"Hyperkeratosis Lenticularis Perstans",
explanation:"Also called Flegel disease, this rare disorder causes tiny rough reddish-brown papules on the legs.",
causes:"Inherited keratinization abnormality.",
solution:"Topical retinoids and keratolytic creams.",
prevention:"No known prevention."
};

skincareKnowledge.infantilePerianalPyramidalProtrusion = {
title:"Infantile Perianal Pyramidal Protrusion",
explanation:"A benign soft tissue protrusion near the anus seen mainly in young girls.",
causes:"Congenital factors or chronic constipation.",
solution:"Treat constipation and observe.",
prevention:"Maintain healthy bowel habits."
};

skincareKnowledge.keratoelastoidosisMarginalis = {
title:"Keratoelastoidosis Marginalis",
explanation:"A rare condition producing keratotic papules along the margins of the hands.",
causes:"Chronic sun exposure and aging.",
solution:"Moisturizers and keratolytic creams.",
prevention:"Protect hands from UV exposure."
};

skincareKnowledge.linearLichenPlanus = {
title:"Linear Lichen Planus",
explanation:"A rare variant of lichen planus following Blaschko's lines.",
causes:"Autoimmune inflammation.",
solution:"Topical corticosteroids and immunomodulators.",
prevention:"No known prevention."
};

skincareKnowledge.morpheaProfunda = {
title:"Morphea Profunda",
explanation:"A deep form of localized scleroderma affecting the skin and underlying tissues.",
causes:"Autoimmune connective tissue inflammation.",
solution:"Immunosuppressive medications and physical therapy.",
prevention:"Early treatment reduces disability."
};

skincareKnowledge.nevusSebaceusSyndrome = {
title:"Nevus Sebaceus Syndrome",
explanation:"A congenital syndrome involving sebaceous nevi with neurological and eye abnormalities.",
causes:"Genetic mosaic mutation.",
solution:"Multidisciplinary medical management.",
prevention:"Cannot be prevented."
};

skincareKnowledge.papularPurpuricGlovesAndSocksSyndrome = {
title:"Papular Purpuric Gloves and Socks Syndrome",
explanation:"A viral rash affecting the hands and feet with redness, swelling and purplish spots.",
causes:"Most commonly Parvovirus B19 infection.",
solution:"Supportive care and hydration.",
prevention:"Good hygiene reduces viral transmission."
};

skincareKnowledge.reactivePerforatingCollagenosisInherited = {
title:"Inherited Reactive Perforating Collagenosis",
explanation:"A rare inherited disorder where collagen is eliminated through the skin after minor injury.",
causes:"Genetic mutation affecting collagen repair.",
solution:"Protect the skin, topical retinoids and dermatologist-guided treatment.",
prevention:"Avoid unnecessary skin trauma."
};

skincareKnowledge.scleredemaDiabeticorum = {
    title:"Scleredema Diabeticorum",
    explanation:"A skin disorder causing thickening and hardening of the skin, especially over the upper back and neck in people with diabetes.",
    causes:"Long-standing poorly controlled diabetes.",
    solution:"Improve blood sugar control, phototherapy and physical therapy.",
    prevention:"Maintain good diabetes management."
};

skincareKnowledge.sebaceousCarcinomaExtraocular = {
    title:"Extraocular Sebaceous Carcinoma",
    explanation:"A rare aggressive sebaceous gland cancer occurring outside the eyelids.",
    causes:"Malignant transformation of sebaceous glands.",
    solution:"Wide surgical excision and oncology follow-up.",
    prevention:"Early evaluation of suspicious skin nodules."
};

skincareKnowledge.segmentalNeurofibromatosis = {
    title:"Segmental Neurofibromatosis",
    explanation:"A localized form of neurofibromatosis affecting only one area of the body.",
    causes:"Post-zygotic mutation of the NF1 gene.",
    solution:"Observation or surgical removal of symptomatic tumors.",
    prevention:"Genetic counseling."
};

skincareKnowledge.subcutaneousGranulomaAnnulare = {
title:"Subcutaneous Granuloma Annulare",
explanation:"A deep form of granuloma annulare presenting as painless lumps beneath the skin in children.",
causes:"Unknown immune response.",
solution:"Observation or corticosteroid injections if needed.",
prevention:"No known prevention."
};

skincareKnowledge.sweatGlandCarcinoma = {
title:"Sweat Gland Carcinoma",
explanation:"A rare malignant tumor arising from sweat glands.",
causes:"Cancerous transformation of sweat gland cells.",
solution:"Wide surgical excision and oncology care.",
prevention:"Early assessment of persistent skin tumors."
};

skincareKnowledge.telangiectasiaHereditariaHemorrhagica = {
title:"Hereditary Hemorrhagic Telangiectasia",
explanation:"A genetic disorder causing fragile blood vessels in the skin and internal organs.",
causes:"Inherited mutations affecting blood vessel formation.",
solution:"Laser therapy, management of bleeding and specialist care.",
prevention:"Genetic counseling."
};

skincareKnowledge.trichilemmalCarcinoma = {
title:"Trichilemmal Carcinoma",
explanation:"A rare low-grade skin cancer arising from the outer root sheath of hair follicles.",
causes:"Sun exposure and genetic mutations.",
solution:"Complete surgical removal.",
prevention:"Protect skin from excessive UV exposure."
};

skincareKnowledge.tumoralCalcinosis = {
title:"Tumoral Calcinosis",
explanation:"Large calcium deposits around joints causing firm masses beneath the skin.",
causes:"Inherited phosphate metabolism disorders.",
solution:"Surgery and correction of phosphate imbalance.",
prevention:"Early management of metabolic abnormalities."
};

skincareKnowledge.verrucousHemangiomaCongenital = {
title:"Congenital Verrucous Hemangioma",
explanation:"A vascular birthmark that becomes thickened and wart-like over time.",
causes:"Congenital vascular malformation.",
solution:"Complete surgical removal with laser assistance when appropriate.",
prevention:"Cannot be prevented."
};

skincareKnowledge.wartsButchers = {
title:"Butcher's Warts",
explanation:"Hand warts commonly affecting people who handle raw meat or fish.",
causes:"Human papillomavirus infection.",
solution:"Cryotherapy, salicylic acid or laser treatment.",
prevention:"Wear protective gloves and maintain hand hygiene."
};

skincareKnowledge.woollyHairNevus = {
title:"Woolly Hair Nevus",
explanation:"A localized patch of tightly curled hair differing from the surrounding hair.",
causes:"Congenital follicular abnormality.",
solution:"Usually no treatment is necessary.",
prevention:"Cannot be prevented."
};

skincareKnowledge.xanthomaPlane = {
title:"Plane Xanthoma",
explanation:"Flat yellow cholesterol deposits commonly appearing on the eyelids, neck or trunk.",
causes:"Lipid disorders or blood diseases.",
solution:"Treat the underlying condition and manage cholesterol.",
prevention:"Maintain healthy cholesterol levels."
};

skincareKnowledge.yellowCallusSyndrome = {
title:"Yellow Callus Syndrome",
explanation:"A rare condition causing thick yellow calluses on pressure-bearing areas.",
causes:"Repeated friction and abnormal keratinization.",
solution:"Keratolytic creams and pressure reduction.",
prevention:"Wear properly fitted footwear."
};

skincareKnowledge.zosteriformLichenPlanus = {
title:"Zosteriform Lichen Planus",
explanation:"A rare form of lichen planus following a shingles-like distribution.",
causes:"Autoimmune inflammation.",
solution:"Topical corticosteroids and antihistamines.",
prevention:"No known prevention."
};

skincareKnowledge.acralFibrokeratoma = {
title:"Acral Fibrokeratoma",
explanation:"A benign fibrous growth occurring on fingers, toes or palms.",
causes:"Minor trauma or unknown factors.",
solution:"Simple surgical excision.",
prevention:"Avoid repeated trauma to the digits."
},

skincareKnowledge.benignLymphangioendothelioma = {
title:"Benign Lymphangioendothelioma",
explanation:"A rare benign tumor involving abnormal lymphatic vessel growth.",
causes:"Unknown lymphatic proliferation.",
solution:"Surgical removal if symptomatic.",
prevention:"No known prevention."
},

skincareKnowledge.cutaneousCiliatedCyst = {
title:"Cutaneous Ciliated Cyst",
explanation:"A rare benign cyst lined with ciliated cells, most often occurring on the legs of young women.",
causes:"Developmental remnants or hormone-sensitive tissue.",
solution:"Simple surgical excision.",
prevention:"Cannot be prevented."
},

skincareKnowledge.digitalPapillaryAdenocarcinoma = {
title:"Digital Papillary Adenocarcinoma",
explanation:"A rare aggressive sweat gland cancer affecting fingers and toes.",
causes:"Malignant sweat gland cells.",
solution:"Wide surgical excision or amputation in advanced cases.",
prevention:"Early diagnosis of persistent finger or toe masses."
},

skincareKnowledge.elastosisPerforansSerpiginosaDrugInduced = {
title:"Drug-Induced Elastosis Perforans Serpiginosa",
explanation:"A medication-related form of elastosis perforans serpiginosa where damaged elastic fibers are expelled through the skin.",
causes:"Certain medications, especially penicillamine.",
solution:"Discontinue the triggering medication under medical supervision and treat skin lesions.",
prevention:"Monitor patients taking high-risk medications."
},

skincareKnowledge.epidermodysplasiaPapillaris = {
title:"Epidermodysplasia Papillaris",
explanation:"A rare inherited disorder characterized by persistent wart-like lesions due to abnormal susceptibility to certain HPV types.",
causes:"Genetic defects affecting immune response to human papillomavirus.",
solution:"Regular dermatologic monitoring, lesion removal and sun protection.",
prevention:"Genetic counseling and early skin examinations."
},

skincareKnowledge.familialProgressiveHyperpigmentation = {
title:"Familial Progressive Hyperpigmentation",
explanation:"A rare inherited disorder causing gradually increasing dark pigmentation from infancy.",
causes:"Genetic mutations affecting melanin production.",
solution:"Usually no treatment is required; cosmetic treatments may be considered.",
prevention:"Cannot be prevented."
},

skincareKnowledge.giantCongenitalMelanocyticNevus = {
title:"Giant Congenital Melanocytic Nevus",
explanation:"A very large pigmented birthmark present at birth with an increased risk of melanoma.",
causes:"Congenital overgrowth of melanocytes.",
solution:"Regular dermatologic monitoring and surgical management when appropriate.",
prevention:"Cannot be prevented."
},

skincareKnowledge.hairThreadTourniquetSyndrome = {
title:"Hair Thread Tourniquet Syndrome",
explanation:"A strand of hair tightly wraps around a finger, toe or genitalia, cutting off blood circulation.",
causes:"Loose hair accidentally wrapping around body parts.",
solution:"Immediate removal of the constricting hair.",
prevention:"Inspect infants regularly and remove loose hairs."
},

skincareKnowledge.ichthyosisBullosaOfSiemens = {
    title:"Ichthyosis Bullosa of Siemens",
    explanation:"A mild inherited blistering form of ichthyosis with peeling and thickened skin.",
    causes:"Mutation of the KRT2 gene.",
    solution:"Moisturizers, keratolytic creams and gentle skin care.",
    prevention:"Genetic counseling."
},

skincareKnowledge.juvenileDermatomyositisSkinManifestations = {
    title:"Juvenile Dermatomyositis Skin Manifestations",
    explanation:"Characteristic skin findings of juvenile dermatomyositis including Gottron papules and heliotrope rash.",
    causes:"Autoimmune inflammation.",
    solution:"Immunosuppressive medications and specialist care.",
    prevention:"No known prevention."
},

skincareKnowledge.keloidalScleroderma = {
    title:"Keloidal Scleroderma",
    explanation:"A rare form of scleroderma producing keloid-like nodules within hardened skin.",
    causes:"Autoimmune connective tissue disease.",
    solution:"Immunosuppressive therapy and dermatologist follow-up.",
    prevention:"No known prevention."
},

skincareKnowledge.lichenAureus = {
    title:"Lichen Aureus",
    explanation:"A localized pigmented purpuric dermatosis producing golden-brown patches on the legs.",
    causes:"Capillary inflammation and leakage.",
    solution:"Topical corticosteroids and compression therapy when indicated.",
    prevention:"Maintain healthy circulation."
},

skincareKnowledge.melanomaInSitu = {
title:"Melanoma In Situ",
explanation:"The earliest stage of melanoma where cancer cells remain confined to the epidermis.",
causes:"Ultraviolet radiation and genetic susceptibility.",
solution:"Complete surgical excision.",
prevention:"Sun protection and routine skin examinations."
},

skincareKnowledge.nevusSpilus = {
title:"Nevus Spilus",
explanation:"A light brown patch containing numerous darker spots or small moles.",
causes:"Congenital pigment cell abnormality.",
solution:"Usually observation only.",
prevention:"Cannot be prevented."
},

skincareKnowledge.occipitalPressureAlopecia = {
title:"Occipital Pressure Alopecia",
explanation:"Hair loss caused by prolonged pressure on the back of the scalp.",
causes:"Extended immobility or prolonged surgery.",
solution:"Reduce pressure and allow hair regrowth.",
prevention:"Frequent repositioning during prolonged bed rest."
};

skincareKnowledge.papularMastocytosis = {
title:"Papular Mastocytosis",
explanation:"A form of cutaneous mastocytosis causing numerous itchy brown papules.",
causes:"Accumulation of mast cells in the skin.",
solution:"Antihistamines and avoidance of triggers.",
prevention:"Avoid heat, friction and mast cell triggers."
};

skincareKnowledge.porphyriaCutaneaTardaFamilial = {
title:"Familial Porphyria Cutanea Tarda",
explanation:"An inherited disorder causing fragile blistering skin on sun-exposed areas.",
causes:"Inherited deficiency of uroporphyrinogen decarboxylase.",
solution:"Phlebotomy, low-dose hydroxychloroquine and sun protection.",
prevention:"Avoid alcohol, excess iron and ultraviolet exposure."
};

skincareKnowledge.reactiveAngioendotheliomatosis = {
title:"Reactive Angioendotheliomatosis",
explanation:"A rare vascular skin disorder associated with systemic disease and abnormal blood flow.",
causes:"Underlying vascular or autoimmune disorders.",
solution:"Treat the underlying condition.",
prevention:"Manage vascular disease appropriately."
};

skincareKnowledge.sebaceousHyperplasiaGiant = {
title:"Giant Sebaceous Hyperplasia",
explanation:"An unusually large benign enlargement of sebaceous glands.",
causes:"Age-related sebaceous gland overgrowth.",
solution:"Laser therapy or surgical removal.",
prevention:"No known prevention."
};

skincareKnowledge.trichorrhexisInvaginata = {
    title:"Trichorrhexis Invaginata",
    explanation:"Also called bamboo hair, this hair shaft abnormality is commonly associated with Netherton syndrome.",
    causes:"Mutation of the SPINK5 gene.",
    solution:"Gentle hair care and management of associated skin disease.",
    prevention:"Genetic counseling."
};

skincareKnowledge.unilateralNevoidTelangiectasia = {
    title:"Unilateral Nevoid Telangiectasia",
    explanation:"A localized collection of superficial dilated blood vessels affecting one side of the body.",
    causes:"Hormonal influences or congenital vascular abnormalities.",
    solution:"Laser therapy for cosmetic improvement.",
    prevention:"No known prevention."
};

skincareKnowledge.vascularEhlersDanlosSkinManifestations = {
    title:"Vascular Ehlers-Danlos Skin Manifestations",
    explanation:"Skin findings in vascular Ehlers-Danlos syndrome including thin translucent skin and easy bruising.",
    causes:"Mutation of the COL3A1 gene.",
    solution:"Protect the skin and receive multidisciplinary care.",
    prevention:"Genetic counseling."
};

skincareKnowledge.wartyDyskeratoma = {
    title:"Warty Dyskeratoma",
    explanation:"A rare benign follicular tumor appearing as a solitary wart-like nodule.",
    causes:"Abnormal follicular keratinization.",
    solution:"Simple surgical excision.",
    prevention:"No known prevention."
};


function searchKnowledge() {

   console.log(skincareKnowledge);

  const query =
document
.getElementById("knowledgeSearch")
.value
.toLowerCase()
.trim()
.replace(/\s+/g, "");

console.log("Query:", query);

const foundKey = Object.keys(skincareKnowledge).find(key =>
    key.toLowerCase().replace(/\s+/g, "").includes(query)
);

console.log("Found Key:", foundKey);

const result =
document.getElementById("resultsContainer");

showRelatedTopics(query);

if(!query){

result.innerHTML =
"<p>Please enter a topic.</p>";

return;

}
  
const topic = skincareKnowledge[foundKey];

if(topic){

result.innerHTML = `

<div class="knowledge-result">

<h2>${topic.title}</h2>

<h3>📖 What Is It?</h3>

<p>${topic.explanation}</p>

<h3>⚠️ Common Causes</h3>

<p>${topic.causes}</p>

<h3>💚 General Solutions</h3>

<p>${topic.solution}</p>

<h3>🛡️ Prevention Tips</h3>

<p>${topic.prevention}</p>

</div>

`;

}else{

result.innerHTML = `

<div class="knowledge-result">

<h2>🔍 No Results Found</h2>

<p>

Sorry, we couldn't find
<strong>${query}</strong>.

Try another skincare topic.

</p>

</div>

`;

}
}

console.log("Knowledge loaded");
console.log(typeof skincareKnowledge);
console.log(skincareKnowledge.acne);

function findKnowledge(query){

query=query.toLowerCase();

const words=query.split(" ");

for(const key in skincareKnowledge){

const lowerKey=key.toLowerCase();

if(query.includes(lowerKey)){

return skincareKnowledge[key];

}

}

return null;

}

function sendMessage(){

const input = document.getElementById("chatInput");
const messages = document.getElementById("chatMessages");

const text=sanitizeInput(input.value.trim());

if(text==="") return;

// User message
messages.innerHTML += `
<div class="user-message">
${text}
</div>
`;

input.value="";

messages.scrollTop = messages.scrollHeight;

// Search knowledge
const topic = findKnowledge(text);

setTimeout(()=>{

let reply="";

if(topic){

reply=`
<h3>${topic.title}</h3>

<p>${topic.explanation}</p>

<b>Common Causes</b>

<p>${topic.causes}</p>

<b>General Solutions</b>

<p>${topic.solution}</p>

<b>Prevention</b>

<p>${topic.prevention}</p>
`;

}else{

reply=`
😔 Sorry...

I couldn't find that topic in the EMerriment Skin Encyclopedia.

Try searching for:

• Acne

• Eczema

• Retinol

• Sunscreen

• Vitamin C

• Melasma

`;

}

messages.innerHTML += `
<div class="bot-message">

${reply}

</div>
`;

messages.scrollTop = messages.scrollHeight;

},800);

}

async function submitQuiz() {
  const loadingEl = document.getElementById("loading");
  const analysisEl = document.getElementById("analysisText");

  // Only attempt to update elements if they actually exist in the DOM
  if (loadingEl) loadingEl.style.display = "flex";
  
  await new Promise(resolve => setTimeout(resolve, 3000));

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const skinType = document.getElementById("skinType").value;
  const concern = document.getElementById("concern").value;
  const oilLevel = document.getElementById("oilLevel")?.value || "";
  const sensitivity = document.getElementById("sensitivity")?.value || "";

  let score = 60;

  if (skinType === "Oily") score -= 10;

  let recommendation = "";

  if (score >= 70) {
    recommendation = "Your skin is healthy and glowing.";
  } else if (score >= 50) {
    recommendation = "Your skin needs hydration and consistency.";
  } else {
    recommendation = "Focus on barrier repair and calming products.";
  }

  let products = "";

  const resultsHTML = `<div class="results-container"><h2>✨ EMerriment Skin Analysis</h2><div class="score-circle"><h3>Hydration Score</h3><p>${score}</p></div><div class="result-grid"><div class="result-card"><h3>Skin Type</h3><p>${skinType}</p></div><div class="result-card"><h3>Main Concern</h3><p>${concern}</p></div><div class="result-card"><h3>Oil Level</h3><p>${oilLevel}</p></div><div class="result-card"><h3>Sensitivity</h3><p>${sensitivity}</p></div></div><div class="recommendation-box"><h3>Your Recommendation</h3><p>${recommendation}</p></div>${products}</div>`;

  document.getElementById("results").innerHTML = resultsHTML;

  const productContainer = document.getElementById("recommendedProducts");

  let productHTML = "";

if (
  concern === "Hyperpigmentation" ||
  concern === "Dark Spots"
) {

  productHTML = `
  <div class="product-card">
    <h3>✨ Fade & Glow Bundle</h3>
    <p>Target dark spots and uneven skin tone.</p>

    <a class="product-btn"
       href="https://selar.com/y31448"
       target="_blank">
       View Product
    </a>
  </div>
  `;

}

else {

  productHTML = `
  <div class="product-card">
    <h3>🌟 21 Days To Glow Challenge</h3>
    <p>Build healthy skincare habits and improve your glow.</p>

    <a class="product-btn"
       href="https://selar.com/4h1454"
       target="_blank">
       View Product
    </a>
  </div>
  `;

}

productContainer.innerHTML = productHTML;

document.getElementById(
  "productRecommendations"
).style.display = "block";

  console.log("About to insert into Supabase");

  const { data, error } = await supabaseClient
  .from("leads")
  .insert([
    {
      name,
      email,

      skin_type: skinType,
      concern,

      oil_level: oilLevel,

      sensitivity,

      score,

      recommendation,

      submitted_at: new Date().toISOString(),

      quiz_version: "2.0",

      source: "Skin Quiz",

      status: "New Lead",

      email_status: "Pending",

      last_email_sent: null,

      email_sequence_day: 1,

last_sequence_email_sent: new Date().toISOString(),

next_email_due: new Date(
  Date.now() + 24 * 60 * 60 * 1000
).toISOString(),

      tags: ["quiz"],

      notes: null
    }
  ])
  .select();
  
   if (error) {
  console.error("Supabase Error:", error);

  alert("Unable to save your quiz. Please try again.");

  return;
}

  if (!error) {

  const emailResponse = await fetch("/.netlify/functions/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name,
    email,
    skinType,
    concern,
    oilLevel,
    sensitivity,
    score,
    recommendation
  })
});

await supabase
    .from("profiles")
    .update({
        current_skin_score: score,
        current_skin_type: skinType,
        current_concern: concern,
        current_recommendation: recommendation,
        last_quiz_date: new Date().toISOString()
    })
    .eq("id", user.id);
    
// ==========================================
// Save Quiz Result to Supabase
// ==========================================

// Check if the user is logged in
const {
    data: { user }
} = await supabase.auth.getUser();

if (user) {

    const { error } = await supabase
        .from("quiz_results")
        .insert({

            user_id: user.id,

            skin_type: skinType,

            concern: concern,

            oil_level: oilLevel,

            sensitivity: sensitivity,

            score: score,

            recommendation: recommendation

        });

    if (error) {

        console.error("Error saving quiz:", error);

    } else {

        console.log("✅ Quiz saved successfully.");

    }

}

// 1. Move the assignment up so leadId exists before it is used
const leadId = data?.[0]?.id;

if (!emailResponse.ok) {
  console.error("Email sending failed.");
  alert("Your quiz was saved, but we couldn't send your email.");
  return;
}

// 2. Now leadId is initialized and can be used in the filter
const { error: updateError } = await supabaseClient
  .from("leads")
  .update({
    email_status: "Sent",
    last_email_sent: new Date().toISOString()
  })
  .eq("id", leadId);

if (updateError) {
  console.error(updateError);
}

console.log("Inserted lead:", data);
console.log("Lead ID:", leadId);

alert("🎉 Your skin report has been generated and sent to your email.");

document.getElementById("results").scrollIntoView({
  behavior: "smooth"
});

const analysisText = document.getElementById("analysisText");
analysisText.innerText = "Analyzing your skin profile...";

setTimeout(() => {
  analysisText.innerText = "Comparing against 1,000+ skin conditions...";
}, 1000); // Added missing closing bracket and delay

setTimeout(()=>{
analysisText.innerText =
"Selecting science-backed ingredients..."
},2000);

setTimeout(()=>{
analysisText.innerText =
"Generating your personalized skin report..."
},3000);

setTimeout(()=>{
  analysisText.innerText = "Sending your report to your email..."
}, 4000);

setTimeout(()=>{
  analysisText.innerText = "Done! 🎉"
}, 5000);

loadingEl.style.display = "none";
}

}

function quickSearch(topic){

document.getElementById("knowledgeSearch").value = topic;

searchKnowledge();

}


function showCategory(category){

const result =
document.getElementById("resultsContainer");

const categories={

conditions:[
"acne",
"eczema",
"psoriasis",
"rosacea",
"melasma",
"vitiligo",
"boils",
"cellulitis",
"ringworm",
"impetigo",
"scabies",
"warts",
"coldsores",
"shingles",
"hives",
"folliculitis",
"seborrheicdermatitis",
"keratosispilaris",
"contactdermatitis",
"fungalacne"
],

ingredients:[
"retinol",
"vitaminc",
"niacinamide",
"salicylicacid",
"glycolicacid",
"hyaluronicacid",
"azelaicacid",
"ceramides",
"panthenol",
"bakuchiol",
"ureainskincare",
"centellaasiatica",
"madecassoside",
"ferulicacid",
"caffeineinskincare"
],

concerns:[
"darkspots",
"hyperpigmentation",
"dryskin",
"oilyskin",
"sensitiveskin",
"largepores",
"wrinkles",
"fineslines",
"acnescars",
"redness",
"dullskin",
"unevenskintexture",
"dehydratedskin"
],

routine:[
"morningroutine",
"nightroutine",
"skincycling",
"productlayering",
"minimalistskincare",
"slugging",
"glassskin",
"bodylotion",
"handcream",
"footcare"
],

hair:[
"dandruff",
"hairloss",
"beardruff",
"beardcare",
"beardacne"
],

baby:[
"babyacne",
"cradlecap",
"diaperrash"
],

procedures:[
"microneedling",
"hydrafacial",
"laserresurfacing",
"chemicalpeel",
"cryotherapywarts",
"skinbiopsy",
"dermoscopy"
],

nutrition:[
"omegathree",
"zincforskin",
"collagensupplements",
"protein_skin",
"blueberriesforskin",
"vitamincdeficiency",
"seleniumskin",
"magnesiumskin"
]

};

let html=`

<h2>${category.toUpperCase()}</h2>

<div class="topic-grid">

`;

categories[category].forEach(topic => {

const item = skincareKnowledge[topic];

if(item){

const explanation =
item.explanation ||
item.causes ||
item.solution ||
item.prevention ||
"Tap to learn more about this topic.";

const preview =
explanation.length > 90
? explanation.substring(0,90) + "..."
: explanation;

html += `

<div class="topic-card"
onclick="openTopic('${topic}')">

<div class="topic-icon">
${getTopicIcon(topic)}
</div>

<h3>${item.title}</h3>

<p>${preview}</p>

<div class="topic-footer">

<span>📖 Read Article</span>

<span>→</span>

</div>

</div>

`;

}

});

// Insert generated HTML into results container
result.innerHTML = html + "\n</div>";

}

function openTopic(topic){

alert(topic);

document.getElementById("knowledgeSearch").value = topic;

searchKnowledge();

}

function showSuggestions() {

const input = document.getElementById("knowledgeSearch");
const box = document.getElementById("suggestions");

if (!input || !box) {
    console.error("knowledgeSearch or suggestions not found");
    return;
}

const value = input.value.toLowerCase().trim();

box.innerHTML = "";

if (value === "") {
    box.style.display = "none";
    return;
}

let count = 0;

for(const key in skincareKnowledge){

if(key.includes(input)){

box.innerHTML += `
<div class="suggestion-item" onclick="selectSuggestion('${key}')">
🔍 ${skincareKnowledge[key].title}
</div>
`;

count++;

}

if(count >= 8) break;

}

box.style.display = count ? "block" : "none";

}

function selectSuggestion(topic){

document.getElementById("knowledgeSearch")
.value=topic;

document.getElementById("suggestions")
.style.display="none";

searchKnowledge();

}

const relatedTopics = {

acne: [
"acnescars",
"salicylicacid",
"benzoylperoxide",
"retinol",
"niacinamide",
"oilyskin"
],

eczema: [
"dryskin",
"ceramides",
"moisturizer",
"itchyskin",
"contactdermatitis"
],

rosacea: [
"sensitiveskin",
"azelaicacid",
"sunscreen",
"redness"
],

hyperpigmentation: [
"vitaminc",
"niacinamide",
"melasma",
"postinflammatoryhyperpigmentation",
"sunscreen"
],

dryskin: [
"ceramides",
"hyaluronicacid",
"moisturizer",
"skinbarrier"
],

oilyskin: [
"salicylicacid",
"niacinamide",
"acne",
"cleanser"
]

};

function getIcon(topic){

if(topic.includes("acid")) return "🧪";

if(topic.includes("routine")) return "🗓️";

if(topic.includes("myth")) return "❌";

if(topic.includes("ingredient")) return "🧴";

  return "🔎";

}

function showRelatedTopics(topic){

const container =
document.getElementById("relatedTopics");

if(!container) return;

container.innerHTML = "";

const topics =
relatedTopics[topic];

if(!topics) return;

container.innerHTML =
"<h3>Related Topics</h3>";

topics.forEach(item => {

const div =
document.createElement("div");

div.className =
"related-item";

div.textContent =
item.replace(/([A-Z])/g," $1");

div.onclick = () => {

document.getElementById(
"knowledgeInput"
).value = item;

searchKnowledge();

};

container.appendChild(div);

});

}

function getTopicIcon(topic){

const icons={

acne:"🩺",

melasma:"☀️",

eczema:"💧",

psoriasis:"🧬",

boils:"🔥",

ringworm:"🍄",

scabies:"🦠",

retinol:"🧴",

niacinamide:"✨",

vitaminc:"🍊",

sunscreen:"🌞",

hairloss:"💇",

dandruff:"❄️",

babyacne:"👶",

chemicalpeel:"🧪",

hyperpigmentation:"🌿"

};

return icons[topic] || "🌿";

}

function sanitizeInput(text){

return text
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#39;");

}

window.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("newsletterForm");
  alert("JS is connected ✅");

  const reveals = document.querySelectorAll(".reveal");

  window.addEventListener("scroll", () => {
    reveals.forEach((reveal) => {
      const windowHeight = window.innerHeight;
      const revealTop = reveal.getBoundingClientRect().top;
      const revealPoint = 100;

      if(revealTop < windowHeight - revealPoint){
        reveal.classList.add("active");
      }
    });
  });

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add("show");
      }
    });
  });

  const hiddenElements = document.querySelectorAll(".hidden");
  hiddenElements.forEach((el)=> observer.observe(el));

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitQuiz();
    });
  }
});

const counters = document.querySelectorAll(".stat-card h2");

counters.forEach(counter => {

  const updateCounter = () => {

    const targetText = counter.innerText;

    if(isNaN(parseInt(targetText))) return;

    const target = parseInt(targetText);

    let count = 0;

    const increment = target / 50;

    const interval = setInterval(() => {

      count += increment;

      if(count >= target){

        counter.innerText = targetText;

        clearInterval(interval);

      } else {

        counter.innerText = Math.floor(count);

      }

    },30);

  };

  updateCounter();

});

function startVoiceSearch() {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Sorry, your browser doesn't support voice search.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  const mic = document.querySelector(".voice-btn");
  if (mic) {
    mic.classList.add("listening");
  }

  recognition.start();

  recognition.onresult = function (event) {
    const speech = event.results[0][0].transcript;
    document.getElementById("knowledgeSearch").value = speech;
    searchKnowledge();
  };

  recognition.onerror = function () {
    alert("Couldn't understand. Please try again.");
  };

  recognition.onend = function () {
    if (mic) {
      mic.classList.remove("listening");
    }
  };
}

document.addEventListener("mousemove", function (e) {
  const x = (e.clientX / window.innerWidth) - 0.5;
  const y = (e.clientY / window.innerHeight) - 0.5;

  document.querySelectorAll(".glass-card").forEach(function (card) {
    card.style.transform = "translate(" + (x * 18) + "px, " + (y * 18) + "px)";
  });
});

const dashboardCards = document.querySelectorAll(".dashboard-card");

dashboardCards.forEach(function (card) {
  card.addEventListener("mousemove", function (e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 12;
    const rotateX = ((y / rect.height) - 0.5) * -12;

    card.style.transform = "perspective(1000px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-10px)";
  });

  card.addEventListener("mouseleave", function () {
    card.style.transform = "";
  });
});