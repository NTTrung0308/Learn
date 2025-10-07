const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  Exam,
  Question,
  ExamResult,
  ExamSubmission,
} = require("../models/examModel");

// Tạo đề thi mới

exports.createExam = async (req, res) => {
  const { title, description, exam_type, duration } = req.body;

  const created_by = req.user.userId;

  try {
    const [results] = await Exam.create({
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

// Lấy tất cả đề thi với phân trang

exports.getAllExams = async (req, res) => {
  const page = parseInt(req.query.page) || 1;

  const limit = parseInt(req.query.limit) || 10;

  const offset = (page - 1) * limit;

  const { search, exam_type } = req.query;

  try {
    const { exams, totalExams } = await Exam.findAll({
      limit,

      offset,

      search,

      exam_type,
    });

    res.json({
      exams,

      totalExams,

      totalPages: Math.ceil(totalExams / limit),

      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching exams:", err);

    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

// Lấy chi tiết đề thi

exports.getExamDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const [examResults] = await Exam.findById(id);

    if (examResults.length === 0) {
      return res.status(404).json({ message: "Đề thi không tồn tại" });
    }

    const [questionResults] = await Question.findByExamId(id);

    // Parse JSON fields

    const questions = questionResults.map((q) => {
      let correctAnswerObject = {};
      if (q.correct_answer) {
        try {
          // Try parsing twice for double-stringified JSON
          correctAnswerObject = JSON.parse(JSON.parse(q.correct_answer));
        } catch (e) {
          try {
            // Fallback to parsing once
            correctAnswerObject = JSON.parse(q.correct_answer);
          } catch (e2) {
            console.error(
              "Could not parse correct_answer in getExamDetail:",
              q.correct_answer,
              e2
            );
            correctAnswerObject = {}; // Assign empty object on failure
          }
        }
      }

      let optionsArray = [];
      if (q.options) {
        try {
          optionsArray = JSON.parse(JSON.parse(q.options));
        } catch (e) {
          try {
            optionsArray = JSON.parse(q.options);
          } catch (e2) {
            console.error(
              "Could not parse options in getExamDetail:",
              q.options,
              e2
            );
            optionsArray = [];
          }
        }
      }

      return {
        ...q,
        options: optionsArray,
        correct_answer: correctAnswerObject,
      };
    });

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
    const [results] = await Exam.update(id, {
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
    const [results] = await Exam.delete(id);

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
    let parsedOptions = options;
    if (typeof options === "string") {
      try {
        parsedOptions = JSON.parse(options);
      } catch (e) {
        console.error("Error parsing options in addQuestion:", e);
      }
    }

    let parsedCorrectAnswer = correct_answer;
    if (typeof correct_answer === "string") {
      try {
        parsedCorrectAnswer = JSON.parse(correct_answer);
      } catch (e) {
        console.error("Error parsing correct_answer in addQuestion:", e);
      }
    }

    const [results] = await Question.create({
      exam_id,

      question_type,

      question_text,

      question_order,

      audio_url,

      image_url,

      options: parsedOptions,

      correct_answer: parsedCorrectAnswer,

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
    const [results] = await Question.findById(id);

    if (results.length === 0) {
      return res.status(404).json({ message: "Câu hỏi không tồn tại" });
    }

    const currentQuestion = results[0];

    let parsedOptions = options;
    if (typeof options === "string") {
      try {
        parsedOptions = JSON.parse(options);
      } catch (e) {
        console.error("Error parsing options in updateQuestion:", e);
      }
    }

    let parsedCorrectAnswer = correct_answer;
    if (typeof correct_answer === "string") {
      try {
        parsedCorrectAnswer = JSON.parse(correct_answer);
      } catch (e) {
        console.error("Error parsing correct_answer in updateQuestion:", e);
      }
    }

    await Question.update(id, {
      question_type,

      question_text,

      question_order,

      audio_url: audio_url || currentQuestion.audio_url,

      image_url: image_url || currentQuestion.image_url,

      options: parsedOptions,

      correct_answer: parsedCorrectAnswer,

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
    const [results] = await Question.findById(id);

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

// Nộp bà
exports.submitExam = async (req, res) => {
  const { id: exam_id } = req.params;
  const user_id = req.user.userId;
  const { answers, time_spent } = req.body;

  try {
    // Lấy thông tin đề thi và câu hỏi
    const [examResults] = await Exam.findById(exam_id);
    if (examResults.length === 0) {
      return res.status(404).json({ message: "Đề thi không tồn tại" });
    }

    const [questionResults] = await Question.findByExamId(exam_id);

    // Parse JSON fields cho câu hỏi
    const questions = questionResults.map((q) => {
      let correctAnswerObject = {};
      if (q.correct_answer) {
        try {
          // Try parsing twice for double-stringified JSON
          correctAnswerObject = JSON.parse(JSON.parse(q.correct_answer));
        } catch (e) {
          try {
            // Fallback to parsing once
            correctAnswerObject = JSON.parse(q.correct_answer);
          } catch (e2) {
            console.error(
              "Could not parse correct_answer in submitExam:",
              q.correct_answer,
              e2
            );
            correctAnswerObject = {}; // Assign empty object on failure
          }
        }
      }

      let optionsArray = [];
      if (q.options) {
        try {
          optionsArray = JSON.parse(JSON.parse(q.options));
        } catch (e) {
          try {
            optionsArray = JSON.parse(q.options);
          } catch (e2) {
            console.error(
              "Could not parse options in submitExam:",
              q.options,
              e2
            );
            optionsArray = [];
          }
        }
      }

      return {
        ...q,
        options: optionsArray,
        correct_answer: correctAnswerObject,
      };
    });

    // Tính điểm
    let score = 0;
    let correct_answers = 0;
    let total_points = 0;
    const submissions = [];

    questions.forEach((question) => {
      total_points += question.points || 1;

      const userAnswer = answers.find((ans) => ans.question_id === question.id);

      let is_correct = false;

      if (userAnswer) {
        // So sánh đáp án (xử lý cho multiple choice)
        if (question.question_type === "multiple_choice") {
          is_correct = userAnswer.answer == question.correct_answer.answer;
        }
        // Có thể mở rộng cho các loại câu hỏi khác ở đây

        if (is_correct) {
          score += question.points || 1;
          correct_answers++;
        }
      }

      submissions.push({
        question_id: question.id,
        user_answer: userAnswer ? userAnswer.answer : null,
        is_correct,
      });
    });

    // Lưu kết quả
    const resultId = await ExamResult.create({
      user_id,
      exam_id,
      score,
      total_points,
      correct_answers,
      total_questions: questions.length,
      time_spent,
    });

    // Lưu chi tiết bài làm
    const submissionData = submissions.map((sub) => ({
      result_id: resultId,
      ...sub,
    }));

    await ExamSubmission.bulkCreate(submissionData);

    res.json({
      message: "Bài thi đã được nộp thành công",
      resultId,
      score,
      correct_answers,
      total_questions: questions.length,
    });
  } catch (err) {
    console.error("Error submitting exam:", err);
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};

// Lấy kết quả bài thi
exports.getExamResult = async (req, res) => {
  const { resultId } = req.params;
  const user_id = req.user.userId;

  try {
    // Lấy thông tin kết quả
    const [resultRows] = await ExamResult.findById(resultId);
    if (resultRows.length === 0) {
      return res.status(404).json({ message: "Kết quả không tồn tại" });
    }

    const result = resultRows[0];

    // Kiểm tra quyền truy cập
    if (result.user_id !== user_id) {
      return res
        .status(403)
        .json({ message: "Không có quyền truy cập kết quả này" });
    }

    // Lấy thông tin đề thi
    const [examRows] = await Exam.findById(result.exam_id);
    const exam = examRows[0];

    // Lấy chi tiết bài làm
    const [submissionRows] = await ExamSubmission.findByResultId(resultId);

    // Lấy thông tin câu hỏi
    const [questionRows] = await Question.findByExamId(result.exam_id);

    const questions = questionRows.map((q) => {
      let correctAnswerObject = {};
      if (q.correct_answer) {
        try {
          // Try parsing twice for double-stringified JSON
          correctAnswerObject = JSON.parse(JSON.parse(q.correct_answer));
        } catch (e) {
          try {
            // Fallback to parsing once
            correctAnswerObject = JSON.parse(q.correct_answer);
          } catch (e2) {
            console.error(
              "Could not parse correct_answer in getExamResult:",
              q.correct_answer,
              e2
            );
            correctAnswerObject = {}; // Assign empty object on failure
          }
        }
      }

      let optionsArray = [];
      if (q.options) {
        try {
          optionsArray = JSON.parse(JSON.parse(q.options));
        } catch (e) {
          try {
            optionsArray = JSON.parse(q.options);
          } catch (e2) {
            console.error(
              "Could not parse options in getExamResult:",
              q.options,
              e2
            );
            optionsArray = [];
          }
        }
      }

      return {
        ...q,
        options: optionsArray,
        correct_answer: correctAnswerObject,
      };
    });

    // Kết hợp thông tin câu hỏi với bài làm
    const detailedResults = questions.map((question) => {
      const submission = submissionRows.find(
        (sub) => sub.question_id === question.id
      );

      return {
        ...question,
        user_answer: submission ? submission.user_answer : null,
        is_correct: submission ? submission.is_correct : false,
      };
    });

    res.json({
      result: {
        ...result,
        exam_title: exam.title,
        exam_type: exam.exam_type,
      },
      detailedResults,
    });
  } catch (err) {
    console.error("Error fetching exam result:", err);
    res.status(500).json({ message: "Lỗi server", error: err });
  }
};


exports.analyzeExamResult = async (req, res) => {
  const { detailedResults } = req.body;

  if (!detailedResults || !Array.isArray(detailedResults)) {
    return res.status(400).json({ message: "Dữ liệu bài làm không hợp lệ" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const incorrectAnswers = detailedResults.filter(q => !q.is_correct);

    if (incorrectAnswers.length === 0) {
      return res.json({ analysis: "Chúc mừng! Bạn đã trả lời đúng tất cả các câu hỏi. Không có gì cần phân tích thêm." });
    }

    const prompt = `
      Bạn là một giáo viên tiếng Anh chuyên nghiệp. Hãy phân tích kết quả bài làm của một học sinh và đưa ra nhận xét chi tiết bằng tiếng Việt.
      Dưới đây là danh sách các câu hỏi học sinh đã trả lời sai:

      ${incorrectAnswers.map((q, index) => {
        const userAnswerText = q.options[q.user_answer] || q.user_answer; // Fallback to user_answer if it's not an index
        const correctAnswerText = q.options[q.correct_answer.answer] || JSON.stringify(q.correct_answer);
        return `
        Câu ${index + 1}:
        - Đề bài: ${q.question_text}
        - Các lựa chọn: ${JSON.stringify(q.options)}
        - Câu trả lời của học sinh: "${userAnswerText}"
        - Đáp án đúng: "${correctAnswerText}"
      `}).join(`\n`)}

      Yêu cầu:
      1. Với mỗi câu trả lời sai, hãy giải thích rõ ràng tại sao đáp án của học sinh lại sai và tại sao đáp án đúng lại đúng. Tập trung vào các quy tắc ngữ pháp, cách dùng từ vựng, hoặc ngữ cảnh của câu.
      2. Sau khi phân tích từng câu, hãy đưa ra một bản tóm tắt tổng quan về năng lực của học sinh dựa trên các lỗi sai này.
      3. Cuối cùng, đề xuất 1-2 chủ đề ngữ pháp hoặc loại từ vựng cụ thể mà học sinh nên tập trung ôn luyện để cải thiện.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = await response.text();

    res.json({ analysis });

  } catch (error) {
    console.error("Error analyzing exam result with AI:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi phân tích kết quả với AI", error: error.message });
  }
};


