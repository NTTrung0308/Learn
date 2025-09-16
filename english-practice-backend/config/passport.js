// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('../models/userModel');

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: "/auth/google/callback"
// },
// async (accessToken, refreshToken, profile, done) => {
//   try {
//     // Kiểm tra xem user đã tồn tại với googleId chưa
//     const [existingUser] = await User.findByGoogleId(profile.id);
//     if (existingUser) {
//       return done(null, existingUser);
//     }

//     // Nếu chưa, tạo user mới
//     const newUser = {
//       google_id: profile.id,
//       email: profile.emails[0].value,
//       is_verified: true
//     };

//     // Model User cần được mở rộng để hỗ trợ lưu user qua Google
//     User.create(newUser, (err, results) => {
//       if (err) {
//         return done(err, null);
//       }
//       newUser.id = results.insertId;
//       done(null, newUser);
//     });
//   } catch (error) {
//     done(error, null);
//   }
// }));

// // Serialize và deserialize user
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   // Tìm user bằng id và gọi done
//   // (Ở đây cần viết hàm findById trong model)
// });

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy; // Thêm Facebook Strategy
const User = require('../models/userModel');

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const [existingUser] = await User.findByGoogleId(profile.id);
    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = {
      google_id: profile.id,
      email: profile.emails[0].value,
      is_verified: true
    };

    User.createWithProvider(newUser, (err, results) => {
      if (err) return done(err, null);
      newUser.id = results.insertId;
      done(null, newUser);
    });
  } catch (error) {
    done(error, null);
  }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'emails'] // Lấy email từ Facebook
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const [existingUser] = await User.findByFacebookId(profile.id);
    if (existingUser) return done(null, existingUser);

    const newUser = {
      facebook_id: profile.id,
      email: profile.emails[0].value,
      is_verified: true
    };

    User.createWithProvider(newUser, (err, results) => {
      if (err) return done(err, null);
      newUser.id = results.insertId;
      done(null, newUser);
    });
  } catch (error) {
    done(error, null);
  }
}));

// Serialize và Deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [user] = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});