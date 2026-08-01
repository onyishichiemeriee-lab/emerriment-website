// ==========================================
// EMerriment Admin Authentication
// ==========================================

const supabase = window.supabaseClient;

const form = document.getElementById("adminLoginForm");
const message = document.getElementById("message");

function showMessage(text, type = "error") {

    message.textContent = text;
    message.className = type;

}

form?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    // Login
    const { error } = await supabase.auth.signInWithPassword({

        email,
        password

    });

    if (error) {

        showMessage(error.message);

        return;

    }

    // Get logged-in user
    const {

        data: { user }

    } = await supabase.auth.getUser();

    // Check admin permission
    const { data: profile, error: profileError } = await supabase

        .from("profiles")

        .select("is_admin")

        .eq("id", user.id)

        .single();

    if (profileError || !profile?.is_admin) {

        await supabase.auth.signOut();

        showMessage("Access denied. Administrator account required.");

        return;

    }

    showMessage("Login successful!", "success");

    setTimeout(() => {

        window.location.href = "dashboardCMS.html";

    }, 1000);

});