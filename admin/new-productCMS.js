const supabase = window.supabaseClient;

const form = document.getElementById("productForm");
const message = document.getElementById("message");

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

const { error } = await supabase

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

await supabase.auth.signOut();

location.href="loginCMS.html";

});