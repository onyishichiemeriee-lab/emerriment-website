// SUPABASE CONNECTION

const supabaseUrl = "https://ioeulnjrozkbetaongbv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZXVsbmpyb3prYmV0YW9uZ2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjQxMzQsImV4cCI6MjA5NTMwMDEzNH0.I3WhW8lnThCZVo1bFHwbl6X8t5xT9tspnTdoR3nlSNc";

const supabaseClient = supabase.createClient(
  supabaseUrl,
  supabaseKey
);

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

function openAI() {

  document.getElementById("aiChatContainer")
  .style.display = "block";

}

function toggleAI(){

const ai =
document.getElementById("aiWindow");

if(ai.style.display==="flex"){

ai.style.display="none";

}else{

ai.style.display="flex";

}

}

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

const text = input.value.trim();

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

  if (loadingEl) loadingEl.style.display = "none";

document.getElementById("loading").style.display="none";

  const form = document.getElementById("newsletterForm");
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const skinType = document.getElementById("skinType").value;
  const concern = document.getElementById("concern").value;
  const oilLevel = document.getElementById("oilLevel")?.value || "";
  const sensitivity = document.getElementById("sensitivity")?.value || "";

  let score = 60;

  if (skinType === "Oily") score -= 10;
  if (concern === "Acne") score -= 10;

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

if (concern === "Acne") {

  productHTML = `
  <div class="product-card">
    <h3>🔥 Acne Care Course</h3>
    <p>Learn how to reduce breakouts and build a clear skin routine.</p>

    <a class="product-btn"
       href="https://selar.com/jsr426"
       target="_blank">
       View Product
    </a>
  </div>
  `;

}

else if (
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
        sensitivity: sensitivity,
        score,
        recommendation
      }
    ])
    .select();

    console.log("Insert finished");
console.log(data);
console.log(error);

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (!error) {

  await fetch("/.netlify/functions/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
  email: email,
  attributes: {
    FIRSTNAME: name
  },
  listIds: [3],
  updateEnabled: true
})
  });

  alert("Skin plan generated!");

  document.getElementById("results").scrollIntoView({
  behavior: "smooth"
});

const analysisText =
document.getElementById(
"analysisText"
);

analysisText.innerText =
"Analyzing skin type...";

setTimeout(()=>{
analysisText.innerText =
"Checking skin barrier...";
},1000);

setTimeout(()=>{
analysisText.innerText =
"Calculating hydration score...";
},2000);

setTimeout(()=>{
analysisText.innerText =
"Generating recommendations...";
},3000);

setTimeout(()=>{
  analysisText.innerText = "Analysis complete!";
}, 4000);

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

function startVoiceSearch(){

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if(!SpeechRecognition){

alert("Sorry, your browser doesn't support voice search.");

return;

}

const recognition =
new SpeechRecognition();

recognition.lang="en-US";

recognition.interimResults=false;

recognition.maxAlternatives=1;

const mic =
document.querySelector(".voice-btn");

mic.classList.add("listening");

recognition.start();

recognition.onresult=function(event){

const speech =
event.results[0][0].transcript;

document.getElementById("knowledgeSearch").value=speech;

searchKnowledge();

};

recognition.onerror=function(){

alert("Couldn't understand. Please try again.");

};

recognition.onend=function(){

mic.classList.remove("listening");

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