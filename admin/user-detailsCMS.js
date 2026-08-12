const supabaseClient = window.supabaseClient;

const userId = new URLSearchParams(window.location.search).get("id");

// ----------------------
// Check Admin
// ----------------------

async function checkAdmin() {

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {

        window.location.href = "loginCMS.html";
        return;

    }

    const { data: profile } = await supabase

        .from("profiles")

        .select("is_admin")

        .eq("id", user.id)

        .single();

    if (!profile?.is_admin) {

        window.location.href = "../dashboardCMS.html";
        return;

    }

    loadUser();

    loadQuizHistory();

}

// ----------------------
// Load User
// ----------------------

async function loadUser() {

    const { data, error } = await supabase

        .from("profiles")

        .select("*")

        .eq("id", userId)

        .single();

    if (error) {

        alert(error.message);

        return;

    }

    document.getElementById("userName").textContent =
        data.full_name || "Unknown User";

    document.getElementById("userEmail").textContent =
        data.email || "-";

    document.getElementById("joinedDate").textContent =
        new Date(data.created_at).toLocaleDateString();

    document.getElementById("skinType").textContent =
        data.current_skin_type || "-";

    document.getElementById("skinConcern").textContent =
        data.current_concern || "-";

    document.getElementById("skinScore").textContent =
        data.current_skin_score || "-";

    document.getElementById("adminStatus").textContent =
        data.is_admin ? "Yes ✅" : "No";

}

// ----------------------
// Quiz History
// ----------------------

async function loadQuizHistory() {

    const { data, error } = await supabase

        .from("quiz_results")

        .select("*")

        .eq("user_id", userId)

        .order("created_at", { ascending: false });

    if (error) {

        console.error(error);

        return;

    }

    const tbody = document.getElementById("quizHistory");

    tbody.innerHTML = "";

    if (!data.length) {

        tbody.innerHTML = `
        <tr>
            <td colspan="4">No quiz history found.</td>
        </tr>
        `;

        return;

    }

    data.forEach(item => {

        tbody.innerHTML += `

        <tr>

            <td>${new Date(item.created_at).toLocaleDateString()}</td>

            <td>${item.score}</td>

            <td>${item.skin_type}</td>

            <td>${item.concern}</td>

        </tr>

        `;

    });

}

// ----------------------
// Toggle Admin
// ----------------------

document.getElementById("toggleAdminBtn").addEventListener("click", async () => {

    const { data } = await supabase

        .from("profiles")

        .select("is_admin")

        .eq("id", userId)

        .single();

    const { error } = await supabase

        .from("profiles")

        .update({

            is_admin: !data.is_admin

        })

        .eq("id", userId);

    if (error) {

        alert(error.message);

        return;

    }

    alert("Admin status updated.");

    loadUser();

});

// ----------------------
// Logout
// ----------------------

document.getElementById("logoutBtn").addEventListener("click", async () => {

    await supabase.auth.signOut();

    window.location.href = "loginCMS.html";

});

checkAdmin();