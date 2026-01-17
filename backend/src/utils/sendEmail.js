// utils/sendEmail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

module.exports = async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: `"TMS" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};
