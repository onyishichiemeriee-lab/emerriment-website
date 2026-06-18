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

    let answer = [];

    for (const topic in skincareKnowledge) {

      if (question.includes(topic)) {

        answer.push(skincareKnowledge[topic]);
        break;

      }

    }

    if (!answer) {

      answer =
        "🌿 I don't have a detailed answer for that topic yet. Try asking about acne, eczema, psoriasis, rosacea, dark spots, sunscreen, retinol, vitamin C, niacinamide, oily skin, dry skin, skincare routines, or other common skin concerns.";

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

function toggleAI(){

const box =
document.getElementById("aiChatBox");

if(box.style.display === "block"){

box.style.display = "none";

}else{

box.style.display = "block";

}

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

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("show");
    }
  });
});

document.querySelectorAll(".hidden")
.forEach(el => observer.observe(el));
