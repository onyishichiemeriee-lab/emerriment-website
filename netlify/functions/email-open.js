const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {

    try {

        const email =
            event.queryStringParameters?.email;

        if (!email) {

            return {
                statusCode: 400,
                body: "Missing email"
            };

        }

        console.log("📧 Tracking email open:", email);


        // -----------------------------------------
        // GET ALL LEAD RECORDS FOR THIS EMAIL
        // -----------------------------------------

        const {
            data: leads,
            error: selectError
        } = await supabase

            .from("leads")

            .select("id, email, emails_opened")

            .eq("email", email);


        if (selectError) {

            console.error(
                "❌ Supabase SELECT error:",
                selectError
            );

            throw selectError;

        }


        if (!leads || leads.length === 0) {

            console.warn(
                "⚠️ No lead found for:",
                email
            );

            return {
                statusCode: 200,

                headers: {
                    "Content-Type": "image/gif",
                    "Cache-Control": "no-cache, no-store, must-revalidate"
                },

                isBase64Encoded: true,

                body:
                    "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
            };

        }


        console.log(
            `📊 Found ${leads.length} records for ${email}`
        );


        // -----------------------------------------
        // CALCULATE CURRENT OPEN COUNT
        // -----------------------------------------

        const currentCount = Math.max(
            ...leads.map(
                lead => Number(lead.emails_opened || 0)
            )
        );


        const newCount =
            currentCount + 1;


        const openedAt =
            new Date().toISOString();


        // -----------------------------------------
        // UPDATE ALL RECORDS FOR THIS SUBSCRIBER
        // -----------------------------------------

        const {
            data: updatedData,
            error: updateError
        } = await supabase

            .from("leads")

            .update({

                emails_opened:
                    newCount,

                last_opened_at:
                    openedAt

            })

            .eq("email", email)

            .select(
                "id, email, emails_opened, last_opened_at"
            );


        if (updateError) {

            console.error(
                "❌ Supabase UPDATE error:",
                updateError
            );

            throw updateError;

        }


        console.log(
            "✅ Email open recorded:",
            {
                email,
                previousCount: currentCount,
                newCount,
                recordsUpdated:
                    updatedData?.length || 0
            }
        );


        // -----------------------------------------
        // 1×1 TRANSPARENT GIF
        // -----------------------------------------

        const pixel =
            "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";


        return {

            statusCode: 200,

            headers: {

                "Content-Type":
                    "image/gif",

                "Cache-Control":
                    "no-cache, no-store, must-revalidate",

                "Pragma":
                    "no-cache",

                "Expires":
                    "0"

            },

            isBase64Encoded: true,

            body: pixel

        };


    } catch (error) {

        console.error(
            "❌ EMAIL OPEN ERROR:",
            error
        );


        return {

            statusCode: 500,

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                success: false,

                error:
                    error.message

            })

        };

    }

};