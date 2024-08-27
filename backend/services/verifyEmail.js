const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use true if using SSL (port 465)
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Your SMTP username
    pass: process.env.EMAIL_PASS,  // Your SMTP password
  },
});

const sendVerificationEmail = async (userEmail, verificationCode) => {

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Verify your email to create your GoodFood account',
    html: `<p>Your verification code for registration on GoodFood is <strong>${verificationCode}</strong>. Do not share this code with anyone for security reasons.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error.message);
    console.error('Stack Trace:', error.stack);
    throw new Error('Error sending email');
  }
};

module.exports = sendVerificationEmail;
