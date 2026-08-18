// ============================================
// EMerriment Skin Quiz
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 EMerriment Skin Quiz starting...");

    // --------------------------------------------
    // Supabase
    // --------------------------------------------

    const supabaseClient = window.supabaseClient;

    if (!supabaseClient) {

        console.error(
            "❌ Supabase client not found. Check js/supabase.js"
        );

        return;
    }

    console.log("✅ Supabase client available");


    // --------------------------------------------
    // DOM ELEMENTS
    // --------------------------------------------

    const introScreen =
        document.getElementById("quizIntro");

    const formScreen =
        document.getElementById("quizFormScreen");

    const analysisScreen =
        document.getElementById("analysisScreen");

    const resultsScreen =
        document.getElementById("quizResults");

    const startBtn =
        document.getElementById("startQuizBtn");

    const previousBtn =
        document.getElementById("previousBtn");

    const nextBtn =
        document.getElementById("nextBtn");

    const submitBtn =
        document.getElementById("submitQuizBtn");

    const form =
        document.getElementById("skinQuizForm");

    const questions =
        document.querySelectorAll(".question");

    const progressBar =
        document.getElementById("progressBar");

    const questionCounter =
        document.getElementById("questionCounter");

    const progressPercentage =
        document.getElementById("progressPercentage");

    const analysisStatus =
        document.getElementById("analysisStatus");


    // --------------------------------------------
    // SAFETY CHECK
    // --------------------------------------------

    if (!startBtn || !form || !questions.length) {

        console.error(
            "❌ Quiz HTML elements could not be found."
        );

        return;
    }


    // --------------------------------------------
    // QUIZ STATE
    // --------------------------------------------

    let currentQuestion = 1;

    const totalQuestions = questions.length;


    // --------------------------------------------
    // SHOW SCREEN
    // --------------------------------------------

    function showScreen(screen) {

        document
            .querySelectorAll(".quiz-screen")
            .forEach(item => {

                item.classList.remove("active");

            });

        if (screen) {

            screen.classList.add("active");

        }

    }


    // --------------------------------------------
    // SHOW QUESTION
    // --------------------------------------------

    function showQuestion(number) {

        questions.forEach(question => {

            question.classList.remove("active");

        });

        const current =
            document.querySelector(
                `.question[data-question="${number}"]`
            );

        if (!current) return;

        current.classList.add("active");

        updateProgress(number);

        updateNavigationButtons(number);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    // --------------------------------------------
    // UPDATE PROGRESS
    // --------------------------------------------

    function updateProgress(number) {

        const percentage =
            Math.round(
                (number / totalQuestions) * 100
            );

        if (questionCounter) {

            questionCounter.textContent =
                `Question ${number} of ${totalQuestions}`;

        }

        if (progressPercentage) {

            progressPercentage.textContent =
                `${percentage}%`;

        }

        if (progressBar) {

            progressBar.style.width =
                `${percentage}%`;

        }

    }


    // --------------------------------------------
    // NAVIGATION BUTTONS
    // --------------------------------------------

    function updateNavigationButtons(number) {

        if (previousBtn) {

            previousBtn.style.display =
                number === 1
                    ? "none"
                    : "inline-flex";

        }

        if (nextBtn) {

            nextBtn.style.display =
                number === totalQuestions
                    ? "none"
                    : "inline-flex";

        }

        if (submitBtn) {

            submitBtn.style.display =
                number === totalQuestions
                    ? "inline-flex"
                    : "none";

        }

    }


    // --------------------------------------------
    // START QUIZ
    // --------------------------------------------

    startBtn.addEventListener("click", () => {

        console.log("▶️ Start quiz clicked");

        showScreen(formScreen);

        currentQuestion = 1;

        showQuestion(currentQuestion);

    });


    // --------------------------------------------
    // GET ANSWER
    // --------------------------------------------

    function getAnswer(name) {

        const selected =
            document.querySelector(
                `input[name="${name}"]:checked`
            );

        return selected
            ? selected.value
            : null;

    }


    // --------------------------------------------
    // VALIDATE CURRENT QUESTION
    // --------------------------------------------

    function validateQuestion(number) {

        // Question 1
        if (number === 1) {

            const name =
                document
                    .getElementById("name")
                    ?.value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    ?.value
                    .trim();

            if (!name) {

                alert("Please enter your name.");

                return false;
            }

            if (!email) {

                alert("Please enter your email address.");

                return false;
            }

            if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ) {

                alert(
                    "Please enter a valid email address."
                );

                return false;
            }

            return true;
        }


        // Question 2
        if (number === 2) {

            if (!getAnswer("skinType")) {

                alert(
                    "Please select your skin type."
                );

                return false;
            }

        }


        // Question 3
        if (number === 3) {

            if (!getAnswer("concern")) {

                alert(
                    "Please select your main skin concern."
                );

                return false;
            }

        }


        // Question 4
        if (number === 4) {

            if (!getAnswer("oilLevel")) {

                alert(
                    "Please select your oil level."
                );

                return false;
            }

        }


        // Question 5
        if (number === 5) {

            if (!getAnswer("sensitivity")) {

                alert(
                    "Please select your skin sensitivity."
                );

                return false;
            }

        }


        // Question 6
        if (number === 6) {

            if (!getAnswer("goal")) {

                alert(
                    "Please select your skincare goal."
                );

                return false;
            }

        }


        // Question 7
        if (number === 7) {

            if (!getAnswer("routine")) {

                alert(
                    "Please select your skincare routine."
                );

                return false;
            }

        }


        return true;

    }


    // --------------------------------------------
    // NEXT QUESTION
    // --------------------------------------------

    nextBtn.addEventListener("click", () => {

        console.log(
            `➡️ Continue clicked on question ${currentQuestion}`
        );

        if (!validateQuestion(currentQuestion)) {

            return;

        }

        if (
            currentQuestion <
            totalQuestions
        ) {

            currentQuestion++;

            showQuestion(currentQuestion);

        }

    });


    // --------------------------------------------
    // PREVIOUS QUESTION
    // --------------------------------------------

    previousBtn.addEventListener("click", () => {

        console.log(
            `⬅️ Back clicked on question ${currentQuestion}`
        );

        if (currentQuestion > 1) {

            currentQuestion--;

            showQuestion(currentQuestion);

        }

    });


    // --------------------------------------------
    // COLLECT QUIZ DATA
    // --------------------------------------------

    function collectQuizData() {

        const name =
            document
                .getElementById("name")
                ?.value
                .trim();

        const email =
            document
                .getElementById("email")
                ?.value
                .trim();

        const skinType =
            getAnswer("skinType");

        const concern =
            getAnswer("concern");

        const oilLevel =
            getAnswer("oilLevel");

        const sensitivity =
            getAnswer("sensitivity");

        const goal =
            getAnswer("goal");

        const routine =
            getAnswer("routine");


        return {

            name,

            email,

            skin_type: skinType,

            concern,

            oil_level: oilLevel,

            sensitivity,

            goal,

            routine

        };

    }


    // --------------------------------------------
    // CALCULATE SKIN SCORE
    // --------------------------------------------

    function calculateScore(data) {

        let score = 70;


        if (data.skin_type === "Oily") {

            score -= 5;

        }


        if (data.skin_type === "Dry") {

            score -= 3;

        }


        if (data.skin_type === "Sensitive") {

            score -= 5;

        }


        if (data.concern === "Acne") {

            score -= 5;

        }


        if (
            data.concern ===
            "Hyperpigmentation"
        ) {

            score -= 3;

        }


        if (data.sensitivity === "High") {

            score -= 5;

        }


        if (data.routine === "Consistent") {

            score += 10;

        }


        if (data.routine === "None") {

            score -= 5;

        }


        return Math.max(
            0,
            Math.min(100, score)
        );

    }


    // --------------------------------------------
    // CREATE RECOMMENDATION
    // --------------------------------------------

    function createRecommendation(data) {

        let recommendation =
            "Focus on a simple, consistent skincare routine with gentle cleansing, appropriate moisturization and daily sun protection.";


        if (data.concern === "Acne") {

            recommendation =
                "Focus on a gentle routine for acne-prone skin. Avoid picking or squeezing blemishes, choose non-comedogenic products and introduce active ingredients gradually.";

        }


        if (
            data.concern ===
            "Hyperpigmentation" ||
            data.concern ===
            "Dark Spots"
        ) {

            recommendation =
                "Your routine should prioritize daily sunscreen, gentle skincare and gradual use of ingredients that support a more even-looking skin tone.";

        }


        if (
            data.skin_type === "Dry"
        ) {

            recommendation =
                "Prioritize hydration and barrier support. Use a gentle cleanser, a nourishing moisturizer and avoid excessive cleansing or harsh exfoliation.";

        }


        if (
            data.skin_type === "Sensitive"
        ) {

            recommendation =
                "Keep your routine gentle and simple. Introduce new products one at a time and avoid unnecessary fragrance or harsh exfoliation if these irritate your skin.";

        }


        if (
            data.concern === "Eczema"
        ) {

            recommendation =
                "Focus on protecting the skin barrier with gentle, fragrance-free skincare and consistent moisturization. Persistent or severe symptoms should be assessed by a healthcare professional.";

        }


        return recommendation;

    }


    // --------------------------------------------
    // SHOW ANALYSIS
    // --------------------------------------------

    async function showAnalysis(data) {

        showScreen(analysisScreen);

        const messages = [

            "Reviewing your skin type...",

            "Analyzing your main concern...",

            "Looking at your skin sensitivity...",

            "Building your personalized profile...",

            "Preparing your EMerriment recommendations..."

        ];


        for (
            let i = 0;
            i < messages.length;
            i++
        ) {

            if (analysisStatus) {

                analysisStatus.textContent =
                    messages[i];

            }

            await new Promise(
                resolve =>
                    setTimeout(resolve, 700)
            );

        }

    }


    // --------------------------------------------
    // SAVE TO SUPABASE
    // --------------------------------------------

    async function saveQuizResult(
        data,
        score,
        recommendation
    ) {

        console.log(
            "💾 Saving quiz result..."
        );


        const payload = {

            name: data.name,

            email: data.email,

            skin_type: data.skin_type,

            concern: data.concern,

            oil_level: data.oil_level,

            sensitivity: data.sensitivity,

            score: score,

            recommendation:
                recommendation

        };


        const {
            data: savedData,
            error
        } = await supabaseClient

            .from("leads")

            .insert(payload)

            .select()
            .single();


        if (error) {

            console.error(
                "❌ Failed to save quiz:",
                error
            );

            return {
                success: false,
                error
            };

        }


        console.log(
            "✅ Quiz saved successfully:",
            savedData
        );


        return {

            success: true,

            data: savedData

        };

    }


    // --------------------------------------------
    // DISPLAY RESULTS
    // --------------------------------------------

    function displayResults(
        data,
        score,
        recommendation
    ) {

        showScreen(resultsScreen);


        const greeting =
            document.getElementById(
                "resultGreeting"
            );

        if (greeting) {

            greeting.textContent =
                `${data.name}, we've analyzed your answers and created your starting point.`;

        }


        const scoreElement =
            document.getElementById(
                "skinScore"
            );

        if (scoreElement) {

            scoreElement.textContent =
                score;

        }


        const message =
            document.getElementById(
                "scoreMessage"
            );

        if (message) {

            if (score >= 80) {

                message.textContent =
                    "Your profile shows a strong foundation. Keep building consistency.";

            } else if (score >= 60) {

                message.textContent =
                    "You have a good starting point. A consistent routine can help strengthen your skin journey.";

            } else {

                message.textContent =
                    "Your skin may benefit from a simpler, more supportive routine.";

            }

        }


        const skinType =
            document.getElementById(
                "resultSkinType"
            );

        if (skinType) {

            skinType.textContent =
                data.skin_type || "--";

        }


        const concern =
            document.getElementById(
                "resultConcern"
            );

        if (concern) {

            concern.textContent =
                data.concern || "--";

        }


        const oil =
            document.getElementById(
                "resultOilLevel"
            );

        if (oil) {

            oil.textContent =
                data.oil_level || "--";

        }


        const sensitivity =
            document.getElementById(
                "resultSensitivity"
            );

        if (sensitivity) {

            sensitivity.textContent =
                data.sensitivity || "--";

        }


        const recommendationElement =
            document.getElementById(
                "resultRecommendation"
            );

        if (recommendationElement) {

            recommendationElement.textContent =
                recommendation;

        }

    }


    // --------------------------------------------
    // SUBMIT QUIZ
    // --------------------------------------------

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            console.log(
                "🚀 Quiz submitted"
            );


            if (
                !validateQuestion(
                    totalQuestions
                )
            ) {

                return;

            }


            const quizData =
                collectQuizData();


            const score =
                calculateScore(
                    quizData
                );


            const recommendation =
                createRecommendation(
                    quizData
                );


            // Disable submit button

            if (submitBtn) {

                submitBtn.disabled = true;

                submitBtn.textContent =
                    "Analyzing...";

            }


            try {

                await showAnalysis(
                    quizData
                );


                const saveResult =
                    await saveQuizResult(
                        quizData,
                        score,
                        recommendation
                    );


                // We still show results
                // even if database saving fails

                displayResults(
                    quizData,
                    score,
                    recommendation
                );


                if (!saveResult.success) {

                    console.warn(
                        "⚠️ Results displayed, but database save failed."
                    );

                }

            } catch (error) {

                console.error(
                    "❌ Quiz error:",
                    error
                );

                alert(
                    "Something went wrong while analyzing your skin. Please try again."
                );

            } finally {

                if (submitBtn) {

                    submitBtn.disabled =
                        false;

                    submitBtn.textContent =
                        "Analyze My Skin ✨";

                }

            }

        }
    );


    // --------------------------------------------
    // INITIAL STATE
    // --------------------------------------------

    showScreen(introScreen);

    updateNavigationButtons(1);

    console.log(
        "✅ EMerriment Skin Quiz initialized."
    );

});