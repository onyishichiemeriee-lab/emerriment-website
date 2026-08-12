// ============================================
// Product Recommendations
// ============================================


// --------------------------------------------
// Recommended Products
// --------------------------------------------

async function loadRecommendedProducts(profile){

    try{

        if(!profile) return;

        const { data } =

            await supabaseClient

            .from("products")

            .select("*");

        const ranked = data

        .map(product=>{

            return{

                product,

                score:

                calculateProductScore(

                    product,

                    profile

                )

            };

        })

        .sort(

            (a,b)=>b.score-a.score

        )

        .slice(0,6)

        .map(item=>item.product);

        renderProductCards(

            "recommendedProducts",

            ranked

        );

    }

    catch(error){

        console.error(error);

    }

}



// --------------------------------------------
// Product Score
// --------------------------------------------

function calculateProductScore(

    product,

    profile

){

    let score = 0;



    if(

        product.skin_concern ===

        profile.concern

    ){

        score += 50;

    }



    if(

        product.skin_type ===

        profile.skin_type

    ){

        score += 30;

    }



    if(product.is_featured){

        score += 20;

    }



    if(product.rating){

        score +=

            product.rating;

    }



    return score;

}



// --------------------------------------------
// Product Cards
// --------------------------------------------

function renderProductCards(

    containerId,

    products

){

    const container =

        document.getElementById(containerId);

    if(!container) return;

    container.innerHTML = "";

    if(!products.length){

        container.innerHTML = `

        <div class="empty-state">

            <h3>No products found</h3>

            <p>

                Products matching your skin profile
                will appear here.

            </p>

        </div>

        `;

        return;

    }

    products.forEach(product=>{

        const card =

            document.createElement("div");

        card.className =

            "product-card";

        card.innerHTML = `

            <img src="${product.image_url || "https://placehold.co/600x400?text=EMerriment"}">

            <div class="product-content">

                <h3>

                    ${product.name}

                </h3>

                <p>

                    ${product.description || ""}

                </p>

                <span>

                    ⭐ ${product.rating || "New"}

                </span>

                <a

                    href="${product.affiliate_link || "#"}"

                    target="_blank"

                    class="read-btn">

                    View Product →

                </a>

            </div>

        `;

        container.appendChild(card);

    });

}