const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");

// Import all email lessons
const emails = require("../../emails");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async () => {

  try {

    const now = new Date().toISOString();

    const { data: subscribers, error } = await supabase
      .from("leads")
      .select("*")
      .lte("next_email_due", now);

    if (error) throw error;

    for (const subscriber of subscribers) {

      // Load today's lesson automatically
      const lesson = emails[subscriber.email_sequence_day];

      if (!lesson) {

        console.log(
          `No lesson found for day ${subscriber.email_sequence_day}`
        );

        continue;

      }

      // Generate personalized email
      const email = lesson({
        name: subscriber.name
      });

      // Send email
      await resend.emails.send({

        from: "EMerriment <onboarding@resend.dev>",

        to: subscriber.email,

        subject: email.subject,

        html: email.html

      });

      // Update subscriber progress
      await supabase
        .from("leads")
        .update({

          email_sequence_day:
            subscriber.email_sequence_day + 1,

          last_sequence_email_sent:
            new Date().toISOString(),

          next_email_due:
            new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ).toISOString()

        })

        .eq("id", subscriber.id);

    }

    return {

      statusCode: 200,

      body: JSON.stringify({

        message: "Email sequence completed."

      })

    };

  } catch (err) {

    console.error(err);

    return {

      statusCode: 500,

      body: JSON.stringify({

        error: err.message

      })

    };

  }

};

// Run automatically once every day
exports.config = {

  schedule: "@daily"

};