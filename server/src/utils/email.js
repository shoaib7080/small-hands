import axios from "axios";

const sendEmail = async (options) => {
  console.log(
    "BREVO_API_KEY:",
    process.env.BREVO_API_KEY ? "✅ Loaded" : "❌ Missing"
  );
  console.log(
    "SENDER_EMAIL:",
    process.env.SENDER_EMAIL ? "✅ Loaded" : "❌ Missing"
  );

  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY environment variable is not set");
  }

  // Brevo API Endpoint
  const url = "https://api.brevo.com/v3/smtp/email";

  // Request Config
  const config = {
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
  };

  // Email Data
  const data = {
    sender: {
      name: "Small Hands Support",
      email: process.env.SENDER_EMAIL, // Must be a verified sender in Brevo
    },
    to: [
      {
        email: options.email,
        name: "User",
      },
    ],
    subject: options.subject,
    textContent: options.message, // Plain text version
    // htmlContent: '<h1>...</h1>' // You can add HTML here if you want later
  };

  try {
    console.log("Sending email with data:", JSON.stringify(data, null, 2));
    const response = await axios.post(url, data, config);
    console.log(`✅ Email sent to ${options.email} via Brevo`);
    return response.data;
  } catch (error) {
    console.error("❌ Brevo Email Error:");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Headers:", error.response?.headers);

    // More specific error messages
    if (error.response?.status === 400) {
      throw new Error(`Bad request: ${JSON.stringify(error.response.data)}`);
    } else if (error.response?.status === 401) {
      throw new Error("Invalid API key");
    } else if (error.response?.status === 402) {
      throw new Error("Insufficient credits");
    } else {
      throw new Error(
        `Email sending failed: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
};

export default sendEmail;
