/* =========================================
   EMerriment Supabase Client
   Authentication V2
========================================= */

"use strict";


/* =========================================
   SUPABASE CONFIGURATION
========================================= */

const SUPABASE_URL =
    "https://ioeulnjrozkbetaongbv.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZXVsbmpyb3prYmV0YW9uZ2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjQxMzQsImV4cCI6MjA5NTMwMDEzNH0.I3WhW8lnThCZVo1bFHwbl6X8t5xT9tspnTdoR3nlSNc";


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

    window.supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
            {
                auth: {

                    persistSession: true,

                    autoRefreshToken: true,

                    detectSessionInUrl: true

                }
            }
        );


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