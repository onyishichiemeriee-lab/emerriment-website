const supabaseClient = window.supabaseClient;

const form = document.getElementById("productForm");
const message = document.getElementById("message");

// Shared administrator check (admin/js/admin-guard.js): the form stays
// disabled, and nothing is saved, unless the user is an administrator.
function setFormEnabled(enabled) {
    if (!form) return;
    form.querySelectorAll("input, textarea, select, button").forEach((el) => { el.disabled = !enabled; });
}

setFormEnabled(false);

window.EMAdminGuard.requireAdmin().then((access) => setFormEnabled(!!access));

document.getElementById("name").addEventListener("input", e => {

document.getElementById("slug").value =

e.target.value

.toLowerCase()

.trim()

.replace(/[^a-z0-9]+/g,"-")

.replace(/^-|-$/g,"");

});

form.addEventListener("submit", async e=>{

e.preventDefault();

if (!(await window.EMAdminGuard.requireAdmin())) return;

const { error } = await supabaseClient

.from("products")

.insert({

name:name.value,

slug:slug.value,

description:description.value,

category:category.value,

price:Number(price.value),

image_url:image_url.value,

affiliate_link:affiliate_link.value,

stock_status:stock_status.value,

is_featured:is_featured.checked

});

if(error){

message.style.color="red";

message.textContent=error.message;

return;

}

message.style.color="green";

message.textContent="Product added successfully.";

form.reset();

});

logoutBtn.addEventListener("click",async()=>{

await supabaseClient.auth.signOut();

location.href="loginCMS.html";

});