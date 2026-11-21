/* =========================================
   EMerriment AI Assistant
   Main Controller
========================================= */

"use strict";

/* =========================================
   INITIALIZE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeAI();

});


async function initializeAI() {

    console.log("🤖 Initializing EMerriment AI...");


    const sendButton =
        document.getElementById("sendButton");

    const messageInput =
        document.getElementById("messageInput");


    /* -----------------------------------------
       SEND BUTTON
    ----------------------------------------- */

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendUserMessage
        );

    }


    /* -----------------------------------------
       ENTER KEY
    ----------------------------------------- */

    if (messageInput) {

        messageInput.addEventListener(
            "keydown",
            handleEnterKey
        );

    }


    /* -----------------------------------------
       PROMPT BUTTONS
    ----------------------------------------- */

    initializePromptButtons();


    /* -----------------------------------------
       LOAD USER PROFILE
    ----------------------------------------- */

    window.EMAIProfileReady = loadUserSkinProfile();


    await window.EMAIProfileReady;


    console.log(
        "✅ EMerriment AI initialized."
    );

}


/* =========================================
   SEND MESSAGE
========================================= */

async function sendUserMessage() {

    const input =
        document.getElementById(
            "messageInput"
        );


    if (!input) return;


    const message =
        input.value.trim();


    if (!message) return;


    /* -----------------------------------------
       Disable repeated submission
    ----------------------------------------- */

    input.disabled = true;


    const sendButton =
        document.getElementById(
            "sendButton"
        );


    if (sendButton) {

        sendButton.disabled = true;

    }


    /* -----------------------------------------
       Display user message
    ----------------------------------------- */

    addUserMessage(message);


    /* -----------------------------------------
       Save user message
    ----------------------------------------- */

    await saveMessageSafely("user", message);


    /* -----------------------------------------
       Clear input
    ----------------------------------------- */

    input.value = "";


    /* -----------------------------------------
       Show typing
    ----------------------------------------- */

    showTyping();


    try {

        /* -----------------------------------------
           Send message to AI API
        ----------------------------------------- */

        const response =
            await sendToAI(message);


        /* -----------------------------------------
           Hide typing
        ----------------------------------------- */

        hideTyping();


        /* -----------------------------------------
           Display AI response
        ----------------------------------------- */

        addAIMessage(
            response
        );


        /* -----------------------------------------
           Save AI response
        ----------------------------------------- */

        await saveMessageSafely("assistant", response);


    }

    catch (error) {

        console.error(
            "EMerriment AI Error:",
            emrSafeError(error)
        );


        hideTyping();


        addAIMessage(
            "I'm sorry, I couldn't process that right now. Please try again."
        );

    }


    /* -----------------------------------------
       Re-enable input
    ----------------------------------------- */

    input.disabled = false;


    if (sendButton) {

        sendButton.disabled = false;

    }


    input.focus();

}


/* =========================================
   ENTER KEY SUPPORT
========================================= */

function handleEnterKey(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendUserMessage();

    }

}


/* =========================================
   PROMPT BUTTONS
========================================= */

function initializePromptButtons() {

    const prompts =
        document.querySelectorAll(
            ".prompt-btn"
        );


    prompts.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const input =
                    document.getElementById(
                        "messageInput"
                    );


                if (!input) return;


                input.value =
                    button.textContent.trim();


                input.focus();


                sendUserMessage();

            }
        );

    });

}


/* =========================================
   ADD USER MESSAGE
========================================= */

function addUserMessage(message) {

    const container =
        document.getElementById(
            "chatContainer"
        );


    if (!container) return;


    const messageBox =
        document.createElement(
            "div"
        );


    messageBox.className =
        "user-message";


    messageBox.innerHTML = `

        <p>
            ${escapeHTML(message)}
        </p>

        <span class="message-time">

            ${getCurrentTime()}

        </span>

    `;


    container.appendChild(
        messageBox
    );


    scrollChat();

}


/* =========================================
   ADD AI MESSAGE
========================================= */

function addAIMessage(message) {

    const container =
        document.getElementById(
            "chatContainer"
        );


    if (!container) return;


    const messageBox =
        document.createElement(
            "div"
        );


    messageBox.className =
        "ai-message";


    messageBox.innerHTML = `

        <div class="message-avatar">

            🤖

        </div>


        <div class="message-content">

            <h4>
                EMerriment AI
            </h4>


            <p>
                ${escapeHTML(message)}
            </p>


            <span class="message-time">

                ${getCurrentTime()}

            </span>

        </div>

    `;


    container.appendChild(
        messageBox
    );


    scrollChat();

}


/* =========================================
   TYPING INDICATOR
========================================= */

function showTyping() {

    const typing =
        document.getElementById(
            "typingIndicator"
        );


    if (typing) {

        typing.classList.remove(
            "hidden"
        );

    }

}


function hideTyping() {

    const typing =
        document.getElementById(
            "typingIndicator"
        );


    if (typing) {

        typing.classList.add(
            "hidden"
        );

    }

}


/* =========================================
   CHAT SCROLL
========================================= */

function scrollChat() {

    const container =
        document.getElementById(
            "chatContainer"
        );


    if (container) {

        container.scrollTop =
            container.scrollHeight;

    }

}


/* =========================================
   LOAD USER SKIN PROFILE
   The assistant is free for guests (no account needed), so the profile
   card always reaches a final state, never a permanent "Loading...":
     guest     -> "—" values and a sign-in / quiz hint; chat still works
     signed in -> skin type, concern, sensitivity and score from the
                  user's own profile and latest quiz (RLS: own rows only)
     failure   -> "Not available"; chat still works
   Values are shown with textContent; nothing personal is logged.
========================================= */

const AI_PROFILE_FIELDS = ["skinType", "skinConcern", "skinSensitivity", "skinScore"];

const AI_PROFILE_TIMEOUT_MS = 8000;

const AI_PROFILE_UNAVAILABLE_HINT = ["Your profile can't be loaded right now, but you can still ask questions below."];


function aiWithTimeout(promise, ms) {

    let timer;

    return Promise.race([
        promise,
        new Promise((resolve, reject) => {
            timer = setTimeout(() => reject(Object.assign(new Error("timeout"), { name: "TimeoutError" })), ms);
        })
    ]).finally(() => clearTimeout(timer));

}


function setProfileCard(values, stateName, hint) {

    for (const id of AI_PROFILE_FIELDS) {

        const el = document.getElementById(id);

        if (el) el.textContent = values[id];

    }

    const card = document.querySelector(".profile-card");

    if (!card) return;

    card.dataset.state = stateName;

    card.setAttribute("aria-busy", "false");

    let note = document.getElementById("profileHint");

    if (!hint) {

        if (note) note.hidden = true;

        return;

    }

    if (!note) {

        note = document.createElement("p");

        note.id = "profileHint";

        note.className = "profile-hint";

        note.setAttribute("role", "status");

        card.appendChild(note);

    }

    note.textContent = "";

    note.hidden = false;

    for (const part of hint) {

        if (typeof part === "string") {

            note.appendChild(document.createTextNode(part));

        } else {

            const link = document.createElement("a");

            link.href = part.href;

            link.textContent = part.text;

            note.appendChild(link);

        }

    }

}


async function loadUserSkinProfile() {

    if (!document.getElementById("skinType")) return "absent";

    const unavailable = { skinType: "Not available", skinConcern: "Not available", skinSensitivity: "Not available", skinScore: "--" };

    const supabase = window.supabaseClient;

    if (!supabase || !supabase.auth) {

        setProfileCard(unavailable, "unavailable", AI_PROFILE_UNAVAILABLE_HINT);

        return "unavailable";

    }

    try {

        // Local check (no network): is anyone signed in?
        const { data: sessionData } = await aiWithTimeout(supabase.auth.getSession(), AI_PROFILE_TIMEOUT_MS);

        const session = sessionData && sessionData.session;

        if (!session || !session.user) {

            setProfileCard(
                { skinType: "—", skinConcern: "—", skinSensitivity: "—", skinScore: "--" },
                "guest",
                [
                    "You're chatting as a guest, so answers are general. ",
                    { href: "../login.html", text: "Log in" },
                    " or ",
                    { href: "../quiz.html", text: "take the skin quiz" },
                    " to personalise them."
                ]
            );

            return "guest";

        }

        const userId = session.user.id;

        const [profileResult, quizResult] = await Promise.allSettled([
            aiWithTimeout(Promise.resolve(supabase.from("profiles").select("*").eq("id", userId).maybeSingle()), AI_PROFILE_TIMEOUT_MS),
            aiWithTimeout(Promise.resolve(supabase.from("quiz_results").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1)), AI_PROFILE_TIMEOUT_MS)
        ]);

        let failures = 0;

        const pick = (result, label) => {

            if (result.status !== "fulfilled") {

                failures++;

                console.warn("AI " + label + " unavailable:", emrSafeError(result.reason));

                return null;

            }

            if (result.value && result.value.error) {

                failures++;

                console.warn("AI " + label + " error:", emrSafeError(result.value.error));

                return null;

            }

            const data = result.value ? result.value.data : null;

            return Array.isArray(data) ? (data[0] || null) : (data || null);

        };

        const profile = pick(profileResult, "profile");

        const quiz = pick(quizResult, "quiz results");

        if (failures === 2) {

            setProfileCard(unavailable, "unavailable", AI_PROFILE_UNAVAILABLE_HINT);

            return "unavailable";

        }

        const text = (...candidates) => {

            for (const c of candidates) {

                if (c !== undefined && c !== null && String(c).trim()) return String(c).trim().slice(0, 60);

            }

            return "Not set";

        };

        const scoreValue = [profile && profile.current_skin_score, quiz && quiz.score]
            .find((v) => v !== undefined && v !== null && v !== "" && Number.isFinite(Number(v)) && Number(v) > 0);

        const values = {
            skinType: text(quiz && quiz.skin_type, profile && profile.current_skin_type),
            skinConcern: text(quiz && quiz.concern, profile && profile.current_concern),
            skinSensitivity: text(quiz && quiz.sensitivity),
            skinScore: scoreValue !== undefined ? String(Math.round(Number(scoreValue))) : "--"
        };

        const hasAny = AI_PROFILE_FIELDS.some((id) => values[id] !== "Not set" && values[id] !== "--");

        setProfileCard(
            values,
            "signed-in",
            hasAny ? null : ["No skin profile yet. ", { href: "../quiz.html", text: "Take the skin quiz" }, " to personalise the assistant."]
        );

        return "signed-in";

    }

    catch (error) {

        console.error(
            "Failed to load skin profile:",
            emrSafeError(error)
        );

        setProfileCard(unavailable, "unavailable", AI_PROFILE_UNAVAILABLE_HINT);

        return "unavailable";

    }

}


/* =========================================
   SAVE WITHOUT BLOCKING THE CHAT
   History saving is optional: a failure must never leave the input
   disabled or hide the reply.
========================================= */

async function saveMessageSafely(role, content) {

    try {

        if (typeof saveMessage === "function") await saveMessage(role, content);

    } catch (error) {

        console.warn("AI message not saved:", emrSafeError(error));

    }

}

/* =========================================
   GET CURRENT TIME
========================================= */

function getCurrentTime() {

    return new Date()
        .toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   GLOBAL EXPORTS
========================================= */

window.sendUserMessage =
    sendUserMessage;

window.addUserMessage =
    addUserMessage;

window.addAIMessage =
    addAIMessage;

window.showTyping =
    showTyping;

window.hideTyping =
    hideTyping;

console.log(
    "✅ EMerriment AI controller loaded."
);

/* -----------------------------------------
   Log privacy: an error reduced to its category.
   Supabase/PostgREST and Auth errors can carry row values,
   user ids or memory text in message/details/hint, so only
   name, code and HTTP status are logged — never the payload.
----------------------------------------- */

function emrSafeError(error) {
    if (!error) return { kind: "unknown" };
    return {
        kind: String(error.name || "Error").slice(0, 60),
        code: error.code !== undefined && error.code !== null ? String(error.code).slice(0, 40) : undefined,
        status: Number.isInteger(error.status) ? error.status : undefined
    };
}
