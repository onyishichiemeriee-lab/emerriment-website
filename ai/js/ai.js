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

    await loadUserSkinProfile();


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

    await saveMessage(
        "user",
        message
    );


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

        await saveMessage(
            "assistant",
            response
        );


    }

    catch (error) {

        console.error(
            "EMerriment AI Error:",
            error
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
========================================= */

async function loadUserSkinProfile() {

    const skinType =
        document.getElementById(
            "skinType"
        );


    if (!skinType) return;


    try {

        const supabase =
            window.supabaseClient;


        if (!supabase) {

            skinType.textContent =
                "Not available";

            return;

        }


        const {
            data: {
                user
            },
            error
        } =
            await supabase.auth.getUser();


        if (error || !user) {

            skinType.textContent =
                "Not set";

            return;

        }


        /* -----------------------------------------
           Get profile
        ----------------------------------------- */

        const {
            data: profile,
            error: profileError
        } =
            await supabase

                .from("profiles")

                .select("*")

                .eq("id", user.id)

                .maybeSingle();


        if (profileError) {

            console.warn(
                "AI profile error:",
                profileError
            );

        }


        if (
            profile &&
            profile.skin_type
        ) {

            skinType.textContent =
                profile.skin_type;

        }

        else {

            skinType.textContent =
                "Not set";

        }


    }

    catch (error) {

        console.error(
            "Failed to load skin profile:",
            error
        );


        skinType.textContent =
            "Not available";

    }

}


/* =========================================
   SAVE CHAT MESSAGE
========================================= */

async function saveMessage(
    role,
    message
) {

    try {

        const supabase =
            window.supabaseClient;


        if (!supabase) {

            console.warn(
                "Cannot save message: Supabase unavailable."
            );

            return;

        }


        /* -----------------------------------------
           Get authenticated user
        ----------------------------------------- */

        const {
            data: {
                user
            }
        } =
            await supabase.auth.getUser();


        if (!user) {

            console.warn(
                "Cannot save message: User not authenticated."
            );

            return;

        }


        /* -----------------------------------------
           Save conversation
        ----------------------------------------- */

        const {
            error
        } =
            await supabase

                .from("ai_conversations")

                .insert({

                    user_id:
                        user.id,

                    role:
                        role,

                    message:
                        message

                });


        if (error) {

            console.error(
                "Failed to save AI message:",
                error
            );

        }

    }

    catch (error) {

        console.error(
            "saveMessage error:",
            error
        );

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