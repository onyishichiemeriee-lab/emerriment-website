/* =========================================
   EMerriment Skin Report Email
========================================= */

const layout = require("./layout");


module.exports = ({
    name,
    email,
    skinType,
    concern,
    oilLevel,
    sensitivity,
    score,
    recommendation
}) => {

    const safeName =
        name || "there";


    const safeScore =
        score ?? "--";


    const safeSkinType =
        skinType || "Not determined";


    const safeConcern =
        concern || "Not determined";


    const safeOilLevel =
        oilLevel || "Not determined";


    const safeSensitivity =
        sensitivity || "Not determined";


    const safeRecommendation =
        recommendation ||
        "Start with a gentle, consistent skincare routine and focus on understanding your skin before adding multiple active products.";


    return {

        subject:
            "🌿 Your EMerriment Skin Report Is Ready",


        html: layout({

            title:
                "Your Personalized Skin Report 🌿",

            email,

            content: `

                <p>
                    Hello <strong>${safeName}</strong> 👋🏽
                </p>


                <p>
                    Thank you for completing your EMerriment
                    Skin Analysis.
                </p>


                <p>
                    We've put your answers together to give you
                    a clearer starting point for your skincare
                    journey.
                </p>


                <div style="
                    background:#07111E;
                    color:white;
                    padding:30px;
                    border-radius:14px;
                    margin:30px 0;
                    text-align:center;
                ">

                    <p style="
                        margin:0;
                        color:#CBD5E1;
                    ">

                        EMerriment Skin Score

                    </p>


                    <div style="
                        font-size:52px;
                        font-weight:bold;
                        color:#00E5FF;
                        margin:10px 0;
                    ">

                        ${safeScore}/100

                    </div>

                </div>


                <h3>
                    🧴 Your Skin Profile
                </h3>


                <table
                    width="100%"
                    cellspacing="0"
                    cellpadding="10"
                    style="
                        border-collapse:collapse;
                        margin:20px 0;
                    "
                >

                    <tr>

                        <td style="
                            border-bottom:1px solid #E2E8F0;
                            font-weight:bold;
                        ">
                            Skin Type
                        </td>

                        <td style="
                            border-bottom:1px solid #E2E8F0;
                        ">
                            ${safeSkinType}
                        </td>

                    </tr>


                    <tr>

                        <td style="
                            border-bottom:1px solid #E2E8F0;
                            font-weight:bold;
                        ">
                            Main Concern
                        </td>

                        <td style="
                            border-bottom:1px solid #E2E8F0;
                        ">
                            ${safeConcern}
                        </td>

                    </tr>


                    <tr>

                        <td style="
                            border-bottom:1px solid #E2E8F0;
                            font-weight:bold;
                        ">
                            Oil Level
                        </td>

                        <td style="
                            border-bottom:1px solid #E2E8F0;
                        ">
                            ${safeOilLevel}
                        </td>

                    </tr>


                    <tr>

                        <td style="
                            font-weight:bold;
                        ">
                            Sensitivity
                        </td>

                        <td>
                            ${safeSensitivity}
                        </td>

                    </tr>

                </table>


                <div style="
                    background:#E0F7FA;
                    padding:22px;
                    border-left:5px solid #00E5FF;
                    border-radius:8px;
                    margin:30px 0;
                ">

                    <strong>
                        🌿 Your Starting Point
                    </strong>


                    <p style="margin-bottom:0;">

                        ${safeRecommendation}

                    </p>

                </div>


                <h3>
                    💚 One Important Reminder
                </h3>


                <p>
                    Your skin score isn't a judgment of your skin.
                    It's simply a starting point to help you
                    understand what your skin may need.
                </p>


                <p>
                    Consistency, patience and the right information
                    matter more than trying every product you see
                    online.
                </p>


                <p style="text-align:center;">

                    <a
                        href="https://emerriment216.netlify.app/dashboard.html"
                        style="
                            display:inline-block;
                            background:#00E5FF;
                            color:#07111E;
                            padding:15px 25px;
                            text-decoration:none;
                            border-radius:10px;
                            font-weight:bold;
                        "
                    >

                        View My Skin Journey →

                    </a>

                </p>


                <p>

                    Your skin journey has officially begun. 🌿

                    <br><br>

                    The EMerriment Team

                </p>

            `

        })

    };

};