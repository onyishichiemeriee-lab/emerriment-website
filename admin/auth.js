// ======================================
// EMerriment Authentication
// ======================================

const supabaseClient = window.supabaseClient;

// Display messages
function showMessage(message, type = "success") {
    const messageBox = document.getElementById("authMessage");

    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
}

// ======================================
// SIGN UP
// ======================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            return showMessage("Passwords do not match.", "error");
        }

        const { data, error } = await supabase.auth.signUp({

            email,
            password,

            options: {
                data: {
                    full_name: fullName
                }
            }

        });

        if (error) {
            return showMessage(error.message, "error");
        }

        // Save profile
        if (data.user) {

            await supabase
                .from("profiles")
                .upsert({
                    id: data.user.id,
                    full_name: fullName
                });

        }

        showMessage(
            "Account created successfully! Please check your email to verify your account.",
            "success"
        );

        signupForm.reset();

    });

}

// ======================================
// LOGIN
// ======================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        const { error } = await supabase.auth.signInWithPassword({

            email,
            password

        });

        if (error) {
            return showMessage(error.message, "error");
        }

        showMessage("Login successful!", "success");

        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 1000);

    });

}

// ======================================
// PASSWORD RESET
// ======================================

const forgotPasswordForm = document.getElementById("forgotPasswordForm");

if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("resetEmail").value.trim();

        const { error } = await supabase.auth.resetPasswordForEmail(email, {

            redirectTo: window.location.origin + "/update-password.html"

        });

        if (error) {
            return showMessage(error.message, "error");
        }

        showMessage(
            "Password reset link sent. Please check your email.",
            "success"
        );

        forgotPasswordForm.reset();

    });

}

// ======================================
// SESSION CHECK
// ======================================

async function checkSession() {

    const {

        data: { session }

    } = await supabase.auth.getSession();

    const currentPage = window.location.pathname;

    if (
        currentPage.includes("dashboard.html") &&
        !session
    ) {

        window.location.href = "login.html";

    }

}

checkSession();

// ======================================
// LOGOUT
// ======================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        await supabase.auth.signOut();

        window.location.href = "login.html";

    });

}