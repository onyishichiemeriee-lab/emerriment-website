// ==========================================
// EMerriment - My Skin Journey
// ==========================================

const supabaseClient = window.supabaseClient;
// ------------------------------
// Check Authentication
// ------------------------------

async function checkUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {

        window.location.href = "../login.html";
        return;

    }

    loadJourney(user);

}

// ------------------------------
// Load Journey
// ------------------------------

async function loadJourney(user) {

    document.getElementById("welcomeMessage").textContent =
        `Welcome back, ${user.user_metadata?.full_name || "Beautiful"} 🌿`;

    const { data: quizzes, error } = await supabaseClient

        .from("quiz_results")

        .select("*")

        .eq("user_id", user.id)

        .order("created_at", { ascending: false });

    if (error) {

        console.error(error);
        return;

    }

    updateStatistics(quizzes);

    displayLatestQuiz(quizzes);

    displayTimeline(quizzes);

}

// ------------------------------
// Statistics
// ------------------------------

function updateStatistics(quizzes) {

    document.getElementById("totalQuizzes").textContent =
        quizzes.length;

    if (quizzes.length === 0) {

        document.getElementById("currentScore").textContent = "--";

        document.getElementById("lastQuizDate").textContent = "--";

        return;

    }

    const latest = quizzes[0];

    document.getElementById("currentScore").textContent =
        latest.score;

    document.getElementById("lastQuizDate").textContent =
        new Date(latest.created_at).toLocaleDateString();

}

// ------------------------------
// Latest Quiz
// ------------------------------

function displayLatestQuiz(quizzes) {

    if (quizzes.length === 0) return;

    const latest = quizzes[0];

    document.getElementById("skinType").textContent =
        latest.skin_type;

    document.getElementById("concern").textContent =
        latest.concern;

    document.getElementById("oilLevel").textContent =
        latest.oil_level;

    document.getElementById("sensitivity").textContent =
        latest.sensitivity;

    document.getElementById("recommendation").textContent =
        latest.recommendation;

}

// ------------------------------
// Timeline
// ------------------------------

function displayTimeline(quizzes) {

    const container = document.getElementById("timelineContainer");

    container.innerHTML = "";

    if (quizzes.length === 0) {

        container.innerHTML = `
            <p>No quiz history yet.</p>
        `;

        return;

    }

    quizzes.forEach((quiz) => {

        const item = document.createElement("div");

        item.className = "timeline-item";

        item.innerHTML = `

            <h4>${new Date(quiz.created_at).toLocaleDateString()}</h4>

            <p><strong>Skin Score:</strong> ${quiz.score}</p>

            <p><strong>Skin Type:</strong> ${quiz.skin_type}</p>

            <p><strong>Concern:</strong> ${quiz.concern}</p>

            <p><strong>Oil Level:</strong> ${quiz.oil_level}</p>

            <p><strong>Sensitivity:</strong> ${quiz.sensitivity}</p>

        `;

        container.appendChild(item);

    });

}

// ------------------------------
// Logout
// ------------------------------

// ------------------------------
// Initialize
// ------------------------------

checkUser();