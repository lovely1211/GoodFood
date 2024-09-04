const nodemailer = require('nodemailer');

// Define the sendEmail function
const sendEmail = async ({ to, subject, text }) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'lovely1211zmn@gmail.com', 
        pass: 'tsuk tngx luav xaqk'    
      },
    });

    let mailOptions = {
      from: 'lovely1211zmn@gmail.com',
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
