/* =========================================
   EMerriment AI Conversation History
========================================= */


let conversations = [];

let selectedConversation = null;



document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeHistory();

    }
);



/* =========================================
   INITIALIZE
========================================= */


async function initializeHistory(){

    showLoading();

    await loadHistory();

    setupSearch();

    setupButtons();

}



/* =========================================
   LOAD CONVERSATIONS
========================================= */


async function loadHistory(){

    conversations =
        await getConversationHistory();


    hideLoading();


    if(!conversations.length){

        showEmptyState();

        return;

    }


    renderConversations(
        conversations
    );

}



/* =========================================
   RENDER CONVERSATIONS
========================================= */


function renderConversations(list){


    const container =
        document.getElementById(
            "conversationList"
        );


    const count =
        document.getElementById(
            "conversationCount"
        );


    if(!container) return;


    container.innerHTML = "";



    count.textContent =
        `${list.length} chats`;



    list.forEach(chat => {


        const card =
        document.createElement(
            "div"
        );


        card.className =
            "conversation-card";



        card.innerHTML = `

        <div class="conversation-info">

            <h3>

                ${chat.title || "New Conversation"}

            </h3>


            <p>

                ${chat.last_message || 
                "No messages yet"}

            </p>


        </div>



        <div class="conversation-meta">


            <span class="chat-time">

                ${formatDate(chat.updated_at)}

            </span>



            <button 
            class="menu-button"
            data-id="${chat.id}"
            >

                ⋮

            </button>


        </div>

        `;



        card.addEventListener(
            "click",
            () => openConversation(chat.id)
        );



        const menuButton =
            card.querySelector(
                ".menu-button"
            );


        menuButton.addEventListener(
            "click",
            (event)=>{


                event.stopPropagation();


                openMenu(
                    chat.id,
                    event
                );


            }
        );



        container.appendChild(card);


    });


}



/* =========================================
   OPEN CONVERSATION
========================================= */


function openConversation(id){


    window.location.href =
        `index.html?conversation=${id}`;


}



/* =========================================
   SEARCH
========================================= */


function setupSearch(){


    const search =
    document.getElementById(
        "conversationSearch"
    );


    if(!search) return;



    search.addEventListener(
        "input",
        ()=>{


            const value =
            search.value.toLowerCase();



            const filtered =
            conversations.filter(chat =>

                chat.title
                ?.toLowerCase()
                .includes(value)

                ||

                chat.last_message
                ?.toLowerCase()
                .includes(value)

            );


            renderConversations(
                filtered
            );


        }
    );


}



/* =========================================
   ACTION MENU
========================================= */


function openMenu(id,event){


    selectedConversation = id;


    const menu =
    document.getElementById(
        "conversationMenu"
    );


    menu.classList.remove(
        "hidden"
    );


    menu.style.left =
        event.pageX + "px";


    menu.style.top =
        event.pageY + "px";


}



document.addEventListener(
"click",
()=>{


    const menu =
    document.getElementById(
        "conversationMenu"
    );


    if(menu)

        menu.classList.add(
            "hidden"
        );


});



/* =========================================
   RENAME
========================================= */


async function renameSelected(){


    const title =
    prompt(
        "Enter new conversation name"
    );


    if(!title) return;



    await renameConversation(
        selectedConversation,
        title
    );


    await loadHistory();


}



/* =========================================
   PIN / UNPIN
========================================= */


async function pinSelected(){


    const chat =
    conversations.find(

        item =>
        item.id === selectedConversation

    );


    await pinConversation(

        selectedConversation,

        !chat.is_pinned

    );


    await loadHistory();


}



/* =========================================
   ARCHIVE
========================================= */


async function archiveSelected(){


    await archiveConversation(

        selectedConversation

    );


    await loadHistory();


}



/* =========================================
   DELETE
========================================= */


async function deleteSelected(){


    const confirmDelete =
    confirm(
        "Delete this conversation?"
    );


    if(!confirmDelete)
    return;



    await deleteConversation(

        selectedConversation

    );


    await loadHistory();


}



/* =========================================
   NEW CHAT
========================================= */


function setupButtons(){


    document
    .getElementById(
        "newChatButton"
    )
    ?.addEventListener(
        "click",
        ()=>{


            window.location.href =
            "index.html";


        }
    );



    document
    .getElementById(
        "renameConversation"
    )
    ?.addEventListener(
        "click",
        renameSelected
    );



    document
    .getElementById(
        "pinConversation"
    )
    ?.addEventListener(
        "click",
        pinSelected
    );



    document
    .getElementById(
        "archiveConversation"
    )
    ?.addEventListener(
        "click",
        archiveSelected
    );



    document
    .getElementById(
        "deleteConversation"
    )
    ?.addEventListener(
        "click",
        deleteSelected
    );


}



/* =========================================
   STATES
========================================= */


function showLoading(){

    document
    .getElementById(
        "loadingState"
    )
    ?.classList.remove(
        "hidden"
    );

}



function hideLoading(){

    document
    .getElementById(
        "loadingState"
    )
    ?.classList.add(
        "hidden"
    );

}



function showEmptyState(){

    document
    .getElementById(
        "emptyState"
    )
    ?.classList.remove(
        "hidden"
    );

}



/* =========================================
   DATE FORMAT
========================================= */


function formatDate(date){


    if(!date)
    return "";


    return new Date(date)

    .toLocaleDateString(
        [],
        {

            month:"short",

            day:"numeric"

        }

    );


}