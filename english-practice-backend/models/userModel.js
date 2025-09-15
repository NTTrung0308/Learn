const db = require("../config/database");

const User = {
  create: (user, callback) => {
    const { email, phone, password, verification_token } = user;
    const query =
      "INSERT INTO users (email, phone, password, verification_token) VALUES (?, ?, ?, ?)";
    db.execute(query, [email, phone, password, verification_token], callback);
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

  findByGoogleId: (googleId, callback) => {
    const query = "SELECT * FROM users WHERE google_id = ?";
    db.execute(query, [googleId], callback);
  },

  findByFacebookId: (facebookId, callback) => {
    const query = "SELECT * FROM users WHERE facebook_id = ?";
    db.execute(query, [facebookId], callback);
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
};

findByVerificationToken: (token, callback) => {
  const query = "SELECT * FROM users WHERE verification_token = ?";
  db.execute(query, [token], callback);
};

module.exports = User;
