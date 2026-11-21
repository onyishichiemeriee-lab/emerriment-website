/* =========================================
   EMerriment CMS — shared administrator guard
   Loaded by every admin CMS page BEFORE its page script.

   EMAdminGuard.requireAdmin() resolves to an access object only for a
   signed-in user whose own profile has is_admin = true; otherwise it
   resolves to null and the page script must not load or render any admin
   data. Decisions:

     no Supabase client / check fails  -> stay, show a notice (fail closed)
     not signed in                      -> /admin/loginCMS.html
     signed in, not an administrator    -> /dashboard.html (normal dashboard)
     administrator                      -> stay; page loads its data

   Destinations are fixed, root-relative paths (same host as the current
   page — a staging preview stays on the preview), never taken from the
   URL or any user input. location.replace() is used (no history entry),
   and a redirect to the page that is already open is refused, so a
   redirect loop is impossible. Nothing personal is logged: errors are
   written only as {kind, code, status}.

   This is a user-experience gate. The security boundary remains
   Row Level Security in the database (admin data is only readable by
   administrators), which this file does not change.
========================================= */

"use strict";

(function () {

    const ADMIN_LOGIN = "/admin/loginCMS.html";
    const USER_DASHBOARD = "/dashboard.html";

    let pending = null;

    function safeError(error) {
        if (!error) return { kind: "unknown" };
        return {
            kind: String(error.name || "Error").slice(0, 60),
            code: error.code !== undefined && error.code !== null ? String(error.code).slice(0, 40) : undefined,
            status: Number.isInteger(error.status) ? error.status : undefined
        };
    }

    // Netlify serves /admin/dashboardCMS.html as /admin/dashboardcms too.
    function normalisePath(path) {
        return String(path || "").toLowerCase().replace(/\.html$/, "").replace(/\/+$/, "") || "/";
    }

    function setState(state) {
        document.documentElement.setAttribute("data-admin-access", state);
    }

    function showNotice(text) {
        const show = () => {
            let box = document.getElementById("adminAccessNotice");
            if (!box) {
                box = document.createElement("div");
                box.id = "adminAccessNotice";
                box.setAttribute("role", "alert");
                box.style.cssText = "margin:16px;padding:14px 18px;border-radius:10px;background:#fdecea;color:#8a2a1c;font-family:inherit;line-height:1.5;overflow-wrap:anywhere;";
                document.body.insertBefore(box, document.body.firstChild);
            }
            box.textContent = text;
        };
        if (document.body) show();
        else document.addEventListener("DOMContentLoaded", show);
    }

    // Returns true when a navigation was started. The target is resolved
    // against the current page first, so a path that leads back to this
    // page (e.g. the old "admin/../dashboardCMS.html") is caught, and a
    // destination on another host is refused.
    function redirect(target) {
        let url;
        try {
            url = new URL(target, window.location.href);
        } catch (error) {
            url = null;
        }
        if (!url || url.origin !== window.location.origin || normalisePath(url.pathname) === normalisePath(window.location.pathname)) {
            showNotice("This page is not available for your account.");
            return false;
        }
        // Observable by tests and monitoring; carries no personal data.
        try {
            window.dispatchEvent(new CustomEvent("emr-admin-redirect", { detail: { target: url.pathname } }));
        } catch (error) { /* older browsers: ignore */ }
        window.location.replace(url.pathname);
        return true;
    }

    async function check() {
        setState("checking");
        const client = window.supabaseClient;

        if (!client || !client.auth || typeof client.from !== "function") {
            setState("unavailable");
            showNotice("We couldn't connect to EMerriment right now. Please reload the page.");
            return null;
        }

        try {
            const { data, error } = await client.auth.getUser();
            const user = data && data.user;

            if (error || !user) {
                setState("signed-out");
                redirect(ADMIN_LOGIN);
                return null;
            }

            const { data: profile, error: profileError } = await client
                .from("profiles")
                .select("is_admin")
                .eq("id", user.id)
                .maybeSingle();

            if (profileError) {
                console.error("❌ Admin access could not be verified:", safeError(profileError));
                setState("error");
                showNotice("We couldn't verify administrator access. Please reload the page.");
                return null;
            }

            if (!profile || profile.is_admin !== true) {
                setState("forbidden");
                redirect(USER_DASHBOARD);
                return null;
            }

            setState("granted");
            return Object.freeze({ granted: true });
        } catch (error) {
            console.error("❌ Admin access could not be verified:", safeError(error));
            setState("error");
            showNotice("We couldn't verify administrator access. Please reload the page.");
            return null;
        }
    }

    function requireAdmin() {
        if (!pending) pending = check();
        return pending;
    }

    window.EMAdminGuard = Object.freeze({
        requireAdmin,
        safeError,
        ADMIN_LOGIN,
        USER_DASHBOARD
    });

})();
