/* =========================================
   EMerriment — safe article content (shared)
   window.EMArticleContent, used by the article reader, the dashboard
   cards, the AI resource cards and the CMS article editor.

   Rich article HTML (encyclopedia_articles.content) is sanitized with
   DOMPurify 3.4.17, served from this site (/js/vendor/, pinned, no CDN),
   using the explicit allowlist below, AT THE RENDERING BOUNDARY: content
   already stored in the database is made safe when it is shown. Every
   other article field (title, summary, category, slug, image URL, product
   name and description) is plain text and is only ever written with
   textContent or escaped.

   If DOMPurify is not available the content is shown as plain text
   (fail safe), never as HTML.
========================================= */

"use strict";

(function () {

    // Educational formatting only. No scripts, styles, forms, frames,
    // embeds, SVG or MathML.
    const ALLOWED_TAGS = [
        "p", "br", "hr", "h2", "h3", "h4", "h5", "h6",
        "strong", "b", "em", "i", "u", "s", "mark", "small", "sub", "sup", "abbr",
        "blockquote", "ul", "ol", "li", "dl", "dt", "dd",
        "a", "code", "pre",
        "table", "caption", "thead", "tbody", "tfoot", "tr", "th", "td",
        "figure", "figcaption", "img", "span"
    ];

    const ALLOWED_ATTR = ["href", "title", "alt", "src", "width", "height", "colspan", "rowspan", "scope", "target", "rel", "start", "reversed"];

    const FORBID_TAGS = ["script", "style", "iframe", "frame", "frameset", "object", "embed", "applet", "svg", "math", "form", "input", "button", "textarea", "select", "option", "link", "meta", "base", "template", "noscript", "audio", "video", "source", "track", "portal"];

    const FORBID_ATTR = ["style", "srcdoc", "srcset", "formaction", "action", "background", "poster", "xlink:href", "ping", "class", "id", "name"];

    // Links: http(s), mailto, in-page anchors and same-site relative paths.
    // Images: https only. Everything else (javascript:, data:, vbscript:,
    // file:, protocol-relative //host) is dropped.
    const SAFE_LINK = /^(?:https?:\/\/|mailto:|#|\/(?!\/)|\.{1,2}\/|[a-z0-9][a-z0-9._-]*(?:[/?#]|$))/i;
    const SAFE_IMAGE = /^https:\/\//i;

    let purifier = null;

    function getPurifier() {
        if (purifier) return purifier;
        if (typeof window.DOMPurify !== "function") return null;
        // A private instance: hooks here cannot affect any other user of DOMPurify.
        purifier = window.DOMPurify(window);
        purifier.addHook("uponSanitizeAttribute", (node, data) => {
            if (data.attrName === "href" && !SAFE_LINK.test(String(data.attrValue || "").trim())) data.keepAttr = false;
            if (data.attrName === "src" && !SAFE_IMAGE.test(String(data.attrValue || "").trim())) data.keepAttr = false;
        });
        purifier.addHook("afterSanitizeAttributes", (node) => {
            if (node.tagName === "A") {
                const href = node.getAttribute("href");
                if (!href) {
                    node.removeAttribute("target");
                    node.removeAttribute("rel");
                    return;
                }
                let external = false;
                try {
                    external = new URL(href, window.location.href).origin !== window.location.origin;
                } catch (error) {
                    external = false;
                }
                if (external || node.getAttribute("target")) {
                    node.setAttribute("target", "_blank");
                    node.setAttribute("rel", "noopener noreferrer");
                } else {
                    node.removeAttribute("rel");
                }
            }
            if (node.tagName === "IMG") {
                if (!node.getAttribute("src")) {
                    node.remove();
                    return;
                }
                node.setAttribute("loading", "lazy");
                node.setAttribute("referrerpolicy", "no-referrer");
            }
        });
        return purifier;
    }

    // Returns a DocumentFragment holding only safe nodes.
    function sanitizeToFragment(html) {
        const p = getPurifier();
        const value = String(html == null ? "" : html);
        if (!p) {
            const fragment = document.createDocumentFragment();
            const para = document.createElement("p");
            para.textContent = value;
            fragment.appendChild(para);
            return fragment;
        }
        return p.sanitize(value, {
            ALLOWED_TAGS,
            ALLOWED_ATTR,
            FORBID_TAGS,
            FORBID_ATTR,
            ALLOW_DATA_ATTR: false,
            ALLOW_ARIA_ATTR: false,
            ALLOW_UNKNOWN_PROTOCOLS: false,
            SAFE_FOR_TEMPLATES: false,
            WHOLE_DOCUMENT: false,
            RETURN_DOM_FRAGMENT: true
        });
    }

    // Replaces the children of `element` with the sanitized article HTML.
    function renderArticleHTML(element, html) {
        if (!element) return;
        element.textContent = "";
        element.appendChild(sanitizeToFragment(html));
    }

    // String form (for CMS save paths: defence in depth only).
    function sanitizeArticleHTML(html) {
        const holder = document.createElement("div");
        holder.appendChild(sanitizeToFragment(html));
        return holder.innerHTML;
    }

    function escapeHTML(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // Plain-text URL fields (featured images, product links).
    function safeImageUrl(value, fallback) {
        const s = String(value || "").trim();
        return SAFE_IMAGE.test(s) ? s : (fallback || "");
    }

    function safeExternalUrl(value) {
        const s = String(value || "").trim();
        return /^https?:\/\//i.test(s) ? s : "";
    }

    // Canonical reader route on the CURRENT host:
    // /article/article.html?slug=<encoded>. Empty slug -> "" (no link).
    function articleHref(slug) {
        const s = String(slug == null ? "" : slug).trim();
        if (!s) return "";
        return "/article/article.html?" + new URLSearchParams({ slug: s }).toString();
    }

    window.EMArticleContent = Object.freeze({
        renderArticleHTML,
        sanitizeArticleHTML,
        escapeHTML,
        safeImageUrl,
        safeExternalUrl,
        articleHref,
        ALLOWED_TAGS: Object.freeze(ALLOWED_TAGS.slice()),
        ALLOWED_ATTR: Object.freeze(ALLOWED_ATTR.slice()),
        sanitizerVersion: () => (window.DOMPurify && window.DOMPurify.version) || null
    });

})();
