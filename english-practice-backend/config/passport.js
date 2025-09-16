const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/userModel");

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile received:", profile);

        const results = await User.findByGoogleId(profile.id);

        if (results && results.length > 0) {
          console.log("Existing user found:", results[0]);
          return done(null, results[0]);
        }

        // Đảm bảo tất cả giá trị đều được định nghĩa, không có undefined
        const newUser = {
          google_id: profile.id || null,
          email:
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null,
          display_name: profile.displayName || null,
          facebook_id: null, // Explicitly set to null
          is_verified: true,
        };

        console.log("Creating new user with data:", newUser);

        User.createWithProvider(newUser, (err, results) => {
          if (err) {
            console.error("Error creating user:", err);
            return done(err, null);
          }

          // Đảm bảo user object có đầy đủ thông tin
          const createdUser = {
            id: results.insertId,
            google_id: newUser.google_id,
            email: newUser.email,
            display_name: newUser.display_name,
            is_verified: newUser.is_verified,
          };

          console.log("New user created successfully:", createdUser);
          done(null, createdUser);
        });
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

        // Đảm bảo tất cả giá trị đều được định nghĩa
        const newUser = {
          facebook_id: profile.id || null,
          email:
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : `${profile.id}@facebook.com`,
          display_name: profile.displayName || null,
          google_id: null, // Explicitly set to null
          is_verified: true,
        };

        console.log("Creating new Facebook user with data:", newUser);

        User.createWithProvider(newUser, (err, results) => {
          if (err) {
            console.error("Error creating Facebook user:", err);
            return done(err, null);
          }
          newUser.id = results.insertId;
          console.log("New Facebook user created with ID:", newUser.id);
          done(null, newUser);
        });
      } catch (error) {
        console.error("Facebook authentication error:", error);
        done(error, null);
      }
    }
  )
);

// Serialize và Deserialize (giữ nguyên)
passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing user ID:", id);
    const results = await User.findById(id);

    if (results && results.length > 0) {
      done(null, results[0]);
    } else {
      done(new Error("User not found"), null);
    }
  } catch (error) {
    console.error("Deserialize error:", error);
    done(error, null);
  }
});
