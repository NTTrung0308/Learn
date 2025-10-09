const {
  VocabularyCollection,
  VocabularyFlashcard,
  UserVocabularyLearning,
  VocabularyCSV,
  VocabularyQuestion,
} = require("../models/vocabularyModel");
const csv = require("csv-parser");
const fs = require("fs");
const { Parser } = require("json2csv");
const fetch = require("node-fetch");

// Bộ từ vựng
exports.createCollection = async (req, res) => {
  const {
    title,
    description,
    level,
    category,
    tags,
    is_public,
    display_order,
  } = req.body;
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
    if (is_public !== undefined) filters.is_public = is_public === "true";

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
      tags: collectionResults[0].tags
        ? JSON.parse(collectionResults[0].tags)
        : [],
      flashcards: flashcardsResults.map((card) => ({
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
  const {
    title,
    description,
    level,
    category,
    tags,
    is_public,
    display_order,
  } = req.body;

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
    pronunciation_audio_url,
  } = req.body;

  try {
    // Xử lý file upload hoặc gọi API
    let pronunciation_audio = pronunciation_audio_url || null;
    if (req.files && req.files.audio) {
      pronunciation_audio = `/uploads/audio/${req.files.audio[0].filename}`;
    } else if (!pronunciation_audio && word) {
      // Nếu không có file audio và không có URL, thử gọi API
      console.log(`Fetching pronunciation for "${word}" from API...`);
      pronunciation_audio = await getAudioFromApi(word);
      if (pronunciation_audio) {
        console.log(`Found pronunciation audio: ${pronunciation_audio}`);
      } else {
        console.log(`Could not find pronunciation for "${word}" from API.`);
      }
    }

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

    const flashcards = results.map((card) => ({
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
    pronunciation_audio_url,
    fetch_pronunciation_audio,
  } = req.body;

  try {
    const currentFlashcard = await VocabularyFlashcard.findById(id);
    if (currentFlashcard.length === 0) {
      return res.status(404).json({ message: "Flashcard không tồn tại" });
    }

    // Xử lý file upload hoặc gọi API
    let pronunciation_audio = pronunciation_audio_url || currentFlashcard[0].pronunciation_audio;
    if (req.files && req.files.audio) {
      pronunciation_audio = `/uploads/audio/${req.files.audio[0].filename}`;
    } else if (fetch_pronunciation_audio) {
        const wordToFetch = word || currentFlashcard[0].word;
        console.log(`Fetching pronunciation for \"${wordToFetch}\" from API...`);
        pronunciation_audio = await getAudioFromApi(wordToFetch);
        if (pronunciation_audio) {
            console.log(`Found pronunciation audio: ${pronunciation_audio}`);
        } else {
            console.log(`Could not find pronunciation for \"${wordToFetch}\" from API.`);
            pronunciation_audio = currentFlashcard[0].pronunciation_audio; // Giữ lại audio cũ nếu không tìm thấy
        }
    }

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

    const flashcards = results.map((card) => ({
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
  const { flashcard_id, collection_id, status, confidence_level } =
    req.body;
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
    await UserVocabularyLearning.updateOverallProgress(
      user_id,
      collection_id
    );

    res.json({
      message: "Tiến độ học tập đã được lưu",
      next_review_date: nextReviewDate,
    });
  } catch (err) {
    console.error("Error saving learning progress:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.saveQuizProgress = async (req, res) => {
  const { collection_id, answers } = req.body;
  const user_id = req.user.userId;

  try {
    const progressDataArray = answers.map((answer) => {
      const confidence_level = answer.is_correct ? 80 : 20; // Example logic
      const status = answer.is_correct ? "learned" : "learning";
      const next_review_date = calculateNextReviewDate(confidence_level);

      return {
        user_id,
        flashcard_id: answer.flashcard_id,
        collection_id,
        status,
        confidence_level,
        next_review_date,
      };
    });

    await UserVocabularyLearning.saveBulkProgress(progressDataArray);
    await UserVocabularyLearning.updateOverallProgress(
      user_id,
      collection_id
    );

    res.status(200).json({ message: "Quiz progress saved successfully" });
  } catch (err) {
    console.error("Error saving quiz progress:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.completeSession = async (req, res) => {
  const { collection_id, study_progress, quiz_answers } = req.body;
  const user_id = req.user.userId;

  console.log("--- completeSession ---");
  console.log("collection_id:", collection_id);
  console.log("study_progress:", JSON.stringify(study_progress, null, 2));
  console.log("quiz_answers:", JSON.stringify(quiz_answers, null, 2));

  try {
    // Combine study progress and quiz answers
    const allProgress = study_progress.map((progress) => {
      const next_review_date = calculateNextReviewDate(
        progress.confidence_level
      );
      return {
        ...progress,
        user_id,
        collection_id,
        next_review_date,
      };
    });

    // In a real app, you might want to handle quiz answers differently
    // For now, we'll just add them to the bulk progress save
    quiz_answers.forEach((answer) => {
      const confidence_level = answer.is_correct ? 85 : 25; // Slightly different from study
      const status = answer.is_correct ? "learned" : "learning";
      const next_review_date = calculateNextReviewDate(confidence_level);

      allProgress.push({
        user_id,
        flashcard_id: answer.flashcard_id,
        collection_id,
        status,
        confidence_level,
        next_review_date,
      });
    });

    console.log("allProgress:", JSON.stringify(allProgress, null, 2));

    if (allProgress.length > 0) {
      await UserVocabularyLearning.saveBulkProgress(allProgress);
    }

    await UserVocabularyLearning.updateOverallProgress(
      user_id,
      collection_id
    );

    res
      .status(200)
      .json({ message: "Session completed and progress saved" });
  } catch (err) {
    console.error("Error completing session:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getLearningProgress = async (req, res) => {
  const user_id = req.user.userId;
  const { collection_id } = req.query;

  try {
    const results = await UserVocabularyLearning.findByUser(
      user_id,
      collection_id
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching learning progress:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Vocabulary Questions
exports.createVocabularyQuestion = async (req, res) => {
  const {
    collection_id,
    flashcard_id,
    question_type,
    question_text,
    options,
    correct_answer,
  } = req.body;

  try {
    let parsedOptions = options;
    if (typeof options === "string") {
      try {
        parsedOptions = JSON.parse(options);
      } catch {
        parsedOptions = options.split(",").map((option) => option.trim());
      }
    }

    const results = await VocabularyQuestion.create({
      collection_id,
      flashcard_id,
      question_type,
      question_text,
      options: parsedOptions,
      correct_answer,
    });

    res.status(201).json({
      message: "Câu hỏi đã được tạo",
      questionId: results.insertId,
    });
  } catch (err) {
    console.error("Error creating vocabulary question:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getVocabularyQuestions = async (req, res) => {
  const { collection_id } = req.query;

  try {
    if (!collection_id) {
      return res.status(400).json({ message: "Thiếu collection_id" });
    }

    const results = await VocabularyQuestion.findByCollectionId(
      collection_id
    );

    const questions = results.map((question) => {
      let optionsArray = [];
      if (question.options && typeof question.options === "string") {
        try {
          const parsed = JSON.parse(question.options);
          if (Array.isArray(parsed)) {
            optionsArray = parsed;
          } else if (typeof parsed === "string") {
            optionsArray = parsed.split(",").map((opt) => opt.trim());
          }
        } catch (e) {
          optionsArray = question.options
            .split(",")
            .map((opt) => opt.trim());
        }
      }

      return {
        ...question,
        options: optionsArray,
      };
    });

    res.json(questions);
  } catch (err) {
    console.error("Error fetching vocabulary questions:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.updateVocabularyQuestion = async (req, res) => {
  const { id } = req.params;
  const {
    flashcard_id,
    question_type,
    question_text,
    options,
    correct_answer,
  } = req.body;

  try {
    let parsedOptions = options;
    if (typeof options === "string") {
      try {
        parsedOptions = JSON.parse(options);
      } catch {
        parsedOptions = options.split(",").map((option) => option.trim());
      }
    }

    const results = await VocabularyQuestion.update(id, {
      flashcard_id,
      question_type,
      question_text,
      options: parsedOptions,
      correct_answer,
    });

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Câu hỏi không tồn tại" });
    }

    res.json({ message: "Câu hỏi đã được cập nhật" });
  } catch (err) {
    console.error("Error updating vocabulary question:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteVocabularyQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const results = await VocabularyQuestion.delete(id);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Câu hỏi không tồn tại" });
    }

    res.json({ message: "Câu hỏi đã được xóa" });
  } catch (err) {
    console.error("Error deleting vocabulary question:", err);
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
          part_of_speech: data.part_of_speech || "noun",
          synonyms: data.synonyms
            ? data.synonyms.split(",").map((item) => item.trim())
            : [],
          antonyms: data.antonyms
            ? data.antonyms.split(",").map((item) => item.trim())
            : [],
          tags: data.tags
            ? data.tags.split(",").map((item) => item.trim())
            : [],
          difficulty_level: data.difficulty_level || "medium",
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
          res
            .status(500)
            .json({ message: "Lỗi server", error: err.message });
        }
      });
  } catch (err) {
    console.error("Error importing CSV:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Dictionary API integration
exports.getWordDefinition = async (req, res) => {
  const { word } = req.params;

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
    );

    if (!response.ok) {
      const errorBody = await response.json();
      console.error(
        `Dictionary API Error: ${response.status} ${response.statusText}`,
        errorBody
      );
      throw new Error(errorBody.title || "Không tìm thấy từ trong từ điển");
    }

    const data = await response.json();

    // Extract relevant information from the first result
    const firstResult = data[0];
    const definition = {
      word: firstResult.word,
      phonetic:
        firstResult.phonetics?.find((p) => p.text)?.text ||
        firstResult.phonetic,
      audio: firstResult.phonetics?.find((p) => p.audio)?.audio,
      meanings:
        firstResult.meanings?.map((meaning) => ({
          partOfSpeech: meaning.partOfSpeech,
          definitions:
            meaning.definitions?.map((def) => ({
              definition: def.definition,
              example: def.example,
              synonyms: def.synonyms,
              antonyms: def.antonyms,
            })) || [],
        })) || [],
    };

    res.json(definition);
  } catch (err) {
    console.error("Error fetching word definition:", err);
    res.status(500).json({
      message: err.message || "Lỗi khi lấy định nghĩa từ",
      error: err.message,
    });
  }
};

async function getAudioFromApi(word) {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
    );
    if (!response.ok) {
      console.error(`Dictionary API Error for ${word}: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    const firstResult = data[0];
    // Find the first phonetic with an audio link
    const audioPhonetic = firstResult.phonetics?.find((p) => p.audio);
    return audioPhonetic?.audio || null;
  } catch (error) {
    console.error(`Error fetching audio from dictionary API for ${word}:`, error);
    return null;
  }
}

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
  return today.toISOString().split("T")[0]; // Trả về YYYY-MM-DD
}