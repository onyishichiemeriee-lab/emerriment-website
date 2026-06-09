exports.handler = async (event) => {

  const { name, email, skinType, concern, score, recommendation } =
    JSON.parse(event.body);

  const response = await fetch(
    "https://api.brevo.com/v3/contacts",
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          FIRSTNAME: name,
          SKINTYPE: skinType,
          CONCERN: concern,
          SCORE: score,
          RECOMMENDATION: recommendation
        },
        listIds: [3],
        updateEnabled: true
      })
    }
  );

  const data = await response.json();

console.log("Brevo status:", response.status);
console.log("Brevo response:", data);

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};