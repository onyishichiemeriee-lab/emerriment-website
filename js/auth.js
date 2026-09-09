/* =========================================
   EMerriment Authentication V3
   Phase A — Authentication Foundation
========================================= */

"use strict";


/* =========================================
   GET SUPABASE CLIENT
========================================= */

function getSupabase() {

    const client = window.supabaseClient;

    if (!client) {

        throw new Error(
            "Supabase client is not initialized."
        );

    }

    return client;

}


/* =========================================
   NORMALIZE EMAIL
========================================= */

function normalizeEmail(email) {

    return String(email || "")
        .trim()
        .toLowerCase();

}


/* =========================================
   SIGN UP
========================================= */

async function signupUser(
    fullName,
    email,
    password
) {

    try {

        const supabase =
            getSupabase();


        /* -----------------------------------------
           Validate input
        ----------------------------------------- */

        fullName =
            String(fullName || "").trim();

        email =
            normalizeEmail(email);

        password =
            String(password || "");


        if (
            !fullName ||
            !email ||
            !password
        ) {

            return {

                success: false,

                error:
                    "Please complete all required fields."

            };

        }


        if (password.length < 8) {

            return {

                success: false,

                error:
                    "Password must contain at least 8 characters."

            };

        }


        /* -----------------------------------------
           Create Supabase account
        ----------------------------------------- */

        const {
            data,
            error
        } =
            await supabase.auth.signUp({

                email: email,

                password: password,

                options: {

                    data: {

                        full_name:
                            fullName

                    }

                }

            });


        if (error) {

            console.error(
                "❌ Supabase signup error:",
                error
            );

            return {

                success: false,

                error:
                    getAuthErrorMessage(error)

            };

        }


        if (!data.user) {

            return {

                success: false,

                error:
                    "Account could not be created. Please try again."

            };

        }


        /* -----------------------------------------
           IMPORTANT
           
           Profile creation should preferably be
           handled by a Supabase database trigger.
           
           We do NOT manually insert profiles here.
        ----------------------------------------- */


        console.log(
            "✅ Account created:",
            data.user.id
        );


        /* -----------------------------------------
           Email confirmation check
        ----------------------------------------- */

        if (!data.session) {

            return {

                success: true,

                requiresConfirmation: true,

                user:
                    data.user,

                session:
                    null

            };

        }


        return {

            success: true,

            requiresConfirmation: false,

            user:
                data.user,

            session:
                data.session

        };

    }

    catch (error) {

        console.error(
            "❌ Signup error:",
            error
        );


        return {

            success: false,

            error:
                getAuthErrorMessage(error)

        };

    }

}


/* =========================================
   LOGIN
========================================= */

async function loginUser(
    email,
    password
) {

    try {

        const supabase =
            getSupabase();


        email =
            normalizeEmail(email);

        password =
            String(password || "");


        if (!email || !password) {

            return {

                success: false,

                error:
                    "Please enter your email and password."

            };

        }


        /* -----------------------------------------
           Sign in
        ----------------------------------------- */

        const {
            data,
            error
        } =
            await supabase.auth.signInWithPassword({

                email:
                    email,

                password:
                    password

            });


        if (error) {

            console.error(
                "❌ Login error:",
                error
            );

            return {

                success: false,

                error:
                    getAuthErrorMessage(error)

            };

        }


        if (!data.user) {

            return {

                success: false,

                error:
                    "Login failed. Please try again."

            };

        }


        console.log(
            "✅ User logged in:",
            data.user.id
        );


        return {

            success: true,

            user:
                data.user,

            session:
                data.session

        };

    }

    catch (error) {

        console.error(
            "❌ Login exception:",
            error
        );


        return {

            success: false,

            error:
                getAuthErrorMessage(error)

        };

    }

}


/* =========================================
   LOGOUT
========================================= */

async function logoutUser() {

    try {

        const supabase =
            getSupabase();


        const {
            error
        } =
            await supabase.auth.signOut();


        if (error) {

            throw error;

        }


        console.log(
            "✅ User logged out."
        );


        return {

            success: true

        };

    }

    catch (error) {

        console.error(
            "❌ Logout error:",
            error
        );


        return {

            success: false,

            error:
                getAuthErrorMessage(error)

        };

    }

}


/* =========================================
   REQUEST PASSWORD RESET
========================================= */

async function requestPasswordReset(email) {
    try {
        const supabase = getSupabase();

        const { error } =
            await supabase.auth.resetPasswordForEmail(
                email.trim(),
                {
                    redirectTo:
                        `${window.location.origin}/reset-password.html`
                }
            );

        if (error) {
            return {
                success: false,
                error: error.message
            };
        }

        return {
            success: true
        };

    } catch (error) {
        console.error("Password reset error:", error);

        return {
            success: false,
            error: error.message
        };
    }
}

/* =========================================
   UPDATE PASSWORD
========================================= */

async function updatePassword(
    newPassword
) {

    try {

        const supabase =
            getSupabase();


        newPassword =
            String(newPassword || "");


        if (newPassword.length < 8) {

            return {

                success: false,

                error:
                    "Password must contain at least 8 characters."

            };

        }


        /* -----------------------------------------
           Make sure reset session exists
        ----------------------------------------- */

        const {
            data: sessionData
        } =
            await supabase.auth.getSession();


        if (!sessionData.session) {

            return {

                success: false,

                error:
                    "Your password reset session has expired. Please request a new reset link."

            };

        }


        /* -----------------------------------------
           Update password
        ----------------------------------------- */

        const {
            data,
            error
        } =
            await supabase.auth.updateUser({

                password:
                    newPassword

            });


        if (error) {

            console.error(
                "❌ Password update error:",
                error
            );

            return {

                success: false,

                error:
                    getAuthErrorMessage(error)

            };

        }


        console.log(
            "✅ Password updated successfully."
        );


        return {

            success: true,

            user:
                data.user

        };

    }

    catch (error) {

        console.error(
            "❌ Password update exception:",
            error
        );


        return {

            success: false,

            error:
                getAuthErrorMessage(error)

        };

    }

}


/* =========================================
   GET CURRENT USER
========================================= */

async function getCurrentUser() {

    try {

        const supabase =
            getSupabase();


        const {
            data,
            error
        } =
            await supabase.auth.getUser();


        if (error) {

            console.warn(
                "No authenticated user:",
                error.message
            );

            return null;

        }


        return data.user || null;

    }

    catch (error) {

        console.error(
            "❌ Get user error:",
            error
        );

        return null;

    }

}


/* =========================================
   GET CURRENT SESSION
========================================= */

async function getCurrentSession() {

    try {

        const supabase =
            getSupabase();


        const {
            data,
            error
        } =
            await supabase.auth.getSession();


        if (error) {

            console.error(
                "❌ Session error:",
                error
            );

            return null;

        }


        return data.session || null;

    }

    catch (error) {

        console.error(
            "❌ Session exception:",
            error
        );

        return null;

    }

}


/* =========================================
   REQUIRE AUTHENTICATION
========================================= */

async function requireAuth(
    redirectPage = "login.html"
) {

    const user =
        await getCurrentUser();


    if (!user) {

        console.warn(
            "🔒 Authentication required."
        );


        window.location.href =
            redirectPage;


        return null;

    }


    return user;

}


/* =========================================
   AUTH STATE LISTENER
========================================= */

function listenForAuthChanges(
    callback
) {

    try {

        const supabase =
            getSupabase();


        const {
            data
        } =
            supabase.auth.onAuthStateChange(

                (event, session) => {

                    console.log(
                        "🔐 Auth event:",
                        event
                    );


                    if (
                        typeof callback ===
                        "function"
                    ) {

                        callback(
                            event,
                            session
                        );

                    }

                }

            );


        return data.subscription;

    }

    catch (error) {

        console.error(
            "❌ Auth listener error:",
            error
        );

        return null;

    }

}


/* =========================================
   FRIENDLY AUTH ERRORS
========================================= */

function getAuthErrorMessage(
    error
) {

    if (!error) {

        return "Something went wrong.";

    }


    const message =
        String(
            error.message || ""
        ).toLowerCase();


    if (
        message.includes(
            "invalid login credentials"
        )
    ) {

        return "Incorrect email or password.";

    }


    if (
        message.includes(
            "email not confirmed"
        )
    ) {

        return "Please confirm your email address before logging in.";

    }


    if (
        message.includes(
            "user already registered"
        )
    ) {

        return "An account with this email already exists.";

    }


    if (
        message.includes(
            "password should be at least"
        )
    ) {

        return "Your password must be at least 8 characters.";

    }


    if (
        message.includes(
            "rate limit"
        )
    ) {

        return "Too many requests. Please wait a moment and try again.";

    }


    if (
        message.includes(
            "session"
        ) &&
        message.includes(
            "missing"
        )
    ) {

        return "Your session has expired. Please log in again.";

    }


    return (
        error.message ||
        "Authentication failed. Please try again."
    );

}


/* =========================================
   GLOBAL EMerriment AUTH API
========================================= */

window.EMAuth = {

    signup:
        signupUser,

    login:
        loginUser,

    logout:
        logoutUser,

    requestPasswordReset:
        requestPasswordReset,

    updatePassword:
        updatePassword,

    getUser:
        getCurrentUser,

    getSession:
        getCurrentSession,

    requireAuth:
        requireAuth,

    onAuthStateChange:
        listenForAuthChanges

};


console.log(
    "✅ EMerriment Authentication V3 loaded."
);
