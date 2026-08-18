/* =========================================
   EMerriment CMS
   Users Controller
========================================= */

const supabaseClient = window.supabaseClient;

let users = [];


/* =========================================
   CHECK ADMIN
========================================= */

async function checkAdmin() {

    try {

        console.log("🔐 Checking CMS admin access...");

        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();


        if (authError) {

            console.error(
                "❌ Auth error:",
                authError
            );

            location.href = "loginCMS.html";

            return;

        }


        if (!user) {

            console.warn(
                "⚠️ No logged-in user."
            );

            location.href = "loginCMS.html";

            return;

        }


        console.log(
            "👤 Logged-in user:",
            user.id,
            user.email
        );


        const {
            data: profile,
            error: profileError
        } = await supabaseClient

            .from("profiles")

            .select("id, email, full_name, is_admin")

            .eq("id", user.id)

            .maybeSingle();


        if (profileError) {

            console.error(
                "❌ Profile query error:",
                profileError
            );

            alert(
                "Unable to verify CMS permissions: " +
                profileError.message
            );

            return;

        }


        console.log(
            "📋 Admin profile:",
            profile
        );


        if (!profile) {

            alert(
                "Your account does not have a profile record."
            );

            return;

        }


        if (profile.is_admin !== true) {

            alert(
                "You do not have permission to access the CMS."
            );

            location.href = "../dashboardCMS.html";

            return;

        }


        console.log(
            "✅ CMS admin access granted."
        );


        loadUsers();

    }

    catch(error) {

        console.error(
            "❌ CMS authorization error:",
            error
        );

        alert(
            "Something went wrong while checking CMS access."
        );

    }

}

/* =========================================
   LOAD USERS
========================================= */

async function loadUsers() {

    console.log(
        "Loading registered users..."
    );


    const {
        data,
        error
    } = await supabaseClient

        .from("profiles")

        .select("*")

        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "❌ Failed to load users:",
            error
        );

        return;

    }


    users = data || [];


    console.log(
        `✅ Loaded ${users.length} users.`
    );


    renderUsers(users);

}


/* =========================================
   RENDER USERS
========================================= */

function renderUsers(data) {

    const tbody =
        document.getElementById(
            "usersBody"
        );


    if (!tbody) {

        console.error(
            "❌ usersBody element not found."
        );

        return;

    }


    tbody.innerHTML = "";


    if (!data || data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="padding:20px;text-align:center;">
                    No users found.
                </td>
            </tr>
        `;

        return;

    }


    data.forEach(user => {

        /* -------------------------------------
           Make sure user has a valid ID
        ------------------------------------- */

        if (!user.id) {

            console.warn(
                "⚠️ User has no ID:",
                user
            );

            return;

        }


        const row =
            document.createElement("tr");


        /* Name */

        const nameCell =
            document.createElement("td");

        nameCell.textContent =
            user.full_name || "Unknown";


        /* Email */

        const emailCell =
            document.createElement("td");

        emailCell.textContent =
            user.email || "-";


        /* Skin Type */

        const skinCell =
            document.createElement("td");

        skinCell.textContent =
            user.current_skin_type || "-";


        /* Joined */

        const joinedCell =
            document.createElement("td");

        joinedCell.textContent =
            user.created_at
                ? new Date(
                    user.created_at
                ).toLocaleDateString()
                : "-";


        /* Details */

        const detailsCell =
            document.createElement("td");


        const viewButton =
            document.createElement("button");


        viewButton.textContent =
            "View";


        viewButton.type =
            "button";


        viewButton.addEventListener(
            "click",
            () => {

                viewUser(user.id);

            }
        );


        detailsCell.appendChild(
            viewButton
        );


        row.appendChild(nameCell);

        row.appendChild(emailCell);

        row.appendChild(skinCell);

        row.appendChild(joinedCell);

        row.appendChild(detailsCell);


        tbody.appendChild(row);

    });

}


/* =========================================
   SEARCH
========================================= */

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        event => {

            const keyword =
                event.target.value
                    .trim()
                    .toLowerCase();


            const filtered =
                users.filter(user => {

                    const name =
                        (
                            user.full_name ||
                            ""
                        )
                        .toLowerCase();


                    const email =
                        (
                            user.email ||
                            ""
                        )
                        .toLowerCase();


                    return (
                        name.includes(keyword) ||
                        email.includes(keyword)
                    );

                });


            renderUsers(
                filtered
            );

        }
    );

}


/* =========================================
   VIEW USER
========================================= */

function viewUser(id) {

    console.log(
        "Opening user:",
        id
    );


    /* -------------------------------------
       Prevent null / undefined IDs
    ------------------------------------- */

    if (
        !id ||
        id === "null" ||
        id === "undefined"
    ) {

        console.error(
            "❌ Cannot open user. Invalid ID:",
            id
        );


        alert(
            "This user does not have a valid ID."
        );


        return;

    }


    /* -------------------------------------
       UUID validation
    ------------------------------------- */

    const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


    if (!uuidPattern.test(id)) {

        console.error(
            "❌ Invalid UUID:",
            id
        );


        alert(
            "Invalid user ID."
        );


        return;

    }


    /* -------------------------------------
       Open User Details
    ------------------------------------- */

    window.location.href =
        `user-detailsCMS.html?id=${encodeURIComponent(id)}`;

}


/* =========================================
   LOGOUT
========================================= */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await supabaseClient.auth.signOut();

                window.location.href =
                    "loginCMS.html";

            }

            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        }
    );

}


/* =========================================
   START
========================================= */

checkAdmin();