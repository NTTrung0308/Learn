const pool = require("../config/database");

const User = {
  create: async (user) => {
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
      user.role || "user",
    ];
    const [result] = await pool.execute(query, values);
    return result;
  },

  findByEmail: async (email) => {
    const query = "SELECT * FROM users WHERE email = ?";
    const [results] = await pool.execute(query, [email]);
    return results;
  },

  findByGoogleId: async (googleId) => {
    const query = "SELECT * FROM users WHERE google_id = ?";
    const [results] = await pool.execute(query, [googleId]);
    return results;
  },

  findByFacebookId: async (facebookId) => {
    const query = "SELECT * FROM users WHERE facebook_id = ?";
    const [results] = await pool.execute(query, [facebookId]);
    return results;
  },

  updateVerificationStatus: async (userId) => {
    const query =
      "UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ?";
    const [result] = await pool.execute(query, [userId]);
    return result;
  },

  updateResetPasswordToken: async (userId, token, expires) => {
    const query =
      "UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?";
    const [result] = await pool.execute(query, [token, expires, userId]);
    return result;
  },

  findByResetPasswordToken: async (token) => {
    const query =
      "SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()";
    const [results] = await pool.execute(query, [token]);
    return results;
  },

  updatePassword: async (userId, password) => {
    const query =
      "UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?";
    const [result] = await pool.execute(query, [password, userId]);
    return result;
  },

  findByVerificationToken: async (token) => {
    const query = "SELECT * FROM users WHERE verification_token = ?";
    const [results] = await pool.execute(query, [token]);
    return results;
  },

  createWithProvider: async (user) => {
    const {
      email,
      google_id = null,
      facebook_id = null,
      display_name = null,
      is_verified = true,
      role = "user",
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
      role,
    ];
    const [result] = await pool.execute(query, params);
    return result;
  },

  findById: async (id) => {
    const query = "SELECT * FROM users WHERE id = ?";
    const [results] = await pool.execute(query, [id]);
    return results;
  },

  updateGoogleId: async (userId, googleId) => {
    const query = "UPDATE users SET google_id = ? WHERE id = ?";
    const [result] = await pool.execute(query, [googleId, userId]);
    return result;
  },

  // Cập nhật thông tin profile (async/await)
  updateProfile: async (id, data) => {
    // Xây dựng query động dựa trên các trường có trong data
    const fields = [];
    const values = [];
    for (const key in data) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    }
    if (fields.length === 0) return { affectedRows: 0 };
    values.push(id);
    const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result;
  },
};

module.exports = User;
