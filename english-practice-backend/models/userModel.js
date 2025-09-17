const db = require("../config/database");

const User = {
  create: (user, callback) => {
    const query = `
      INSERT INTO users 
      (email, phone, password, verification_token, role) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      user.email,
      user.phone,
      user.password,
      user.verification_token,
      user.role || 'user'
    ];
    db.query(query, values, callback);
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM users WHERE email = ?";
      db.execute(query, [email], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  findByGoogleId: (googleId) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM users WHERE google_id = ?";
      db.execute(query, [googleId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },
  findByFacebookId: (facebookId) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM users WHERE facebook_id = ?";
      db.execute(query, [facebookId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },
  updateVerificationStatus: (userId, callback) => {
    const query =
      "UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ?";
    db.execute(query, [userId], callback);
  },

  updateResetPasswordToken: (userId, token, expires, callback) => {
    const query =
      "UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?";
    db.execute(query, [token, expires, userId], callback);
  },

  findByResetPasswordToken: (token, callback) => {
    const query =
      "SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()";
    db.execute(query, [token], callback);
  },

  updatePassword: (userId, password, callback) => {
    const query =
      "UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?";
    db.execute(query, [password, userId], callback);
  },

  // findByVerificationToken để hỗ trợ cả callback và promise
  findByVerificationToken: (token, callback) => {
    const query = "SELECT * FROM users WHERE verification_token = ?";

    // Nếu có callback, sử dụng callback
    if (typeof callback === "function") {
      return db.execute(query, [token], callback);
    }

    // Nếu không có callback, trả về promise
    return new Promise((resolve, reject) => {
      db.execute(query, [token], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  // Hàm tạo user với OAuth (Google/Facebook)
createWithProvider: (user, callback) => {
  const {
    email,
    google_id = null,
    facebook_id = null,
    display_name = null,
    is_verified = true,
    role = "user" // Đảm bảo có role
  } = user;

  const query = `
    INSERT INTO users 
    (email, google_id, facebook_id, display_name, is_verified, role) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [
    email, 
    google_id, 
    facebook_id, 
    display_name, 
    is_verified,
    role // Thêm role vào query
  ];

  console.log("Inserting user with params:", params);
  db.execute(query, params, callback);
},

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM users WHERE id = ?";
      db.execute(query, [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },
};

// Thêm vào userModel.js
updateGoogleId: (userId, googleId) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE users SET google_id = ? WHERE id = ?";
    db.execute(query, [googleId, userId], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
},

module.exports = User;
