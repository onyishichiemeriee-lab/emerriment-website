const layout = require("./layout");

module.exports = ({ name, email }) => {

return {

subject:
"😴 Your Skin Is Watching Your Lifestyle (Even When You Aren't)",

html: layout({

title:
"😴 Your Lifestyle Is Showing On Your Skin",

content: `

<p>Hello <strong>${name}</strong> 👋🏽</p>

<p>

You can buy the best skincare products in the world...

But if your daily habits are working against your skin, progress will always be slower.

Today, let's talk about something many people overlook:

<strong>Your lifestyle.</strong>

Your skin responds to how you live every single day.

</p>

<hr>

<h2>😴 1. Sleep Is Your Skin's Repair Time</h2>

<p>

While you're sleeping, your skin is busy repairing itself.

New skin cells are produced, damaged cells are replaced, and your skin barrier works to recover from the day's stress.

Poor sleep can lead to:

</p>

<ul>

<li>Dull-looking skin</li>

<li>Dark circles</li>

<li>Slower healing of acne</li>

<li>Premature fine lines</li>

</ul>

<p>

Aim for 7–9 hours of quality sleep whenever possible.

</p>

<hr>

<h2>😟 2. Stress Can Show Up On Your Face</h2>

<p>

Have you ever noticed a breakout before an important event or exam?

That's not a coincidence.

Stress hormones can increase oil production and make existing skin conditions worse.

Stress may contribute to:

</p>

<ul>

<li>Acne flare-ups</li>

<li>Eczema flare-ups</li>

<li>Psoriasis flare-ups</li>

<li>Skin irritation</li>

</ul>

<p>

Managing stress isn't just good for your mind—it's good for your skin too.

</p>

<hr>

<h2>💧 3. Hydration Matters</h2>

<p>

Your skin needs water to function properly.

While drinking water alone won't magically clear your skin, staying hydrated supports healthy skin function and overall wellbeing.

A dehydrated body can leave your skin looking tired and less radiant.

</p>

<hr>

<h2>🥗 4. Food Can Influence Your Skin</h2>

<p>

No single food causes perfect skin.

But a balanced diet helps support healthy skin over time.

Try including:

</p>

<ul>

<li>Colorful fruits</li>

<li>Leafy vegetables</li>

<li>Healthy fats</li>

<li>Protein-rich foods</li>

<li>Plenty of water</li>

</ul>

<p>

Your skin benefits when your body receives the nutrients it needs.

</p>

<hr>

<h2>🏃 5. Small Daily Habits Add Up</h2>

<p>

Healthy skin isn't built in one day.

It's built through small choices repeated consistently.

Simple habits include:

</p>

<ul>

<li>Removing makeup before bed</li>

<li>Applying sunscreen every morning</li>

<li>Using products consistently</li>

<li>Avoiding unnecessary picking or squeezing pimples</li>

<li>Being patient with your routine</li>

</ul>

<hr>

<div style="background:#E8F5E9;padding:20px;border-left:5px solid #32D296;border-radius:10px;">

<h3>💚 Today's Action Step</h3>

<p>

Choose just one healthy habit to improve this week.

Maybe it's sleeping earlier.

Maybe it's drinking more water.

Maybe it's finally wearing sunscreen daily.

Small improvements become big results over time.

</p>

</div>

<hr>

<p>

Tomorrow we'll answer a question almost everyone asks:

<strong>"How long does skincare actually take to work?"</strong>

Knowing the answer can save you from giving up too soon.

</p>

<p>

Stay glowing 🌿

<br><br>

<strong>The EMerriment Team</strong>

</p>

<hr>

<p style="font-size:14px;color:#6B7280;">

Healthy skin reflects healthy habits.

Your daily choices matter more than perfection.

</p>

`

})

};

};