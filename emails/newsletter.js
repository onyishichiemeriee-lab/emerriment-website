/* =========================================
   EMerriment Newsletter
========================================= */

const layout = require("./layout");


module.exports = ({
    name,
    email,
    title,
    content,
    subject
}) => {

    const safeName =
        name || "there";


    return {

        subject:
            subject ||
            `🌿 ${title || "Your EMerriment Skin Education Update"}`,


        html: layout({

            title:
                title ||
                "Your EMerriment Skin Education Update 🌿",

            email,

            content: `

                <p>
                    Hello <strong>${safeName}</strong> 👋🏽
                </p>


                ${content || `

                    <p>
                        Here's your latest EMerriment skincare
                        education update.
                    </p>

                `}


                <div style="
                    background:#E0F7FA;
                    padding:22px;
                    border-left:5px solid #00E5FF;
                    border-radius:8px;
                    margin:30px 0;
                ">

                    <strong>
                        🌿 EMerriment Reminder
                    </strong>

                    <p style="margin-bottom:0;">

                        Your skin doesn't need perfection.
                        It needs understanding, consistency
                        and patience.

                    </p>

                </div>


                <p>

                    Keep learning.

                    <br>

                    Keep caring.

                    <br>

                    Keep glowing. ✨

                </p>


                <p>

                    The EMerriment Team 🌿

                </p>

            `

        })

    };

};