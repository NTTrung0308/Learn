const pool = require("../config/database");

const GrammarTopic = {
  // Tạo chủ đề mới
  create: async (topicData) => {
    const sql = `
      INSERT INTO grammar_topics (title, description, level, display_order, created_by) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      topicData.title,
      topicData.description,
      topicData.level,
      topicData.display_order || 0,
      topicData.created_by,
    ]);
    return result;
  },

  // Lấy tất cả chủ đề
  findAll: async () => {
    const sql = `
      SELECT gt.*, u.display_name as creator_name 
      FROM grammar_topics gt 
      LEFT JOIN users u ON gt.created_by = u.id 
      ORDER BY gt.display_order ASC, gt.created_at DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // Tìm chủ đề theo ID
  findById: async (id) => {
    const sql = `
      SELECT gt.*, u.display_name as creator_name 
      FROM grammar_topics gt 
      LEFT JOIN users u ON gt.created_by = u.id 
      WHERE gt.id = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows;
  },

  // Cập nhật chủ đề
  update: async (id, topicData) => {
    const sql = `
      UPDATE grammar_topics 
      SET title = ?, description = ?, level = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [
      topicData.title,
      topicData.description,
      topicData.level,
      topicData.display_order,
      id,
    ]);
    return result;
  },

  // Xóa chủ đề
  delete: async (id) => {
    const sql = "DELETE FROM grammar_topics WHERE id = ?";
    const [result] = await pool.query(sql, [id]);
    return result;
  },
};

const GrammarLesson = {
  // Tạo bài học mới
  create: async (lessonData) => {
    const sql = `
      INSERT INTO grammar_lessons 
      (topic_id, title, explanation, structure, \`usage\`, pronunciation_audio, 
       example_sentence, example_image, meaning, tags, difficulty_level, display_order, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      lessonData.topic_id,
      lessonData.title,
      lessonData.explanation,
      lessonData.structure || null,
      lessonData.usage || null, // This is the 'usage' field
      lessonData.pronunciation_audio || null,
      lessonData.example_sentence || null,
      lessonData.example_image || null,
      lessonData.meaning || null,
      JSON.stringify(lessonData.tags || []),
      lessonData.difficulty_level || "medium",
      lessonData.display_order || 0,
      lessonData.created_by,
    ]);
    return result;
  },

  // Lấy tất cả bài học theo chủ đề
  findByTopicId: async (topicId) => {
    const sql = `
      SELECT gl.*, u.display_name as creator_name 
      FROM grammar_lessons gl 
      LEFT JOIN users u ON gl.created_by = u.id 
      WHERE gl.topic_id = ? AND gl.is_active = TRUE 
      ORDER BY gl.display_order ASC, gl.created_at DESC
    `;
    const [rows] = await pool.query(sql, [topicId]);
    return rows;
  },

  // Lấy tất cả bài học
  findAll: async (filters = {}) => {
    let sql = `
      SELECT gl.*, gt.title as topic_title, u.display_name as creator_name 
      FROM grammar_lessons gl 
      LEFT JOIN grammar_topics gt ON gl.topic_id = gt.id 
      LEFT JOIN users u ON gl.created_by = u.id 
      WHERE gl.is_active = TRUE
    `;
    const params = [];

    if (filters.level) {
      sql += ` AND gt.level = ?`;
      params.push(filters.level);
    }

    if (filters.difficulty) {
      sql += ` AND gl.difficulty_level = ?`;
      params.push(filters.difficulty);
    }

    if (filters.topic_id) {
      sql += ` AND gl.topic_id = ?`;
      params.push(filters.topic_id);
    }

    sql += ` ORDER BY gl.display_order ASC, gl.created_at DESC`;
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // Tìm bài học theo ID
  findById: async (id) => {
    const sql = `
      SELECT gl.*, gt.title as topic_title, u.display_name as creator_name 
      FROM grammar_lessons gl 
      LEFT JOIN grammar_topics gt ON gl.topic_id = gt.id 
      LEFT JOIN users u ON gl.created_by = u.id 
      WHERE gl.id = ?
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows;
  },

  // Cập nhật bài học - Also fix the UPDATE query
  update: async (id, lessonData) => {
    const sql = `
      UPDATE grammar_lessons 
      SET topic_id = ?, title = ?, explanation = ?, structure = ?, \`usage\` = ?, 
          pronunciation_audio = ?, example_sentence = ?, example_image = ?, 
          meaning = ?, tags = ?, difficulty_level = ?, display_order = ?, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    const [result] = await pool.query(sql, [
      lessonData.topic_id,
      lessonData.title,
      lessonData.explanation,
      lessonData.structure || null,
      lessonData.usage || null, // This is the 'usage' field
      lessonData.pronunciation_audio || null,
      lessonData.example_sentence || null,
      lessonData.example_image || null,
      lessonData.meaning || null,
      JSON.stringify(lessonData.tags || []),
      lessonData.difficulty_level,
      lessonData.display_order,
      id,
    ]);
    return result;
  },

  // Xóa bài học (soft delete)
  delete: async (id) => {
    const sql = "UPDATE grammar_lessons SET is_active = FALSE WHERE id = ?";
    const [result] = await pool.query(sql, [id]);
    return result;
  },

  // Import từ CSV
   bulkCreate: async (lessons) => {
    const sql = `
      INSERT INTO grammar_lessons 
      (topic_id, title, explanation, structure, \`usage\`, example_sentence, meaning, tags, difficulty_level, display_order, created_by) 
      VALUES ?
    `;
    
    const values = lessons.map(lesson => [
      lesson.topic_id,
      lesson.title,
      lesson.explanation,
      lesson.structure || null,
      lesson.usage || null, // This is the 'usage' field
      lesson.example_sentence || null,
      lesson.meaning || null,
      JSON.stringify(lesson.tags || []),
      lesson.difficulty_level || 'medium',
      lesson.display_order || 0,
      lesson.created_by,
    ]);

    const [result] = await pool.query(sql, [values]);
    return result;
  },
};

const GrammarExercise = {
  // Tạo bài tập mới
  create: async (exerciseData) => {
    const sql = `
      INSERT INTO grammar_exercises 
      (lesson_id, question_type, question_text, options, correct_answer, explanation, points, display_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      exerciseData.lesson_id,
      exerciseData.question_type,
      exerciseData.question_text,
      JSON.stringify(exerciseData.options || []),
      JSON.stringify(exerciseData.correct_answer || {}),
      exerciseData.explanation || null,
      exerciseData.points || 1,
      exerciseData.display_order || 0,
    ]);
    return result;
  },

  // Lấy bài tập theo bài học
  findByLessonId: async (lessonId) => {
    const sql = `
      SELECT * FROM grammar_exercises 
      WHERE lesson_id = ? 
      ORDER BY display_order ASC, created_at ASC
    `;
    const [rows] = await pool.query(sql, [lessonId]);
    return rows;
  },
};

// Utility functions cho CSV
const GrammarCSV = {
  exportLessons: async () => {
    const sql = `
      SELECT 
        gl.title,
        gl.explanation,
        gl.structure,
        gl.usage,
        gl.example_sentence,
        gl.meaning,
        gl.difficulty_level,
        gl.display_order,
        gt.title as topic_title,
        gt.level as topic_level
      FROM grammar_lessons gl
      LEFT JOIN grammar_topics gt ON gl.topic_id = gt.id
      WHERE gl.is_active = TRUE
      ORDER BY gt.level, gt.title, gl.display_order
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },
};

module.exports = {
  GrammarTopic,
  GrammarLesson,
  GrammarExercise,
  GrammarCSV,
};
