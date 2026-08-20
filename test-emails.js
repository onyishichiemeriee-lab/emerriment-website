const emails = require("./emails");

for (let day = 1; day <= 14; day++) {

    try {

        const emailTemplate = emails[day]({
            name: "Emmanuel",
            email: "test@example.com"
        });

        console.log(`✅ Day ${day}`);
        console.log(`   Subject: ${emailTemplate.subject}`);
        console.log(`   HTML: ${emailTemplate.html.length} characters`);

    } catch (error) {

        console.error(`❌ Day ${day} FAILED`);
        console.error(error);

    }

}