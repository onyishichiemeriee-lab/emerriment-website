// ============================================
// EMerriment Dashboard Profile
// ============================================

async function loadUserProfile(user) {

    try {

        // Welcome message
        const fullName =
            user.user_metadata?.full_name ||
            user.email.split("@")[0];

        const welcome =
            document.getElementById("welcomeMessage");

        if (welcome) {

            welcome.textContent =
                `Welcome back, ${fullName}! 👋`;

        }

        // Load profile
        const { data: profile, error } =
            await supabaseClient

            .from("profiles")

            .select("*")

            .eq("id", user.id)

            .maybeSingle();

        if (error) {

            console.error(error);

            return null;

        }

        window.currentProfile = profile;

        populateProfile(profile);

        return profile;

    }

    catch (error) {

        console.error(error);

        return null;

    }

}

// --------------------------------------------
// Populate Profile
// --------------------------------------------

function populateProfile(profile) {

    if (!profile) return;

    setText("profileName", profile.full_name);

    setText("profileEmail", profile.email);

    setText("skinType", profile.skin_type);

    setText("skinConcern", profile.concern);

    setText("skinScore",

        profile.current_skin_score ?? "--"

    );

}



// --------------------------------------------
// Update Profile
// --------------------------------------------

async function updateProfile(updates) {

    try {

        const {

            data: { user }

        } = await supabaseClient.auth.getUser();

        const { error } =

            await supabaseClient

            .from("profiles")

            .update(updates)

            .eq("id", user.id);

        if (error) throw error;

        showNotification(

            "Profile updated successfully."

        );

    }

    catch (error) {

        console.error(error);

        showNotification(

            "Unable to update profile.",

            "error"

        );

    }

}