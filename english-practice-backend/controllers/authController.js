const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");

// Đăng ký
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

    // Lưu người dùng vào cơ sở dữ liệu - THÊM ROLE MẶC ĐỊNH
    const newUser = {
      email,
      phone,
      password: hashedPassword,
      verification_token: verificationToken,
      role: "user" // Thêm role mặc định
    };

    User.create(newUser, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error creating user", error: err });
      }

      // Gửi email xác thực
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

      sendEmail(email, "Verify your email", emailHtml)
        .then(() => {
          res.status(201).json({
            message: "User registered. Please check your email to verify.",
          });
        })
        .catch((error) => {
          console.error("Error sending email:", error);
          res.status(500).json({ message: "Error sending verification email" });
        });
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
    // Sửa: Chuyển findByVerificationToken thành Promise để xử lý đúng
    const results = await new Promise((resolve, reject) => {
      User.findByVerificationToken(token, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log("Database results:", results);

    if (results.length === 0) {
      console.log("Không tìm thấy người dùng nào có mã thông báo này");
      return res.status(400).send(`
    <div style="font-family: Arial; color: #c00; text-align: center; margin-top: 50px;">
      <h2>Verification Failed</h2>
      <p>Invalid or expired verification token.</p>
      <a href="http://localhost:3000/login">Go to Login</a>
    </div>
  `);
    }

    const user = results[0];
    console.log("Người dùng đã tìm thấy:", user);

    // Cập nhật trạng thái xác thực
    await new Promise((resolve, reject) => {
      User.updateVerificationStatus(user.id, (err, updateResults) => {
        if (err) {
          reject(err);
        } else {
          resolve(updateResults);
        }
      });
    });

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
const forgotPassword = (req, res) => {
  const { email } = req.body;

  // Tìm user bằng email
  User.findByEmail(email, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];

    // Tạo token reset mật khẩu
    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 giờ

    // Lưu token và thời gian hết hạn vào user
    User.updateResetPasswordToken(user.id, token, expires, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error setting reset token", error: err });
      }

      // Gửi email reset mật khẩu
      const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
      const emailHtml = `<p>Please click <a href="${resetUrl}">here</a> to reset your password.</p>`;

      sendEmail(email, "Reset your password", emailHtml)
        .then(() => {
          res.json({ message: "Password reset link sent to your email" });
        })
        .catch((error) => {
          console.error("Error sending email:", error);
          res.status(500).json({ message: "Error sending reset email" });
        });
    });
  });
};

// Reset mật khẩu
const resetPassword = (req, res) => {
  const { token, password } = req.body;

  // Tìm user bằng token và kiểm tra thời gian hết hạn
  User.findByResetPasswordToken(token, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = results[0];

    // Mã hóa mật khẩu mới
    bcrypt.hash(password, 12, (err, hashedPassword) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error hashing password", error: err });
      }

      // Cập nhật mật khẩu
      User.updatePassword(user.id, hashedPassword, (err, results) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error updating password", error: err });
        }
        res.json({ message: "Password reset successfully" });
      });
    });
  });
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
};
