const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, chatController.sendMessage);

module.exports = router;