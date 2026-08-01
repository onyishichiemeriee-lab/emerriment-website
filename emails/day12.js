const layout = require("./layout");

module.exports = ({ name, email }) => {

return {

subject:
"🧴 Do You Really Need a 10-Step Skincare Routine?",

html: layout({

title:
"🧴 Simplicity Often Wins in Skincare",

content: `

<p>Hello <strong>${name}</strong> 👋🏽</p>

<p>

Have you ever watched a skincare video where someone applies ten different products before going to bed?

It looks impressive…

But here's the truth:

<strong>More products don't always mean better skin.</strong>

In fact, using too many products can sometimes do more harm than good.

</p>

<hr>

<h2>🌿 Your Skin Doesn't Need Everything</h2>

<p>

Every new product introduces new ingredients to your skin.

When you layer too many products together, your skin may become overwhelmed.

This can lead to:

</p>

<ul>

<li>Redness</li>

<li>Irritation</li>

<li>Breakouts</li>

<li>A weakened skin barrier</li>

</ul>

<p>

Healthy skin usually comes from using the <strong>right products</strong>, not the largest number of products.

</p>

<hr>

<h2>✨ The Four Essential Steps</h2>

<p>

For most people, a simple routine is enough.

</p>

<ol>

<li><strong>Cleanser</strong> — Removes dirt, oil, and sunscreen.</li>

<li><strong>Treatment</strong> — Targets concerns like acne or dark spots.</li>

<li><strong>Moisturizer</strong> — Supports your skin barrier and hydration.</li>

<li><strong>Sunscreen (Morning)</strong> — Protects your skin every day.</li>

</ol>

<p>

That's the foundation of a healthy routine.

Everything else is optional.

</p>

<hr>

<h2>⚠️ Don't Introduce Everything At Once</h2>

<p>

Starting several new products on the same day makes it impossible to know which one is helping—or causing irritation.

Instead:

</p>

<ul>

<li>Add one new product at a time.</li>

<li>Use it consistently for a few weeks.</li>

<li>Observe how your skin responds.</li>

</ul>

<hr>

<h2>💚 Listen To Your Skin</h2>

<p>

Your skin has its own needs.

Just because a product is trending doesn't mean it's right for you.

Choose products based on:

</p>

<ul>

<li>Your skin type</li>

<li>Your skin concerns</li>

<li>Your goals</li>

</ul>

<p>

Personalized skincare will always outperform copying someone else's routine.

</p>

<hr>

<div style="background:#E8F5E9;padding:20px;border-left:5px solid #32D296;border-radius:10px;">

<h3>🌱 Today's Challenge</h3>

<p>

Take a look at your current routine.

Ask yourself:

"Am I using this product because my skin needs it… or because social media told me to buy it?"

Removing unnecessary products can sometimes improve your skin more than adding new ones.

</p>

</div>

<hr>

<h2>✨ Remember</h2>

<p>

Healthy skin isn't complicated.

Consistency, patience, and understanding your skin will always beat complicated routines.

</p>

<hr>

<p>

Tomorrow we'll explore one of the most important skincare habits of all:

<strong>Why sunscreen isn't just for sunny days.</strong>

You may never look at SPF the same way again.

</p>

<p>

Stay glowing 🌿

<br><br>

<strong>The EMerriment Team</strong>

</p>

<hr>

<p style="font-size:14px;color:#6B7280;">

Healthy skin begins with understanding—not with owning more products.

</p>

`

})

};

};