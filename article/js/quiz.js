// =====================================================
// EMERRIMENT SKIN QUIZ
// quiz.js
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // -------------------------------------------------
    // SUPABASE
    // -------------------------------------------------

    const supabaseClient = window.supabaseClient;

    if (!supabaseClient) {
        console.error(
            "❌ Supabase client not found. Check your supabase.js file."
        );
        return;
    }

    // -------------------------------------------------
    // QUIZ VARIABLES
    // -------------------------------------------------

    let currentStep = 0;

    let quizData = {
        name: "",
        email: "",
        skinType: "",
        concern: "",
        oilLevel: "",
        sensitivity: "",
        score: 60,
        recommendation: ""
    };

    // -------------------------------------------------
    // QUIZ STEPS
    // -------------------------------------------------

    const steps = document.querySelectorAll(".quiz-step");

    const totalSteps = steps.length;

    // -------------------------------------------------
    // ELEMENTS
    // -------------------------------------------------

    const nextButton =
        document.getElementById("nextBtn");

    const previousButton =
        document.getElementById("prevBtn");

    const submitButton =
        document.getElementById("submitQuiz");

    const progressBar =
        document.getElementById("progressBar");

    const progressText =
        document.getElementById("progressText");

    const quizForm =
        document.getElementById("skinQuizForm");

    const resultSection =
        document.getElementById("quizResult");

    // -------------------------------------------------
    // INITIALIZE
    // -------------------------------------------------

    showStep(currentStep);

    // -------------------------------------------------
    // SHOW STEP
    // -------------------------------------------------

    function showStep(index) {

        steps.forEach((step, i) => {

            step.classList.toggle(
                "active",
                i === index
            );

        });

        updateProgress();

        updateButtons();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // -------------------------------------------------
    // UPDATE PROGRESS
    // -------------------------------------------------

    function updateProgress() {

        if (!progressBar) return;

        const percentage =
            ((currentStep + 1) / totalSteps) * 100;

        progressBar.style.width =
            `${percentage}%`;

        if (progressText) {

            progressText.textContent =
                `Step ${currentStep + 1} of ${totalSteps}`;

        }
    }

    // -------------------------------------------------
    // UPDATE BUTTONS
    // -------------------------------------------------

    function updateButtons() {

        if (previousButton) {

            previousButton.style.display =
                currentStep === 0
                    ? "none"
                    : "inline-flex";
        }

        if (nextButton) {

            nextButton.style.display =
                currentStep === totalSteps - 1
                    ? "none"
                    : "inline-flex";
        }

        if (submitButton) {

            submitButton.style.display =
                currentStep === totalSteps - 1
                    ? "inline-flex"
                    : "none";
        }
    }

    // -------------------------------------------------
    // NEXT BUTTON
    // -------------------------------------------------

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                if (!validateCurrentStep()) {
                    return;
                }

                saveCurrentStepData();

                if (
                    currentStep <
                    totalSteps - 1
                ) {

                    currentStep++;

                    showStep(currentStep);

                }

            }
        );
    }

    // -------------------------------------------------
    // PREVIOUS BUTTON
    // -------------------------------------------------

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                if (currentStep > 0) {

                    currentStep--;

                    showStep(currentStep);

                }

            }
        );
    }

    // -------------------------------------------------
    // VALIDATE CURRENT STEP
    // -------------------------------------------------

    function validateCurrentStep() {

        const current =
            steps[currentStep];

        if (!current) return true;

        // Check required inputs
        const requiredInputs =
            current.querySelectorAll(
                "input[required], select[required], textarea[required]"
            );

        for (const input of requiredInputs) {

            if (!input.value.trim()) {

                showMessage(
                    "Please complete this question before continuing.",
                    "error"
                );

                input.focus();

                return false;
            }
        }

        // Check radio groups
        const radioNames = new Set();

        current
            .querySelectorAll(
                'input[type="radio"][required]'
            )
            .forEach(radio => {

                radioNames.add(radio.name);

            });

        for (const name of radioNames) {

            const selected =
                current.querySelector(
                    `input[name="${name}"]:checked`
                );

            if (!selected) {

                showMessage(
                    "Please select an answer before continuing.",
                    "error"
                );

                return false;
            }
        }

        return true;
    }

    // -------------------------------------------------
    // SAVE CURRENT STEP DATA
    // -------------------------------------------------

    function saveCurrentStepData() {

        const current =
            steps[currentStep];

        if (!current) return;

        // Inputs
        current
            .querySelectorAll(
                "input, select, textarea"
            )
            .forEach(input => {

                if (!input.name) return;

                if (
                    input.type === "radio" ||
                    input.type === "checkbox"
                ) {

                    if (!input.checked) return;
                }

                quizData[input.name] =
                    input.value;

            });

        // Also support common IDs
        const nameInput =
            document.getElementById("name");

        const emailInput =
            document.getElementById("email");

        if (nameInput) {
            quizData.name =
                nameInput.value.trim();
        }

        if (emailInput) {
            quizData.email =
                emailInput.value.trim();
        }
    }

    // -------------------------------------------------
    // FORM SUBMISSION
    // -------------------------------------------------

    if (quizForm) {

        quizForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                if (!validateCurrentStep()) {
                    return;
                }

                saveCurrentStepData();

                await processQuiz();

            }
        );
    }

    // -------------------------------------------------
    // PROCESS QUIZ
    // -------------------------------------------------

    async function processQuiz() {

        showLoadingState();

        calculateScore();

        generateRecommendation();

        try {

            await saveQuizResult();

            displayResult();

        } catch (error) {

            console.error(
                "Quiz submission error:",
                error
            );

            // Still show the result locally
            // even if Supabase fails.
            displayResult();

            showMessage(
                "Your skin analysis is ready. We couldn't save your result online.",
                "error"
            );
        }
    }

    // -------------------------------------------------
    // CALCULATE SCORE
    // -------------------------------------------------

    function calculateScore() {

        let score = 60;

        // Skin type
        if (
            quizData.skinType === "oily"
        ) {

            score -= 10;

        }

        if (
            quizData.skinType === "dry"
        ) {

            score -= 5;

        }

        if (
            quizData.skinType === "combination"
        ) {

            score -= 3;

        }

        // Main concern
        if (
            quizData.concern === "acne"
        ) {

            score -= 10;

        }

        if (
            quizData.concern === "dark-spots"
        ) {

            score -= 5;

        }

        if (
            quizData.concern === "eczema"
        ) {

            score -= 8;

        }

        // Oil level
        if (
            quizData.oilLevel === "high"
        ) {

            score -= 5;

        }

        if (
            quizData.oilLevel === "low"
        ) {

            score -= 3;

        }

        // Sensitivity
        if (
            quizData.sensitivity === "high"
        ) {

            score -= 7;

        }

        // Keep score between 0 and 100
        quizData.score =
            Math.max(
                0,
                Math.min(100, score)
            );
    }

    // -------------------------------------------------
    // GENERATE RECOMMENDATION
    // -------------------------------------------------

    function generateRecommendation() {

        const skin =
            quizData.skinType;

        const concern =
            quizData.concern;

        let recommendation =
            "Focus on a gentle, consistent skincare routine that supports your skin barrier.";

        if (
            skin === "oily" &&
            concern === "acne"
        ) {

            recommendation =
                "Focus on gentle cleansing, lightweight non-comedogenic hydration, acne-friendly ingredients and daily sunscreen.";

        }

        else if (
            skin === "dry"
        ) {

            recommendation =
                "Focus on barrier-supporting skincare, gentle cleansing, rich moisturization and consistent sunscreen.";

        }

        else if (
            skin === "sensitive"
        ) {

            recommendation =
                "Focus on a simple fragrance-free routine, gentle products and barrier support while avoiding harsh active ingredients.";

        }

        else if (
            concern === "dark-spots"
        ) {

            recommendation =
                "Focus on daily sunscreen, gentle brightening ingredients and consistent moisturization. Avoid aggressive treatments that may irritate your skin.";

        }

        else if (
            concern === "eczema"
        ) {

            recommendation =
                "Focus on protecting your skin barrier with gentle cleansers, regular moisturization and avoiding known triggers.";

        }

        quizData.recommendation =
            recommendation;
    }

    // -------------------------------------------------
    // SAVE TO SUPABASE
    // -------------------------------------------------

    async function saveQuizResult() {

        if (!quizData.email) {

            console.warn(
                "No email provided. Quiz result will not be saved."
            );

            return;
        }

        const payload = {

            name:
                quizData.name || null,

            email:
                quizData.email,

            skin_type:
                quizData.skinType || null,

            concern:
                quizData.concern || null,

            oil_level:
                quizData.oilLevel || null,

            sensitivity:
                quizData.sensitivity || null,

            score:
                quizData.score,

            recommendation:
                quizData.recommendation,

            submitted_at:
                new Date().toISOString()
        };

        console.log(
            "Saving quiz result:",
            payload
        );

        const {
            data,
            error
        } = await supabaseClient
            .from("leads")
            .upsert(
                payload,
                {
                    onConflict: "email"
                }
            )
            .select()
            .single();

        if (error) {

            console.error(
                "Supabase save error:",
                error
            );

            throw error;
        }

        console.log(
            "✅ Quiz result saved:",
            data
        );

        return data;
    }

    // -------------------------------------------------
    // DISPLAY RESULT
    // -------------------------------------------------

    function displayResult() {

        // Hide quiz
        if (quizForm) {

            quizForm.style.display =
                "none";
        }

        // Show result
        if (resultSection) {

            resultSection.style.display =
                "block";
        }

        // Score
        const scoreElement =
            document.getElementById(
                "skinScore"
            );

        if (scoreElement) {

            scoreElement.textContent =
                quizData.score;
        }

        // Skin type
        const skinTypeElement =
            document.getElementById(
                "resultSkinType"
            );

        if (skinTypeElement) {

            skinTypeElement.textContent =
                formatText(
                    quizData.skinType
                );
        }

        // Concern
        const concernElement =
            document.getElementById(
                "resultConcern"
            );

        if (concernElement) {

            concernElement.textContent =
                formatText(
                    quizData.concern
                );
        }

        // Recommendation
        const recommendationElement =
            document.getElementById(
                "resultRecommendation"
            );

        if (recommendationElement) {

            recommendationElement.textContent =
                formatText(
                    quizData.recommendation
                );
        }

        // Analysis
        const analysisElement =
            document.getElementById(
                "skinAnalysis"
            );

        if (analysisElement) {

            analysisElement.textContent =
                formatText(
                    getScoreMessage(
                        quizData.score
                    )
                );
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // -------------------------------------------------
    // SCORE MESSAGE
    // -------------------------------------------------

    function getScoreMessage(score) {

        if (score >= 80) {

            return "Your skin profile looks relatively balanced. Keep protecting your skin barrier and stay consistent with your routine.";

        }

        if (score >= 60) {

            return "Your skin may need some additional attention. A consistent and gentle routine can help support healthier-looking skin.";

        }

        if (score >= 40) {

            return "Your answers suggest that your skin may be experiencing several concerns. Focus on simplicity, consistency and barrier support.";

        }

        return "Your skin may need extra care. Consider keeping your routine gentle and, if your symptoms are persistent or severe, speaking with a qualified dermatologist.";
    }

    // -------------------------------------------------
    // LOADING STATE
    // -------------------------------------------------

    function showLoadingState() {

        if (!quizForm) return;

        quizForm.innerHTML = `

            <div class="quiz-loading">

                <div class="loading-spinner"></div>

                <h2>
                    Analyzing Your Skin...
                </h2>

                <p>
                    We're creating your personalized
                    EMerriment skin profile.
                </p>

            </div>

        `;
    }

    // -------------------------------------------------
    // FORMAT TEXT
    // -------------------------------------------------

    function formatText(value) {

        if (!value) return "Not provided";

        return value
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, letter =>
                letter.toUpperCase()
            );
    }

    // -------------------------------------------------
    // MESSAGE
    // -------------------------------------------------

    function showMessage(
        message,
        type = "info"
    ) {

        let messageBox =
            document.getElementById(
                "quizMessage"
            );

        if (!messageBox) {

            messageBox =
                document.createElement(
                    "div"
                );

            messageBox.id =
                "quizMessage";

            document.body.prepend(
                messageBox
            );
        }

        messageBox.textContent =
            message;

        messageBox.className =
            `quiz-message ${type}`;

        setTimeout(() => {

            messageBox.remove();

        }, 5000);
    }

    // -------------------------------------------------
    // RESTART QUIZ
    // -------------------------------------------------

    const restartButton =
        document.getElementById(
            "restartQuiz"
        );

    if (restartButton) {

        restartButton.addEventListener(
            "click",
            () => {

                window.location.reload();

            }
        );
    }

    // -------------------------------------------------
    // DEBUG
    // -------------------------------------------------

    console.log(
        "✅ EMerriment Skin Quiz initialized."
    );

});