const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");

// Import all email lessons
const emails = require("../../emails");

const {
    isValidEmail,
    normalizeEmail,
    buildTracking,
    unsubscribeHeaders,
    sendWithResend,
    isValueRejected
} = require("../lib/email-common");


/* =========================================
   EMerriment 14-Day Email Sequence
   -----------------------------------------
   Runs on a schedule. For each lead whose next
   lesson is due, sends that day's lesson and
   moves the lead to the next day.

   Intended schedule (unchanged):
   - The quiz creates the lead with
     email_sequence_day = 1 and next_email_due =
     24 hours after the quiz.
   - Each successful send advances the day by one
     and sets the next lesson 24 hours later.
   - After Day 14 is sent the lead moves to day 15,
     which means "completed" (the admin dashboard
     already treats day > 14 as completed). No
     Day 15 email exists or is sent.

   Protections:
   - Only days 1–14 are selected.
   - Each lead is claimed with a conditional
     update on its current day and due time, so
     overlapping runs cannot send a lesson twice.
   - A failed send releases the claim and is
     retried on the next run; the day only
     advances after Resend accepts the email.
   - Unsubscribed addresses are skipped.
   - Invalid addresses are skipped.
   - Each run is bounded in size and time.
========================================= */


const DAY_MS = 24 * 60 * 60 * 1000;

const FIRST_DAY = 1;
const LAST_DAY = 14;

// Leads processed per run, and time budget per
// run, so the function finishes before Netlify's
// time limit and respects Resend's rate limit.
const BATCH_SIZE = 50;
const TIME_BUDGET_MS = 20 * 1000;

// While a lesson is being sent, its due time is
// pushed forward by this lease so other runs skip
// it. If the run crashes the lead is retried once
// the lease expires.
const CLAIM_LEASE_MS = 2 * 60 * 60 * 1000;

const STATUS_UNSUBSCRIBED = "Unsubscribed";


function getClients() {

    const resendKey = process.env.RESEND_API_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!resendKey || !supabaseUrl || !serviceRoleKey) {
        return null;
    }

    return {
        resend: new Resend(resendKey),
        supabase: createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        })
    };

}


function respond(statusCode, body) {

    return {
        statusCode,
        body: JSON.stringify(body)
    };

}


// Normalized addresses that have unsubscribed on
// any of their leads. Returns null on error.
async function loadUnsubscribedAddresses(supabase) {

    const { data, error } = await supabase
        .from("leads")
        .select("email")
        .eq("status", STATUS_UNSUBSCRIBED);

    if (error) {

        // The status column does not accept the
        // value, so no lead can be unsubscribed.
        if (isValueRejected(error)) {
            return new Set();
        }

        return null;

    }

    return new Set(
        (Array.isArray(data) ? data : [])
            .map((row) => normalizeEmail(row.email))
            .filter(Boolean)
    );

}


async function processLead(supabase, resend, lead, unsubscribed) {

    const day = Number(lead.email_sequence_day);

    if (!Number.isInteger(day) || day < FIRST_DAY || day > LAST_DAY) {
        return "skipped_invalid_day";
    }

    const lesson = emails[day];

    if (typeof lesson !== "function") {
        return "skipped_missing_lesson";
    }

    if (
        lead.status === STATUS_UNSUBSCRIBED ||
        unsubscribed.has(normalizeEmail(lead.email))
    ) {
        return "skipped_unsubscribed";
    }

    const recipient =
        typeof lead.email === "string" ? lead.email.trim() : "";

    if (!isValidEmail(recipient)) {
        return "skipped_invalid_email";
    }

    /* ---------- Claim ----------
       Matches only if no other run has changed this
       lead's day or due time since it was read. */

    const claimUntil =
        new Date(Date.now() + CLAIM_LEASE_MS).toISOString();

    const { data: claimed, error: claimError } = await supabase
        .from("leads")
        .update({ next_email_due: claimUntil })
        .eq("id", lead.id)
        .eq("email_sequence_day", lead.email_sequence_day)
        .eq("next_email_due", lead.next_email_due)
        .select("id");

    if (claimError) {
        return "failed_claim";
    }

    if (!Array.isArray(claimed) || claimed.length !== 1) {
        return "skipped_already_claimed";
    }

    /* ---------- Render and send ---------- */

    const tracking = buildTracking(lead.id);

    let email;

    try {
        email = lesson({
            name: lead.name,
            email: recipient,
            tracking
        });
    } catch (error) {
        email = null;
    }

    const delivery = email
        ? await sendWithResend(
            resend,
            {
                to: recipient,
                subject: email.subject,
                html: email.html,
                headers: unsubscribeHeaders(tracking)
            },
            `sequence-lead-${lead.id}-day-${day}`
        )
        : { ok: false };

    if (!delivery.ok) {

        // Put the original due time back so the
        // next run retries this lesson. Only if
        // this run still holds the claim.
        await supabase
            .from("leads")
            .update({ next_email_due: lead.next_email_due })
            .eq("id", lead.id)
            .eq("email_sequence_day", lead.email_sequence_day)
            .eq("next_email_due", claimUntil);

        return "failed_delivery";

    }

    /* ---------- Advance ---------- */

    const sentAt = new Date();

    const { error: advanceError } = await supabase
        .from("leads")
        .update({
            email_sequence_day: day + 1,
            last_sequence_email_sent: sentAt.toISOString(),
            next_email_due: new Date(sentAt.getTime() + DAY_MS).toISOString()
        })
        .eq("id", lead.id)
        .eq("email_sequence_day", lead.email_sequence_day)
        .eq("next_email_due", claimUntil);

    if (advanceError) {
        // Delivered but not advanced. The claim lease
        // keeps it from being picked up again
        // immediately; the idempotency key guards a
        // retry within Resend's 24-hour window.
        console.error(
            "EMAIL SEQUENCE: sent but progress not saved.",
            { leadId: lead.id, day }
        );
        return "sent_not_advanced";
    }

    return day === LAST_DAY ? "sent_completed" : "sent";

}


exports.handler = async () => {

    const clients = getClients();

    if (!clients) {
        console.error("EMAIL SEQUENCE: required server configuration is missing.");
        return respond(500, { error: "Email sequence is not configured." });
    }

    const { supabase, resend } = clients;

    const startedAt = Date.now();

    const summary = {};

    const count = (outcome) => {
        summary[outcome] = (summary[outcome] || 0) + 1;
    };

    try {

        const now = new Date().toISOString();

        const { data: leads, error } = await supabase
            .from("leads")
            .select("*")
            .gte("email_sequence_day", FIRST_DAY)
            .lte("email_sequence_day", LAST_DAY)
            .lte("next_email_due", now)
            .order("next_email_due", { ascending: true })
            .limit(BATCH_SIZE);

        if (error) {
            throw new Error("due_leads_lookup_failed");
        }

        const unsubscribed = await loadUnsubscribedAddresses(supabase);

        if (unsubscribed === null) {
            // Without the unsubscribe list we cannot
            // safely send marketing email.
            throw new Error("unsubscribe_lookup_failed");
        }

        for (const lead of leads || []) {

            if (Date.now() - startedAt > TIME_BUDGET_MS) {
                count("deferred_time_budget");
                continue;
            }

            try {
                count(await processLead(supabase, resend, lead, unsubscribed));
            } catch (leadError) {
                count("failed_unexpected");
            }

        }

        console.log("EMAIL SEQUENCE: run complete.", summary);

        return respond(200, {
            message: "Email sequence completed.",
            summary
        });

    } catch (err) {

        console.error(
            "EMAIL SEQUENCE: run failed.",
            {
                stage: err && /^[a-z_]+$/.test(err.message) ? err.message : "unknown",
                summary
            }
        );

        return respond(500, { error: "Email sequence failed." });

    }

};

// Run automatically once every day
exports.config = {

  schedule: "@daily"

};
