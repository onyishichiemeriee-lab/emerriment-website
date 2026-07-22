module.exports = ({ title, content }) => {

return `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

</head>

<body style="
margin:0;
padding:0;
background:#F8F5EF;
font-family:Arial,sans-serif;
">

<table width="100%" cellspacing="0" cellpadding="0">

<tr>

<td align="center">

<table
width="650"
style="
background:white;
border-radius:18px;
overflow:hidden;
margin:30px auto;
box-shadow:0 15px 40px rgba(0,0,0,.08);
">

<tr>

<td
style="
background:#07111E;
padding:50px;
text-align:center;
">

<h1
style="
margin:0;
font-size:38px;
color:#00E5FF;
">

🌿 EMerriment

</h1>

<p
style="
margin-top:12px;
color:#CBD5E1;
font-size:17px;
">

Healthy Skin Begins With Understanding

</p>

</td>

</tr>

<tr>

<td
style="
padding:50px;
color:#334155;
line-height:1.8;
font-size:17px;
">

<h2
style="
color:#07111E;
margin-top:0;
">

${title}

</h2>

${content}

</td>

</tr>

<tr>

<td
style="
background:#F1F5F9;
padding:35px;
text-align:center;
">

<a
href="https://emerriment216.netlify.app"
style="
display:inline-block;
background:#00E5FF;
color:#07111E;
padding:16px 28px;
text-decoration:none;
border-radius:10px;
font-weight:bold;
">

Visit EMerriment

</a>

<br><br>

<p
style="
color:#64748B;
font-size:14px;
">

Follow EMerriment

<br><br>

Instagram • TikTok • Facebook • YouTube

</p>

<hr
style="
border:none;
border-top:1px solid #CBD5E1;
margin:30px 0;
">

<p
style="
font-size:13px;
color:#94A3B8;
">

© EMerriment

Helping people understand their skin naturally.

</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>

`;

};