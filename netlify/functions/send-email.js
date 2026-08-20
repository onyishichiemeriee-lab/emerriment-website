const { Resend } = require("resend");

const emails = require("../../emails");

const resend =
    new Resend(process.env.RESEND_API_KEY);


/* =========================================
   EMerriment Email Function
========================================= */

exports.handler = async (event) => {

    try {

        /* -----------------------------------------
           METHOD
        ----------------------------------------- */

        if (event.httpMethod !== "POST") {

            return {

                statusCode: 405,

                body: JSON.stringify({
                    error: "Method Not Allowed"
                })

            };

        }


        /* -----------------------------------------
           API KEY
        ----------------------------------------- */

        if (!process.env.RESEND_API_KEY) {

            throw new Error(
                "RESEND_API_KEY is missing."
            );

        }


        /* -----------------------------------------
           REQUEST BODY
        ----------------------------------------- */

        const body =
            JSON.parse(
                event.body || "{}"
            );


        const {

            type = "report",

            day,

            name,

            email,

            skinType,

            concern,

            oilLevel,

            sensitivity,

            score,

            recommendation,

            title,

            content,

            subject

        } = body;


        /* -----------------------------------------
           VALIDATE EMAIL
        ----------------------------------------- */

        if (!email) {

            return {

                statusCode: 400,

                body: JSON.stringify({
                    error:
                        "Email address is required."
                })

            };

        }


        /* -----------------------------------------
           SELECT TEMPLATE
        ----------------------------------------- */

        let template;


        if (type === "day") {

            const dayNumber =
                Number(day);


            if (
                !dayNumber ||
                dayNumber < 1 ||
                dayNumber > 14 ||
                !emails[dayNumber]
            ) {

                return {

                    statusCode: 400,

                    body: JSON.stringify({
                        error:
                            "Invalid email day. Choose Day 1-14."
                    })

                };

            }


            template =
                emails[dayNumber]({

                    name,
                    email,

                    skinType,
                    concern,
                    oilLevel,
                    sensitivity,

                    score,
                    recommendation

                });

        }


        else if (type === "welcome") {

            template =
                emails.welcome({

                    name,
                    email

                });

        }


        else if (type === "report") {

            template =
                emails.report({

                    name,
                    email,

                    skinType,
                    concern,
                    oilLevel,
                    sensitivity,

                    score,
                    recommendation

                });

        }


        else if (type === "newsletter") {

            template =
                emails.newsletter({

                    name,
                    email,

                    title,
                    content,
                    subject

                });

        }


        else {

            return {

                statusCode: 400,

                body: JSON.stringify({
                    error:
                        "Unknown email type."
                })

            };

        }


        /* -----------------------------------------
           SEND EMAIL
        ----------------------------------------- */

        const response =
            await resend.emails.send({

                from:
                    "EMerriment <onboarding@resend.dev>",

                to:
                    email,

                subject:
                    template.subject,

                html:
                    template.html

            });


        console.log(
            "RESEND RESPONSE:",
            response
        );


        /* -----------------------------------------
           SUCCESS
        ----------------------------------------- */

        return {

            statusCode: 200,

            body: JSON.stringify({

                success: true,

                message:
                    "Email sent successfully.",

                type,

                response

            })

        };


    } catch (error) {

        console.error(
            "SEND EMAIL ERROR:",
            error
        );


        return {

            statusCode: 500,

            body: JSON.stringify({

                success: false,

                error:
                    error.message

            })

        };

    }

};