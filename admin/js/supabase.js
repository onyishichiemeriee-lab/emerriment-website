/* =========================================
   EMerriment Supabase Client
   Authentication V2
========================================= */

"use strict";


/* =========================================
   SUPABASE CONFIGURATION
   The project URL and public key come from the per-deploy runtime
   configuration, checked by /js/supabase-config.js (loaded first by
   every page). Nothing is hard-coded here and there is no fallback:
   without a valid configuration no client is created.
========================================= */


/* =========================================
   CREATE CLIENT
========================================= */

if (!window.supabase) {

    console.error(
        "❌ Supabase library has not loaded."
    );

} else if (!window.EmerrimentSupabase) {

    console.error(
        "❌ /js/supabase-config.js has not loaded; no Supabase client created."
    );

} else {

    const client =
        window.EmerrimentSupabase.createClient({
            auth: {

                persistSession: true,

                autoRefreshToken: true,

                detectSessionInUrl: true

            }
        });

    if (client) {
        window.supabaseClient = client;
    }

}


/* =========================================
   SUPABASE CLIENT CHECK
========================================= */

if (window.supabaseClient) {

    console.log(
        "✅ EMerriment Supabase client initialized."
    );

} else {

    console.error(
        "❌ EMerriment Supabase client failed to initialize."
    );

}
