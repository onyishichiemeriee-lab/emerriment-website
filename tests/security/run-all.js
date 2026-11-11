/* Runs the offline security suites.
   Usage: npm run test:security
   Repository/static checks and fake-Supabase tests only — they do not
   connect to the live database. */
"use strict";

const suites = [
    require("./static-security.test"),
    require("./auth-regression.test")
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
