const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

// Đăng ký
const register = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    // Kiểm tra người dùng đã tồn tại chưa
    const [existingUser] = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 12);

    // Tạo token xác thực
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Lưu người dùng vào cơ sở dữ liệu
    const newUser = {
      email,
      phone,
      password: hashedPassword,
      verification_token: verificationToken
    };

    User.create(newUser, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error creating user', error: err });
      }

      // Gửi email xác thực
      const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;
      const emailHtml = `<p>Please click <a href="${verificationUrl}">here</a> to verify your email.</p>`;

      sendEmail(email, 'Verify your email', emailHtml)
        .then(() => {
          res.status(201).json({ message: 'User registered. Please check your email to verify.' });
        })
        .catch((error) => {
          console.error('Error sending email:', error);
          res.status(500).json({ message: 'Error sending verification email' });
        });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Xác thực email
const verifyEmail = (req, res) => {
  const { token } = req.query;

 User.findByVerificationToken(token, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid token' });
    }
    const user = results[0];

    // Cập nhật trạng thái xác thực
    User.updateVerificationStatus(user.id, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error verifying email', error: err });
      }
      res.json({ message: 'Email verified successfully' });
    });
  });
};

// Đăng nhập
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Kiểm tra email đã xác thực chưa
    if (!user.is_verified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    // Tạo JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Quên mật khẩu
const forgotPassword = (req, res) => {
  const { email } = req.body;

  // Tìm user bằng email
  User.findByEmail(email, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = results[0];

    // Tạo token reset mật khẩu
    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 giờ

    // Lưu token và thời gian hết hạn vào user
    User.updateResetPasswordToken(user.id, token, expires, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error setting reset token', error: err });
      }

      // Gửi email reset mật khẩu
      const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
      const emailHtml = `<p>Please click <a href="${resetUrl}">here</a> to reset your password.</p>`;

      sendEmail(email, 'Reset your password', emailHtml)
        .then(() => {
          res.json({ message: 'Password reset link sent to your email' });
        })
        .catch((error) => {
          console.error('Error sending email:', error);
          res.status(500).json({ message: 'Error sending reset email' });
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
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = results[0];

    // Mã hóa mật khẩu mới
    bcrypt.hash(password, 12, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Error hashing password', error: err });
      }

      // Cập nhật mật khẩu
      User.updatePassword(user.id, hashedPassword, (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating password', error: err });
        }
        res.json({ message: 'Password reset successfully' });
      });
    });
  });
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword
};