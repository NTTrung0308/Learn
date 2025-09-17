// const express = require("express");
// const cors = require("cors");
// const passport = require("passport"); // Add this
// const session = require("express-session");
// require("dotenv").config();
// require("./config/passport"); // <-- Thêm dòng này



// const authRoutes = require("./routes/authRoutes");

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware quan trọng
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "mysupersecretkey123",
//     resave: false,
//     saveUninitialized: false,
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

// app.use(cors());
// app.use(express.json());
// app.use(passport.initialize()); // Add this

// // Routes
// app.use("/api/auth", authRoutes);

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();
require("./config/passport"); // Đảm bảo đường dẫn đúng

const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware quan trọng - ĐẶT ĐÚNG THỨ TỰ
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysupersecretkey123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Passport middleware - CHỈ MỘT LẦN
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server đang hoạt động" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Có gì đó không ổn!" });
});

app.listen(PORT, () => {
  console.log(`Máy chủ đang chạy trên cổng ${PORT}`);
});