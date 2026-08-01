/* =========================================
   EMerriment AI Assistant
   UI Controller
========================================= */


/* =========================================
   CREATE MESSAGE ELEMENT
========================================= */


function createMessageElement(
    type,
    content
){


    const wrapper =
    document.createElement("div");


    if(type === "ai"){


        wrapper.className =
        "ai-message";


        wrapper.innerHTML = `

            <div class="message-avatar">

                🤖

            </div>


            <div class="message-content">

                <h4>
                    EMerriment AI
                </h4>

                <p>
                    ${formatMessage(content)}
                </p>

                <span class="message-time">

                    ${getMessageTime()}

                </span>

            </div>

        `;


    }


    else {


        wrapper.className =
        "user-message";


        wrapper.innerHTML = `

            <p>
                ${formatMessage(content)}
            </p>


            <span class="message-time">

                ${getMessageTime()}

            </span>

        `;


    }



    return wrapper;


}



/* =========================================
   DISPLAY MESSAGE
========================================= */


function displayMessage(
    type,
    content
){


    const container =
    document.getElementById(
        "chatContainer"
    );


    if(!container)
    return;



    const message =
    createMessageElement(
        type,
        content
    );



    container.appendChild(
        message
    );


    scrollChatToBottom();


}



/* =========================================
   SCROLL CHAT
========================================= */


function scrollChatToBottom(){


    const container =
    document.getElementById(
        "chatContainer"
    );


    if(container){


        container.scrollTo({

            top:
            container.scrollHeight,

            behavior:
            "smooth"

        });


    }


}



/* =========================================
   TYPING INDICATOR
========================================= */


function showAITyping(){


    const typing =
    document.getElementById(
        "typingIndicator"
    );


    if(typing){

        typing.classList.remove(
            "hidden"
        );


        scrollChatToBottom();

    }


}



function hideAITyping(){


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
   AI LOADING STATE
========================================= */


function setAILoading(buttonState){


    const button =
    document.getElementById(
        "sendButton"
    );


    if(!button)
    return;



    if(buttonState){


        button.disabled = true;

        button.textContent =
        "Thinking...";


    }


    else {


        button.disabled = false;

        button.textContent =
        "Send";


    }


}



/* =========================================
   WELCOME MESSAGE
========================================= */


function showWelcomeAnimation(){


    const chat =
    document.getElementById(
        "chatContainer"
    );


    if(!chat)
    return;



    chat.classList.add(
        "ai-loading"
    );



    setTimeout(()=>{


        chat.classList.remove(
            "ai-loading"
        );


    },1000);


}



/* =========================================
   RICH RESPONSE CARDS
========================================= */


function createArticleCard(article){


    return `

    <div class="ai-resource-card">


        <h4>
            📚 ${article.title}
        </h4>


        <p>
            ${article.summary || ""}
        </p>


        <a href="article.html?slug=${article.slug}">

            Read Article →

        </a>


    </div>

    `;


}




function createProductCard(product){


    return `

    <div class="ai-resource-card">


        <h4>
            🧴 ${product.name}
        </h4>


        <p>
            ${product.description || ""}
        </p>


        <a href="${product.link || "#"}">

            View Product →

        </a>


    </div>

    `;


}



/* =========================================
   MESSAGE FORMATTER
========================================= */


function formatMessage(text){


    if(!text)
    return "";



    return text

    .replace(
        /\n/g,
        "<br>"
    );


}



/* =========================================
   TIME FORMAT
========================================= */


function getMessageTime(){


    return new Date()

    .toLocaleTimeString(
        [],
        {

            hour:"2-digit",

            minute:"2-digit"

        }

    );


}