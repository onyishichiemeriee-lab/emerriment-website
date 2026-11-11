/* Runs every offline email-system test suite.
   Usage: npm run test:email   (or: node tests/email/run-all.js)
   No network access, no real credentials, no real emails. */
"use strict";

const suites = [
    require("./send-email.test"),
    require("./templates.test"),
    require("./sequence.test"),
    require("./tracking.test"),
    require("./homepage-quiz.test")
];

(async () => {
    let pass = 0;
    let fail = 0;
    for (const suite of suites) {
        const result = await suite.run();
        pass += result.pass;
        fail += result.fail;
    }
    process.stdout.write(`\nTOTAL: ${pass} passed, ${fail} failed\n`);
    process.exit(fail ? 1 : 0);
})();
