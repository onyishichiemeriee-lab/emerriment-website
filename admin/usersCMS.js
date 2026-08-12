const supabaseClient = window.supabaseClient;

let users = [];

// ----------------------------
// Check Admin
// ----------------------------

async function checkAdmin(){

const { data:{ user } } =
await supabase.auth.getUser();

if(!user){

location.href="loginCMS.html";

return;

}

const { data:profile } =
await supabase

.from("profiles")

.select("is_admin")

.eq("id",user.id)

.single();

if(!profile?.is_admin){

location.href="../dashboardCMS.html";

return;

}

loadUsers();

}

// ----------------------------
// Load Users
// ----------------------------

async function loadUsers(){

const { data,error } =
await supabase

.from("profiles")

.select("*")

.order("created_at",{ascending:false});

if(error){

console.error(error);

return;

}

users=data;

renderUsers(users);

}

// ----------------------------
// Render
// ----------------------------

function renderUsers(data){

const tbody=document.getElementById("usersBody");

tbody.innerHTML="";

if(data.length===0){

tbody.innerHTML=`
<tr>

<td colspan="5">

No users found.

</td>

</tr>
`;

return;

}

data.forEach(user=>{

tbody.innerHTML+=`

<tr>

<td>${user.full_name || "Unknown"}</td>

<td>${user.email || "-"}</td>

<td>${user.current_skin_type || "-"}</td>

<td>${new Date(user.created_at).toLocaleDateString()}</td>

<td>

<button
onclick="viewUser('${user.id}')">

View

</button>

</td>

</tr>

`;

});

}

// ----------------------------
// Search
// ----------------------------

document

.getElementById("searchInput")

.addEventListener("input",(e)=>{

const keyword=e.target.value.toLowerCase();

const filtered=users.filter(user=>{

return(

(user.full_name||"")

.toLowerCase()

.includes(keyword)

||

(user.email||"")

.toLowerCase()

.includes(keyword)

);

});

renderUsers(filtered);

});

// ----------------------------
// View User
// ----------------------------

function viewUser(id){

location.href=
`user-detailsCMS.html?id=${id}`;

}

// ----------------------------
// Logout
// ----------------------------

document

.getElementById("logoutBtn")

.addEventListener("click",

async()=>{

await supabase.auth.signOut();

location.href="loginCMS.html";

});

checkAdmin();