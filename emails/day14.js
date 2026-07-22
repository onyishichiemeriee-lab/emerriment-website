const layout = require("./layout");

module.exports = ({ name }) => {

return {

subject:
"🎉 Congratulations! Your EMerriment Journey Is Just Beginning",

html: layout({

title:
"🌿 Congratulations, ${name}!",

content: `

<p>Hello <strong>${name}</strong> 👋🏽</p>

<p>

Fourteen days ago, you joined EMerriment with one goal...

To understand your skin better.

Today, you've completed your first skincare education journey.

Congratulations! 🎉

You now know things that many people never learn—even after years of buying skincare products.

</p>

<hr>

<h2>🌿 Here's What You've Learned</h2>

<ul>

<li>✅ How to identify your skin type.</li>

<li>✅ The difference between skin types and skin conditions.</li>

<li>✅ Why ingredients matter more than expensive brands.</li>

<li>✅ The importance of protecting your skin barrier.</li>

<li>✅ Why consistency beats perfection.</li>

<li>✅ How lifestyle affects your skin.</li>

<li>✅ Why sunscreen is one of the most valuable skincare products.</li>

<li>✅ How to build a routine that actually works.</li>

</ul>

<p>

That's a powerful foundation.

</p>

<hr>

<h2>💚 But This Isn't Goodbye...</h2>

<p>

EMerriment was never created to sell products.

It was created to help people understand their skin with confidence.

Whether you're dealing with acne, dark spots, oily skin, dryness, sensitivity, or simply want healthier skin...

We'll continue learning together.

</p>

<hr>

<h2>🌟 Continue Your Journey</h2>

<p>

Here's what you can explore next:

</p>

<ul>

<li>📚 EMerriment Skin Encyclopedia</li>

<li>🧪 Personalized Skin Quiz</li>

<li>🎥 Educational skincare videos</li>

<li>✨ 21 Days To Glow Challenge</li>

<li>🌸 Fade & Glow Bundle</li>

<li>📝 Free skincare guides and resources</li>

</ul>

<p>

Every resource is designed to help you make smarter skincare decisions—not just buy more products.

</p>

<hr>

<div style="background:#E8F5E9;padding:20px;border-left:5px solid #32D296;border-radius:10px;">

<h3>🌱 One Final Challenge</h3>

<p>

Don't try to have perfect skin.

Instead...

Aim for healthier skin.

Healthy skin looks different for everyone, and your journey is unique.

Keep learning.

Stay consistent.

Celebrate every small improvement.

</p>

</div>

<hr>

<h2>🤝 Stay Connected</h2>

<p>

We'd love to keep supporting you.

Follow EMerriment for:

</p>

<ul>

<li>✔ Science-backed skincare education</li>

<li>✔ Weekly skincare tips</li>

<li>✔ Myth-busting content</li>

<li>✔ Product guidance</li>

<li>✔ Skin condition awareness</li>

</ul>

<p>

You're now part of the EMerriment family.

And we're excited to continue growing with you.

</p>

<hr>

<p>

Thank you for trusting us with your skincare journey.

This is only the beginning.

</p>

<p>

Stay glowing 🌿

<br><br>

<strong>The EMerriment Team</strong>

</p>

<hr>

<div style="text-align:center;padding:25px;background:#0F172A;border-radius:12px;">

<h2 style="color:#32D296;">

Healthy Skin Begins With Understanding.

</h2>

<p style="color:#CBD5E1;">

Thank you for choosing EMerriment.

We'll always be here to help you glow with confidence.

</p>

<a href="https://emerriment216.netlify.app"

style="display:inline-block;margin-top:20px;background:#32D296;color:#07111E;padding:14px 26px;text-decoration:none;font-weight:bold;border-radius:8px;">

Continue Your Journey →

</a>

</div>

`

})

};

};