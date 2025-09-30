const express = require("express");
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const {
  createTopic,
  getAllTopics,
  updateTopic,
  deleteTopic,
  createLesson,
  getLessons,
  getLessonDetail,
  updateLesson,
  deleteLesson,
  addExercise,
  exportLessonsCSV,
  importLessonsCSV,
  getWordDefinition,
} = require("../controllers/grammarController");

const router = express.Router();

// Cấu hình multer cho file upload
const grammarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "audio") {
      cb(null, "uploads/grammar/audio/");
    } else if (file.fieldname === "image") {
      cb(null, "uploads/grammar/images/");
    } else if (file.fieldname === "csv") {
      cb(null, "uploads/grammar/temp/");
    } else {
      cb(new Error("Invalid fieldname"), false);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: grammarStorage,
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
    } else if (file.fieldname === "csv") {
      if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
        cb(null, true);
      } else {
        cb(new Error("Chỉ chấp nhận file CSV"), false);
      }
    } else {
      cb(new Error("Invalid fieldname"), false);
    }
  }
});

// Routes cho chủ đề ngữ pháp
router.post("/topics", auth, createTopic);
router.get("/topics", getAllTopics);    
router.put("/topics/:id", auth, updateTopic);
router.delete("/topics/:id", auth, deleteTopic);

// Routes cho bài học ngữ pháp
router.post("/lessons", auth, upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "image", maxCount: 1 }
]), createLesson);

router.get("/lessons", getLessons);
router.get("/lessons/:id", getLessonDetail);
router.put("/lessons/:id", auth, upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "image", maxCount: 1 }
]), updateLesson);

router.delete("/lessons/:id", auth, deleteLesson);

// Routes cho bài tập
router.post("/exercises", auth, addExercise);

// Routes cho Import/Export CSV
router.get("/export/csv", auth, exportLessonsCSV);
router.post("/import/csv", auth, upload.single("csv"), importLessonsCSV);

// Route cho Oxford Dictionary API
router.get("/dictionary/:word", auth, getWordDefinition);

module.exports = router;