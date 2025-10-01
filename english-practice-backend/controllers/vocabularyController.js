const {
  VocabularyCollection,
  VocabularyFlashcard,
  UserVocabularyLearning,
  VocabularyCSV,
} = require("../models/vocabularyModel");
const csv = require("csv-parser");
const fs = require("fs");
const { Parser } = require("json2csv");

// Bộ từ vựng
exports.createCollection = async (req, res) => {
  const { title, description, level, category, tags, is_public, display_order } = req.body;
  const created_by = req.user.userId;

  try {
    let parsedTags = tags;
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(",").map((tag) => tag.trim());
      }
    }

    const results = await VocabularyCollection.create({
      title,
      description,
      level,
      category,
      tags: parsedTags,
      is_public: is_public !== undefined ? is_public : true,
      display_order: display_order || 0,
      created_by,
    });

    res.status(201).json({
      message: "Bộ từ vựng đã được tạo",
      collectionId: results.insertId,
    });
  } catch (err) {
    console.error("Error creating vocabulary collection:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getAllCollections = async (req, res) => {
  const { level, category, created_by, is_public } = req.query;

  try {
    const filters = {};
    if (level) filters.level = level;
    if (category) filters.category = category;
    if (created_by) filters.created_by = created_by;
    if (is_public !== undefined) filters.is_public = is_public === 'true';

    const results = await VocabularyCollection.findAll(filters);
    res.json(results);
  } catch (err) {
    console.error("Error fetching vocabulary collections:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getCollectionDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const collectionResults = await VocabularyCollection.findById(id);
    if (collectionResults.length === 0) {
      return res.status(404).json({ message: "Bộ từ vựng không tồn tại" });
    }

    const flashcardsResults = await VocabularyFlashcard.findByCollectionId(id);

    const collection = {
      ...collectionResults[0],
      tags: collectionResults[0].tags ? JSON.parse(collectionResults[0].tags) : [],
      flashcards: flashcardsResults.map(card => ({
        ...card,
        synonyms: card.synonyms ? JSON.parse(card.synonyms) : [],
        antonyms: card.antonyms ? JSON.parse(card.antonyms) : [],
        tags: card.tags ? JSON.parse(card.tags) : [],
      })),
    };

    res.json(collection);
  } catch (err) {
    console.error("Error fetching vocabulary collection details:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.updateCollection = async (req, res) => {
  const { id } = req.params;
  const { title, description, level, category, tags, is_public, display_order } = req.body;

  try {
    let parsedTags = tags;
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(",").map((tag) => tag.trim());
      }
    }

    const results = await VocabularyCollection.update(id, {
      title,
      description,
      level,
      category,
      tags: parsedTags,
      is_public,
      display_order,
    });

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Bộ từ vựng không tồn tại" });
    }

    res.json({ message: "Bộ từ vựng đã được cập nhật" });
  } catch (err) {
    console.error("Error updating vocabulary collection:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteCollection = async (req, res) => {
  const { id } = req.params;

  try {
    const results = await VocabularyCollection.delete(id);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Bộ từ vựng không tồn tại" });
    }

    res.json({ message: "Bộ từ vựng đã được xóa" });
  } catch (err) {
    console.error("Error deleting vocabulary collection:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Flashcards
exports.addFlashcard = async (req, res) => {
  const {
    collection_id,
    word,
    meaning,
    pronunciation,
    example_sentence,
    example_meaning,
    part_of_speech,
    synonyms,
    antonyms,
    tags,
    difficulty_level,
    display_order,
  } = req.body;

  try {
    // Xử lý file upload
    const pronunciation_audio =
      req.files && req.files.audio
        ? `/uploads/audio/${req.files.audio[0].filename}`
        : null;

    const example_image =
      req.files && req.files.image
        ? `/uploads/images/${req.files.image[0].filename}`
        : null;

    // Parse các trường JSON
    let parsedSynonyms = synonyms;
    let parsedAntonyms = antonyms;
    let parsedTags = tags;

    if (typeof synonyms === "string") {
      try {
        parsedSynonyms = JSON.parse(synonyms);
      } catch {
        parsedSynonyms = synonyms.split(",").map((item) => item.trim());
      }
    }

    if (typeof antonyms === "string") {
      try {
        parsedAntonyms = JSON.parse(antonyms);
      } catch {
        parsedAntonyms = antonyms.split(",").map((item) => item.trim());
      }
    }

    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(",").map((item) => item.trim());
      }
    }

    const results = await VocabularyFlashcard.create({
      collection_id,
      word,
      meaning,
      pronunciation,
      pronunciation_audio,
      example_sentence,
      example_meaning,
      example_image,
      part_of_speech,
      synonyms: parsedSynonyms,
      antonyms: parsedAntonyms,
      tags: parsedTags,
      difficulty_level,
      display_order,
    });

    res.status(201).json({
      message: "Flashcard đã được thêm",
      flashcardId: results.insertId,
    });
  } catch (err) {
    console.error("Error adding vocabulary flashcard:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getFlashcards = async (req, res) => {
  const { collection_id } = req.query;

  try {
    if (!collection_id) {
      return res.status(400).json({ message: "Thiếu collection_id" });
    }

    const results = await VocabularyFlashcard.findByCollectionId(collection_id);
    
    const flashcards = results.map(card => ({
      ...card,
      synonyms: card.synonyms ? JSON.parse(card.synonyms) : [],
      antonyms: card.antonyms ? JSON.parse(card.antonyms) : [],
      tags: card.tags ? JSON.parse(card.tags) : [],
    }));

    res.json(flashcards);
  } catch (err) {
    console.error("Error fetching vocabulary flashcards:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.updateFlashcard = async (req, res) => {
  const { id } = req.params;
  const {
    word,
    meaning,
    pronunciation,
    example_sentence,
    example_meaning,
    part_of_speech,
    synonyms,
    antonyms,
    tags,
    difficulty_level,
    display_order,
  } = req.body;

  try {
    const currentFlashcard = await VocabularyFlashcard.findById(id);
    if (currentFlashcard.length === 0) {
      return res.status(404).json({ message: "Flashcard không tồn tại" });
    }

    // Xử lý file upload
    const pronunciation_audio =
      req.files && req.files.audio
        ? `/uploads/audio/${req.files.audio[0].filename}`
        : currentFlashcard[0].pronunciation_audio;

    const example_image =
      req.files && req.files.image
        ? `/uploads/images/${req.files.image[0].filename}`
        : currentFlashcard[0].example_image;

    // Parse các trường JSON
    let parsedSynonyms = synonyms;
    let parsedAntonyms = antonyms;
    let parsedTags = tags;

    if (typeof synonyms === "string") {
      try {
        parsedSynonyms = JSON.parse(synonyms);
      } catch {
        parsedSynonyms = synonyms.split(",").map((item) => item.trim());
      }
    }

    if (typeof antonyms === "string") {
      try {
        parsedAntonyms = JSON.parse(antonyms);
      } catch {
        parsedAntonyms = antonyms.split(",").map((item) => item.trim());
      }
    }

    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = tags.split(",").map((item) => item.trim());
      }
    }

    const results = await VocabularyFlashcard.update(id, {
      word,
      meaning,
      pronunciation,
      pronunciation_audio,
      example_sentence,
      example_meaning,
      example_image,
      part_of_speech,
      synonyms: parsedSynonyms,
      antonyms: parsedAntonyms,
      tags: parsedTags,
      difficulty_level,
      display_order,
    });

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Flashcard không tồn tại" });
    }

    res.json({ message: "Flashcard đã được cập nhật" });
  } catch (err) {
    console.error("Error updating vocabulary flashcard:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteFlashcard = async (req, res) => {
  const { id } = req.params;

  try {
    const results = await VocabularyFlashcard.delete(id);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Flashcard không tồn tại" });
    }

    res.json({ message: "Flashcard đã được xóa" });
  } catch (err) {
    console.error("Error deleting vocabulary flashcard:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Tìm kiếm từ vựng
exports.searchVocabulary = async (req, res) => {
  const { q, collection_id } = req.query;

  try {
    if (!q) {
      return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });
    }

    const results = await VocabularyFlashcard.search(q, collection_id);
    
    const flashcards = results.map(card => ({
      ...card,
      synonyms: card.synonyms ? JSON.parse(card.synonyms) : [],
      antonyms: card.antonyms ? JSON.parse(card.antonyms) : [],
      tags: card.tags ? JSON.parse(card.tags) : [],
    }));

    res.json(flashcards);
  } catch (err) {
    console.error("Error searching vocabulary:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Học từ vựng
exports.saveLearningProgress = async (req, res) => {
  const { flashcard_id, collection_id, status, confidence_level } = req.body;
  const user_id = req.user.userId;

  try {
    // Tính ngày ôn tập tiếp theo dựa trên confidence level
    const nextReviewDate = calculateNextReviewDate(confidence_level);

    await UserVocabularyLearning.saveProgress({
      user_id,
      flashcard_id,
      collection_id,
      status,
      confidence_level,
      next_review_date: nextReviewDate,
    });

    // Cập nhật tổng tiến độ
    await UserVocabularyLearning.updateOverallProgress(user_id, collection_id);

    res.json({ 
      message: "Tiến độ học tập đã được lưu",
      next_review_date: nextReviewDate
    });
  } catch (err) {
    console.error("Error saving learning progress:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getLearningProgress = async (req, res) => {
  const user_id = req.user.userId;
  const { collection_id } = req.query;

  try {
    const results = await UserVocabularyLearning.findByUser(user_id, collection_id);
    res.json(results);
  } catch (err) {
    console.error("Error fetching learning progress:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Import/Export CSV
exports.exportFlashcardsCSV = async (req, res) => {
  const { collection_id } = req.query;

  try {
    if (!collection_id) {
      return res.status(400).json({ message: "Thiếu collection_id" });
    }

    const flashcards = await VocabularyCSV.exportFlashcards(collection_id);

    const fields = [
      "word",
      "meaning",
      "pronunciation",
      "example_sentence",
      "example_meaning",
      "part_of_speech",
      "difficulty_level",
      "display_order",
      "collection_title",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(flashcards);

    res.header("Content-Type", "text/csv");
    res.attachment(`vocabulary-${collection_id}.csv`);
    res.send(csv);
  } catch (err) {
    console.error("Error exporting CSV:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.importFlashcardsCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Vui lòng chọn file CSV" });
  }

  const { collection_id } = req.body;
  if (!collection_id) {
    return res.status(400).json({ message: "Thiếu collection_id" });
  }

  const flashcards = [];

  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => {
        const flashcard = {
          collection_id: parseInt(collection_id),
          word: data.word,
          meaning: data.meaning,
          pronunciation: data.pronunciation || null,
          example_sentence: data.example_sentence || null,
          example_meaning: data.example_meaning || null,
          part_of_speech: data.part_of_speech || 'noun',
          synonyms: data.synonyms ? data.synonyms.split(",").map(item => item.trim()) : [],
          antonyms: data.antonyms ? data.antonyms.split(",").map(item => item.trim()) : [],
          tags: data.tags ? data.tags.split(",").map(item => item.trim()) : [],
          difficulty_level: data.difficulty_level || 'medium',
          display_order: parseInt(data.display_order) || 0,
        };
        flashcards.push(flashcard);
      })
      .on("end", async () => {
        try {
          await VocabularyFlashcard.bulkCreate(flashcards);
          fs.unlinkSync(req.file.path); // Xóa file tạm
          res.json({
            message: `Đã import thành công ${flashcards.length} flashcards`,
            count: flashcards.length,
          });
        } catch (err) {
          console.error("Error bulk creating flashcards:", err);
          res.status(500).json({ message: "Lỗi server", error: err.message });
        }
      });
  } catch (err) {
    console.error("Error importing CSV:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Oxford Dictionary API integration
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
      `https://od-api.oxforddictionaries.com/api/v2/entries/en-us/${word.toLowerCase()}`,
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
      phonetic: data.results[0]?.lexicalEntries[0]?.pronunciations?.[0]?.phoneticSpelling,
      audio: data.results[0]?.lexicalEntries[0]?.pronunciations?.find(p => p.audioFile)?.audioFile,
      definitions: data.results[0]?.lexicalEntries?.map(lexicalEntry => ({
        partOfSpeech: lexicalEntry.lexicalCategory?.text,
        definitions: lexicalEntry.entries?.[0]?.senses?.map(sense => ({
          definition: sense.definitions?.[0],
          examples: sense.examples?.map(ex => ex.text) || [],
        })) || [],
      })) || [],
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

// Hàm tính ngày ôn tập tiếp theo
function calculateNextReviewDate(confidenceLevel) {
  const today = new Date();
  let daysToAdd = 1;

  if (confidenceLevel >= 80) {
    daysToAdd = 7; // 1 tuần
  } else if (confidenceLevel >= 60) {
    daysToAdd = 3; // 3 ngày
  } else if (confidenceLevel >= 40) {
    daysToAdd = 2; // 2 ngày
  }
  // confidenceLevel < 40: ôn lại ngày mai (mặc định)

  today.setDate(today.getDate() + daysToAdd);
  return today.toISOString().split('T')[0]; // Trả về YYYY-MM-DD
}