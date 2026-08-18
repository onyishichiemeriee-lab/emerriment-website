const supabaseClient = window.supabaseClient;

async()=>{

  const {data}=await supabaseClient.auth.getSession();

if(!data.session){

window.location.href="login.html";

return;

}

};

document.getElementById("productForm")

.addEventListener("submit",async(e)=>{

e.preventDefault();

const product={

name:

document.getElementById("name").value,

description:

document.getElementById("description").value,

price:

Number(document.getElementById("price").value),

selar_link:

document.getElementById("selarLink").value,

category:

document.getElementById("category").value,

image:

document.getElementById("image").value,

featured:

document.getElementById("featured").checked,

quiz_recommended:

document.getElementById("recommended").checked

};

const {error}=await supabaseClient

.from("products")

.insert(product);

if(error){

alert(error.message);

return;

}

alert("✅ Product Added Successfully!");

window.location.href="products.html";

});

document.getElementById("logoutBtn").onclick=async()=>{

await supabaseClient.auth.signOut();

window.location.href="login.html";

};