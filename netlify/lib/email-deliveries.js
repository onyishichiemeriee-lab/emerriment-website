/* =========================================
   EMerriment Email Delivery Records
   -----------------------------------------
   Optional at-most-once guard backed by the
   `email_deliveries` table (created by the
   migration in supabase/migrations/).

   A row is reserved BEFORE an email is sent.
   The unique key (lead_id, kind, sequence_day)
   makes a second reservation for the same email
   fail, even across crashes, overlapping runs
   or retries after Resend's idempotency window.

   Until the migration is applied the table does
   not exist; every helper then reports
   "unavailable" and callers keep their existing
   behaviour.
========================================= */

const TABLE = "email_deliveries";

// "relation does not exist" (Postgres) and
// "table not in schema cache" (PostgREST).
function isMissingTable(error) {

    if (!error) {
        return false;
    }

    if (error.code === "42P01" || error.code === "PGRST205") {
        return true;
    }

    const message = String(error.message || "");

    return (
        message.includes(TABLE) &&
        (message.includes("does not exist") || message.includes("schema cache"))
    );

}

function isUniqueViolation(error) {

    return Boolean(error && error.code === "23505");

}

// Returns one of:
//   { state: "reserved", id }
//   { state: "duplicate" }   — already sent or in progress
//   { state: "unavailable" } — table not created yet
// Throws on any other database error.
async function reserveDelivery(supabase, { leadId, kind, day }) {

    const { data, error } = await supabase
        .from(TABLE)
        .insert({
            lead_id: leadId,
            kind,
            sequence_day: day,
            status: "sending"
        })
        .select("id");

    if (error) {

        if (isMissingTable(error)) {
            return { state: "unavailable" };
        }

        if (isUniqueViolation(error)) {
            return { state: "duplicate" };
        }

        throw new Error("delivery_reserve_failed");

    }

    const row = Array.isArray(data) ? data[0] : null;

    if (!row || row.id === undefined) {
        throw new Error("delivery_reserve_failed");
    }

    return { state: "reserved", id: row.id };

}

// Delivery accepted by Resend.
async function completeDelivery(supabase, reservation, providerId) {

    if (!reservation || reservation.state !== "reserved") {
        return true;
    }

    const { error } = await supabase
        .from(TABLE)
        .update({
            status: "sent",
            provider_message_id: providerId || null,
            sent_at: new Date().toISOString()
        })
        .eq("id", reservation.id)
        .eq("status", "sending");

    return !error;

}

// Delivery definitely failed: remove the
// reservation so a later retry is allowed.
async function releaseDelivery(supabase, reservation) {

    if (!reservation || reservation.state !== "reserved") {
        return true;
    }

    const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq("id", reservation.id)
        .eq("status", "sending");

    return !error;

}

// Has this exact email already been delivered
// (status "sent")? null when the table is missing.
async function wasDelivered(supabase, { leadId, kind, day }) {

    const { data, error } = await supabase
        .from(TABLE)
        .select("id, status")
        .eq("lead_id", leadId)
        .eq("kind", kind)
        .eq("sequence_day", day)
        .limit(1);

    if (error) {
        return isMissingTable(error) ? null : false;
    }

    const row = Array.isArray(data) ? data[0] : null;

    return Boolean(row && row.status === "sent");

}

module.exports = {
    TABLE,
    isMissingTable,
    reserveDelivery,
    completeDelivery,
    releaseDelivery,
    wasDelivered
};
