/* =========================================
   EMerriment — verified customer onboarding
   -----------------------------------------
   Scheduled (netlify.toml, 07:00 UTC = 08:00 Africa/Lagos). Sends the
   onboarding emails in emails/customer-onboarding.js (days 0, 3, 10) to
   VERIFIED purchases only — rows in public.purchases, which only the
   service role can write (a signed provider webhook or an administrator
   recording an order checked in the Selar dashboard). A checkout click
   never creates a purchase.

   Safety
   * Sends nothing unless CUSTOMER_ONBOARDING_ENABLED=true.
   * At most once per purchase and day: a row in email_deliveries
     (purchase_id, 'customer', day) is reserved BEFORE sending, and the
     Resend idempotency key repeats it. Without that table/column the
     function sends nothing (fails closed).
   * At most one email per purchase per run (no catch-up bursts).
   * Refunded purchases and unsubscribed addresses are skipped.
   * Day 10 asks for a reply, so it is only sent when EMAIL_REPLY_TO
     names a real inbox.
   * Purchases older than 30 days are not started (no bulk mailing of
     historical customers when this is switched on).
========================================= */
"use strict";

const { createServiceClient, createMailer, emailDeliveryAllowed, marketingSwitch } = require("../lib/environment");

const onboarding = require("../../emails/customer-onboarding");
const {
    isValidEmail,
    normalizeEmail,
    buildTracking,
    unsubscribeHeaders,
    sendWithResend,
    getReplyTo,
    isValidLeadId
} = require("../lib/email-common");
const { completeDelivery, releaseDelivery, isMissingTable } = require("../lib/email-deliveries");

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_AGE_MS = 30 * DAY_MS;
const BATCH_SIZE = 100;
const TIME_BUDGET_MS = 20 * 1000;
const STATUS_UNSUBSCRIBED = "Unsubscribed";

// Product codes recorded in public.purchases → names used in the emails.
const PRODUCT_NAMES = {
    "21-days-to-glow": "21 Days To Glow Challenge",
    "fade-and-glow": "Fade & Glow Bundle"
};

// Production only: outside production the switch is always off.
function isEnabled() {
    return marketingSwitch("CUSTOMER_ONBOARDING_ENABLED");
}

function respond(statusCode, body) {
    return { statusCode, body: JSON.stringify(body) };
}

// This deploy's own Supabase project only; Resend in production only
// (netlify/lib/environment.js).
function getClients() {
    const resendKey = process.env.RESEND_API_KEY;
    const emailAllowed = emailDeliveryAllowed();
    if (emailAllowed && !resendKey) return null;
    const supabase = createServiceClient("customer-onboarding");
    if (!supabase) return null;
    return { resend: emailAllowed ? createMailer(resendKey) : null, supabase };
}

async function loadUnsubscribed(supabase) {
    const { data, error } = await supabase.from("leads").select("email").eq("status", STATUS_UNSUBSCRIBED);
    if (error) return null;
    return new Set((data || []).map((row) => normalizeEmail(row.email)).filter(Boolean));
}

async function loadDelivered(supabase, purchaseIds) {
    if (!purchaseIds.length) return new Map();
    const { data, error } = await supabase
        .from("email_deliveries")
        .select("purchase_id, sequence_day")
        .eq("kind", "customer")
        .in("purchase_id", purchaseIds);
    if (error) return null;
    const map = new Map();
    for (const row of data || []) {
        if (!map.has(row.purchase_id)) map.set(row.purchase_id, new Set());
        map.get(row.purchase_id).add(Number(row.sequence_day));
    }
    return map;
}

// Earliest onboarding day that is due and not yet sent.
function nextDueDay(purchase, sentDays, now) {
    const verifiedAt = new Date(purchase.verified_at).getTime();
    for (const day of onboarding.DAYS) {
        if (sentDays.has(day)) continue;
        return verifiedAt + day * DAY_MS <= now ? day : null;
    }
    return null;
}

async function reserve(supabase, purchaseId, day) {
    const { data, error } = await supabase
        .from("email_deliveries")
        .insert({ purchase_id: purchaseId, kind: "customer", sequence_day: day, status: "sending" })
        .select("id");
    if (error) {
        if (error.code === "23505") return { state: "duplicate" };
        if (isMissingTable(error) || error.code === "42703" || error.code === "PGRST204" || error.code === "23514") {
            return { state: "unavailable" };
        }
        return { state: "failed" };
    }
    const row = Array.isArray(data) ? data[0] : null;
    return row && row.id !== undefined ? { state: "reserved", id: row.id } : { state: "failed" };
}

async function processPurchase(supabase, resend, purchase, sentDays, unsubscribed, now) {
    const recipient = typeof purchase.email === "string" ? purchase.email.trim() : "";
    if (!isValidEmail(recipient)) return "skipped_invalid_email";
    if (unsubscribed.has(normalizeEmail(recipient))) return "skipped_unsubscribed";

    const day = nextDueDay(purchase, sentDays, now);
    if (day === null) return "nothing_due";
    if (day === 10 && !getReplyTo()) return "skipped_feedback_no_reply_inbox";

    const reservation = await reserve(supabase, purchase.id, day);
    if (reservation.state === "duplicate") return "skipped_already_sent";
    if (reservation.state === "unavailable") return "failed_no_delivery_log";
    if (reservation.state !== "reserved") return "failed_reserve";

    const tracking = isValidLeadId(String(purchase.lead_id || "")) ? buildTracking(purchase.lead_id) : null;
    let email = null;
    try {
        email = onboarding[day]({
            name: purchase.name || null,
            productName: PRODUCT_NAMES[purchase.product_code] || null,
            tracking
        });
    } catch (error) {
        email = null;
    }

    const delivery = email
        ? await sendWithResend(resend, {
            to: recipient,
            subject: email.subject,
            html: email.html,
            headers: tracking ? unsubscribeHeaders(tracking) : undefined
        }, `customer-${purchase.id}-day-${day}`)
        : { ok: false };

    if (!delivery.ok) {
        await releaseDelivery(supabase, reservation);
        return "failed_delivery";
    }

    await completeDelivery(supabase, reservation, delivery.id);
    return "sent_day_" + day;
}

exports.handler = async () => {
    if (!isEnabled()) {
        console.log("CUSTOMER ONBOARDING: disabled (CUSTOMER_ONBOARDING_ENABLED is not \"true\"); nothing sent.");
        return respond(200, { message: "Customer onboarding is disabled." });
    }

    const clients = getClients();
    if (!clients) {
        console.error("CUSTOMER ONBOARDING: required server configuration is missing.");
        return respond(500, { error: "Customer onboarding is not configured." });
    }

    const { supabase, resend } = clients;
    const startedAt = Date.now();
    const summary = {};
    const count = (outcome) => { summary[outcome] = (summary[outcome] || 0) + 1; };

    try {
        const since = new Date(Date.now() - MAX_AGE_MS).toISOString();
        const { data: purchases, error } = await supabase
            .from("purchases")
            .select("*")
            .is("refunded_at", null)
            .gte("verified_at", since)
            .order("verified_at", { ascending: true })
            .limit(BATCH_SIZE);

        if (error) {
            if (isMissingTable(error) || /purchases/.test(String(error.message || ""))) {
                console.warn("CUSTOMER ONBOARDING: purchases table not found (migration 20261117090000 not applied); nothing sent.");
                return respond(200, { message: "No verified purchases table yet.", summary: { purchases_table_missing: true } });
            }
            throw new Error("purchases_lookup_failed");
        }

        const unsubscribed = await loadUnsubscribed(supabase);
        if (unsubscribed === null) throw new Error("unsubscribe_lookup_failed");

        const delivered = await loadDelivered(supabase, (purchases || []).map((p) => p.id));
        if (delivered === null) {
            console.warn("CUSTOMER ONBOARDING: delivery records unavailable; nothing sent (at-most-once cannot be guaranteed).");
            return respond(200, { message: "Delivery records unavailable.", summary: { delivery_log_unavailable: true } });
        }

        const now = Date.now();
        for (const purchase of purchases || []) {
            if (Date.now() - startedAt > TIME_BUDGET_MS) { count("deferred_time_budget"); continue; }
            try {
                count(await processPurchase(supabase, resend, purchase, delivered.get(purchase.id) || new Set(), unsubscribed, now));
            } catch (purchaseError) {
                count("failed_unexpected");
            }
        }

        console.log("CUSTOMER ONBOARDING: run complete.", summary);
        return respond(200, { message: "Customer onboarding completed.", summary });
    } catch (err) {
        console.error("CUSTOMER ONBOARDING: run failed.", {
            stage: err && /^[a-z_]+$/.test(err.message) ? err.message : "unknown",
            summary
        });
        return respond(500, { error: "Customer onboarding failed." });
    }
};

// For tests.
exports._internal = { nextDueDay, PRODUCT_NAMES };
