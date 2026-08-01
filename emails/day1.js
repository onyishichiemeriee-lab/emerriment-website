const layout = require("./layout");

module.exports = ({ name, email }) => {

return {

subject:
"🌿 The Truth About Your Skin Type (Most People Get This Wrong)",

html: layout({

title:
"🌿 The Truth About Your Skin Type",

email,

content: `

<p>Hello <strong>${name}</strong> 👋🏽</p>

<p>
Yesterday you received your personalized EMerriment Skin Report.
Today, let's talk about something that changes everything in skincare...
</p>

<h3>🌿 Your Skin Type</h3>

<p>
Most people think they know their skin type...
but many are actually treating the wrong problem.
</p>

<p>
Your skin type is determined by how much natural oil (called sebum) your skin produces—not by one bad skin day.
</p>

<h3>✨ Skin Type vs Skin Condition</h3>

<p>
A skin type usually stays the same for years.
</p>

<p>
A skin condition changes because of stress, hormones,
weather, products or lifestyle.
</p>

<ul>

<li>Acne → Skin Condition</li>

<li>Dark Spots → Skin Condition</li>

<li>Dehydration → Skin Condition</li>

<li>Oily Skin → Skin Type</li>

<li>Dry Skin → Skin Type</li>

<li>Combination Skin → Skin Type</li>

<li>Normal Skin → Skin Type</li>

</ul>

<h3>💚 Quick Tip</h3>

<p>

Wash your face.

Wait one hour.

Observe your skin.

</p>

<ul>

<li>Very shiny → Oily</li>

<li>Tight and flaky → Dry</li>

<li>Oily T-zone only → Combination</li>

<li>Balanced → Normal</li>

</ul>

<div style="
background:#E0F7FA;
padding:20px;
border-left:5px solid #00E5FF;
border-radius:8px;
margin:30px 0;
">

<strong>EMerriment Tip 🌿</strong>

<p style="margin-bottom:0;">
Never skip moisturizer because your skin feels oily.
Dehydrated oily skin often produces even more oil.
</p>

</div>

<p>

Tomorrow we'll reveal...

<strong>

5 skincare mistakes silently damaging your skin every single day.

</strong>

</p>

<p>

Stay glowing 🌿

<br><br>

The EMerriment Team

</p>

`

})

};

};