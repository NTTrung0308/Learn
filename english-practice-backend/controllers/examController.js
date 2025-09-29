const { Exam, Question } = require("../models/examModel");

// Tạo đề thi mới
exports.createExam = async (req, res) => {
  const { title, description, exam_type, duration } = req.body;
  const created_by = req.user.userId;

  try {
    const results = await Exam.create({
      title,
      description,
      exam_type,
      duration,
      created_by,
    });
    res
      .status(201)
      .json({ message: "Đề thi đã được tạo", examId: results.insertId });
  } catch (err) {
    console.error("Error creating exam:", err);
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

// Lấy tất cả đề thi
exports.getAllExams = async (req, res) => {
  try {
    const results = await Exam.findAll();
    res.json(results);
  } catch (err) {
    console.error("Error fetching exams:", err);
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

// Lấy chi tiết đề thi
exports.getExamDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const examResults = await Exam.findById(id);

    if (examResults.length === 0) {
      return res.status(404).json({ message: "Đề thi không tồn tại" });
    }

    const questionResults = await Question.findByExamId(id);

    // Parse JSON fields
    const questions = questionResults.map((q) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : [],
      correct_answer: q.correct_answer ? JSON.parse(q.correct_answer) : {},
    }));

    res.json({
      ...examResults[0],
      questions,
    });
  } catch (err) {
    console.error("Error fetching exam details:", err);
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

// Cập nhật đề thi
exports.updateExam = async (req, res) => {
  const { id } = req.params;
  const { title, description, exam_type, duration } = req.body;

  try {
    const results = await Exam.update(id, {
      title,
      description,
      exam_type,
      duration,
    });

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Đề thi không tồn tại" });
    }

    res.json({ message: "Đề thi đã được cập nhật" });
  } catch (err) {
    console.error("Error updating exam:", err);
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

// Xóa đề thi
exports.deleteExam = async (req, res) => {
  const { id } = req.params;

  try {
    const results = await Exam.delete(id);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Đề thi không tồn tại" });
    }

    res.json({ message: "Đề thi đã được xóa" });
  } catch (err) {
    console.error("Error deleting exam:", err);
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

// Thêm câu hỏi vào đề thi
exports.addQuestion = async (req, res) => {
  const {
    exam_id,
    question_type,
    question_text,
    question_order,
    options,
    correct_answer,
    points,
  } = req.body;

  // Xử lý file upload nếu có
  const audio_url =
    req.files && req.files.audio
      ? `/uploads/audio/${req.files.audio[0].filename}`
      : null;
  const image_url =
    req.files && req.files.image
      ? `/uploads/images/${req.files.image[0].filename}`
      : null;

  try {
    const results = await Question.create({
      exam_id,
      question_type,
      question_text,
      question_order,
      audio_url,
      image_url,
      options,
      correct_answer,
      points,
    });

    // Cập nhật tổng số câu hỏi
    await Exam.updateTotalQuestions(exam_id);

    res.status(201).json({
      message: "Câu hỏi đã được thêm",
      questionId: results.insertId,
    });
  } catch (err) {
    console.error("Error adding question:", err);
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

// Cập nhật câu hỏi
exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  const {
    question_type,
    question_text,
    question_order,
    options,
    correct_answer,
    points,
  } = req.body;

  // Xử lý file upload nếu có
  const audio_url =
    req.files && req.files.audio
      ? `/uploads/audio/${req.files.audio[0].filename}`
      : undefined;
  const image_url =
    req.files && req.files.image
      ? `/uploads/images/${req.files.image[0].filename}`
      : undefined;

  try {
    const results = await Question.findById(id);

    if (results.length === 0) {
      return res.status(404).json({ message: "Câu hỏi không tồn tại" });
    }

    const currentQuestion = results[0];

    await Question.update(id, {
      question_type,
      question_text,
      question_order,
      audio_url: audio_url || currentQuestion.audio_url,
      image_url: image_url || currentQuestion.image_url,
      options,
      correct_answer,
      points,
    });

    res.json({ message: "Câu hỏi đã được cập nhật" });
  } catch (err) {
    console.error("Error updating question:", err);
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

// Xóa câu hỏi
exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const results = await Question.findById(id);

    if (results.length === 0) {
      return res.status(404).json({ message: "Câu hỏi không tồn tại" });
    }

    const exam_id = results[0].exam_id;

    await Question.delete(id);

    // Cập nhật tổng số câu hỏi và thứ tự
    await Exam.updateTotalQuestions(exam_id);
    await Question.updateOrder(exam_id);

    res.json({ message: "Câu hỏi đã được xóa" });
  } catch (err) {
    console.error("Error deleting question:", err);
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};
