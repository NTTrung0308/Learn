const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/userModel");

// Google Strategy
// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile received:", profile);

        // Tìm user bằng google_id
        const results = await User.findByGoogleId(profile.id);
        
        if (results && results.length > 0) {
          console.log("Existing user found:", results[0]);
          // Trả về đầy đủ thông tin user từ database
          return done(null, results[0]);
        }

        // Tìm user bằng email (nếu đã đăng ký trước đó bằng email)
        const emailResults = await User.findByEmail(profile.emails[0].value);
        if (emailResults && emailResults.length > 0) {
          console.log("User exists with this email, updating google_id:", emailResults[0]);
          // Cập nhật google_id cho user đã tồn tại
          await User.updateGoogleId(emailResults[0].id, profile.id);
          return done(null, emailResults[0]);
        }

        // Tạo user mới
        const newUser = {
          google_id: profile.id,
          email: profile.emails[0].value,
          display_name: profile.displayName,
          facebook_id: null,
          is_verified: true,
          role: "user",
        };

        console.log("Creating new user with data:", newUser);

        // Sử dụng promise để xử lý kết quả
        const createdUser = await new Promise((resolve, reject) => {
          User.createWithProvider(newUser, (err, results) => {
            if (err) {
              console.error("Error creating user:", err);
              return reject(err);
            }
            
            // Lấy thông tin user vừa tạo từ database
            User.findById(results.insertId)
              .then(userResults => {
                if (userResults && userResults.length > 0) {
                  resolve(userResults[0]);
                } else {
                  reject(new Error("User not found after creation"));
                }
              })
              .catch(error => reject(error));
          });
        });

        console.log("New user created successfully:", createdUser);
        done(null, createdUser);
      } catch (error) {
        console.error("Google authentication error:", error);
        done(error, null);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL:
        process.env.FACEBOOK_CALLBACK_URL ||
        "http://localhost:5000/api/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "displayName"],
    },
   async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Facebook profile received:", profile);

        const results = await User.findByFacebookId(profile.id);

        if (results && results.length > 0) {
          console.log("Existing Facebook user found:", results[0]);
          return done(null, results[0]);
        }

        const newUser = {
          facebook_id: profile.id || null,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`,
          display_name: profile.displayName || null,
          google_id: null,
          is_verified: true,
          role: "user", // Thêm role mặc định
        };

        console.log("Creating new Facebook user with data:", newUser);

        User.createWithProvider(newUser, (err, results) => {
          if (err) {
            console.error("Error creating Facebook user:", err);
            return done(err, null);
          }
          
          const createdUser = {
            id: results.insertId,
            facebook_id: newUser.facebook_id,
            email: newUser.email,
            display_name: newUser.display_name,
            is_verified: newUser.is_verified,
            role: newUser.role, // Thêm role
          };
          
          console.log("New Facebook user created with ID:", createdUser);
          done(null, createdUser);
        });
      } catch (error) {
        console.error("Facebook authentication error:", error);
        done(error, null);
      }
    }
  )
);