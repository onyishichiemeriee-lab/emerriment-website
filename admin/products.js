const supabaseClient = window.supabaseClient;

(async()=>{

const {data}=await supabaseClient.auth.getSession();

if(!data.session){

window.location.href="login.html";

return;

}

loadProducts();

})();

async function loadProducts(){

const {data,error}=await supabaseClient

.from("products")

.select("*")

.order("created_at",{ascending:false});

if(error){

console.error(error);

return;

}

const tbody=document.querySelector("#productTable tbody");

tbody.innerHTML="";

data.forEach(product=>{

tbody.innerHTML+=`

<tr>

<td>${product.name}</td>

<td>${product.category}</td>

<td>₦${product.price}</td>

<td>${product.featured?"⭐":"-"}</td>

<td>${product.quiz_recommended?"✅":"-"}</td>

<td>

<button onclick="previewProduct('${product.id}')">

👁

</button>

<button onclick="editProduct('${product.id}')">

✏️

</button>

<button onclick="deleteProduct('${product.id}')">

🗑

</button>

</td>

</tr>

`;

});

}

function previewProduct(id){

window.open(`https://selar.com`);

}

function editProduct(id){

alert("Edit Product page coming next.");

}

async function deleteProduct(id){

if(!confirm("Delete this product?")) return;

await supabaseClient

.from("products")

.delete()

.eq("id",id);

loadProducts();

}

document.getElementById("addProductBtn")

.onclick=()=>{

window.location.href="add-product.html";

};

document.getElementById("logoutBtn").onclick=async()=>{

await supabaseClient.auth.signOut();

window.location.href="login.html";

};