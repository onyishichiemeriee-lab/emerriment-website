// SUPABASE CONNECTION

const supabaseUrl = "https://ioeulnjrozkbetaongbv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZXVsbmpyb3prYmV0YW9uZ2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjQxMzQsImV4cCI6MjA5NTMwMDEzNH0.I3WhW8lnThCZVo1bFHwbl6X8t5xT9tspnTdoR3nlSNc";

const supabaseClient = supabase.createClient(
  supabaseUrl,
  supabaseKey
);

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

  if(skinType === "Dry"){
    products = `
      <div class="product-card">
        <h3>Clear Skin Blueprint</h3>
        <p>Hydration + Acne Recovery</p>
      </div>

      <div class="product-card">
        <h3>Glow Guide</h3>
        <p>Restore your skin barrier</p>
      </div>
    `;
  }

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
      name,
      email,
      skinType,
      concern,
      score,
      recommendation
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