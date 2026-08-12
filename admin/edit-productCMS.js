const supabaseClient = window.supabaseClient;

const id = new URLSearchParams(location.search).get("id");

const form = document.getElementById("productForm");

const message = document.getElementById("message");

async function loadProduct(){

const { data,error }=

await supabase

.from("products")

.select("*")

.eq("id",id)

.single();

if(error){

alert(error.message);

return;

}

name.value=data.name;

slug.value=data.slug;

description.value=data.description||"";

category.value=data.category||"";

price.value=data.price||"";

image_url.value=data.image_url||"";

affiliate_link.value=data.affiliate_link||"";

stock_status.value=data.stock_status;

is_featured.checked=data.is_featured;

}

form.addEventListener("submit",async e=>{

e.preventDefault();

const { error }=

await supabase

.from("products")

.update({

name:name.value,

slug:slug.value,

description:description.value,

category:category.value,

price:Number(price.value),

image_url:image_url.value,

affiliate_link:affiliate_link.value,

stock_status:stock_status.value,

is_featured:is_featured.checked,

updated_at:new Date().toISOString()

})

.eq("id",id);

if(error){

message.style.color="red";

message.textContent=error.message;

return;

}

message.style.color="green";

message.textContent="Product updated successfully.";

});

deleteBtn.addEventListener("click",async()=>{

if(!confirm("Delete this product?")) return;

await supabase

.from("products")

.delete()

.eq("id",id);

location.href="productsCMS.html";

});

logoutBtn.addEventListener("click",async()=>{

await supabase.auth.signOut();

location.href="loginCMS.html";

});

loadProduct();