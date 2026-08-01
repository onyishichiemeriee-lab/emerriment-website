// ===============================
// EMerriment Supabase Configuration
// ===============================

// Replace these with your own Supabase credentials
const SUPABASE_URL = "https://ioeulnjrozkbetaongbv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZXVsbmpyb3prYmV0YW9uZ2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjQxMzQsImV4cCI6MjA5NTMwMDEzNH0.I3WhW8lnThCZVo1bFHwbl6X8t5xT9tspnTdoR3nlSNc";

// Initialize Supabase Client
const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// Make the client available globally
window.supabaseClient = supabase;

// Check connection (optional)
(async () => {
    try {
        const {
            data: { session },
            error
        } = await supabase.auth.getSession();

        if (error) {
            console.error("Supabase Connection Error:", error.message);
        } else {
            console.log("✅ Supabase connected successfully.");
        }
    } catch (err) {
        console.error("Unexpected Error:", err.message);
    }
})();