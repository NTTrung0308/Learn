const pool = require("../config/database");

const GrammarTopic = {
  // Tạo chủ đề mới
  create: async (topicData) => {
    const sql = `
      INSERT INTO grammar_topics (title, description, level, display_order, created_by) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
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
    const [rows] = await pool.execute(sql);
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
    const [rows] = await pool.execute(sql, [id]);
    return rows;
  },

  // Cập nhật chủ đề
  update: async (id, topicData) => {
    const sql = `
      UPDATE grammar_topics 
      SET title = ?, description = ?, level = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [
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
    const [result] = await pool.execute(sql, [id]);
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
    const [result] = await pool.execute(sql, [
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
    const [rows] = await pool.execute(sql, [topicId]);
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
    const [rows] = await pool.execute(sql, params);
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
    const [rows] = await pool.execute(sql, [id]);
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
    const [result] = await pool.execute(sql, [
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
    const [result] = await pool.execute(sql, [id]);
    return result;
  },

  // Import từ CSV
  bulkCreate: async (lessons) => {
    const sql = `
      INSERT INTO grammar_lessons 
      (topic_id, title, explanation, structure, \`usage\`, example_sentence, meaning, tags, difficulty_level, display_order, created_by) 
      VALUES ?
    `;

    const values = lessons.map((lesson) => [
      lesson.topic_id,
      lesson.title,
      lesson.explanation,
      lesson.structure || null,
      lesson.usage || null, // This is the 'usage' field
      lesson.example_sentence || null,
      lesson.meaning || null,
      JSON.stringify(lesson.tags || []),
      lesson.difficulty_level || "medium",
      lesson.display_order || 0,
      lesson.created_by,
    ]);

    const [result] = await pool.execute(sql, [values]);
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
    const [result] = await pool.execute(sql, [
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
    const [rows] = await pool.execute(sql, [lessonId]);
    return rows;
  },

  // Xóa bài tập
  delete: async (id) => {
    const sql = "DELETE FROM grammar_exercises WHERE id = ?";
    const [result] = await pool.execute(sql, [id]);
    return result;
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
    const [rows] = await pool.execute(sql);
    return rows;
  },
};

const GrammarExample = {
  // Tạo ví dụ mới
  create: async (exampleData) => {
    const sql = `
      INSERT INTO grammar_examples 
      (lesson_id, example_sentence, meaning, pronunciation_audio, example_image, notes, display_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      exampleData.lesson_id,
      exampleData.example_sentence,
      exampleData.meaning || null,
      exampleData.pronunciation_audio || null,
      exampleData.example_image || null,
      exampleData.notes || null,
      exampleData.display_order || 0,
    ]);
    return result;
  },

  // Lấy ví dụ theo bài học
  findByLessonId: async (lessonId) => {
    const sql = `
      SELECT * FROM grammar_examples 
      WHERE lesson_id = ? 
      ORDER BY display_order ASC, created_at ASC
    `;
    const [rows] = await pool.execute(sql, [lessonId]);
    return rows;
  },

  // Tìm ví dụ theo ID
  findById: async (id) => {
    const sql = `
      SELECT * FROM grammar_examples 
      WHERE id = ?
    `;
    const [rows] = await pool.execute(sql, [id]);
    return rows;
  },

  // Cập nhật ví dụ
  update: async (id, exampleData) => {
    const sql = `
      UPDATE grammar_examples 
      SET example_sentence = ?, meaning = ?, pronunciation_audio = ?, 
          example_image = ?, notes = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [
      exampleData.example_sentence,
      exampleData.meaning,
      exampleData.pronunciation_audio,
      exampleData.example_image,
      exampleData.notes,
      exampleData.display_order,
      id,
    ]);
    return result;
  },

  // Xóa ví dụ
  delete: async (id) => {
    const sql = "DELETE FROM grammar_examples WHERE id = ?";
    const [result] = await pool.execute(sql, [id]);
    return result;
  },
};

const GrammarPractice = {
  // Tạo bài thực hành mới
  create: async (practiceData) => {
    const sql = `
      INSERT INTO grammar_practices 
      (lesson_id, title, instructions, content, practice_type, difficulty_level, time_limit, points, display_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      practiceData.lesson_id,
      practiceData.title,
      practiceData.instructions,
      JSON.stringify(practiceData.content || {}),
      practiceData.practice_type,
      practiceData.difficulty_level || "medium",
      practiceData.time_limit || null,
      practiceData.points || 10,
      practiceData.display_order || 0,
    ]);
    return result;
  },

  // Lấy bài thực hành theo bài học
  findByLessonId: async (lessonId) => {
    const sql = `
      SELECT * FROM grammar_practices 
      WHERE lesson_id = ? AND is_active = TRUE
      ORDER BY display_order ASC, created_at ASC
    `;
    const [rows] = await pool.execute(sql, [lessonId]);
    return rows;
  },

  // Tìm bài thực hành theo ID
  findById: async (id) => {
    const sql = "SELECT * FROM grammar_practices WHERE id = ?";
    const [rows] = await pool.execute(sql, [id]);
    return rows;
  },

  // Cập nhật bài thực hành
  update: async (id, practiceData) => {
    const sql = `
      UPDATE grammar_practices 
      SET title = ?, instructions = ?, content = ?, practice_type = ?, 
          difficulty_level = ?, time_limit = ?, points = ?, display_order = ?, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    const [result] = await pool.execute(sql, [
      practiceData.title,
      practiceData.instructions,
      JSON.stringify(practiceData.content || {}),
      practiceData.practice_type,
      practiceData.difficulty_level,
      practiceData.time_limit,
      practiceData.points,
      practiceData.display_order,
      id,
    ]);
    return result;
  },

  // Xóa bài thực hành (soft delete)
  delete: async (id) => {
    const sql = "UPDATE grammar_practices SET is_active = FALSE WHERE id = ?";
    const [result] = await pool.execute(sql, [id]);
    return result;
  },
};

const UserGrammarPractice = {
  // Lưu kết quả thực hành
  saveResult: async (resultData) => {
    const sql = `
      INSERT INTO user_grammar_practice 
      (user_id, practice_id, answers, score, time_spent, completed_at) 
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    const [result] = await pool.execute(sql, [
      resultData.user_id,
      resultData.practice_id,
      JSON.stringify(resultData.answers || {}),
      resultData.score || 0,
      resultData.time_spent || 0,
    ]);
    return result;
  },

  // Lấy lịch sử thực hành của người dùng
  findByUser: async (userId, lessonId = null) => {
    let sql = `
      SELECT ugp.*, gp.title, gp.lesson_id, gl.title as lesson_title
      FROM user_grammar_practice ugp
      LEFT JOIN grammar_practices gp ON ugp.practice_id = gp.id
      LEFT JOIN grammar_lessons gl ON gp.lesson_id = gl.id
      WHERE ugp.user_id = ?
    `;

    const params = [userId];

    if (lessonId) {
      sql += " AND gp.lesson_id = ?";
      params.push(lessonId);
    }

    sql += " ORDER BY ugp.completed_at DESC";

    const [rows] = await pool.execute(sql, params);
    return rows;
  },
};

// Thêm vào module.exports
module.exports = {
  GrammarTopic,
  GrammarLesson,
  GrammarExercise,
  GrammarCSV,
  GrammarExample,
  GrammarPractice,
  UserGrammarPractice,
};
