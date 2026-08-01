/* =========================================
   EMerriment AI Assistant
   Main Controller
========================================= */


document.addEventListener("DOMContentLoaded", () => {


    initializeAI();


});



function initializeAI(){


    const sendButton = document.getElementById("sendButton");

    const messageInput = document.getElementById("messageInput");


    if(sendButton){

        sendButton.addEventListener(
            "click",
            sendUserMessage
        );

    }



    if(messageInput){


        messageInput.addEventListener(
            "keydown",
            handleEnterKey
        );


    }



    initializePromptButtons();


    loadUserSkinProfile();


}



/* =========================================
   SEND MESSAGE
========================================= */


async function sendUserMessage(){


    const input = document.getElementById("messageInput");


    if(!input) return;


    const message = input.value.trim();



    if(!message) return;



    addUserMessage(message);

    await saveMessage("user", message);



    input.value = "";



    showTyping();



    /*
       AI response will connect here
       through ai-api.js
    */


    try{


        const response = await sendToAI(message);



        hideTyping();



        addAIMessage(response);

        await saveMessage("assistant", response);



    }

    catch(error){


        console.error(
            "AI Error:",
            error
        );


        hideTyping();


        addAIMessage(

            "Sorry, I couldn't process that right now. Please try again."

        );


    }


}



/* =========================================
   ENTER KEY SUPPORT
========================================= */


function handleEnterKey(event){


    if(
        event.key === "Enter" &&
        !event.shiftKey
    ){

        event.preventDefault();


        sendUserMessage();

    }


}



/* =========================================
   PROMPT BUTTONS
========================================= */


function initializePromptButtons(){


    const prompts = document.querySelectorAll(
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


                if(input){


                    input.value =
                    button.textContent.trim();



                    sendUserMessage();


                }


            }

        );


    });


}



/* =========================================
   ADD USER MESSAGE
========================================= */


function addUserMessage(message){


    const container =
    document.getElementById(
        "chatContainer"
    );


    if(!container) return;



    const messageBox =
    document.createElement(
        "div"
    );


    messageBox.className =
    "user-message";



    messageBox.innerHTML = `

        <p>${escapeHTML(message)}</p>

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


function addAIMessage(message){


    const container =
    document.getElementById(
        "chatContainer"
    );


    if(!container) return;



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
   TYPING CONTROL
========================================= */


function showTyping(){


    const typing =
    document.getElementById(
        "typingIndicator"
    );


    if(typing){

        typing.classList.remove(
            "hidden"
        );

    }


}



function hideTyping(){


    const typing =
    document.getElementById(
        "typingIndicator"
    );


    if(typing){

        typing.classList.add(
            "hidden"
        );

    }


}



/* =========================================
   CHAT SCROLL
========================================= */


function scrollChat(){


    const container =
    document.getElementById(
        "chatContainer"
    );


    if(container){


        container.scrollTop =
        container.scrollHeight;


    }


}



/* =========================================
   USER PROFILE
========================================= */


async function loadUserSkinProfile(){


    /*
       Supabase connection will be added
       when Module 4 Context Engine begins.
    */


    const skinType =
    document.getElementById(
        "skinType"
    );


    if(skinType){

        skinType.textContent =
        "Not set";

    }


}



/* =========================================
   HELPERS
========================================= */


function getCurrentTime(){


    return new Date()
    .toLocaleTimeString(
        [],
        {
            hour:"2-digit",
            minute:"2-digit"
        }
    );


}



function escapeHTML(text){


    return text

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