// ============================================
// Dashboard UI
// ============================================


// --------------------------------------------
// Loading
// --------------------------------------------

function showLoading() {

    const loader =

        document.getElementById(

            "dashboardLoader"

        );

    if (loader) {

        loader.style.display = "flex";

    }

}


function hideLoading() {

    const loader =

        document.getElementById(

            "dashboardLoader"

        );

    if (loader) {

        loader.style.display = "none";

    }

}


// --------------------------------------------
// Notifications
// --------------------------------------------

function showNotification(

    message,

    type = "success"

) {

    const notification =

        document.createElement(

            "div"

        );

    notification.className =

        `notification ${type}`;

    notification.textContent =

        message;

    document.body.appendChild(

        notification

    );

    setTimeout(() => {

        notification.remove();

    }, 3000);

}


// --------------------------------------------
// Error Screen
// --------------------------------------------

// Shows a visible message at the top of the dashboard (never a blank
// page) and always removes the loading indicator. Plain text only.
function showError(message) {

    hideLoading();

    const notice =

        document.getElementById(

            "dashboardNotice"

        );

    if (!notice) {

        console.error("Dashboard:", message);

        return;

    }

    notice.textContent = "";

    const text = document.createElement("p");

    text.textContent =
        String(message || "Something went wrong while loading your dashboard.");

    const reload = document.createElement("button");

    reload.type = "button";

    reload.className = "dashboard-notice-action";

    reload.textContent = "Reload";

    reload.addEventListener("click", () => window.location.reload());

    notice.appendChild(text);

    notice.appendChild(reload);

    notice.hidden = false;

}


// --------------------------------------------
// Safe Text
// --------------------------------------------

function safeText(value) {

    if (

        value === null ||

        value === undefined ||

        value === ""

    ) {

        return "--";

    }

    return value;

}

// --------------------------------------------
// Safe Text Helper
// --------------------------------------------

function setText(id, value) {

    const element =

        document.getElementById(id);

    if (!element) return;

    element.textContent =

        value ?? "--";

}

function renderArticleCards(containerId, articles){

    const container =

        document.getElementById(containerId);

    if(!container) return;

    container.innerHTML = "";

    if(!articles.length){

        container.innerHTML = `

            <div class="empty-state">

                <h3>No articles found</h3>

            </div>

        `;

        return;

    }

    articles.forEach(article=>{

        const card =

            document.createElement("div");

        card.className="article-card";

        card.innerHTML=`

            <img src="${article.featured_image || 'https://placehold.co/600x400?text=EMerriment'}">

            <div class="article-content">

                <span>${article.category || "General"}</span>

                <h3>${article.title}</h3>

                <p>${article.summary || ""}</p>

                <a class="read-btn"

                href="article.html?slug=${article.slug}">

                Read Article →

                </a>

            </div>

        `;

        container.appendChild(card);

    });

}