/* ============================================================
   EMerriment Admin Dashboard
   Part 1 — Foundation
============================================================ */

// ------------------------------------------------------------
// Global Variables
// ------------------------------------------------------------

supabaseClient.auth.getSession()

let subscribers = [];
let currentAdmin = null;

let concernChart = null;
let journeyChart = null;
let growthChart = null;
let emailChart = null;


// ------------------------------------------------------------
// Initialize Dashboard
// ------------------------------------------------------------

document.addEventListener(
"DOMContentLoaded",
async()=>{


const authenticated =
await checkAdminSession();


if(!authenticated){

return;

}


initializeDashboard();


});


// ------------------------------------------------------------
// Verify Admin Login
// ------------------------------------------------------------

async function checkAdminSession(){

try {

const {
data:{
session
}

} = await supabaseClient.auth.getSession();


if(!session){

window.location.href="login.html";

return false;

}


return true;


}catch(error){

console.error(
"Auth check failed:",
error
);

return false;

}


}


// ------------------------------------------------------------
// Dashboard Startup
// ------------------------------------------------------------

async function initializeDashboard() {

    showLoading(true);

    await loadSubscribers();

    updateDashboardCards();

    showLoading(false);

}


// ------------------------------------------------------------
// Load Subscribers
// ------------------------------------------------------------

async function loadSubscribers() {

    const {

        data,

        error

    } = await supabaseClient

        .from("leads")

        .select("*")

        .order("submitted_at", {

            ascending: false

        });

    if (error) {

        console.error(error);

        throw error;

    }

    subscribers = data || [];

}


// ------------------------------------------------------------
// Dashboard Cards
// ------------------------------------------------------------

function updateDashboardCards() {

    setText(

        "totalSubscribers",

        subscribers.length

    );

    const pending = subscribers.filter(

        x => x.email_status === "Pending"

    ).length;

    setText(

        "pendingEmails",

        pending

    );

    const completed = subscribers.filter(

        x =>

        Number(x.email_sequence_day) > 14

    ).length;

    setText(

        "completedJourney",

        completed

    );

    const concerns = {};

    subscribers.forEach(sub => {

        const key =

            sub.concern || "Unknown";

        concerns[key] =

            (concerns[key] || 0) + 1;

    });

    let topConcern = "-";

    let highest = 0;

    for (const concern in concerns) {

        if (concerns[concern] > highest) {

            highest = concerns[concern];

            topConcern = concern;

        }

    }

    setText(

        "topConcern",

        topConcern

    );

}


// ------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------

function setText(id, value) {

    const element =

        document.getElementById(id);

    if (element) {

        element.textContent = value;

    }

}

function showLoading(show) {

    const loader =

        document.getElementById("loading");

    if (!loader) return;

    loader.style.display =

        show

        ? "flex"

        : "none";

}

function showError(message) {

    console.error(message);

    alert(message);

}

/* ============================================================
   Part 2 — Subscriber Management
============================================================ */


// ------------------------------------------------------------
// Render Subscriber Table
// ------------------------------------------------------------

function renderSubscriberTable(data = subscribers) {

    const table = document.getElementById(
        "subscriberTable"
    );

    if (!table) return;


    table.innerHTML = "";


    if (!data.length) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No subscribers found.
                </td>
            </tr>
        `;

        return;

    }


    data.forEach(subscriber => {


        const row = document.createElement("tr");


        row.innerHTML = `

            <td>
                ${subscriber.name || "-"}
            </td>

            <td>
                ${subscriber.email || "-"}
            </td>

            <td>
                ${subscriber.skin_type || "-"}
            </td>

            <td>
                ${subscriber.concern || "-"}
            </td>

            <td>
                ${subscriber.email_sequence_day || 0}
            </td>

            <td>
                ${subscriber.email_status || "-"}
            </td>

            <td>

                <button 
                class="viewBtn"
                data-id="${subscriber.id}">

                    View

                </button>

            </td>

        `;


        table.appendChild(row);


    });


    attachViewButtons();

}



// ------------------------------------------------------------
// Attach View Buttons
// ------------------------------------------------------------

function attachViewButtons(){


    const buttons = document.querySelectorAll(
        ".viewBtn"
    );


    buttons.forEach(button => {


        button.addEventListener(
            "click",
            () => {

                const id =
                button.dataset.id;


                viewSubscriber(id);

            }
        );


    });


}



// ------------------------------------------------------------
// View Subscriber Modal
// ------------------------------------------------------------

function viewSubscriber(id){


    const subscriber = subscribers.find(
        user => user.id === id
    );


    if(!subscriber){

        console.error(
            "Subscriber not found"
        );

        return;

    }



    const details =
    document.getElementById(
        "subscriberDetails"
    );


    if(!details) return;



    details.innerHTML = `

        <p>
        <strong>Name:</strong>
        ${subscriber.name || "-"}
        </p>


        <p>
        <strong>Email:</strong>
        ${subscriber.email || "-"}
        </p>


        <p>
        <strong>Skin Type:</strong>
        ${subscriber.skin_type || "-"}
        </p>


        <p>
        <strong>Main Concern:</strong>
        ${subscriber.concern || "-"}
        </p>


        <p>
        <strong>Oil Level:</strong>
        ${subscriber.oil_level || "-"}
        </p>


        <p>
        <strong>Sensitivity:</strong>
        ${subscriber.sensitivity || "-"}
        </p>


        <p>
        <strong>Skin Score:</strong>
        ${subscriber.score || "-"}
        </p>


        <p>
        <strong>Recommendation:</strong>
        ${subscriber.recommendation || "-"}
        </p>


        <p>
        <strong>Email Status:</strong>
        ${subscriber.email_status || "-"}
        </p>


        <p>
        <strong>Joined:</strong>
        ${subscriber.submitted_at || "-"}
        </p>


    `;


    const modal =
    document.getElementById(
        "subscriberModal"
    );


    if(modal){

        modal.style.display = "block";

    }


}



// ------------------------------------------------------------
// Close Modal
// ------------------------------------------------------------

function setupModal(){


    const close =
    document.getElementById(
        "closeModal"
    );


    const modal =
    document.getElementById(
        "subscriberModal"
    );


    if(close && modal){


        close.onclick = () => {

            modal.style.display =
            "none";

        };


        window.onclick = event => {


            if(event.target === modal){

                modal.style.display =
                "none";

            }


        };


    }


}



// ------------------------------------------------------------
// Live Search
// ------------------------------------------------------------

function setupSearch(){


    const search =
    document.getElementById(
        "search"
    );


    if(!search) return;



    search.addEventListener(
        "input",
        event => {


            const value =
            event.target.value
            .toLowerCase();



            const filtered =
            subscribers.filter(user => {


                return (

                    user.name
                    ?.toLowerCase()
                    .includes(value)

                    ||

                    user.email
                    ?.toLowerCase()
                    .includes(value)

                    ||

                    user.concern
                    ?.toLowerCase()
                    .includes(value)

                );


            });



            renderSubscriberTable(
                filtered
            );


        }
    );


}



// ------------------------------------------------------------
// Refresh Dashboard Data
// ------------------------------------------------------------

async function refreshSubscribers(){


    try{


        showLoading(true);


        await loadSubscribers();


        renderSubscriberTable();


        updateDashboardCards();


        showLoading(false);



    }catch(error){


        console.error(
            "Refresh failed:",
            error
        );


        showError(
            "Unable to refresh subscribers"
        );


    }


}

/* ============================================================
   Part 3 — Analytics Charts
============================================================ */


// ------------------------------------------------------------
// Concern Distribution Chart
// ------------------------------------------------------------

function renderConcernChart(data) {


    const canvas =
    document.getElementById(
        "concernChart"
    );


    if(!canvas) return;


    const concerns = {};


    data.forEach(user => {


        const concern =
        user.concern || "Unknown";


        concerns[concern] =
        (concerns[concern] || 0) + 1;


    });



    if(concernChart){

        concernChart.destroy();

    }



    concernChart = new Chart(
        canvas,
        {

            type:"doughnut",

            data:{

                labels:
                Object.keys(concerns),

                datasets:[{

                    label:
                    "Skin Concerns",

                    data:
                    Object.values(concerns)

                }]

            },

            options:{

                responsive:true,

                plugins:{

                    legend:{

                        position:"bottom"

                    }

                }

            }

        }
    );

}



// ------------------------------------------------------------
// Skin Journey Chart
// ------------------------------------------------------------

function renderJourneyChart(data){


    const canvas =
    document.getElementById(
        "journeyChart"
    );


    if(!canvas) return;



    const journey = {


        completed:0,

        ongoing:0,

        new:0


    };



    data.forEach(user=>{


        const day =
        Number(
            user.email_sequence_day || 0
        );


        if(day > 14){

            journey.completed++;

        }

        else if(day > 0){

            journey.ongoing++;

        }

        else{

            journey.new++;

        }


    });



    if(journeyChart){

        journeyChart.destroy();

    }



    journeyChart = new Chart(

        canvas,

        {


            type:"bar",


            data:{


                labels:[

                    "Completed",

                    "Ongoing",

                    "New"

                ],


                datasets:[{


                    label:
                    "Skin Journey",


                    data:[

                        journey.completed,

                        journey.ongoing,

                        journey.new

                    ]


                }]


            },


            options:{


                responsive:true


            }


        }

    );


}



// ------------------------------------------------------------
// Subscriber Growth Chart
// ------------------------------------------------------------

function renderGrowthChart(data){


    const canvas =
    document.getElementById(
        "growthChart"
    );


    if(!canvas) return;



    const monthly = {};



    data.forEach(user=>{


        if(!user.submitted_at)
        return;



        const month =
        new Date(
            user.submitted_at
        )

        .toLocaleString(
            "default",
            {
                month:"short"
            }
        );



        monthly[month] =
        (monthly[month] || 0)+1;



    });



    if(growthChart){

        growthChart.destroy();

    }



    growthChart = new Chart(

        canvas,

        {


            type:"line",


            data:{


                labels:
                Object.keys(monthly),


                datasets:[{


                    label:
                    "New Subscribers",


                    data:
                    Object.values(monthly),


                    tension:.3


                }]


            },


            options:{


                responsive:true


            }


        }

    );


}



// ------------------------------------------------------------
// Email Performance Chart
// ------------------------------------------------------------

function renderEmailChart(data){


    const canvas =
    document.getElementById(
        "emailChart"
    );


    if(!canvas) return;



    const sent =
    data.filter(

        user =>
        user.email_status === "Sent"

    ).length;



    const pending =
    data.filter(

        user =>
        user.email_status === "Pending"

    ).length;




    if(emailChart){

        emailChart.destroy();

    }



    emailChart = new Chart(

        canvas,

        {


            type:"pie",


            data:{


                labels:[

                    "Sent",

                    "Pending"

                ],


                datasets:[{


                    data:[

                        sent,

                        pending

                    ]


                }]


            },


            options:{


                responsive:true


            }


        }

    );


}



// ------------------------------------------------------------
// Completion Progress
// ------------------------------------------------------------

function updateCompletionBar(data){


    const bar =
    document.getElementById(
        "completionBar"
    );


    const text =
    document.getElementById(
        "completionText"
    );



    if(!bar || !text)
    return;



    const completed =
    data.filter(

        user =>
        Number(
            user.email_sequence_day
        ) > 14

    ).length;



    const percent =
    Math.round(

        (completed /
        (data.length || 1))
        *100

    );



    bar.style.width =
    percent + "%";



    text.textContent =
    percent + "% Completed";


}

/* ============================================================
   Part 4 — Dashboard Tools
============================================================ */


// ------------------------------------------------------------
// Refresh Dashboard
// ------------------------------------------------------------

async function refreshDashboard(){

    try{

        showLoading(true);


        await loadSubscribers();


        updateDashboardCards();


        renderSubscriberTable(
            subscribers
        );


        renderConcernChart(
            subscribers
        );


        renderJourneyChart(
            subscribers
        );


        renderGrowthChart(
            subscribers
        );


        renderEmailChart(
            subscribers
        );


        updateCompletionBar(
            subscribers
        );


        showNotification(
            "Dashboard updated successfully",
            "success"
        );


        showLoading(false);


    }
    catch(error){

        console.error(
            "Refresh error:",
            error
        );


        showNotification(
            "Unable to refresh dashboard",
            "error"
        );


        showLoading(false);

    }

}



// ------------------------------------------------------------
// Export Subscribers CSV
// ------------------------------------------------------------

function exportSubscribersCSV(){


    if(!subscribers.length){

        showNotification(
            "No subscribers available",
            "error"
        );

        return;

    }


    const headers = [

        "Name",

        "Email",

        "Skin Type",

        "Concern",

        "Email Day",

        "Email Status",

        "Joined"

    ];



    const rows = subscribers.map(user => [

        user.name || "",

        user.email || "",

        user.skin_type || "",

        user.concern || "",

        user.email_sequence_day || "",

        user.email_status || "",

        user.submitted_at || ""

    ]);



    let csvContent = [

        headers,

        ...rows

    ]

    .map(row =>

        row.join(",")

    )

    .join("\n");



    const blob = new Blob(

        [csvContent],

        {

            type:"text/csv"

        }

    );


    const url =
    URL.createObjectURL(blob);



    const link =
    document.createElement("a");



    link.href = url;


    link.download =
    "emerriment-subscribers.csv";



    link.click();



    URL.revokeObjectURL(url);



    showNotification(

        "CSV exported successfully",

        "success"

    );


}



// ------------------------------------------------------------
// Subscriber Filter
// ------------------------------------------------------------

function filterSubscribers(type){


    let filtered = subscribers;



    if(type === "completed"){


        filtered =
        subscribers.filter(user =>

            Number(
                user.email_sequence_day
            ) > 14

        );


    }



    if(type === "pending"){


        filtered =
        subscribers.filter(user =>

            user.email_status === "Pending"

        );


    }



    if(type === "new"){


        filtered =
        subscribers.filter(user =>

            Number(
                user.email_sequence_day
            ) === 0

        );


    }



    renderSubscriberTable(
        filtered
    );


}



// ------------------------------------------------------------
// Logout Admin
// ------------------------------------------------------------

async function logoutAdmin(){


    try{


        await supabaseClient.auth.signOut();


        window.location.href =
        "login.html";


    }
    catch(error){


        console.error(
            "Logout failed",
            error
        );


    }

}



// ------------------------------------------------------------
// Notification System
// ------------------------------------------------------------

function showNotification(
    message,
    type="success"
){


    let notification =
    document.getElementById(
        "dashboardNotification"
    );



    if(!notification){


        notification =
        document.createElement(
            "div"
        );


        notification.id =
        "dashboardNotification";


        document.body.appendChild(
            notification
        );


    }



    notification.className =
    `notification ${type}`;



    notification.textContent =
    message;



    notification.style.display =
    "block";



    setTimeout(()=>{


        notification.style.display =
        "none";


    },3000);



}



// ------------------------------------------------------------
// Button Event Setup
// ------------------------------------------------------------

function setupDashboardTools(){


    const refreshBtn =
    document.getElementById(
        "refreshDashboard"
    );


    if(refreshBtn){

        refreshBtn.onclick =
        refreshDashboard;

    }



    const exportBtn =
    document.getElementById(
        "exportCSV"
    );


    if(exportBtn){

        exportBtn.onclick =
        exportSubscribersCSV;

    }



    const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


    if(logoutBtn){

        logoutBtn.onclick =
        logoutAdmin;

    }



}

/* ============================================================
   Part 5 — Production Polish
============================================================ */


// ------------------------------------------------------------
// Safe Text Rendering
// Prevents broken UI from missing data
// ------------------------------------------------------------

function safeText(value){

    if(value === null || value === undefined || value === ""){

        return "-";

    }

    return value;

}



// ------------------------------------------------------------
// Improved Loading State
// ------------------------------------------------------------

function setDashboardLoading(state){


    const dashboard =
    document.querySelector(
        ".dashboard-container"
    );


    if(!dashboard) return;



    if(state){

        dashboard.classList.add(
            "loading"
        );

    }

    else{

        dashboard.classList.remove(
            "loading"
        );

    }

}



// ------------------------------------------------------------
// Empty State Handler
// ------------------------------------------------------------

function showEmptyState(
    elementId,
    message
){

    const element =
    document.getElementById(
        elementId
    );


    if(!element) return;



    element.innerHTML = `

        <div class="empty-state">

            <h3>
                Nothing here yet
            </h3>

            <p>
                ${message}
            </p>

        </div>

    `;


}



// ------------------------------------------------------------
// Global Error Handler
// ------------------------------------------------------------

window.addEventListener(
    "error",
    function(event){


        console.error(
            "Dashboard Error:",
            event.error
        );


    }
);



// ------------------------------------------------------------
// Network Check
// ------------------------------------------------------------

async function checkConnection(){


    try{


        const {
            data,
            error
        } = await supabaseClient
        .from("leads")
        .select("id")
        .limit(1);



        if(error){

            throw error;

        }


        return true;


    }

    catch(error){


        console.error(
            "Database connection failed",
            error
        );


        showNotification(
            "Database connection problem",
            "error"
        );


        return false;

    }

}



// ------------------------------------------------------------
// Dashboard Health Check
// ------------------------------------------------------------

async function dashboardHealthCheck(){


    const connected =
    await checkConnection();



    const status =
    document.getElementById(
        "systemStatus"
    );


    if(!status) return;



    if(connected){


        status.innerHTML = `

            🟢 System Online

        `;


    }

    else{


        status.innerHTML = `

            🔴 Connection Issue

        `;


    }


}



// ------------------------------------------------------------
// Prevent Multiple Loading Requests
// ------------------------------------------------------------

let dashboardLoading = false;



async function safeRefresh(){


    if(dashboardLoading){

        return;

    }


    dashboardLoading = true;


    await refreshDashboard();


    dashboardLoading = false;


}



// ------------------------------------------------------------
// Final Dashboard Startup
// ------------------------------------------------------------

async function startDashboard(){


    try{


        setDashboardLoading(true);



        const connected =
        await checkConnection();



        if(!connected){

            return;

        }



        await startDashboard();



        await dashboardHealthCheck();



        setDashboardLoading(false);



    }


    catch(error){


        console.error(
            "Dashboard failed:",
            error
        );


        showNotification(
            "Dashboard failed to load",
            "error"
        );


        setDashboardLoading(false);


    }


}