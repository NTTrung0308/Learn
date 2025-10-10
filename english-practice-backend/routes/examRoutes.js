const express = require("express");
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const {
  createExam,
  getAllExams,
  getExamDetail,
  updateExam,
  deleteExam,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  submitExam, // Added back
  getExamResult, // Added back
  getExamHistory,
  analyzeExamResult,
} = require("../controllers/examController");

const router = express.Router();

// Cấu hình multer cho file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "audio") {
      cb(null, "uploads/audio/");
    } else if (file.fieldname === "image") {
      cb(null, "uploads/images/");
    } else {
      cb(new Error("Invalid fieldname"), false);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === "audio") {
      if (file.mimetype.startsWith("audio/")) {
        cb(null, true);
      } else {
        cb(new Error("Chỉ chấp nhận file audio"), false);
      }
    } else if (file.fieldname === "image") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Chỉ chấp nhận file ảnh"), false);
      }
    } else {
      cb(new Error("Invalid fieldname"), false);
    }
  },
});

// Routes cho đề thi
router.post("/", auth, createExam);
router.get("/", getAllExams);
router.get("/history", auth, getExamHistory);
router.get("/:id", getExamDetail);
router.put("/:id", auth, updateExam);
router.delete("/:id", auth, deleteExam);
router.post("/:id/submit", auth, submitExam); // Added back
router.get("/result/:resultId", auth, getExamResult); // Changed route
router.post("/analyze", auth, analyzeExamResult);

// Routes cho câu hỏi
router.post(
  "/:examId/questions",
  auth,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  addQuestion
);

router.put(
  "/questions/:id",
  auth,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  updateQuestion
);

router.delete("/questions/:id", auth, deleteQuestion);

module.exports = router;
