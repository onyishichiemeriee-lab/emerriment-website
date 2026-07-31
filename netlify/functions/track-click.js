const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {

  try {

    const email = event.queryStringParameters.email;

    const product = event.queryStringParameters.product;

    const url = event.queryStringParameters.url;

    if (!email || !url) {

      return {

        statusCode:400,

        body:"Missing parameters"

      };

    }

    const { data } = await supabase

      .from("leads")

      .select("emails_clicked")

      .eq("email", email)

      .single();

    await supabase

      .from("leads")

      .update({

        emails_clicked:
          (data?.emails_clicked || 0) + 1,

        last_clicked_at:
          new Date().toISOString()

      })

      .eq("email", email);

    await supabase

      .from("product_clicks")

      .insert({

        email,

        product

      });

    return {

      statusCode:302,

      headers:{

        Location:url

      }

    };

  }

  catch(err){

    console.error(err);

    return{

      statusCode:500,

      body:err.message

    };

  }

};
