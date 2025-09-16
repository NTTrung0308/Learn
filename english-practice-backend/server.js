const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/passport'); // Cấu hình passport

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Đã có, giữ nguyên
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});