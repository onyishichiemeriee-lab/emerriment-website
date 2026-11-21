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

    console.error("❌ Invalid UUID");

    alert(
        "Invalid user ID."
    );

    window.location.href = "usersCMS.html";

    throw new Error(
        "Invalid user ID."
    );

}


console.log("✅ User details page opened.");


/* =========================================
   CHECK ADMIN
========================================= */

async function checkAdmin() {

    // Shared, fail-closed administrator check (admin/js/admin-guard.js):
    // nothing below runs unless the signed-in user is an administrator.
    const access = await window.EMAdminGuard.requireAdmin();

    if (!access) return;

        loadUser();

        loadQuizHistory();

}


/* =========================================
   LOAD USER
========================================= */

async function loadUser() {

    console.log("Loading user");


    const {
        data,
        error
    } = await supabaseClient

        .from("profiles")

        .select("*")

        .eq("id", userId)

        .maybeSingle();


    if (error) {

        console.error("❌ Failed to load user:", window.EMAdminGuard.safeError(error));

        alert(
            error.message
        );

        return;

    }


    if (!data) {

        console.warn("⚠️ No profile found");

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


    console.log("✅ User loaded");

}


/* =========================================
   LOAD QUIZ HISTORY
========================================= */

async function loadQuizHistory() {

    console.log("Loading quiz history");


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

        console.error("❌ Quiz history error:", window.EMAdminGuard.safeError(error));

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

                    console.error("❌ user-detailsCMS request failed:", window.EMAdminGuard.safeError(error));

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


                // Administrator access can only be changed through
                // this database function, which checks that the
                // caller is an administrator and never removes the
                // last one. Direct updates of is_admin are refused.
                // (supabase/migrations/20261113090000_emerriment_production_hardening.sql)
                const {
                    error: updateError
                } = await supabaseClient

                    .rpc("emerriment_set_admin", {

                        target_user: userId,

                        make_admin: !data.is_admin

                    });


                if (updateError) {

                    console.error("❌ user-detailsCMS request failed:", window.EMAdminGuard.safeError(updateError));

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

                console.error("Toggle admin error:", window.EMAdminGuard.safeError(error));

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