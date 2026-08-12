const supabaseClient = window.supabaseClient;

(async()=>{

const {data}=await supabaseClient.auth.getSession();

if(!data.session){

window.location.href="login.html";

return;

}

loadAnalytics();

})();

async function loadAnalytics() {

  const { data, error } = await supabaseClient
    .from("leads")
    .select("*");

  if (error) {
    console.error(error);
    return;
  }

  // Total Subscribers
  document.getElementById("totalSubscribers").innerText = data.length;

  const today = new Date();

  // Today's date (YYYY-MM-DD)
  const todayString = today.toISOString().slice(0, 10);

  // Subscribers today
  const todaySubscribers = data.filter(sub =>
    sub.submitted_at &&
    sub.submitted_at.startsWith(todayString)
  );

  document.getElementById("dailyGrowth").innerText =
    todaySubscribers.length;

  // Last 7 Days
  const last7Days = data.filter(sub => {

    if (!sub.submitted_at) return false;

    const date = new Date(sub.submitted_at);

    const diff =
      (today - date) / (1000 * 60 * 60 * 24);

    return diff <= 7;

  });

  document.getElementById("weeklyGrowth").innerText =
    last7Days.length;

  // Last 30 Days
  const last30Days = data.filter(sub => {

    if (!sub.submitted_at) return false;

    const date = new Date(sub.submitted_at);

    const diff =
      (today - date) / (1000 * 60 * 60 * 24);

    return diff <= 30;

  });

  document.getElementById("monthlyGrowth").innerText =
    last30Days.length;

    const growthRate =
data.length === 0
? 0
: Math.round(
(last30Days.length / data.length) * 100
);

document.getElementById("growthRate").innerText =
growthRate + "%";

  // Top Skin Concern
  const concerns = {};

  data.forEach(sub => {

    concerns[sub.concern] =
      (concerns[sub.concern] || 0) + 1;

  });

  let topConcern = "-";
  let highest = 0;

  for (const concern in concerns) {

    if (concerns[concern] > highest) {

      highest = concerns[concern];

      topConcern = concern;

    }

  }

  document.getElementById("topConcern").innerText =
    topConcern;

    const totalSent =
data.reduce((sum, sub) =>
sum + (sub.emails_sent || 0), 0);

const totalOpened =
data.reduce((sum, sub) =>
sum + (sub.emails_opened || 0), 0);

const totalClicked =
data.reduce((sum, sub) =>
sum + (sub.emails_clicked || 0), 0);

document.getElementById("emailsSent").innerText = totalSent;

document.getElementById("emailsOpened").innerText = totalOpened;

document.getElementById("emailsClicked").innerText = totalClicked;

const openRate =
totalSent === 0
? 0
: Math.round((totalOpened / totalSent) * 100);

const clickRate =
totalSent === 0
? 0
: Math.round((totalClicked / totalSent) * 100);

document.getElementById("emailOpenRate").innerText =
openRate + "%";

document.getElementById("clickRate").innerText =
clickRate + "%";

}