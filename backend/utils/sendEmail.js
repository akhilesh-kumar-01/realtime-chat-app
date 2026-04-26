const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Gmail service
// This is the "postman" that will send our emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send a welcome email to a new user
const sendWelcomeEmail = async (toEmail, name) => {
  try {
    // Setup the email details (who is it from, who is it to, subject, and body)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Welcome to ChatApp!",
      text: `Hello ${name},\n\nWelcome to ChatApp! We are so excited to have you on board. You can now start chatting with your friends in real-time.\n\nEnjoy chatting!\nThe ChatApp Team`
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${toEmail}`);
  } catch (error) {
    // If the email fails, we don't want to crash the whole server, just log the error
    console.error("Failed to send welcome email:", error.message);
  }
};

module.exports = { sendWelcomeEmail };
