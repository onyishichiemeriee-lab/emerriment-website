const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

document.getElementById("loginBtn").onclick = async () => {

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  const { error } =
    await supabaseClient.auth.signInWithPassword({

      email,
      password

    });

  if (error) {

    document.getElementById("message").innerText =
      error.message;

    return;

  }

  window.location.href = "dashboard.html";

};