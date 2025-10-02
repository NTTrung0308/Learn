const db = require("../config/database");

// Bảng đề thi
const Exam = {
  // Tạo đề thi mới
  create: async (examData) => {
    const sql = `
      INSERT INTO exams (title, description, exam_type, duration, created_by) 
      VALUES (?, ?, ?, ?, ?)
    `;
    return await db.execute(sql, [
      examData.title,
      examData.description,
      examData.exam_type,
      examData.duration,
      examData.created_by,
    ]);
  },

  // Lấy tất cả đề thi với phân trang
  findAll: async ({ limit, offset }) => {
    const sql = `
      SELECT e.*, u.display_name as creator_name 
      FROM exams e 
      LEFT JOIN users u ON e.created_by = u.id 
      ORDER BY e.created_at DESC
      LIMIT ? OFFSET ?
    `;
    return await db.execute(sql, [limit, offset]);
  },

  // Tìm đề thi theo ID
  findById: async (id) => {
    const sql = `
      SELECT e.*, u.display_name as creator_name 
      FROM exams e 
      LEFT JOIN users u ON e.created_by = u.id 
      WHERE e.id = ?
    `;
    return await db.execute(sql, [id]);
  },

  // Cập nhật đề thi
  update: async (id, examData) => {
    const sql = `
      UPDATE exams 
      SET title = ?, description = ?, exam_type = ?, duration = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    return await db.execute(sql, [
      examData.title,
      examData.description,
      examData.exam_type,
      examData.duration,
      id,
    ]);
  },

  // Xóa đề thi
  delete: async (id) => {
    const sql = "DELETE FROM exams WHERE id = ?";
    return await db.execute(sql, [id]);
  },

  // Cập nhật tổng số câu hỏi
  updateTotalQuestions: async (examId) => {
    const sql = `
      UPDATE exams e
      SET e.total_questions = (
        SELECT COUNT(*) FROM questions WHERE exam_id = ?
      )
      WHERE e.id = ?
    `;
    return await db.execute(sql, [examId, examId]);
  },

  // Đếm tổng số đề thi
  countAll: async () => {
    const sql = "SELECT COUNT(*) as count FROM exams";
    const [rows] = await db.execute(sql);
    return rows[0].count;
  },
};

// Bảng câu hỏi
const Question = {
  // Tạo câu hỏi mới
  create: async (questionData) => {
    const sql = `
      INSERT INTO questions (exam_id, question_type, question_text, question_order, audio_url, image_url, options, correct_answer, points) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return await db.execute(sql, [
      questionData.exam_id,
      questionData.question_type,
      questionData.question_text,
      questionData.question_order,
      questionData.audio_url || null,
      questionData.image_url || null,
      JSON.stringify(questionData.options || []),
      JSON.stringify(questionData.correct_answer || {}),
      questionData.points || 1,
    ]);
  },

  // Lấy tất cả câu hỏi của một đề thi
  findByExamId: async (examId) => {
    const sql =
      "SELECT * FROM questions WHERE exam_id = ? ORDER BY question_order ASC";
    return await db.execute(sql, [examId]);
  },

  // Tìm câu hỏi theo ID
  findById: async (id) => {
    const sql = "SELECT * FROM questions WHERE id = ?";
    return await db.execute(sql, [id]);
  },

  // Cập nhật câu hỏi
  update: async (id, questionData) => {
    const sql = `
      UPDATE questions 
      SET question_type = ?, question_text = ?, question_order = ?, audio_url = ?, image_url = ?, options = ?, correct_answer = ?, points = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    return await db.execute(sql, [
      questionData.question_type,
      questionData.question_text,
      questionData.question_order,
      questionData.audio_url || null,
      questionData.image_url || null,
      JSON.stringify(questionData.options || []),
      JSON.stringify(questionData.correct_answer || {}),
      questionData.points || 1,
      id,
    ]);
  },

  // Xóa câu hỏi
  delete: async (id) => {
    const sql = "DELETE FROM questions WHERE id = ?";
    return await db.execute(sql, [id]);
  },

  // Cập nhật thứ tự câu hỏi
  updateOrder: async (examId) => {
    const sql = `
      UPDATE questions q1
      JOIN (
        SELECT id, ROW_NUMBER() OVER (ORDER BY question_order, id) as new_order
        FROM questions 
        WHERE exam_id = ?
      ) q2 ON q1.id = q2.id
      SET q1.question_order = q2.new_order
      WHERE q1.exam_id = ?
    `;
    return await db.execute(sql, [examId, examId]);
  },
};

module.exports = { Exam, Question };
