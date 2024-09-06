const nodemailer = require('nodemailer');

// Define the sendEmail function
const sendEmail = async ({ to, subject, text }) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: EMAIL_USER, 
        pass: EMAIL_PASS'    
      },
    });

    let mailOptions = {
      from: EMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
