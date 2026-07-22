const layout = require("./layout");

module.exports = ({ name }) => {

return {

subject:
"🧪 The 5 Skincare Ingredients Your Skin Will Thank You For",

html: layout({

title:
"🧪 The Ingredients Your Skin Will Love",

content: `

<p>Hello <strong>${name}</strong> 👋🏽</p>

<p>

By now you've learned about your skin type and the common mistakes that can slow your skincare progress.

Today, let's talk about something that separates effective skincare from expensive guesswork...

The ingredients.

You don't need dozens of products.

You simply need the right ingredients for your skin's needs.

</p>

<hr>

<h3>💧 1. Hyaluronic Acid</h3>

<p>

Despite its name, Hyaluronic Acid isn't harsh.

It attracts water to your skin, helping it stay hydrated, soft, and plump.

It's suitable for almost every skin type.

</p>

<h3>🌿 2. Niacinamide</h3>

<p>

Niacinamide is one of the most versatile skincare ingredients.

It can help improve the appearance of excess oil, enlarged pores, uneven skin tone, and support the skin barrier.

It's a great choice for beginners.

</p>

<h3>✨ 3. Vitamin C</h3>

<p>

Vitamin C is known for helping brighten the skin and improve the appearance of dullness and dark spots while protecting against environmental stressors.

Morning use is often recommended alongside sunscreen.

</p>

<h3>🌸 4. Salicylic Acid</h3>

<p>

If you struggle with oily skin or breakouts, Salicylic Acid can help exfoliate inside pores, reducing congestion and helping keep skin clearer.

Use it as directed and avoid overusing it.

</p>

<h3>🛡️ 5. Ceramides</h3>

<p>

Ceramides are natural lipids found in your skin.

They help strengthen your skin barrier and reduce moisture loss.

Dry and sensitive skin especially benefits from products containing ceramides.

</p>

<div style="background:#E0F7FA;padding:20px;border-left:5px solid #00E5FF;border-radius:8px;margin:30px 0;">

<strong>🌿 EMerriment Tip</strong>

<p>

Don't choose products because they're trending.

Choose products because their ingredients solve your skin's needs.

Understanding ingredients is one of the smartest investments you can make for your skin.

</p>

</div>

<h3>💚 Simple Rule</h3>

<ul>

<li>Dry skin → Hydrating ingredients like Hyaluronic Acid and Ceramides.</li>

<li>Oily skin → Lightweight hydration plus Niacinamide.</li>

<li>Breakouts → Salicylic Acid.</li>

<li>Dull skin or dark spots → Vitamin C.</li>

</ul>

<p>

Tomorrow we'll answer one of the biggest questions in skincare...

<strong>

"Why isn't my skincare routine working?"

</strong>

The answer surprises most people.

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