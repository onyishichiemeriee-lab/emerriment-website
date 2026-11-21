const supabaseClient = window.supabaseClient;

const form = document.getElementById("settingsForm");
const message = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");


// =========================================
// SAFETY CHECK
// =========================================

if (!supabaseClient) {

    console.error(
        "❌ Supabase client is not initialized."
    );

    if (message) {
        message.className = "error";
        message.textContent =
            "Supabase connection is not available.";
    }

    throw new Error(
        "Supabase client is not initialized."
    );
}


// =========================================
// CHECK ADMIN
// =========================================

async function checkAdmin() {

    // Shared, fail-closed administrator check (admin/js/admin-guard.js):
    // nothing below runs unless the signed-in user is an administrator.
    const access = await window.EMAdminGuard.requireAdmin();

    if (!access) return;

        await loadSettings();

}


// =========================================
// LOAD SETTINGS
// =========================================

async function loadSettings() {

    console.log(
        "⚙️ Loading website settings..."
    );


    const {
        data,
        error
    } = await supabaseClient

        .from("website_settings")

        .select("*")

        .limit(1)

        .maybeSingle();


    if (error) {

        console.error("❌ Failed to load settings:", window.EMAdminGuard.safeError(error));

        showMessage(
            "Unable to load website settings.",
            "error"
        );

        return;

    }


    if (!data) {

        console.log(
            "ℹ️ No website settings found yet."
        );

        showMessage(
            "No website settings have been created yet.",
            "info"
        );

        return;

    }


    // =====================================
    // POPULATE FORM
    // =====================================

    Object.keys(data).forEach(key => {

        const field =
            document.getElementById(key);


        if (!field) {
            return;
        }


        if (Array.isArray(data[key])) {

            field.value =
                data[key].join(", ");

        }

        else {

            field.value =
                data[key] ?? "";

        }

    });


    console.log(
        "✅ Website settings loaded."
    );


    showMessage(
        "Website settings loaded.",
        "info"
    );

}


// =========================================
// SAVE SETTINGS
// =========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        try {

            console.log(
                "💾 Saving website settings..."
            );


            if (saveSettingsBtn) {

                saveSettingsBtn.disabled = true;

                saveSettingsBtn.textContent =
                    "Saving...";

            }


            const settings = {

                site_name:
                    document.getElementById(
                        "site_name"
                    ).value.trim(),


                tagline:
                    document.getElementById(
                        "tagline"
                    ).value.trim(),


                hero_title:
                    document.getElementById(
                        "hero_title"
                    ).value.trim(),


                hero_subtitle:
                    document.getElementById(
                        "hero_subtitle"
                    ).value.trim(),


                hero_button_text:
                    document.getElementById(
                        "hero_button_text"
                    ).value.trim(),


                hero_button_link:
                    document.getElementById(
                        "hero_button_link"
                    ).value.trim(),


                homepage_banner:
                    document.getElementById(
                        "homepage_banner"
                    ).value.trim(),


                contact_email:
                    document.getElementById(
                        "contact_email"
                    ).value.trim(),


                contact_phone:
                    document.getElementById(
                        "contact_phone"
                    ).value.trim(),


                address:
                    document.getElementById(
                        "address"
                    ).value.trim(),


                facebook:
                    document.getElementById(
                        "facebook"
                    ).value.trim(),


                instagram:
                    document.getElementById(
                        "instagram"
                    ).value.trim(),


                tiktok:
                    document.getElementById(
                        "tiktok"
                    ).value.trim(),


                youtube:
                    document.getElementById(
                        "youtube"
                    ).value.trim(),


                x:
                    document.getElementById(
                        "x"
                    ).value.trim(),


                primary_color:
                    document.getElementById(
                        "primary_color"
                    ).value,


                secondary_color:
                    document.getElementById(
                        "secondary_color"
                    ).value,


                footer_text:
                    document.getElementById(
                        "footer_text"
                    ).value.trim(),


                seo_title:
                    document.getElementById(
                        "seo_title"
                    ).value.trim(),


                seo_description:
                    document.getElementById(
                        "seo_description"
                    ).value.trim(),


                seo_keywords:
                    document.getElementById(
                        "seo_keywords"
                    ).value

                    .split(",")

                    .map(
                        keyword =>
                            keyword.trim()
                    )

                    .filter(Boolean),


                updated_at:
                    new Date().toISOString()

            };


            // =================================
            // CHECK EXISTING SETTINGS
            // =================================

            const {
                data: existing,
                error: lookupError
            } = await supabaseClient

                .from("website_settings")

                .select("id")

                .limit(1);


            if (lookupError) {

                throw lookupError;

            }


            let saveError;


            // =================================
            // UPDATE EXISTING SETTINGS
            // =================================

            if (
                existing &&
                existing.length > 0
            ) {

                const {
                    error
                } = await supabaseClient

                    .from("website_settings")

                    .update(settings)

                    .eq(
                        "id",
                        existing[0].id
                    );


                saveError = error;

            }


            // =================================
            // CREATE SETTINGS
            // =================================

            else {

                const {
                    error
                } = await supabaseClient

                    .from("website_settings")

                    .insert(settings);


                saveError = error;

            }


            if (saveError) {

                throw saveError;

            }


            console.log(
                "✅ Website settings saved."
            );


            showMessage(
                "✅ Website settings saved successfully.",
                "success"
            );

        }

        catch (error) {

            console.error("❌ Save settings failed:", window.EMAdminGuard.safeError(error));


            showMessage(
                error.message ||
                "Failed to save website settings.",
                "error"
            );

        }

        finally {

            if (saveSettingsBtn) {

                saveSettingsBtn.disabled = false;

                saveSettingsBtn.textContent =
                    "💾 Save Website Settings";

            }

        }

    }
);


// =========================================
// LOGOUT
// =========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                console.log(
                    "🚪 Logging out..."
                );


                const {
                    error
                } = await supabaseClient.auth.signOut();


                if (error) {

                    throw error;

                }


                location.href =
                    "loginCMS.html";

            }

            catch (error) {

                console.error("❌ Logout failed:", window.EMAdminGuard.safeError(error));


                showMessage(
                    "Logout failed. Please try again.",
                    "error"
                );

            }

        }
    );

}


// =========================================
// MESSAGE HELPER
// =========================================

function showMessage(
    text,
    type = "info"
) {

    if (!message) {
        return;
    }


    message.className = type;

    message.textContent = text;

}


// =========================================
// START CMS
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkAdmin();

    }
);