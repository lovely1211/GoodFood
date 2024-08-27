const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lovely1211zmn@gmail.com', // email
    pass: 'tsuk tngx luav xaqk'       // app-specific password
  },
  tls: {
    rejectUnauthorized: false
  }
});

router.post('/sendQuery', (req, res) => {
  const { queryType, name, email, message, isMember } = req.body;

  if (!queryType || !name || !email || !message || isMember === undefined) {
    return res.status(400).send('All fields are required.');
  }

  const mailOptions = {
    from: email,
    to: 'lovely1211zmn@gmail.com', //  email
    subject: `Query from ${name} - ${queryType}`,
    text: `
      Name: ${name}
      Email: ${email}
      Member of GoodFood: ${isMember}
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
