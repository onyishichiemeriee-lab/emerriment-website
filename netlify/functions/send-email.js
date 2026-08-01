const { Resend } = require("resend");

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Import your Day 1 email template
const day1 = require("../../emails/day1");

exports.handler = async (event) => {
  try {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({
          error: "Method Not Allowed",
        }),
      };
    }

    // Ensure API key exists
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing.");
    }

    // Parse request body
    const {
      name,
      email,
      skinType,
      concern,
      oilLevel,
      sensitivity,
      score,
      recommendation,
    } = JSON.parse(event.body);

    // Validate required fields
    if (!name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Name and email are required.",
        }),
      };
    }

    // Generate email content
    const emailTemplate = day1({
      name,
      email,
      skinType,
      concern,
      oilLevel,
      sensitivity,
      score,
      recommendation,
    });

    // Send email
    const response = await resend.emails.send({
      from: "EMerriment <onboarding@resend.dev>",
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log("RESEND RESPONSE:", response);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Email sent successfully.",
        response,
      }),
    };
  } catch (err) {
    console.error("SEND EMAIL ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message,
      }),
    };
  }
};