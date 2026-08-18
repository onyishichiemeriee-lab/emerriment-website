const supabaseClient = window.supabaseClient;

let products = [];

async function checkAdmin(){

const { data:{ user } } =
await supabaseClient.auth.getUser();

if(!user){

location.href="loginCMS.html";

return;

}

const { data:profile } =
await supabaseClient

.from("profiles")

.select("is_admin")

.eq("id",user.id)

.maybeSingle();

if(!profile?.is_admin){

location.href="../dashboardCMS.html";

return;

}

loadProducts();

}

async function loadProducts(){

const { data,error } =
await supabaseClient

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

function renderProducts(data) {

    const tbody =
        document.getElementById("productsBody");

    tbody.innerHTML = "";


    if (!data || data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5">
                    No products available.
                </td>
            </tr>
        `;

        return;

    }


    data.forEach(product => {

        if (!product.id) {

            console.warn(
                "⚠️ Product has no ID:",
                product
            );

            return;

        }


        tbody.innerHTML += `

            <tr>

                <td>
                    ${product.name || "-"}
                </td>

                <td>
                    ${product.category || "-"}
                </td>

                <td>
                    ${product.price ?? "-"}
                </td>

                <td>
                    ${product.stock_status || "-"}
                </td>

                <td>

                    <button
                        type="button"
                        onclick="editProduct('${product.id}')"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        onclick="deleteProduct('${product.id}')"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `;

    });

}


function editProduct(id) {

    if (
        !id ||
        id === "null" ||
        id === "undefined"
    ) {

        alert(
            "This product does not have a valid ID."
        );

        return;

    }


    console.log(
        "✏️ Editing product:",
        id
    );


    window.location.href =
        `edit-productCMS.html?id=${encodeURIComponent(id)}`;

}

async function deleteProduct(id){

if(!confirm("Delete product?")) return;

const { error }=
await supabaseClient

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

await supabaseClient.auth.signOut();

location.href="loginCMS.html";

});

checkAdmin();