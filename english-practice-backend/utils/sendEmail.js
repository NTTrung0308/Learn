const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Hoặc service khác
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn
    pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng (nếu dùng Gmail, cần tạo mật khẩu ứng dụng)
  }
});

const sendEmail = (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;