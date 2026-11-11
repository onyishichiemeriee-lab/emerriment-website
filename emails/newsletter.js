/* =========================================
   EMerriment Newsletter
========================================= */

const layout = require("./layout");

const escapeHtml = require("./escape-html");


// Plain-text subject: strip line breaks and
// control characters, limit the length.
function safeSubject(value) {

    return String(value)
        .replace(/[\u0000-\u001F\u007F]+/g, " ")
        .trim()
        .slice(0, 200);

}


/*
   SECURITY NOTE
   `content` is inserted as HTML on purpose so an
   administrator can format a newsletter. It must
   only ever come from a trusted, server-side
   authorized administrator — never from a public
   request. The public send-email function does
   not allow the newsletter type.
   `name` and `title` are escaped.
*/
module.exports = ({
    name,
    email,
    title,
    content,
    subject,
    tracking
}) => {

    const safeName =
        escapeHtml(name || "there");

    const safeTitle =
        title ? escapeHtml(title) : null;


    return {

        subject:
            safeSubject(
                subject ||
                `🌿 ${title || "Your EMerriment Skin Education Update"}`
            ),


        html: layout({

            tracking,

            title:
                safeTitle ||
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