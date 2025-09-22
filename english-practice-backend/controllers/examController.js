const { Exam, Question } = require("../models/examModel");

// Tạo đề thi mới
exports.createExam = (req, res) => {
  const { title, description, exam_type, duration } = req.body;
  const created_by = req.user.userId;

  Exam.create(
    { title, description, exam_type, duration, created_by },
    (err, results) => {
      if (err) {
        console.error("Error creating exam:", err);
        return res.status(500).json({ message: "Lỗi server", error: err });
      }
      res
        .status(201)
        .json({ message: "Đề thi đã được tạo", examId: results.insertId });
    }
  );
};

// Lấy tất cả đề thi
exports.getAllExams = (req, res) => {
  Exam.findAll((err, results) => {
    if (err) {
      console.error("Error fetching exams:", err);
      return res.status(500).json({ message: "Lỗi server", error: err });
    }
    res.json(results);
  });
};

// Lấy chi tiết đề thi
exports.getExamDetail = (req, res) => {
  const { id } = req.params;

  Exam.findById(id, (err, examResults) => {
    if (err) {
      console.error("Error fetching exam:", err);
      return res.status(500).json({ message: "Lỗi server", error: err });
    }

    if (examResults.length === 0) {
      return res.status(404).json({ message: "Đề thi không tồn tại" });
    }

    Question.findByExamId(id, (err, questionResults) => {
      if (err) {
        console.error("Error fetching questions:", err);
        return res.status(500).json({ message: "Lỗi server", error: err });
      }

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
    });
  });
};

// Cập nhật đề thi
exports.updateExam = (req, res) => {
  const { id } = req.params;
  const { title, description, exam_type, duration } = req.body;

  Exam.update(
    id,
    { title, description, exam_type, duration },
    (err, results) => {
      if (err) {
        console.error("Error updating exam:", err);
        return res.status(500).json({ message: "Lỗi server", error: err });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Đề thi không tồn tại" });
      }

      res.json({ message: "Đề thi đã được cập nhật" });
    }
  );
};

// Xóa đề thi
exports.deleteExam = (req, res) => {
  const { id } = req.params;

  Exam.delete(id, (err, results) => {
    if (err) {
      console.error("Error deleting exam:", err);
      return res.status(500).json({ message: "Lỗi server", error: err });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Đề thi không tồn tại" });
    }

    res.json({ message: "Đề thi đã được xóa" });
  });
};

// Thêm câu hỏi vào đề thi
exports.addQuestion = (req, res) => {
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

  Question.create(
    {
      exam_id,
      question_type,
      question_text,
      question_order,
      audio_url,
      image_url,
      options,
      correct_answer,
      points,
    },
    (err, results) => {
      if (err) {
        console.error("Error adding question:", err);
        return res.status(500).json({ message: "Lỗi server", error: err });
      }

      // Cập nhật tổng số câu hỏi
      Exam.updateTotalQuestions(exam_id, (err) => {
        if (err) {
          console.error("Error updating total questions:", err);
        }
      });

      res
        .status(201)
        .json({
          message: "Câu hỏi đã được thêm",
          questionId: results.insertId,
        });
    }
  );
};

// Cập nhật câu hỏi
exports.updateQuestion = (req, res) => {
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

  Question.findById(id, (err, results) => {
    if (err) {
      console.error("Error finding question:", err);
      return res.status(500).json({ message: "Lỗi server", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Câu hỏi không tồn tại" });
    }

    const currentQuestion = results[0];

    Question.update(
      id,
      {
        question_type,
        question_text,
        question_order,
        audio_url: audio_url || currentQuestion.audio_url,
        image_url: image_url || currentQuestion.image_url,
        options,
        correct_answer,
        points,
      },
      (err, results) => {
        if (err) {
          console.error("Error updating question:", err);
          return res.status(500).json({ message: "Lỗi server", error: err });
        }

        res.json({ message: "Câu hỏi đã được cập nhật" });
      }
    );
  });
};

// Xóa câu hỏi
exports.deleteQuestion = (req, res) => {
  const { id } = req.params;

  Question.findById(id, (err, results) => {
    if (err) {
      console.error("Error finding question:", err);
      return res.status(500).json({ message: "Lỗi server", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Câu hỏi không tồn tại" });
    }

    const exam_id = results[0].exam_id;

    Question.delete(id, (err, results) => {
      if (err) {
        console.error("Error deleting question:", err);
        return res.status(500).json({ message: "Lỗi server", error: err });
      }

      // Cập nhật tổng số câu hỏi và thứ tự
      Exam.updateTotalQuestions(exam_id, (err) => {
        if (err) {
          console.error("Error updating total questions:", err);
        }
      });

      Question.updateOrder(exam_id, (err) => {
        if (err) {
          console.error("Error updating question order:", err);
        }
      });

      res.json({ message: "Câu hỏi đã được xóa" });
    });
  });
};
