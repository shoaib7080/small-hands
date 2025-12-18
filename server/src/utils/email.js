import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); // Load env vars

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // The App Password
    },
  });

  const mailOptions = {
    from: `"Small Hands Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
