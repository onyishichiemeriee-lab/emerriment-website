/* =========================================
   EMerriment CMS
   Edit Product Controller
========================================= */

const supabaseClient = window.supabaseClient;


/* =========================================
   GET PRODUCT ID
========================================= */

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");


/* =========================================
   ELEMENTS
========================================= */

const form = document.getElementById("productForm");
const message = document.getElementById("message");

const nameInput = document.getElementById("name");
const slugInput = document.getElementById("slug");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const imageUrlInput = document.getElementById("image_url");
const affiliateLinkInput = document.getElementById("affiliate_link");
const stockStatusInput = document.getElementById("stock_status");
const featuredInput = document.getElementById("is_featured");

const deleteBtn = document.getElementById("deleteBtn");
const logoutBtn = document.getElementById("logoutBtn");


/* =========================================
   VALIDATE PRODUCT ID
========================================= */

if (!productId || productId === "null" || productId === "undefined") {

    console.error("❌ No valid product ID found.");

    alert("No product was selected. Please return to the Products page.");

    window.location.href = "productsCMS.html";

}


/* =========================================
   CHECK ADMIN
========================================= */

async function checkAdmin() {

    try {

        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();


        if (authError || !user) {

            window.location.href = "loginCMS.html";

            return;

        }


        const { data: profile, error: profileError } =
            await supabaseClient
                .from("profiles")
                .select("is_admin")
                .eq("id", user.id)
                .maybeSingle();


        if (profileError) {

            console.error(
                "Admin check error:",
                profileError
            );

            alert(profileError.message);

            return;

        }


        if (!profile?.is_admin) {

            alert("You do not have permission to access the CMS.");

            window.location.href = "dashboardCMS.html";

            return;

        }


        await loadProduct();

    }

    catch (error) {

        console.error(
            "CMS authentication error:",
            error
        );

    }

}


/* =========================================
   LOAD PRODUCT
========================================= */

async function loadProduct() {

    if (!productId) return;


    console.log(
        "🔎 Loading product:",
        productId
    );


    const { data, error } =
        await supabaseClient
            .from("products")
            .select("*")
            .eq("id", productId)
            .maybeSingle();


    if (error) {

        console.error(
            "❌ Product loading error:",
            error
        );

        showMessage(
            error.message,
            "red"
        );

        return;

    }


    if (!data) {

        alert(
            "Product not found."
        );

        window.location.href =
            "productsCMS.html";

        return;

    }


    console.log(
        "✅ Product loaded:",
        data
    );


    /* =====================================
       FILL FORM
    ===================================== */

    if (nameInput)
        nameInput.value = data.name || "";

    if (slugInput)
        slugInput.value = data.slug || "";

    if (descriptionInput)
        descriptionInput.value =
            data.description || "";

    if (categoryInput)
        categoryInput.value =
            data.category || "";

    if (priceInput)
        priceInput.value =
            data.price ?? "";

    if (imageUrlInput)
        imageUrlInput.value =
            data.image_url || "";

    if (affiliateLinkInput)
        affiliateLinkInput.value =
            data.affiliate_link || "";

    if (stockStatusInput)
        stockStatusInput.value =
            data.stock_status || "";

    if (featuredInput)
        featuredInput.checked =
            Boolean(data.is_featured);

}


/* =========================================
   SAVE PRODUCT
========================================= */

if (form) {

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            if (!productId) {

                showMessage(
                    "Product ID is missing.",
                    "red"
                );

                return;

            }


            const price =
                Number(priceInput?.value || 0);


            const { error } =
                await supabaseClient
                    .from("products")
                    .update({

                        name:
                            nameInput?.value.trim() || "",

                        slug:
                            slugInput?.value.trim() || "",

                        description:
                            descriptionInput?.value.trim() || "",

                        category:
                            categoryInput?.value.trim() || "",

                        price,

                        image_url:
                            imageUrlInput?.value.trim() || "",

                        affiliate_link:
                            affiliateLinkInput?.value.trim() || "",

                        stock_status:
                            stockStatusInput?.value || "",

                        is_featured:
                            Boolean(
                                featuredInput?.checked
                            ),

                        updated_at:
                            new Date().toISOString()

                    })
                    .eq(
                        "id",
                        productId
                    );


            if (error) {

                console.error(
                    "❌ Update error:",
                    error
                );

                showMessage(
                    error.message,
                    "red"
                );

                return;

            }


            showMessage(
                "✅ Product updated successfully.",
                "green"
            );

        }
    );

}


/* =========================================
   DELETE PRODUCT
========================================= */

if (deleteBtn) {

    deleteBtn.addEventListener(
        "click",
        async () => {

            if (!productId) {

                alert(
                    "Product ID is missing."
                );

                return;

            }


            const confirmed =
                confirm(
                    "Are you sure you want to delete this product?"
                );


            if (!confirmed) return;


            const { error } =
                await supabaseClient
                    .from("products")
                    .delete()
                    .eq(
                        "id",
                        productId
                    );


            if (error) {

                console.error(
                    "❌ Delete error:",
                    error
                );

                alert(
                    error.message
                );

                return;

            }


            alert(
                "Product deleted successfully."
            );


            window.location.href =
                "productsCMS.html";

        }
    );

}


/* =========================================
   LOGOUT
========================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            window.location.href =
                "loginCMS.html";

        }
    );

}


/* =========================================
   MESSAGE HELPER
========================================= */

function showMessage(
    text,
    color
) {

    if (!message) return;

    message.style.color = color;

    message.textContent = text;

}


/* =========================================
   START
========================================= */

checkAdmin();