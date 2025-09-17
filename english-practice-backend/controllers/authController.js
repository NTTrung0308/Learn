const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

// Tạo queue cho email jobs
const emailQueue = [];
let isProcessing = false;

// Hàm xử lý email queue
const processEmailQueue = async () => {
  if (isProcessing || emailQueue.length === 0) return;

  isProcessing = true;

  while (emailQueue.length > 0) {
    const emailJob = emailQueue.shift();
    try {
      await sendEmail(emailJob.to, emailJob.subject, emailJob.html);
      console.log(`Email sent to: ${emailJob.to}`);
    } catch (error) {
      console.error(`Failed to send email to: ${emailJob.to}`, error);
    }
  }

  isProcessing = false;
};

// Đăng ký
const register = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    // Kiểm tra người dùng đã tồn tại chưa
    const [existingUser] = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 12);

    // Tạo token xác thực
    const verificationToken = crypto.randomBytes(20).toString("hex");

    // Lưu người dùng vào cơ sở dữ liệu
    const newUser = {
      email,
      phone,
      password: hashedPassword,
      verification_token: verificationToken,
      role: "user",
    };

    await User.create(newUser);

    // Gửi email xác thực qua queue
    const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Welcome to English Learning!</h2>
        <p>Thank you for joining our platform. To start practicing and improving your English skills, please verify your email address.</p>
        <p>
          <a href="${verificationUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; 
                    color: #fff; text-decoration: none; border-radius: 5px;">
            Verify My Email
          </a>
        </p>
        <p>If the button above doesn’t work, copy and paste the following link into your browser:</p>
        <p><a href="${verificationUrl}" style="color: #4CAF50;">${verificationUrl}</a></p>
        <hr />
        <p style="font-size: 12px; color: #777;">
          Happy learning,<br/>
          The English Learning Team
        </p>
      </div>
    `;

    emailQueue.push({
      to: email,
      subject: "Verify your email",
      html: emailHtml,
    });
    processEmailQueue();

    // Trả về response NGAY LẬP TỨC
    res.status(201).json({
      message: "User registered. Please check your email to verify.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Xác thực email

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  console.log("Đã nhận được mã thông báo xác minh:", token);

  try {
    // Dùng async/await thay vì callback
    const results = await User.findByVerificationToken(token);

    if (results.length === 0) {
      return res.status(400).send(`
        <div style="font-family: Arial; color: #c00; text-align: center; margin-top: 50px;">
          <h2>Verification Failed</h2>
          <p>Invalid or expired verification token.</p>
          <a href="http://localhost:3000/login">Go to Login</a>
        </div>
      `);
    }

    const user = results[0];

    // Cập nhật trạng thái xác thực
    await User.updateVerificationStatus(user.id);

    return res.send(`
      <div style="font-family: Arial; color: #090; text-align: center; margin-top: 50px;">
        <h2>Email Verified Successfully!</h2>
        <p>Your email has been verified. You can now log in and start learning English.</p>
        <a href="http://localhost:3000/login">Go to Login</a>
      </div>
    `);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Database error", error });
  }
};

// Đăng nhập
// Đăng nhập
// Đăng nhập
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Kiểm tra email đã xác thực chưa
    if (!user.is_verified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }

    // Tạo JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role, // Đảm bảo trả về role
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// Quên mật khẩu
// Quên mật khẩu - Tối ưu hóa
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    console.time("findUserByEmail");
    const results = await User.findByEmail(email);
    console.timeEnd("findUserByEmail");

    if (results.length === 0) {
      // Trả về thành công ngay cả khi không tìm thấy email (bảo mật)
      return res.json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    const user = results[0];

    // Tạo token
    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 giờ

    console.time("updateResetToken");
    await User.updateResetPasswordToken(user.id, token, expires);
    console.timeEnd("updateResetToken");

    // Tạo email content
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; 
                    color: #fff; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
        <p><a href="${resetUrl}" style="color: #4CAF50;">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <hr />
        <p style="font-size: 12px; color: #777;">
          If you didn't request this reset, please ignore this email.<br/>
          The English Learning Team
        </p>
      </div>
    `;

    // Thêm email vào queue và phản hồi ngay lập tức
    emailQueue.push({
      to: email,
      subject: "Reset your password",
      html: emailHtml,
    });

    // Khởi động xử lý queue
    processEmailQueue();

    res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Reset mật khẩu
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Tìm user bằng token (dùng async/await)
    const results = await User.findByResetPasswordToken(token);

    // Kiểm tra token hợp lệ
    if (results.length === 0) {
      return res
        .status(400)
        .json({ message: "Mã thông báo không hợp lệ hoặc hết hạn" });
    }

    const user = results[0];

    // Xác thực mật khẩu (ví dụ: độ dài tối thiểu)
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải từ 6 ký tự trở lên" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Cập nhật mật khẩu và xóa token (dùng async/await)
    await User.updatePassword(user.id, hashedPassword);

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
};
