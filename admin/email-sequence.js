const supabaseClient = window.supabaseClient;

(async()=>{

const {data}=await supabaseClient.auth.getSession();

if(!data.session){

window.location.href="login.html";

return;

}

loadEmails();

})();

const totalEmails=14;

function loadEmails(){

const container=document.getElementById("emailList");

container.innerHTML="";

for(let day=1;day<=totalEmails;day++){

container.innerHTML+=`

<div class="emailCard">

<h3>Day ${day}</h3>

<p>Email Lesson ${day}</p>

<div class="emailButtons">

<button onclick="previewEmail(${day})">

👁 Preview

</button>

<button onclick="editEmail(${day})">

✏ Edit

</button>

<button onclick="sendTest(${day})">

📧 Send Test

</button>

<button onclick="toggleAutomation(${day})">

⏸ Pause

</button>

</div>

</div>

`;

}

}

function previewEmail(day){

window.open(

`../emails/day${day}.js`

);

}

function editEmail(day){

alert(`Open emails/day${day}.js in VS Code to edit.`);

}

function sendTest(day){

alert(`Test email for Day ${day} will be added next.`);

}

function toggleAutomation(day){

alert(`Pause/Resume feature coming next.`);

}

document.getElementById("logoutBtn").onclick=async()=>{

await supabaseClient.auth.signOut();

window.location.href="login.html";

};

await supabase
  .from("leads")
  .update({
    emails_sent: (subscriber.emails_sent || 0) + 1
  })
  .eq("id", subscriber.id);