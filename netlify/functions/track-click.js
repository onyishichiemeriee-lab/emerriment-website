const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {

  try {

    const params = event.queryStringParameters || {};

    const email = params.email;
    const product = params.product;
    const url = params.url;

    if (!email || !url) {
      return {
        statusCode: 400,
        body: "Missing parameters"
      };
    }

    console.log("🖱️ Tracking email click:", {
      email,
      product,
      url
    });


    // -----------------------------------------
    // GET ALL LEAD RECORDS FOR THIS EMAIL
    // -----------------------------------------

    const {
      data: leads,
      error: selectError
    } = await supabase
      .from("leads")
      .select("id, email, emails_clicked")
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

    } else {

      console.log(
        `📊 Found ${leads.length} lead records for ${email}`
      );


      // -----------------------------------------
      // GET CURRENT CLICK COUNT
      // -----------------------------------------

      const currentCount = Math.max(
        ...leads.map(
          lead => Number(lead.emails_clicked || 0)
        )
      );


      const newCount =
        currentCount + 1;


      const clickedAt =
        new Date().toISOString();


      // -----------------------------------------
      // UPDATE CLICK COUNT
      // -----------------------------------------

      const {
        error: updateError
      } = await supabase
        .from("leads")
        .update({
          emails_clicked: newCount,
          last_clicked_at: clickedAt
        })
        .eq("email", email);


      if (updateError) {

        console.error(
          "❌ Supabase UPDATE error:",
          updateError
        );

        throw updateError;

      }


      console.log(
        "✅ Email click count updated:",
        {
          email,
          previousCount: currentCount,
          newCount,
          recordsUpdated: leads.length
        }
      );

    }


    // -----------------------------------------
    // TRACK PRODUCT CLICK
    // -----------------------------------------

    if (product) {

      const {
        error: productError
      } = await supabase
        .from("product_clicks")
        .insert({
          email,
          product,
          clicked_at: new Date().toISOString()
        });


      if (productError) {

        // Product tracking should NOT prevent
        // the user from reaching the destination.

        console.error(
          "⚠️ Failed to track product click:",
          productError
        );

      } else {

        console.log(
          "✅ Product click recorded:",
          product
        );

      }

    }


    // -----------------------------------------
    // REDIRECT USER
    // -----------------------------------------

    return {

      statusCode: 302,

      headers: {
        Location: url
      }

    };


  } catch (err) {

    console.error(
      "❌ TRACK CLICK ERROR:",
      err
    );


    return {

      statusCode: 500,

      body: JSON.stringify({
        success: false,
        error: err.message
      })

    };

  }

};