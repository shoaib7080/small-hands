import axios from "axios";

const sendEmail = async (options) => {
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
    await axios.post(url, data, config);
    console.log(`✅ Email sent to ${options.email} via Brevo`);
  } catch (error) {
    console.error(
      "❌ Brevo Email Error:",
      error.response?.data || error.message
    );
    throw new Error("Email sending failed");
  }
};

export default sendEmail;
