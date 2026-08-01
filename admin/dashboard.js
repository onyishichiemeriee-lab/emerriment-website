const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Check if admin is logged in
(async () => {

  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {

    window.location.href = "login.html";

    return;

  }

})();

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Global variable for all subscribers
let subscribers = [];

async function loadDashboard() {

  const { data, error } = await supabaseClient
    .from("leads")
    .select("*");

  if (error) {
    console.error(error);
    return;
  }

  // Save data globally
  subscribers = data;

  renderConcernChart(data);

renderJourneyChart(data);

  // Dashboard cards
  document.getElementById("totalSubscribers").innerText =
    data.length;

  document.getElementById("pendingEmails").innerText =
    data.filter(
      x => x.email_status === "Pending"
    ).length;

  document.getElementById("completedJourney").innerText =
    data.filter(
      x => x.email_sequence_day > 14
    ).length;

  // Most common concern
  const concerns = {};

  data.forEach(x => {

    concerns[x.concern] =
      (concerns[x.concern] || 0) + 1;

  });

  let top = "-";
  let max = 0;

  for (const c in concerns) {

    if (concerns[c] > max) {

      max = concerns[c];

      top = c;

    }

  }

  document.getElementById("topConcern").innerText = top;

  // Build subscriber table
  const table =
    document.getElementById("subscriberTable");

  table.innerHTML = "";

  data.forEach(sub => {

    table.innerHTML += `

    <tr>

      <td>${sub.name}</td>

      <td>${sub.email}</td>

      <td>${sub.skin_type}</td>

      <td>${sub.concern}</td>

      <td>${sub.email_sequence_day}</td>

      <td>${sub.status}</td>

      <td>

        <button
          class="viewBtn"
          onclick="viewSubscriber('${sub.id}')">

          View

        </button>

      </td>

    </tr>

    `;

  });

}

// View Subscriber Modal
function viewSubscriber(id) {

  const user =
    subscribers.find(x => x.id === id);

  if (!user) return;

  document.getElementById(
    "subscriberDetails"
  ).innerHTML = `

    <p><strong>Name:</strong> ${user.name}</p>

    <p><strong>Email:</strong> ${user.email}</p>

    <p><strong>Skin Type:</strong> ${user.skin_type}</p>

    <p><strong>Main Concern:</strong> ${user.concern}</p>

    <p><strong>Oil Level:</strong> ${user.oil_level}</p>

    <p><strong>Sensitivity:</strong> ${user.sensitivity}</p>

    <p><strong>Hydration Score:</strong> ${user.score}</p>

    <p><strong>Recommendation:</strong> ${user.recommendation}</p>

    <p><strong>Email Sequence Day:</strong> ${user.email_sequence_day}</p>

    <p><strong>Email Status:</strong> ${user.email_status}</p>

    <p><strong>Status:</strong> ${user.status}</p>

    <p><strong>Joined:</strong> ${user.submitted_at}</p>

  `;

  document.getElementById(
    "subscriberModal"
  ).style.display = "block";

}

// Close Modal
document.getElementById(
  "closeModal"
).onclick = () => {

  document.getElementById(
    "subscriberModal"
  ).style.display = "none";

};

// Close when clicking outside
window.onclick = function(event){

  const modal =
    document.getElementById("subscriberModal");

  if(event.target === modal){

    modal.style.display = "none";

  }

};

// Live Search
document.getElementById("search")
.addEventListener("input", function(e){

  const value =
    e.target.value.toLowerCase();

  const rows =
    document.querySelectorAll(
      "#subscriberTable tr"
    );

  rows.forEach(row=>{

    row.style.display =
      row.innerText
      .toLowerCase()
      .includes(value)

      ? ""

      : "none";

  });

});

// Load dashboard
loadDashboard();

let concernChart;
let journeyChart;
let growthChart;
let emailChart;

renderGrowthChart(data);

renderEmailChart(data);

updateCompletionBar(data);

let growthChart;

function renderGrowthChart(data){

const monthly={};

data.forEach(sub=>{

const month=new Date(sub.submitted_at)

.toLocaleString("default",{

month:"short"

});

monthly[month]=(monthly[month]||0)+1;

});

if(growthChart){

growthChart.destroy();

}

growthChart=new Chart(

document.getElementById("growthChart"),

{

type:"line",

data:{

labels:Object.keys(monthly),

datasets:[{

label:"Subscribers",

data:Object.values(monthly),

fill:false,

tension:.3

}]

}

}

);

}

let emailChart;

function renderEmailChart(data){

const sent=data.filter(

x=>x.email_status==="Sent"

).length;

const pending=data.filter(

x=>x.email_status==="Pending"

).length;

if(emailChart){

emailChart.destroy();

}

emailChart=new Chart(

document.getElementById("emailChart"),

{

type:"pie",

data:{

labels:[

"Sent",

"Pending"

],

datasets:[{

data:[

sent,

pending

]

}]

}

}

);

}

function updateCompletionBar(data){

const completed=

data.filter(

x=>x.email_sequence_day>14

).length;

const percent=

Math.round(

(completed/data.length||0)*100

);

document.getElementById(

"completionBar"

).style.width=

percent+"%";

document.getElementById(

"completionText"

).innerText=

percent+"% Completed";

}

document.getElementById(

"exportCSV"

).onclick=()=>{

let csv="Name,Email,Skin Type,Concern\n";

subscribers.forEach(sub=>{

csv+=`${sub.name},${sub.email},${sub.skin_type},${sub.concern}\n`;

});

const blob=new Blob([csv]);

const url=URL.createObjectURL(blob);

const a=document.createElement("a");

a.href=url;

a.download="EMerriment Subscribers.csv";

a.click();

};

document.getElementById(

"toggleTheme"

).onclick=()=>{

document.body.classList.toggle(

"dark"

);

};

function renderConcernChart(data){

const counts={};

data.forEach(x=>{

counts[x.concern]=(counts[x.concern]||0)+1;

});

const labels=Object.keys(counts);

const values=Object.values(counts);

if(concernChart){

concernChart.destroy();

}

concernChart=new Chart(

document.getElementById("concernChart"),

{

type:"doughnut",

data:{

labels,

datasets:[{

data:values

}]

}

}

);

}

function renderJourneyChart(data){

const days=[];

for(let i=1;i<=14;i++){

days.push(

data.filter(

x=>x.email_sequence_day===i

).length

);

}

if(journeyChart){

journeyChart.destroy();

}

journeyChart=new Chart(

document.getElementById("journeyChart"),

{

type:"bar",

data:{

labels:[

"1","2","3","4","5","6","7",

"8","9","10","11","12","13","14"

],

datasets:[{

label:"Subscribers",

data:days

}]

}

}

);

}

document.getElementById("logoutBtn").onclick = async () => {

  await supabaseClient.auth.signOut();

  window.location.href = "login.html";

};