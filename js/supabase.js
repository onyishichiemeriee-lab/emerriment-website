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
   INITIALIZE SUPABASE
========================================= */

(function initializeSupabase() {

    /* -----------------------------------------
       Check Supabase Library
    ----------------------------------------- */

    if (!window.supabase) {

        console.error(
            "❌ Supabase library has not loaded."
        );

        return;

    }


    /* -----------------------------------------
       Prevent Duplicate Initialization
    ----------------------------------------- */

    if (window.supabaseClient) {

        console.log(
            "ℹ️ Supabase client already initialized."
        );

        return;

    }


    /* -----------------------------------------
       Create Client
    ----------------------------------------- */

    if (!window.EmerrimentSupabase) {

        console.error(
            "❌ /js/supabase-config.js has not loaded; no Supabase client created."
        );

        return;

    }

    const client =
        window.EmerrimentSupabase.createClient({
            auth: {

                persistSession: true,

                autoRefreshToken: true,

                detectSessionInUrl: true

            }
        });

    if (!client) {

        return;

    }

    window.supabaseClient = client;


    console.log(
        "✅ EMerriment Supabase client initialized."
    );

})();


/* =========================================
   GET SUPABASE CLIENT
========================================= */

function getSupabaseClient() {

    if (!window.supabaseClient) {

        console.error(
            "❌ Supabase client is not initialized."
        );

        return null;

    }

    return window.supabaseClient;

}


window.getSupabaseClient =
    getSupabaseClient;