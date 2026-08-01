const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {

  try {

    const email = event.queryStringParameters.email;

    if (!email) {

      return {

        statusCode: 400,

        body: "Missing email"

      };

    }

    const { data } = await supabase

      .from("leads")

      .select("emails_opened")

      .eq("email", email)

      .single();

    await supabase

      .from("leads")

      .update({

        emails_opened: (data?.emails_opened || 0) + 1,

        last_opened_at: new Date().toISOString()

      })

      .eq("email", email);

    // Return a 1×1 transparent GIF
    const pixel =
      "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

    return {

      statusCode: 200,

      headers: {

        "Content-Type": "image/gif"

      },

      isBase64Encoded: true,

      body: pixel

    };

  } catch (err) {

    console.error(err);

    return {

      statusCode: 500,

      body: err.message

    };

  }

};