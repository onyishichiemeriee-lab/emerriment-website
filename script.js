// SUPABASE CONNECTION

const supabaseUrl = "https://ioeulnjrozkbetaongbv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZXVsbmpyb3prYmV0YW9uZ2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjQxMzQsImV4cCI6MjA5NTMwMDEzNH0.I3WhW8lnThCZVo1bFHwbl6X8t5xT9tspnTdoR3nlSNc";

const supabaseClient = supabase.createClient(
  supabaseUrl,
  supabaseKey
);

const skincareKnowledge = {

acne: "Acne occurs when pores become clogged with oil, dead skin cells, and bacteria.",

eczema: "Eczema weakens the skin barrier and causes itching, dryness, and inflammation.",

psoriasis: "Psoriasis is an immune-mediated skin condition that causes thick, scaly patches.",

rosacea: "Rosacea commonly causes redness, flushing, and increased skin sensitivity.",

melasma: "Melasma causes brown patches on the skin and is often linked to hormones and sun exposure.",

vitiligo: "Vitiligo causes loss of skin pigment due to the destruction of melanocytes.",

boils: "Boils are painful bacterial infections that develop around hair follicles.",

hives: "Hives are raised, itchy welts often triggered by allergies or infections.",

warts: "Warts are skin growths caused by certain strains of human papillomavirus (HPV).",

ringworm: "Ringworm is a fungal infection that causes a circular, itchy rash.",

athletesfoot: "Athlete's foot is a fungal infection affecting the feet.",

coldsores: "Cold sores are caused by the herpes simplex virus and often appear around the lips.",

impetigo: "Impetigo is a contagious bacterial skin infection common in children.",

cellulitis: "Cellulitis is a bacterial infection of deeper layers of the skin.",

scabies: "Scabies is caused by microscopic mites that burrow into the skin.",

seborrheicdermatitis: "Seborrheic dermatitis causes flaky, oily patches on the scalp and face.",

contactdermatitis: "Contact dermatitis develops when the skin reacts to an irritant or allergen.",

keratosispilaris: "Keratosis pilaris causes rough, tiny bumps often called chicken skin.",

folliculitis: "Folliculitis occurs when hair follicles become inflamed or infected.",

lupus: "Cutaneous lupus can cause rashes and increased sensitivity to sunlight.",

scleroderma: "Scleroderma is an autoimmune condition that causes skin thickening.",

pemphigus: "Pemphigus is a rare autoimmune disorder that causes skin blistering.",

bullouspemphigoid: "Bullous pemphigoid causes large, fluid-filled blisters.",

dermatomyositis: "Dermatomyositis affects the skin and muscles and can cause characteristic rashes.",

albinism: "Albinism is a genetic condition characterized by reduced melanin production.",

darkspots: "Dark spots often develop after inflammation, acne, or sun exposure.",

hyperpigmentation: "Hyperpigmentation occurs when excess melanin is produced in the skin.",

sunburn: "Sunburn is skin damage caused by excessive UV exposure.",

skinbarrier: "A healthy skin barrier helps retain moisture and protect against irritation.",

dehydratedskin: "Dehydrated skin lacks water and may feel tight and dull.",

dryskin: "Dry skin lacks sufficient moisture and may become flaky.",

oilyskin: "Oily skin produces excess sebum and may appear shiny.",

combinationskin: "Combination skin has both oily and dry areas.",

sensitiveskin: "Sensitive skin reacts easily to certain products or environmental triggers.",

niacinamide: "Niacinamide may help support the skin barrier and improve the appearance of oiliness.",

vitaminc: "Vitamin C is an antioxidant that can help brighten uneven skin tone.",

retinol: "Retinol promotes skin cell turnover and may improve signs of aging.",

hyaluronicacid: "Hyaluronic acid attracts water and helps hydrate the skin.",

salicylicacid: "Salicylic acid helps unclog pores and is commonly used for acne.",

glycolicacid: "Glycolic acid exfoliates the skin and may improve texture.",

lacticacid: "Lactic acid gently exfoliates and can help improve hydration.",

azelaicacid: "Azelaic acid may help with acne and uneven skin tone.",

ceramides: "Ceramides help strengthen and protect the skin barrier.",

benzoylperoxide: "Benzoyl peroxide helps reduce acne-causing bacteria.",

sunscreen: "Daily sunscreen use helps protect against UV damage and hyperpigmentation.",

spf: "SPF measures protection against UVB rays that contribute to sunburn.",

cleanser: "A cleanser removes dirt, oil, and impurities from the skin.",

moisturizer: "Moisturizers help maintain hydration and support the skin barrier.",

toner: "Toners are optional products that can provide hydration or exfoliation.",

serum: "Serums contain concentrated ingredients designed for specific concerns.",

faceoil: "Face oils can help lock in moisture and improve skin softness.",

doublecleansing: "Double cleansing involves using an oil-based cleanser followed by a water-based cleanser.",

patchtest: "Patch testing helps identify potential reactions before using a new product.",

exfoliation: "Exfoliation removes dead skin cells and may improve skin texture.",

overexfoliation: "Too much exfoliation can damage the skin barrier and increase irritation.",

antiaging: "Healthy skincare habits and sun protection can help reduce visible signs of aging.",

collagen: "Collagen is a structural protein that helps maintain skin firmness.",

peptides: "Peptides are ingredients that may support skin repair and firmness.",

acnescars: "Acne scars can develop after inflammation damages deeper skin layers.",

blackheads: "Blackheads form when pores become clogged and exposed to air.",

whiteheads: "Whiteheads are clogged pores that remain closed at the surface.",

cysticacne: "Cystic acne is a severe form of acne that develops deep within the skin.",

fungalacne: "Fungal acne involves yeast overgrowth and often appears as small itchy bumps.",

stretchmarks: "Stretch marks develop when the skin stretches rapidly.",

ingrownhair: "Ingrown hairs occur when hairs grow back into the skin.",

dandruff: "Dandruff causes flaking of the scalp and may be linked to seborrheic dermatitis.",

scalpcare: "A healthy scalp supports healthy hair growth and comfort.",

facemask: "Face masks can provide hydration, exfoliation, or other targeted benefits.",

sheetmask: "Sheet masks temporarily boost hydration and deliver skincare ingredients.",

sleep: "Quality sleep supports skin repair and overall health.",

water: "Adequate hydration supports overall skin health.",

diet: "A balanced diet contributes to overall skin wellness.",

stress: "Stress may worsen certain skin conditions such as acne and eczema.",

exercise: "Regular exercise supports circulation and overall wellness.",

glowingskin: "Healthy skin is often the result of consistency rather than quick fixes.",

skincareroutine: "A simple routine usually includes cleansing, moisturizing, and sun protection.",

morningroutine: "Morning routines often focus on protection and hydration.",

nightroutine: "Night routines often focus on cleansing and repair.",

makeupremoval: "Removing makeup before bed helps prevent clogged pores.",

fragrance: "Fragrances can irritate sensitive skin in some individuals.",

alcoholinskincare: "Some alcohols can be drying, while others are beneficial fatty alcohols.",

naturalproducts: "Natural ingredients are not automatically safer or more effective.",

organicproducts: "Organic products can still cause irritation in some people.",

skincaremyth1: "Myth: Oily skin does not need moisturizer. Fact: All skin types benefit from appropriate hydration.",

skincaremyth2: "Myth: Acne is caused by poor hygiene. Fact: Acne is influenced by multiple biological factors.",

skincaremyth3: "Myth: Sunscreen is only needed on sunny days. Fact: UV exposure can occur year-round.",

skincaremyth4: "Myth: Drinking water alone clears acne. Fact: Acne is more complex than hydration alone.",

skincaremyth5: "Myth: Expensive products are always better. Fact: Effectiveness depends on formulation and suitability.",

skincaremyth6: "Myth: You can shrink pores permanently. Fact: Pore size is largely influenced by genetics.",

productrecommendations: "Skincare products should be selected based on skin type and concerns.",

ingredientlayering: "Some ingredients work well together, while others may increase irritation.",

skincareconsistency: "Consistency is one of the most important factors in achieving skincare goals.",

dermatologist: "Persistent or severe skin concerns should be evaluated by a qualified dermatologist."

};

function askAI() {

  const input =
    document.getElementById("userQuestion");

  const question =
    input.value.toLowerCase().trim();

  const messages =
    document.getElementById("aiMessages");

  if (!question) return;

  messages.innerHTML += `
    <div class="ai-message">
      🧑 ${input.value}
    </div>
  `;

  messages.innerHTML += `
    <div id="thinking" class="ai-message">
      🤖 EMerriment AI is thinking...
    </div>
  `;

  messages.scrollTop = messages.scrollHeight;

  setTimeout(() => {

    let answer = "";

for (const topic in skincareKnowledge) {

  if (question.includes(topic)) {

    answer = skincareKnowledge[topic];
    break;

  }

}

if (answer === "") {

  answer =
  "🌿 I don't have a detailed answer for that topic yet. Try asking about acne, eczema, rosacea, psoriasis, dark spots, retinol, niacinamide, sunscreen, oily skin, dry skin, and many other skincare topics.";

}

    document.getElementById("thinking").remove();

    messages.innerHTML += `
      <div class="ai-message">
        🤖 ${answer}
      </div>
    `;

    messages.scrollTop =
      messages.scrollHeight;

  }, 1500);

  input.value = "";

}

function openAI() {

  document.getElementById("aiChatContainer")
  .style.display = "block";

}

function toggleAI(){

const box =
document.getElementById("aiChatBox");

if(box.style.display === "block"){

box.style.display = "none";

}else{

box.style.display = "block";

}

}

function searchKnowledge() {

const query =
document
.getElementById("knowledgeInput")
.value
.toLowerCase()
.trim()
.replace(/\s+/g, "");

const result =
document.getElementById("knowledgeResults");

showRelatedTopics(query);

if(!query){

result.innerHTML =
"<p>Please enter a topic.</p>";

return;

}

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

if(skincareKnowledge[query]){

const topic = skincareKnowledge[query];

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

}


async function submitQuiz() {
  const loadingEl = document.getElementById("loading");
  const analysisEl = document.getElementById("analysisText");

  // Only attempt to update elements if they actually exist in the DOM
  if (loadingEl) loadingEl.style.display = "flex";
  if (analysisEl) analysisEl.textContent = "Analyzing your skin...";

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

  const resultsHTML = `
  <div class="results-container">
    <h2>✨ EMerriment Skin Analysis</h2>
    <div class="score-circle">
      <h3>Hydration Score</h3>
      <p>${score}</p>
    </div>
    <div class="result-grid">
      <div class="result-card"><h3>Skin Type</h3><p>${skinType}</p></div>
      <div class="result-card"><h3>Main Concern</h3><p>${concern}</p></div>
      <div class="result-card"><h3>Oil Level</h3><p>${oilLevel}</p></div>
      <div class="result-card"><h3>Sensitivity</h3><p>${sensitivity}</p></div>
    </div>
    <div class="recommendation-box">
      <h3>Your Recommendation</h3>
      <p>${recommendation}</p>
    </div>
    ${products}
  </div>
  `;

  document.getElementById("results").innerHTML = resultsHTML;

  const productContainer =
document.getElementById("recommendedProducts");

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

document.addEventListener("mousemove",(e)=>{

const x=(e.clientX/window.innerWidth)-0.5;

const y=(e.clientY/window.innerHeight)-0.5;

document.querySelectorAll(".glass-card").forEach(card=>{

card.style.transform=

`translate(${x*18}px,${y*18}px)`;

});

});