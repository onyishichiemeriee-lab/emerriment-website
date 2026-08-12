const supabaseClient = window.supabaseClient;

(async () => {

const { data: session } =
await supabaseClient.auth.getSession();

if (!session.session) {

window.location.href = "login.html";

return;

}

loadSubscribers();

})();

async function loadSubscribers(){

const { data, error } = await supabaseClient

.from("leads")

.select("*")

.order("submitted_at",{ascending:false});

if(error){

console.error(error);

return;

}

renderTable(data);

}

function renderTable(data){

const tbody = document.querySelector("#subscriberTable tbody");

tbody.innerHTML="";

data.forEach(sub=>{

tbody.innerHTML +=`

<tr>

<td>${sub.name}</td>

<td>${sub.email}</td>

<td>${sub.skin_type}</td>

<td>${sub.concern}</td>

<td>${sub.email_sequence_day}</td>

<td>

<button onclick="viewSubscriber('${sub.id}')">

👤

</button>

<button onclick="editSubscriber('${sub.id}')">

✏️

</button>

<button onclick="deleteSubscriber('${sub.id}')">

🗑

</button>

</td>

</tr>

`;

});

}

document.getElementById("searchInput")

.addEventListener("keyup",async(e)=>{

const keyword=e.target.value;

const { data } = await supabaseClient

.from("leads")

.select("*")

.or(`name.ilike.%${keyword}%,email.ilike.%${keyword}%`);

renderTable(data);

});

async function deleteSubscriber(id){

if(!confirm("Delete this subscriber?")) return;

await supabaseClient

.from("leads")

.delete()

.eq("id",id);

loadSubscribers();

}

function viewSubscriber(id){

window.location.href=`subscriber.html?id=${id}`;

}

function editSubscriber(id){

window.location.href=`edit-subscriber.html?id=${id}`;

}

document.getElementById("logoutBtn").onclick=async()=>{

await supabaseClient.auth.signOut();

window.location.href="login.html";

};