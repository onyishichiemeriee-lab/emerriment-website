const layout = require("./layout");

module.exports = ({ name, email }) => {

return {

subject:
"🤔 Why Your Skincare Routine Isn't Working (And How to Fix It)",

html: layout({

title:
"🤔 Why Your Skincare Routine Isn't Working",

content: `

<p>Hello <strong>${name}</strong> 👋🏽</p>

<p>

Have you ever looked at your skincare shelf and wondered...

<strong>

"I'm using all these products... so why isn't my skin improving?"

</strong>

You're not alone.

The truth is, great skin isn't about owning more products.

It's about using the right products the right way.

</p>

<hr>

<h3>❌ Reason #1: You're Not Being Consistent</h3>

<p>

Many skincare ingredients need several weeks to show visible results.

Switching products every few days doesn't give your skin enough time to respond.

Consistency is one of the biggest secrets to healthy skin.

</p>

<h3>❌ Reason #2: Your Routine Is Too Complicated</h3>

<p>

Using six or seven active ingredients together can overwhelm your skin.

A simple routine with a gentle cleanser, moisturizer, sunscreen, and one treatment product often performs better than an overloaded routine.

</p>

<h3>❌ Reason #3: You're Treating the Wrong Problem</h3>

<p>

If your skin is dehydrated but you keep buying products for oily skin, your routine won't deliver the results you're hoping for.

Understanding your skin is always the first step.

</p>

<h3>❌ Reason #4: You're Ignoring Your Skin Barrier</h3>

<p>

Your skin barrier protects you from irritation and helps lock in moisture.

When it's damaged, even the best products may sting, irritate, or seem ineffective.

Healthy skin starts with a healthy barrier.

</p>

<h3>❌ Reason #5: You're Expecting Instant Results</h3>

<p>

Skincare is a journey, not a race.

Healthy skin develops through daily habits—not overnight miracles.

Small improvements add up over time.

</p>

<div style="
background:#E0F7FA;
padding:20px;
border-left:5px solid #00E5FF;
border-radius:8px;
margin:30px 0;
">

<strong>🌿 EMerriment Tip</strong>

<p>

Don't chase perfect skin.

Focus on building healthy skin.

Healthy skin naturally becomes clearer, stronger, and more radiant over time.

</p>

</div>

<h3>✅ Today's Action Step</h3>

<p>

Take a look at your skincare routine.

Ask yourself:

</p>

<ul>

<li>Am I consistent?</li>

<li>Am I using products for my actual skin needs?</li>

<li>Am I protecting my skin barrier?</li>

<li>Am I giving my products enough time to work?</li>

</ul>

<p>

Even improving one of these areas can make a noticeable difference.

</p>

<p>

Tomorrow we'll dive into one of the most misunderstood skin conditions...

<strong>

Acne.

</strong>

We'll explain what really causes breakouts and why treating acne isn't as simple as drying out your skin.

</p>

<p>

Stay glowing 🌿

<br><br>

<strong>The EMerriment Team</strong>

</p>

`

})

};

};