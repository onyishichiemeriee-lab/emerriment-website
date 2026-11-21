/* =========================================
   EMerriment — server environment guard (Netlify functions)
   -----------------------------------------
   The ONE place functions get their deploy context, their Supabase
   service-role client, their site URL and permission to send email.

   Deploy context
     Recorded at build time by scripts/write-runtime-config.js in
     ./deploy-context.json (Netlify's CONTEXT). A build-time value cannot
     be overridden at run time. Without it (committed default
     "unconfigured") CONTEXT / EMERRIMENT_CONTEXT are read; anything
     unknown is "unconfigured", which is treated as NON-production.

   Supabase
     production      SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
     everything else STAGING ONLY: STAGING_SUPABASE_PROJECT_REF must be
                     set, must not be the production project, and
                     SUPABASE_URL (and the key's ref, when it carries one)
                     must match it. Production credentials — e.g.
                     inherited from an "all contexts" variable — are
                     refused. There is no fallback: no client is created.
                     (Local development may use a local Supabase.)

   Email
     Sending is allowed in production only. In every other context no
     Resend client is created and every send is blocked before any
     provider call, whatever keys or switches are configured.

   Marketing switches
     EMAIL_CONFIRMATION_ENABLED, EMAIL_SEQUENCE_ENABLED and
     CUSTOMER_ONBOARDING_ENABLED count only in production.

   OpenAI
     OpenAI API calls are allowed in production only. Elsewhere (deploy
     previews, branch deploys, local, unknown context) the key is never
     read and no request is made, even if EMERRIMENT_OPENAI_KEY is present.
========================================= */
"use strict";

const PRODUCTION_PROJECT_REF = "ioeulnjrozkbetaongbv";
const PRODUCTION_SITE_URL = "https://emerriment.com";
const NON_PRODUCTION_PLACEHOLDER_URL = "https://preview.invalid";
const KNOWN_CONTEXTS = new Set(["production", "deploy-preview", "branch-deploy", "dev"]);
const MARKETING_SWITCHES = new Set(["EMAIL_CONFIRMATION_ENABLED", "EMAIL_SEQUENCE_ENABLED", "CUSTOMER_ONBOARDING_ENABLED"]);

function buildTimeContext() {
    try {
        // Bundled with every function; written by the build.
        const recorded = require("./deploy-context.json");
        return recorded && typeof recorded === "object" ? recorded : {};
    } catch (error) {
        return {};
    }
}

function getDeployContext() {
    const recorded = buildTimeContext().context;
    if (typeof recorded === "string" && recorded !== "unconfigured") {
        return KNOWN_CONTEXTS.has(recorded) ? recorded : "unconfigured";
    }
    const env = String(process.env.CONTEXT || process.env.EMERRIMENT_CONTEXT || "").trim();
    return KNOWN_CONTEXTS.has(env) ? env : "unconfigured";
}

function isProduction() {
    return getDeployContext() === "production";
}

function projectRefOf(url) {
    const value = String(url || "").trim().replace(/\/+$/, "");
    const m = /^https:\/\/([a-z0-9]{20})\.supabase\.co$/.exec(value);
    if (m) return m[1];
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d{2,5})?$/.test(value)) return "local";
    return null;
}

function jwtClaims(token) {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return null;
    try {
        return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    } catch (error) {
        return null;
    }
}

// { ok: true, url, key, context } or { ok: false, reason, context }.
// Never returns or logs a key.
function getServerSupabaseConfig() {
    const context = getDeployContext();
    const url = String(process.env.SUPABASE_URL || "").trim();
    const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

    if (!url || !key) {
        return { ok: false, reason: "supabase_not_configured", context };
    }
    if (context === "production") {
        return { ok: true, url, key, context };
    }

    const ref = projectRefOf(url);
    const claims = jwtClaims(key);
    if (ref === PRODUCTION_PROJECT_REF || (claims && claims.ref === PRODUCTION_PROJECT_REF)) {
        return { ok: false, reason: "production_credentials_refused_outside_production", context };
    }
    if (context === "dev" && ref === "local") {
        return { ok: true, url, key, context };
    }
    const staging = String(process.env.STAGING_SUPABASE_PROJECT_REF || "").trim();
    if (!staging || staging === PRODUCTION_PROJECT_REF || !/^[a-z0-9]{20}$/.test(staging)) {
        return { ok: false, reason: "staging_project_ref_not_configured", context };
    }
    if (ref !== staging || (claims && claims.ref && claims.ref !== staging)) {
        return { ok: false, reason: "credentials_do_not_match_staging_project", context };
    }
    return { ok: true, url, key, context };
}

const refusalsLogged = new Set();
function logRefusal(where, reason, context) {
    const tag = `${where}:${reason}`;
    if (refusalsLogged.has(tag)) return;
    refusalsLogged.add(tag);
    console.error(`ENVIRONMENT: no Supabase client for ${where} (${reason}; context ${context}).`);
}

// A service-role client for this deploy's own project, or null.
function createServiceClient(where = "function") {
    const config = getServerSupabaseConfig();
    if (!config.ok) {
        logRefusal(where, config.reason, config.context);
        return null;
    }
    const { createClient } = require("@supabase/supabase-js");
    return createClient(config.url, config.key, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
}

function emailDeliveryAllowed() {
    return isProduction();
}

// A Resend client only where email may be sent; null everywhere else.
function createMailer(apiKey) {
    if (!emailDeliveryAllowed() || !apiKey) return null;
    const { Resend } = require("resend");
    return new Resend(apiKey);
}

// OpenAI (paid, external) may be called from production only.
function openAiAllowed() {
    return isProduction();
}

// The OpenAI key, or null outside production (it is never even read there).
function getOpenAiKey() {
    if (!openAiAllowed()) return null;
    return process.env.EMERRIMENT_OPENAI_KEY || null;   // production: exactly as before
}

function marketingSwitch(name) {
    if (!MARKETING_SWITCHES.has(name)) throw new Error("unknown marketing switch " + name);
    return isProduction() && process.env[name] === "true";
}

function validUrl(value, { allowHttpLocal = false } = {}) {
    const v = String(value || "").trim().replace(/\/+$/, "");
    if (/^https:\/\/[A-Za-z0-9.-]+(:\d+)?$/.test(v)) return v;
    if (allowHttpLocal && /^http:\/\/(localhost|127\.0\.0\.1)(:\d{2,5})?$/.test(v)) return v;
    return null;
}

// This deploy's own address. Production: URL (else emerriment.com).
// Elsewhere: the deploy's own URL, never the production domain.
function getSiteUrl() {
    const recorded = buildTimeContext();
    if (isProduction()) {
        return validUrl(process.env.URL) || validUrl(recorded.siteUrl) || PRODUCTION_SITE_URL;
    }
    const candidates = [recorded.deployPrimeUrl, process.env.DEPLOY_PRIME_URL, recorded.deployUrl, process.env.DEPLOY_URL];
    if (getDeployContext() === "dev") candidates.push(process.env.URL);
    for (const c of candidates) {
        const v = validUrl(c, { allowHttpLocal: getDeployContext() === "dev" });
        if (v && !/(^|\/\/)(www\.)?emerriment\.com$/.test(v) && v !== "https://emerriment216.netlify.app") return v;
    }
    return NON_PRODUCTION_PLACEHOLDER_URL;
}

module.exports = {
    PRODUCTION_PROJECT_REF,
    PRODUCTION_SITE_URL,
    NON_PRODUCTION_PLACEHOLDER_URL,
    getDeployContext,
    isProduction,
    getServerSupabaseConfig,
    createServiceClient,
    emailDeliveryAllowed,
    createMailer,
    openAiAllowed,
    getOpenAiKey,
    marketingSwitch,
    getSiteUrl
};
