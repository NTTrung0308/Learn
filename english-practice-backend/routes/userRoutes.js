const express = require("express");
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/authMiddleware");
const User = require("../models/userModel");
const router = express.Router();

// Cấu hình multer để lưu file ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/avatars/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh"), false);
    }
  },
});

// Lấy thông tin profile
router.get("/profile", auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id; // Đảm bảo lấy đúng id
    const users = await User.findById(userId);
    const user = users && users[0];

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.json({
      display_name: user.display_name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      learning_goal: user.learning_goal,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật thông tin profile
router.put("/profile", auth, upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { display_name, phone, learning_goal } = req.body;

    let avatarPath = null;
    if (req.file) {
      avatarPath = "/uploads/avatars/" + req.file.filename;
    }

    const updatedData = {
      display_name,
      phone,
      learning_goal,
    };

    if (avatarPath) {
      updatedData.avatar = avatarPath;
    }

    const result = await User.updateProfile(userId, updatedData);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Lấy thông tin người dùng đã cập nhật
    const updatedUsers = await User.findById(userId);
    const updatedUser = updatedUsers && updatedUsers[0];

    res.json({
      message: "Cập nhật thông tin thành công",
      user: {
        display_name: updatedUser.display_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        learning_goal: updatedUser.learning_goal,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Đổi mật khẩu
router.put("/change-password", auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải từ 6 ký tự" });
    }

    // Lấy user hiện tại
    const users = await User.findById(userId);
    const user = users && users[0];
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra mật khẩu cũ
    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    // Hash mật khẩu mới và cập nhật
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.updatePassword(userId, hashedPassword);

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
