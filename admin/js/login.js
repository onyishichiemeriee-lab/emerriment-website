const supabaseClient = window.supabase.createClient

// Wrap in DOMContentLoaded to ensure elements exist
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.onclick = async () => {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        document.getElementById("message").innerText = error.message;
        return;
      }

      window.location.href = "dashboard.html";
    };
  }
});