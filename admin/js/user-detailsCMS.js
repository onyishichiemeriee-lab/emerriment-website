/* =========================================
   EMerriment CMS
   User Details Controller
========================================= */

const supabaseClient = window.supabaseClient;


/* =========================================
   GET USER ID
========================================= */

const params = new URLSearchParams(
    window.location.search
);

const userId = params.get("id");


/* =========================================
   VALIDATE USER ID
========================================= */

if (
    !userId ||
    userId === "null" ||
    userId === "undefined"
) {

    console.error(
        "❌ No valid user ID was provided."
    );

    alert(
        "Unable to open this user's details. No valid user ID was provided."
    );

    window.location.href = "usersCMS.html";

    throw new Error(
        "Invalid or missing user ID."
    );

}


/* =========================================
   UUID VALIDATION
========================================= */

const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


if (!uuidPattern.test(userId)) {

    console.error(
        "❌ Invalid UUID:",
        userId
    );

    alert(
        "Invalid user ID."
    );

    window.location.href = "usersCMS.html";

    throw new Error(
        "Invalid UUID: " + userId
    );

}


console.log(
    "✅ User Details ID:",
    userId
);


/* =========================================
   CHECK ADMIN
========================================= */

async function checkAdmin() {

    try {

        const {
            data: {
                user
            },
            error: authError
        } = await supabaseClient.auth.getUser();


        if (authError) {

            console.error(
                "Authentication error:",
                authError
            );

            window.location.href =
                "loginCMS.html";

            return;

        }


        if (!user) {

            console.warn(
                "No authenticated user."
            );

            window.location.href =
                "loginCMS.html";

            return;

        }


        /* -------------------------------------
           CHECK ADMIN PROFILE
        ------------------------------------- */

        const {
    data: profile,
    error: profileError
} = await supabaseClient

    .from("profiles")

    .select("is_admin")

    .eq("id", user.id)

    .maybeSingle();


if (profileError) {

    console.error(
        "Admin check failed:",
        profileError
    );

    alert(
        "Unable to verify CMS permissions."
    );

    return;

}


if (!profile || profile.is_admin !== true) {

    alert(
        "You do not have permission to access the CMS."
    );

    location.href = "loginCMS.html";

    return;

}


        loadUser();

        loadQuizHistory();

    }

    catch (error) {

        console.error(
            "checkAdmin error:",
            error
        );

        window.location.href =
            "loginCMS.html";

    }

}


/* =========================================
   LOAD USER
========================================= */

async function loadUser() {

    console.log(
        "Loading user:",
        userId
    );


    const {
        data,
        error
    } = await supabaseClient

        .from("profiles")

        .select("*")

        .eq("id", userId)

        .maybeSingle();


    if (error) {

        console.error(
            "❌ Failed to load user:",
            error
        );

        alert(
            error.message
        );

        return;

    }


    if (!data) {

        console.warn(
            "⚠️ No profile found for:",
            userId
        );

        document.getElementById(
            "userName"
        ).textContent =
            "User not found";

        return;

    }


    /* -------------------------------------
       DISPLAY USER
    ------------------------------------- */

    document.getElementById(
        "userName"
    ).textContent =
        data.full_name || "Unknown User";


    document.getElementById(
        "userEmail"
    ).textContent =
        data.email || "-";


    document.getElementById(
        "joinedDate"
    ).textContent =
        data.created_at
            ? new Date(
                data.created_at
            ).toLocaleDateString()
            : "-";


    document.getElementById(
        "skinType"
    ).textContent =
        data.current_skin_type || "-";


    document.getElementById(
        "skinConcern"
    ).textContent =
        data.current_concern || "-";


    document.getElementById(
        "skinScore"
    ).textContent =
        data.current_skin_score ?? "-";


    document.getElementById(
        "adminStatus"
    ).textContent =
        data.is_admin
            ? "Yes ✅"
            : "No";


    console.log(
        "✅ User loaded:",
        data
    );

}


/* =========================================
   LOAD QUIZ HISTORY
========================================= */

async function loadQuizHistory() {

    console.log(
        "Loading quiz history for:",
        userId
    );


    const {
        data,
        error
    } = await supabaseClient

        .from("quiz_results")

        .select("*")

        .eq("user_id", userId)

        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "❌ Quiz history error:",
            error
        );

        return;

    }


    const tbody =
        document.getElementById(
            "quizHistory"
        );


    tbody.innerHTML = "";


    if (!data || data.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4"
                    style="padding:20px;text-align:center;">
                    No quiz history found.
                </td>
            </tr>
        `;

        return;

    }


    data.forEach(item => {

        const row =
            document.createElement("tr");


        const dateCell =
            document.createElement("td");

        const scoreCell =
            document.createElement("td");

        const skinTypeCell =
            document.createElement("td");

        const concernCell =
            document.createElement("td");


        dateCell.textContent =
            item.created_at
                ? new Date(
                    item.created_at
                ).toLocaleDateString()
                : "-";


        scoreCell.textContent =
            item.score ?? "-";


        skinTypeCell.textContent =
            item.skin_type || "-";


        concernCell.textContent =
            item.concern || "-";


        row.appendChild(dateCell);

        row.appendChild(scoreCell);

        row.appendChild(skinTypeCell);

        row.appendChild(concernCell);


        tbody.appendChild(row);

    });


    console.log(
        `✅ Loaded ${data.length} quiz results.`
    );

}


/* =========================================
   TOGGLE ADMIN ACCESS
========================================= */

document
    .getElementById("toggleAdminBtn")
    .addEventListener(
        "click",
        async () => {

            try {

                const {
                    data,
                    error
                } = await supabaseClient

                    .from("profiles")

                    .select("is_admin")

                    .eq("id", userId)

                    .maybeSingle();


                if (error) {

                    console.error(
                        error
                    );

                    alert(
                        error.message
                    );

                    return;

                }


                if (!data) {

                    alert(
                        "User profile not found."
                    );

                    return;

                }


                const {
                    error: updateError
                } = await supabaseClient

                    .from("profiles")

                    .update({

                        is_admin:
                            !data.is_admin

                    })

                    .eq("id", userId);


                if (updateError) {

                    console.error(
                        updateError
                    );

                    alert(
                        updateError.message
                    );

                    return;

                }


                alert(
                    "Admin status updated successfully."
                );


                await loadUser();

            }

            catch (error) {

                console.error(
                    "Toggle admin error:",
                    error
                );

            }

        }
    );


/* =========================================
   LOGOUT
========================================= */

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            window.location.href =
                "loginCMS.html";

        }
    );


/* =========================================
   START
========================================= */

checkAdmin();