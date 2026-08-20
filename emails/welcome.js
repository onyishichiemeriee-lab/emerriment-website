/* =========================================
   EMerriment Welcome Email
========================================= */

const layout = require("./layout");


module.exports = ({ name, email }) => {

    const safeName = name || "there";


    return {

        subject:
            "🌿 Welcome to EMerriment — Your Skin Journey Starts Here",


        html: layout({

            title:
                "Welcome to EMerriment 🌿",

            email,

            content: `

                <p>
                    Hello <strong>${safeName}</strong> 👋🏽
                </p>


                <p>
                    We're so happy you're here.
                </p>


                <p>
                    EMerriment was created around one simple
                    belief:
                    <strong>
                        understanding your skin should never feel confusing.
                    </strong>
                </p>


                <p>
                    You are now part of a growing community
                    learning how to understand, care for and
                    appreciate their skin naturally.
                </p>


                <div style="
                    background:#E0F7FA;
                    padding:22px;
                    border-left:5px solid #00E5FF;
                    border-radius:8px;
                    margin:30px 0;
                ">

                    <strong>
                        🌿 What happens next?
                    </strong>

                    <p style="margin-bottom:0;">

                        You'll receive helpful skincare education,
                        practical guidance and personalized resources
                        designed to help you make better decisions
                        for your skin.

                    </p>

                </div>


                <h3>
                    ✨ Start With Your Skin
                </h3>


                <p>
                    If you haven't already, take the EMerriment
                    Skin Quiz and discover your skin profile.
                </p>


                <p style="text-align:center;">

                    <a
                        href="https://emerriment216.netlify.app/quiz.html"
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

                        Discover My Skin Profile →

                    </a>

                </p>


                <p>
                    Remember:
                    <strong>
                        healthy skin begins with understanding.
                    </strong>
                </p>


                <p>

                    Stay glowing 🌿

                    <br><br>

                    The EMerriment Team

                </p>

            `

        })

    };

};