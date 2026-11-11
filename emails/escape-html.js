/* =========================================
   EMerriment Email HTML Escaping
   Escapes user-supplied values before they
   are inserted into email HTML templates.
========================================= */

const HTML_ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "`": "&#96;"
};

module.exports = function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value).replace(
        /[&<>"'`]/g,
        (character) => HTML_ESCAPES[character]
    );

};
