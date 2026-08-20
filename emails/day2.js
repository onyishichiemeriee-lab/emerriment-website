const layout = require("./layout");

module.exports = ({ name, email }) => {

    return {

        subject:
        "🌿 Understanding Your Skin Type: The Foundation of Better Skincare",

        html: layout({

            title:
            "🌿 Understanding Your Skin Type",

            email,

            content: `
            
<p>Hello <strong>${name}</strong> 👋🏽</p>

<p>

Yesterday, you received your personalized EMerriment Skin Report.

Today, let's talk about something that changes everything in skincare...

<strong>Your skin type.</strong>

</p>

<hr>

<h2>🌿 Most People Get This Wrong</h2>

<p>

Many people believe they have oily skin simply because their face becomes shiny.

Others assume they have dry skin because it feels tight after washing.

But your skin type is determined by how much natural oil (called sebum) your skin produces—not by one bad skin day.

</p>

<hr>

<h2>✨ Skin Type vs Skin Condition</h2>

<p>

This is one of the biggest areas of confusion.

A skin type usually stays the same for years.

A skin condition can change depending on:

</p>

<ul>

<li>Weather</li>

<li>Hormones</li>

<li>Stress</li>

<li>Diet</li>

<li>Skincare products</li>

</ul>

<p>

For example:

</p>

<ul>

<li>Acne is a skin condition.</li>

<li>Dark spots are a skin condition.</li>

<li>Dehydration is a skin condition.</li>

</ul>

<p>

But:

</p>

<ul>

<li>Oily skin</li>

<li>Dry skin</li>

<li>Combination skin</li>

<li>Normal skin</li>

</ul>

<p>

...are skin types.

</p>

<hr>

<h2>🌸 The Four Main Skin Types</h2>

<h3>✨ Oily Skin</h3>

<ul>

<li>Produces excess oil.</li>

<li>Large pores.</li>

<li>Frequent blackheads.</li>

<li>Breakouts are common.</li>

</ul>

<h3>🌿 Dry Skin</h3>

<ul>

<li>Feels tight.</li>

<li>May flake easily.</li>

<li>Can feel rough.</li>

</ul>

<h3>💧 Combination Skin</h3>

<ul>

<li>Oily forehead, nose and chin.</li>

<li>Normal or dry cheeks.</li>

</ul>

<h3>🌼 Normal Skin</h3>

<ul>

<li>Balanced oil production.</li>

<li>Comfortable throughout the day.</li>

<li>Still needs daily care.</li>

</ul>

<hr>

<h2>❌ Biggest Myth</h2>

<p>

"If your skin is oily, don't use moisturizer."

This is false.

When oily skin becomes dehydrated, it often produces even more oil.

A lightweight moisturizer helps restore balance.

</p>

<hr>

<div style="background:#E8F5E9;padding:20px;border-left:5px solid #32D296;border-radius:10px;">

<h3>💚 Today's Tip</h3>

<p>

Wash your face with a gentle cleanser.

Wait one hour without applying anything.

Observe your skin.

Very shiny?

Likely oily.

Tight?

Likely dry.

Only shiny around the T-zone?

Likely combination.

Comfortable?

Likely normal.

</p>

</div>

<hr>

<p>

Tomorrow we'll reveal the biggest "🚨 5 Skincare Mistakes That Are Secretly Damaging Your Skin",

One of them may surprise you.

</p>

<p>

Stay glowing 🌿

<br><br>

<strong>The EMerriment Team</strong>

</p>

<hr>

<p style="font-size:14px;color:#6B7280;">

Healthy skin begins with understanding.

</p>

`

})

};

};