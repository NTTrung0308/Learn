const express = require("express");
const cors = require("cors");
const passport = require("passport"); // Add this
const session = require("express-session");
require("dotenv").config();
require("./config/passport"); // <-- Thêm dòng này

const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware quan trọng
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysupersecretkey123",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(express.json());
app.use(passport.initialize()); // Add this

// Routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
