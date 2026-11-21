#!/usr/bin/env node
/* =========================================
   EMerriment — per-environment runtime configuration
   -----------------------------------------
   Netlify build command (netlify.toml [build] command). Netlify sets
   CONTEXT for every build: "production", "deploy-preview",
   "branch-deploy" (and "dev" locally). This script writes two files
   into the build workspace — never committed with real values:

     js/runtime-config.js            browser: which Supabase project
                                     (URL + PUBLIC anon key) this deploy
                                     may use
     netlify/lib/deploy-context.json functions: the build context and
                                     this deploy's own URLs (no secrets)

   Rules
   * production     → the production project (public URL + anon key,
                      below; they are public by design).
   * deploy-preview,
     branch-deploy,
     dev            → the STAGING project from
                      STAGING_PUBLIC_SUPABASE_URL and
                      STAGING_PUBLIC_SUPABASE_ANON_KEY. Never production:
                      a production URL/ref, a service-role or secret key,
                      or missing values produce a FAIL-CLOSED file
                      (no Supabase in the browser, with a reason).
   * anything else  → fail-closed ("unconfigured").
   Service-role keys never reach the browser: they are refused here and
   in js/supabase-config.js.

   Local use:  EMERRIMENT_CONTEXT=dev STAGING_PUBLIC_SUPABASE_URL=... \
               STAGING_PUBLIC_SUPABASE_ANON_KEY=... node scripts/write-runtime-config.js
   Restore the committed (fail-closed) files before committing:
               git checkout js/runtime-config.js netlify/lib/deploy-context.json
   Tests:      --out-dir <dir> writes both files below <dir>.
========================================= */
"use strict";

const fs = require("fs");
const path = require("path");

const PRODUCTION = Object.freeze({
    projectRef: "ioeulnjrozkbetaongbv",
    url: "https://ioeulnjrozkbetaongbv.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZXVsbmpyb3prYmV0YW9uZ2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjQxMzQsImV4cCI6MjA5NTMwMDEzNH0.I3WhW8lnThCZVo1bFHwbl6X8t5xT9tspnTdoR3nlSNc"
});

const NON_PRODUCTION_CONTEXTS = new Set(["deploy-preview", "branch-deploy", "dev"]);

function projectRefOf(url) {
    const m = /^https:\/\/([a-z0-9]{20})\.supabase\.co\/?$/.exec(String(url || ""));
    if (m) return m[1];
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d{2,5})?\/?$/.test(String(url || ""))) return "local";
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

// Returns null when the key is acceptable in a browser, otherwise why not.
function browserKeyProblem(key, ref) {
    const k = String(key || "");
    if (!k) return "missing public key";
    if (/^sb_secret_/.test(k)) return "a secret key must never be sent to the browser";
    if (/^sb_publishable_/.test(k)) return null;
    const claims = jwtClaims(k);
    if (!claims) return "public key is not a recognised Supabase key";
    if (claims.role !== "anon") return `key role "${claims.role}" is not allowed in the browser (anon only)`;
    if (claims.ref && ref !== "local" && claims.ref !== ref) return "public key belongs to a different project than the URL";
    return null;
}

function resolve(env) {
    const context = String(env.CONTEXT || env.EMERRIMENT_CONTEXT || "").trim() || "unconfigured";
    const failClosed = (reason) => ({ context, supabaseUrl: null, supabaseAnonKey: null, reason });

    if (context === "production") {
        return { context, supabaseUrl: PRODUCTION.url, supabaseAnonKey: PRODUCTION.anonKey, reason: null };
    }
    if (!NON_PRODUCTION_CONTEXTS.has(context)) {
        return failClosed(`unknown deploy context "${context}"`);
    }

    const url = String(env.STAGING_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
    const key = String(env.STAGING_PUBLIC_SUPABASE_ANON_KEY || "").trim();
    if (!url || !key) {
        return failClosed(`staging Supabase is not configured for ${context} (STAGING_PUBLIC_SUPABASE_URL / STAGING_PUBLIC_SUPABASE_ANON_KEY)`);
    }
    const ref = projectRefOf(url);
    if (!ref) return failClosed("STAGING_PUBLIC_SUPABASE_URL is not a Supabase project URL");
    if (ref === "local" && context !== "dev") return failClosed("a local Supabase URL is only allowed in local development");
    const claims = jwtClaims(key);
    if (ref === PRODUCTION.projectRef || (claims && claims.ref === PRODUCTION.projectRef) || key === PRODUCTION.anonKey) {
        return failClosed(`production Supabase is never used in ${context}`);
    }
    const problem = browserKeyProblem(key, ref);
    if (problem) return failClosed(problem);
    return { context, supabaseUrl: url, supabaseAnonKey: key, reason: null };
}

function safeUrl(value) {
    const v = String(value || "").trim().replace(/\/+$/, "");
    return /^https?:\/\/[A-Za-z0-9.-]+(:\d{2,5})?$/.test(v) ? v : null;
}

function render(config, env) {
    const browser = {
        context: config.context,
        supabaseUrl: config.supabaseUrl,
        supabaseAnonKey: config.supabaseAnonKey,
        reason: config.reason
    };
    const runtimeJs =
        "/* Generated by scripts/write-runtime-config.js for this deploy. Do not edit or commit real values. */\n" +
        "window.EMERRIMENT_RUNTIME = Object.freeze(" + JSON.stringify(browser) + ");\n";
    const deployContext = {
        context: config.context,
        siteUrl: safeUrl(env.URL),
        deployPrimeUrl: safeUrl(env.DEPLOY_PRIME_URL),
        deployUrl: safeUrl(env.DEPLOY_URL)
    };
    return { runtimeJs, deployContextJson: JSON.stringify(deployContext, null, 2) + "\n" };
}

function write(env, outDir) {
    const config = resolve(env);
    const files = render(config, env);
    const root = outDir || path.resolve(__dirname, "..");
    fs.mkdirSync(path.join(root, "js"), { recursive: true });
    fs.mkdirSync(path.join(root, "netlify", "lib"), { recursive: true });
    fs.writeFileSync(path.join(root, "js", "runtime-config.js"), files.runtimeJs);
    fs.writeFileSync(path.join(root, "netlify", "lib", "deploy-context.json"), files.deployContextJson);
    return config;
}

if (require.main === module) {
    const i = process.argv.indexOf("--out-dir");
    const outDir = i > 0 ? path.resolve(process.argv[i + 1]) : null;
    const config = write(process.env, outDir);
    const where = config.supabaseUrl ? (config.context === "production" ? "production project" : "staging project") : "NONE (fail-closed)";
    // Never prints keys.
    console.log(`EMerriment runtime config: context=${config.context}, browser Supabase=${where}${config.reason ? ", reason: " + config.reason : ""}`);
}

module.exports = { resolve, render, write, projectRefOf, browserKeyProblem, PRODUCTION_PROJECT_REF: PRODUCTION.projectRef };
