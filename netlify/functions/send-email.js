const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Import Email Day 1
const day1 = require("../../emails/day1");

exports.handler = async (event) => {

  try {

    if (event.httpMethod !== "POST") {

      return {
        statusCode: 405,
        body: JSON.stringify({
          message: "Method Not Allowed"
        })
      };

    }

    const {

      name,
      email,
      skinType,
      concern,
      oilLevel,
      sensitivity,
      score,
      recommendation

    } = JSON.parse(event.body);

    // Generate Day 1 Email
    const emailTemplate = day1({ name });

    const response = await resend.emails.send({

      from: "EMerriment <onboarding@resend.dev>",

      to: email,

      subject: emailTemplate.subject,

      html: emailTemplate.html

    });

    console.log("RESEND RESPONSE:", response);

    return {

      statusCode: 200,

      body: JSON.stringify(response)

    };

  }

  catch (err) {

    console.error(err);

    return {

      statusCode: 500,

      body: JSON.stringify({

        error: err.message

      })

    };

  }

};