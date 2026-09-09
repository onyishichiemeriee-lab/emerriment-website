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
   CREATE CLIENT
========================================= */

if (!window.supabase) {

    console.error(
        "❌ Supabase library has not loaded."
    );

} else {

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