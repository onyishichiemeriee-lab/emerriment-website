/* =========================================
   EMerriment — the ONE browser Supabase configuration guard
   -----------------------------------------
   Every page loads, in this order:
     /js/runtime-config.js   (generated per deploy: context, project URL,
                              PUBLIC anon key — or a fail-closed reason)
     /js/supabase-config.js  (this file)
   and every browser Supabase client is created through
   window.EmerrimentSupabase.createClient(options).

   It refuses — returns null, logs, and shows a visible notice — when:
   * the runtime configuration is missing or incomplete;
   * the key is a service-role or secret key (anon/publishable only);
   * the production project would be used anywhere except the exact
     production hosts in a production build (deploy previews, branch
     deploys, deploy permalinks and localhost can never reach it);
   * a production build does not point at the production project.
   There is no fallback to production.
========================================= */
(function () {
    "use strict";

    var PRODUCTION_PROJECT_REF = "ioeulnjrozkbetaongbv";
    var PRODUCTION_HOSTS = ["emerriment.com", "www.emerriment.com", "emerriment216.netlify.app"];
    var LOCAL_HOSTS = ["localhost", "127.0.0.1"];

    function projectRefOf(url) {
        var m = /^https:\/\/([a-z0-9]{20})\.supabase\.co\/?$/.exec(String(url || ""));
        if (m) return m[1];
        if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d{2,5})?\/?$/.test(String(url || ""))) return "local";
        return null;
    }

    function jwtClaims(token) {
        var parts = String(token || "").split(".");
        if (parts.length !== 3) return null;
        try {
            var b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            while (b64.length % 4) b64 += "=";
            return JSON.parse(window.atob(b64));
        } catch (e) {
            return null;
        }
    }

    function fail(reason) {
        return { ok: false, reason: reason };
    }

    function resolve() {
        var rt = window.EMERRIMENT_RUNTIME;
        var host = String((window.location && window.location.hostname) || "").toLowerCase();

        if (!rt || typeof rt !== "object") {
            return fail("runtime configuration is missing (/js/runtime-config.js was not loaded)");
        }
        if (!rt.supabaseUrl || !rt.supabaseAnonKey) {
            return fail(rt.reason || ("Supabase is not configured for this environment (" + rt.context + ")"));
        }

        var ref = projectRefOf(rt.supabaseUrl);
        if (!ref) return fail("the configured Supabase URL is not valid");

        var key = String(rt.supabaseAnonKey);
        if (/^sb_secret_/.test(key)) return fail("a secret key must never be used in the browser");
        if (!/^sb_publishable_/.test(key)) {
            var claims = jwtClaims(key);
            if (!claims) return fail("the configured public key is not a recognised Supabase key");
            if (claims.role !== "anon") return fail("only the public anon key may be used in the browser");
            if (claims.ref && ref !== "local" && claims.ref !== ref) return fail("the public key belongs to a different project");
            if (claims.ref === PRODUCTION_PROJECT_REF && ref !== PRODUCTION_PROJECT_REF) return fail("production key with a non-production URL");
        }

        if (ref === PRODUCTION_PROJECT_REF) {
            if (rt.context !== "production" || PRODUCTION_HOSTS.indexOf(host) === -1) {
                return fail("the production database is only available on the production site");
            }
        } else {
            if (rt.context === "production") return fail("a production build must use the production project");
            if (ref === "local" && LOCAL_HOSTS.indexOf(host) === -1) return fail("a local Supabase URL is only allowed on localhost");
        }

        return { ok: true, url: rt.supabaseUrl, anonKey: key, context: rt.context, projectRef: ref };
    }

    var noticeShown = false;
    function showNotice(reason) {
        if (window.console && console.error) console.error("EMerriment configuration: " + reason);
        if (noticeShown || !window.document) return;
        noticeShown = true;
        var add = function () {
            if (!document.body) return;
            var box = document.createElement("div");
            box.setAttribute("role", "alert");
            box.setAttribute("data-emerriment-config-error", "");
            box.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:2147483647;padding:12px 16px;" +
                "background:#7a2e1f;color:#fff;font:14px/1.5 system-ui,sans-serif;text-align:center";
            box.textContent = "This environment is not connected to a database, so sign-in and saving are unavailable. (" + reason + ")";
            document.body.appendChild(box);
        };
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add);
        else add();
    }

    function createClient(options) {
        var c = resolve();
        if (!c.ok) {
            showNotice(c.reason);
            return null;
        }
        if (!window.supabase || typeof window.supabase.createClient !== "function") {
            if (window.console && console.error) console.error("EMerriment configuration: the Supabase library has not loaded.");
            return null;
        }
        return window.supabase.createClient(c.url, c.anonKey, options);
    }

    window.EmerrimentSupabase = Object.freeze({
        resolve: resolve,
        createClient: createClient,
        PRODUCTION_PROJECT_REF: PRODUCTION_PROJECT_REF,
        PRODUCTION_HOSTS: PRODUCTION_HOSTS.slice()
    });
})();
