const express = require('express');
const cors = require('cors'); // Thêm dòng này
const passport = require('passport');
const authRoutes = require('./routes/authRoutes');
require('./config/passport'); // Cấu hình passport

const app = express();

app.use(cors()); // Thêm dòng này
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);

// Routes cho OAuth2
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    }
);

module.exports = app;