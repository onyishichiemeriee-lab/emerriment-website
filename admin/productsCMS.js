const supabase = window.supabaseClient;

let products = [];

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

loadProducts();

}

async function loadProducts(){

const { data,error } =
await supabase

.from("products")

.select("*")

.order("created_at",{ascending:false});

if(error){

console.error(error);

return;

}

products=data;

renderProducts(products);

}

function renderProducts(data){

const tbody=document.getElementById("productsBody");

tbody.innerHTML="";

if(data.length===0){

tbody.innerHTML=`
<tr>
<td colspan="5">
No products available.
</td>
</tr>
`;

return;

}

data.forEach(product=>{

tbody.innerHTML+=`

<tr>

<td>${product.name}</td>

<td>${product.category||"-"}</td>

<td>${product.price??"-"}</td>

<td>${product.stock_status}</td>

<td>

<button onclick="editProduct('${product.id}')">

Edit

</button>

<button onclick="deleteProduct('${product.id}')">

Delete

</button>

</td>

</tr>

`;

});

}

document
.getElementById("searchInput")
.addEventListener("input",(e)=>{

const keyword=e.target.value.toLowerCase();

renderProducts(

products.filter(product=>

product.name.toLowerCase().includes(keyword)

)

);

});

function editProduct(id){

location.href=
`edit-productCMS.html?id=${id}`;

}

async function deleteProduct(id){

if(!confirm("Delete product?")) return;

const { error }=
await supabase

.from("products")

.delete()

.eq("id",id);

if(error){

alert(error.message);

return;

}

loadProducts();

}

document
.getElementById("logoutBtn")
.addEventListener("click",async()=>{

await supabase.auth.signOut();

location.href="loginCMS.html";

});

checkAdmin();