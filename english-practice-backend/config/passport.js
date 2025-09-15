const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Kiểm tra xem user đã tồn tại với googleId chưa
    const [existingUser] = await User.findByGoogleId(profile.id);
    if (existingUser) {
      return done(null, existingUser);
    }

    // Nếu chưa, tạo user mới
    const newUser = {
      google_id: profile.id,
      email: profile.emails[0].value,
      is_verified: true
    };

    // Lưu ý: Model User cần được mở rộng để hỗ trợ lưu user qua Google
    User.create(newUser, (err, results) => {
      if (err) {
        return done(err, null);
      }
      newUser.id = results.insertId;
      done(null, newUser);
    });
  } catch (error) {
    done(error, null);
  }
}));

// Serialize và deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Tìm user bằng id và gọi done
  // (Ở đây cần viết hàm findById trong model)
});