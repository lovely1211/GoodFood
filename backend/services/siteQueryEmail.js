require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS       
  },
  tls: {
    rejectUnauthorized: false
  }
});

router.post('/sendQuery', (req, res) => {
  const { queryType, name, email, message } = req.body;

  if (!queryType || !name || !email || message === undefined) {
    return res.status(400).send('All fields are required.');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: process.env.EMAIL_USER, 
    subject: `Query from ${name} - ${queryType}`,
    text: `
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send(error.toString());
    }
    res.status(200).send('Email sent: ' + info.response);
  });
});

module.exports = router;
