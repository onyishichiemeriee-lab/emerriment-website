const layout = require("./layout");

module.exports = ({ name, email }) => {

return {

subject:
"🌿 The Truth About Acne: It's More Than Just Pimples",

html: layout({

title:
"🌿 Understanding Acne Beyond the Surface",

content: `

<p>Hello <strong>${name}</strong> 👋🏽</p>

<p>

When most people hear the word "acne," they think of pimples.

But acne is much more than what appears on the surface.

Understanding what causes acne is the first step toward managing it wisely.

</p>

<hr>

<h3>🔍 What Is Acne?</h3>

<p>

Acne develops when hair follicles become clogged with excess oil (sebum), dead skin cells, and sometimes bacteria.

This can lead to blackheads, whiteheads, pimples, and in more severe cases, painful cysts or nodules.

</p>

<h3>🌿 What Can Trigger Acne?</h3>

<ul>

<li>Hormonal changes</li>

<li>Excess oil production</li>

<li>Genetics</li>

<li>Stress</li>

<li>Certain cosmetics or skincare products</li>

<li>Friction from helmets, hats, or face masks</li>

</ul>

<p>

Everyone's skin is different, so acne triggers can vary from person to person.

</p>

<h3>❌ Acne Myths</h3>

<p>

Let's clear up a few common myths:

</p>

<ul>

<li><strong>Myth:</strong> Acne happens because your face is dirty.<br>
<strong>Fact:</strong> Acne is not caused by poor hygiene. Overwashing can actually irritate your skin.</li>

<li><strong>Myth:</strong> Popping pimples makes them heal faster.<br>
<strong>Fact:</strong> Picking or squeezing pimples can increase inflammation and raise the risk of scarring.</li>

<li><strong>Myth:</strong> Toothpaste is a good acne treatment.<br>
<strong>Fact:</strong> Toothpaste is not formulated for facial skin and may cause irritation.</li>

</ul>

<h3>💚 Caring for Acne-Prone Skin</h3>

<p>

If your skin is prone to breakouts:

</p>

<ul>

<li>Use a gentle cleanser.</li>

<li>Moisturize daily, even if your skin is oily.</li>

<li>Choose non-comedogenic products.</li>

<li>Avoid picking at blemishes.</li>

<li>Be patient and consistent with your routine.</li>

</ul>

<div style="
background:#E0F7FA;
padding:20px;
border-left:5px solid #00E5FF;
border-radius:8px;
margin:30px 0;
">

<strong>🌿 EMerriment Tip</strong>

<p>

Healthy skin is not about fighting your skin.

It's about supporting it.

Treat acne with patience, consistency, and evidence-based skincare—not harsh treatments that damage your skin barrier.

</p>

</div>

<h3>✨ Today's Action Step</h3>

<p>

If you currently have acne, avoid picking or squeezing any blemishes today.

Give your skin the chance to heal naturally.

Small habits like this can reduce the likelihood of long-term marks and irritation.

</p>

<p>

Tomorrow we'll talk about something that affects almost everyone after acne...

<strong>Dark spots and hyperpigmentation.</strong>

You'll learn why they happen, why they take time to fade, and what actually helps improve their appearance.

</p>

<p>

Stay glowing 🌿

<br><br>

<strong>The EMerriment Team</strong>

</p>

<hr>

<p style="font-size:14px;color:#6B7280;">

Want to learn more about acne and build a clearer skincare routine?

Our <strong>EMerriment Acne Masterclass</strong> provides practical guidance to help you better understand acne and care for acne-prone skin.

</p>

`

})

};

};