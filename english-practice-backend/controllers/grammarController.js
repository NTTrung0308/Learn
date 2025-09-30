const {
  GrammarTopic,
  GrammarLesson,
  GrammarExercise,
  GrammarCSV,
} = require("../models/grammarModel");
const csv = require("csv-parser");
const fs = require("fs");
const { Parser } = require("json2csv");

// Chủ đề ngữ pháp
exports.createTopic = async (req, res) => {
  const { title, description, level, display_order } = req.body;
  const created_by = req.user.userId;

  try {
    const results = await GrammarTopic.create({
      title,
      description,
      level,
      display_order,
      created_by,
    });
    res.status(201).json({
      message: "Chủ đề ngữ pháp đã được tạo",
      topicId: results.insertId,
    });
  } catch (err) {
    console.error("Error creating grammar topic:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getAllTopics = async (req, res) => {
  try {
    const results = await GrammarTopic.findAll();
    res.json(results);
  } catch (err) {
    console.error("Error fetching grammar topics:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.updateTopic = async (req, res) => {
  const { id } = req.params;
  const { title, description, level, display_order } = req.body;

  try {
    const results = await GrammarTopic.update(id, {
      title,
      description,
      level,
      display_order,
    });

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Chủ đề không tồn tại" });
    }

    res.json({ message: "Chủ đề đã được cập nhật" });
  } catch (err) {
    console.error("Error updating grammar topic:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteTopic = async (req, res) => {
  const { id } = req.params;

  try {
    const results = await GrammarTopic.delete(id);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Chủ đề không tồn tại" });
    }

    res.json({ message: "Chủ đề đã được xóa" });
  } catch (err) {
    console.error("Error deleting grammar topic:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Bài học ngữ pháp
exports.createLesson = async (req, res) => {
  const {
    topic_id,
    title,
    explanation,
    structure,
    usage,
    example_sentence,
    meaning,
    tags,
    difficulty_level,
    display_order,
  } = req.body;

  const created_by = req.user.userId;

  // Xử lý file upload
  const pronunciation_audio =
    req.files && req.files.audio
      ? `/uploads/grammar/audio/${req.files.audio[0].filename}`
      : null;

  const example_image =
    req.files && req.files.image
      ? `/uploads/grammar/images/${req.files.image[0].filename}`
      : null;

  try {
    // Parse tags nếu là string
    let parsedTags = tags;
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(",").map((tag) => tag.trim());
      }
    }

    const results = await GrammarLesson.create({
      topic_id,
      title,
      explanation,
      structure,
      usage,
      pronunciation_audio,
      example_sentence,
      example_image,
      meaning,
      tags: parsedTags,
      difficulty_level,
      display_order,
      created_by,
    });

    res.status(201).json({
      message: "Bài học ngữ pháp đã được tạo",
      lessonId: results.insertId,
    });
  } catch (err) {
    console.error("Error creating grammar lesson:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getLessons = async (req, res) => {
  const { topic_id, level, difficulty } = req.query;

  try {
    const filters = {};
    if (topic_id) filters.topic_id = topic_id;
    if (level) filters.level = level;
    if (difficulty) filters.difficulty = difficulty;

    const results = await GrammarLesson.findAll(filters);
    res.json(results);
  } catch (err) {
    console.error("Error fetching grammar lessons:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getLessonDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const lessonResults = await GrammarLesson.findById(id);
    if (lessonResults.length === 0) {
      return res.status(404).json({ message: "Bài học không tồn tại" });
    }

    const exerciseResults = await GrammarExercise.findByLessonId(id);

    // Parse JSON fields
    const lesson = {
      ...lessonResults[0],
      tags: lessonResults[0].tags ? JSON.parse(lessonResults[0].tags) : [],
      exercises: exerciseResults.map((ex) => ({
        ...ex,
        options: ex.options ? JSON.parse(ex.options) : [],
        correct_answer: ex.correct_answer ? JSON.parse(ex.correct_answer) : {},
      })),
    };

    res.json(lesson);
  } catch (err) {
    console.error("Error fetching grammar lesson details:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.updateLesson = async (req, res) => {
  const { id } = req.params;
  const {
    topic_id,
    title,
    explanation,
    structure,
    usage,
    example_sentence,
    meaning,
    tags,
    difficulty_level,
    display_order,
  } = req.body;

  try {
    const currentLesson = await GrammarLesson.findById(id);
    if (currentLesson.length === 0) {
      return res.status(404).json({ message: "Bài học không tồn tại" });
    }

    // Xử lý file upload
    const pronunciation_audio =
      req.files && req.files.audio
        ? `/uploads/grammar/audio/${req.files.audio[0].filename}`
        : currentLesson[0].pronunciation_audio;

    const example_image =
      req.files && req.files.image
        ? `/uploads/grammar/images/${req.files.image[0].filename}`
        : currentLesson[0].example_image;

    // Parse tags
    let parsedTags = tags;
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(",").map((tag) => tag.trim());
      }
    }

    await GrammarLesson.update(id, {
      topic_id,
      title,
      explanation,
      structure,
      usage,
      pronunciation_audio,
      example_sentence,
      example_image,
      meaning,
      tags: parsedTags,
      difficulty_level,
      display_order,
    });

    res.json({ message: "Bài học đã được cập nhật" });
  } catch (err) {
    console.error("Error updating grammar lesson:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteLesson = async (req, res) => {
  const { id } = req.params;

  try {
    const results = await GrammarLesson.delete(id);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Bài học không tồn tại" });
    }

    res.json({ message: "Bài học đã được xóa" });
  } catch (err) {
    console.error("Error deleting grammar lesson:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Bài tập ngữ pháp
exports.addExercise = async (req, res) => {
  const {
    lesson_id,
    question_type,
    question_text,
    options,
    correct_answer,
    explanation,
    points,
    display_order,
  } = req.body;

  try {
    const results = await GrammarExercise.create({
      lesson_id,
      question_type,
      question_text,
      options,
      correct_answer,
      explanation,
      points,
      display_order,
    });

    res.status(201).json({
      message: "Bài tập đã được thêm",
      exerciseId: results.insertId,
    });
  } catch (err) {
    console.error("Error adding grammar exercise:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Import/Export CSV
exports.exportLessonsCSV = async (req, res) => {
  try {
    const lessons = await GrammarCSV.exportLessons();

    const fields = [
      "title",
      "explanation",
      "structure",
      "usage",
      "example_sentence",
      "meaning",
      "difficulty_level",
      "display_order",
      "topic_title",
      "topic_level",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(lessons);

    res.header("Content-Type", "text/csv");
    res.attachment("grammar-lessons.csv");
    res.send(csv);
  } catch (err) {
    console.error("Error exporting CSV:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.importLessonsCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Vui lòng chọn file CSV" });
  }

  const lessons = [];
  const created_by = req.user.userId;

  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => {
        // Map CSV data to lesson structure
        const lesson = {
          topic_id: data.topic_id, // Cần có topic_id trong CSV
          title: data.title,
          explanation: data.explanation,
          structure: data.structure || null,
          usage: data.usage || null,
          example_sentence: data.example_sentence || null,
          meaning: data.meaning || null,
          tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
          difficulty_level: data.difficulty_level || "medium",
          display_order: parseInt(data.display_order) || 0,
          created_by,
        };
        lessons.push(lesson);
      })
      .on("end", async () => {
        try {
          await GrammarLesson.bulkCreate(lessons);
          fs.unlinkSync(req.file.path); // Xóa file tạm
          res.json({
            message: `Đã import thành công ${lessons.length} bài học`,
            count: lessons.length,
          });
        } catch (err) {
          console.error("Error bulk creating lessons:", err);
          res.status(500).json({ message: "Lỗi server", error: err.message });
        }
      });
  } catch (err) {
    console.error("Error importing CSV:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Oxford Dictionary API integration (Optional)
exports.getWordDefinition = async (req, res) => {
  const { word } = req.params;
  const appId = process.env.OXFORD_APP_ID;
  const appKey = process.env.OXFORD_APP_KEY;

  if (!appId || !appKey) {
    return res.status(400).json({
      message: "Oxford Dictionary API chưa được cấu hình",
    });
  }

  try {
    const response = await fetch(
      `https://od-api.oxforddictionaries.com/api/v2/entries/en-us/${word}`,
      {
        headers: {
          app_id: appId,
          app_key: appKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Không tìm thấy từ trong từ điển");
    }

    const data = await response.json();

    // Extract relevant information
    const definition = {
      word: data.word,
      phonetic:
        data.results[0]?.lexicalEntries[0]?.pronunciations?.[0]
          ?.phoneticSpelling,
      definitions:
        data.results[0]?.lexicalEntries[0]?.entries?.[0]?.senses?.map(
          (sense) => ({
            definition: sense.definitions?.[0],
            examples: sense.examples?.map((ex) => ex.text) || [],
          })
        ) || [],
    };

    res.json(definition);
  } catch (err) {
    console.error("Error fetching word definition:", err);
    res.status(500).json({
      message: "Lỗi khi lấy định nghĩa từ",
      error: err.message,
    });
  }
};
