CREATE DATABASE english_practice;

USE english_practice;

-- Bảng người dùng
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NULL,
  phone VARCHAR(20) NULL,
  google_id VARCHAR(255) NULL,
  facebook_id VARCHAR(255) NULL,
  display_name VARCHAR(255) NULL,
  role ENUM('superadmin', 'admin', 'teacher', 'student', 'user') NOT NULL DEFAULT 'user',
  avatar VARCHAR(255) NULL,
  is_premium TINYINT(1) DEFAULT 0 AFTER role;
  learning_goal TEXT NULL, 
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255) NULL,
  reset_password_token VARCHAR(255) NULL,
  reset_password_expires DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Bảng đề thi
CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    exam_type ENUM('listening', 'reading', 'writing', 'speaking', 'full_test') NOT NULL,
    duration INT, -- Thời gian làm bài (phút)
    total_questions INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng câu hỏi
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    question_type ENUM('multiple_choice', 'matching', 'fill_blanks', 'essay', 'short_answer') NOT NULL,
    question_text TEXT NOT NULL,
    question_order INT NOT NULL,
    audio_url VARCHAR(255), -- Cho phần Listening
    image_url VARCHAR(255), -- Cho hình ảnh minh họa
    options JSON, -- Lưu các lựa chọn dưới dạng JSON
    correct_answer JSON, -- Lưu đáp án đúng
    points INT DEFAULT 1, -- Điểm số cho câu hỏi
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Bảng bài nộp của người dùng
CREATE TABLE user_exam_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    exam_id INT NOT NULL,
    score DECIMAL(5,2),
    time_spent INT, -- Thời gian làm bài (giây)
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Bảng câu trả lời của người dùng
CREATE TABLE user_answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    user_answer JSON,
    is_correct BOOLEAN,
    points_earned DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES user_exam_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- (1) Bảng chủ đề ngữ pháp
CREATE TABLE `grammar_topics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `level` ENUM('beginner','intermediate','advanced') NOT NULL,
  `display_order` INT DEFAULT 0,
  `created_by` INT NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_grammar_topics_created_by` FOREIGN KEY (`created_by`)
    REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- (2) Bảng bài học ngữ pháp (lưu ý: `structure` và `usage` được quote bằng backticks)
CREATE TABLE `grammar_lessons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `topic_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `explanation` TEXT NOT NULL,
  `structure` TEXT,
  `usage` TEXT,
  `pronunciation_audio` VARCHAR(255),
  `example_sentence` TEXT,
  `example_image` VARCHAR(255),
  `meaning` TEXT,
  `tags` JSON, -- nếu server không hỗ trợ JSON: thay bằng TEXT
  `difficulty_level` ENUM('easy','medium','hard') DEFAULT 'medium',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` INT NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_grammar_lessons_topic` FOREIGN KEY (`topic_id`)
    REFERENCES `grammar_topics`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_grammar_lessons_created_by` FOREIGN KEY (`created_by`)
    REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- (3) Bảng bài tập ngữ pháp
CREATE TABLE `grammar_exercises` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lesson_id` INT NOT NULL,
  `question_type` ENUM('multiple_choice','fill_blank','sentence_correction','matching') NOT NULL,
  `question_text` TEXT NOT NULL,
  `options` JSON,         -- nếu không có JSON: dùng TEXT
  `correct_answer` JSON,  -- nếu không có JSON: dùng TEXT
  `explanation` TEXT,
  `points` INT DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_grammar_exercises_lesson` FOREIGN KEY (`lesson_id`)
    REFERENCES `grammar_lessons`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng ví dụ minh họa cho bài học
CREATE TABLE `grammar_examples` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lesson_id` INT NOT NULL,
  `example_sentence` TEXT NOT NULL,
  `meaning` TEXT,
  `pronunciation_audio` VARCHAR(255),
  `example_image` VARCHAR(255),
  `notes` TEXT,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_grammar_examples_lesson` FOREIGN KEY (`lesson_id`)
  REFERENCES `grammar_lessons`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng bài tập thực hành
CREATE TABLE `grammar_practices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lesson_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `instructions` TEXT NOT NULL,
  `content` JSON,
  -- `answer` JSON,
  `practice_type` ENUM('sentence_building', 'translation', 'fill_blank', 'conversation') NOT NULL,
  `difficulty_level` ENUM('easy','medium','hard') DEFAULT 'medium',
  `time_limit` INT, -- Thời gian giới hạn (phút)
  `points` INT DEFAULT 10,
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_grammar_practices_lesson` FOREIGN KEY (`lesson_id`)
  REFERENCES `grammar_lessons`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng kết quả thực hành của người dùng
CREATE TABLE `user_grammar_practice` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `practice_id` INT NOT NULL,
  `answers` JSON,
  `score` DECIMAL(5,2),
  `time_spent` INT, -- Thời gian làm bài (giây)
  `completed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`practice_id`) REFERENCES `grammar_practices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng tiến độ học ngữ pháp của người dùng
CREATE TABLE `user_grammar_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `lesson_id` INT NOT NULL,
  `score` DECIMAL(5,2) NOT NULL,
  `time_spent` INT, -- Thời gian làm bài (giây)
  `completed` BOOLEAN DEFAULT FALSE,
  `completed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`lesson_id`) REFERENCES `grammar_lessons`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_lesson` (`user_id`, `lesson_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Bảng bộ từ vựng (flashcard collections)
CREATE TABLE `vocabulary_collections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `level` ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
  `category` VARCHAR(100),
  `tags` JSON,
  `is_public` BOOLEAN DEFAULT TRUE,
  `display_order` INT DEFAULT 0,
  `created_by` INT NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_vocab_collections_created_by` FOREIGN KEY (`created_by`)
  REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng từ vựng (flashcards)
CREATE TABLE `vocabulary_flashcards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `collection_id` INT NOT NULL,
  `word` VARCHAR(255) NOT NULL,
  `meaning` TEXT NOT NULL,
  `pronunciation` VARCHAR(255),
  `pronunciation_audio` VARCHAR(255),
  `example_sentence` TEXT,
  `example_meaning` TEXT,
  `example_image` VARCHAR(255),
  `part_of_speech` ENUM('noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection') NOT NULL,
  `synonyms` JSON,
  `antonyms` JSON,
  `tags` JSON,
  `difficulty_level` ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  `is_active` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_vocab_flashcards_collection` FOREIGN KEY (`collection_id`)
  REFERENCES `vocabulary_collections`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng câu hỏi tự kiểm tra từ vựng
CREATE TABLE `vocabulary_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `collection_id` INT NOT NULL,
  `question_type` ENUM('multiple_choice', 'fill_in_the_blank', 'translation') NOT NULL,
  `question_text` TEXT NOT NULL,
  `options` JSON,
  `correct_answer` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_vocab_questions_collection` FOREIGN KEY (`collection_id`)
  REFERENCES `vocabulary_collections`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Bảng học từ vựng của người dùng
CREATE TABLE `user_vocabulary_learning` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `flashcard_id` INT NOT NULL,
  `collection_id` INT NOT NULL,
  `status` ENUM('new', 'learning', 'review', 'mastered') DEFAULT 'new',
  `confidence_level` INT DEFAULT 0, -- 0-100
  `next_review_date` DATE,
  `review_count` INT DEFAULT 0,
  `last_reviewed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`flashcard_id`) REFERENCES `vocabulary_flashcards`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`collection_id`) REFERENCES `vocabulary_collections`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_flashcard` (`user_id`, `flashcard_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng kết quả học tập từ vựng
CREATE TABLE `user_vocabulary_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `collection_id` INT NOT NULL,
  `total_cards` INT DEFAULT 0,
  `learned_cards` INT DEFAULT 0,
  `mastered_cards` INT DEFAULT 0,
  `total_reviews` INT DEFAULT 0,
  `average_confidence` DECIMAL(5,2) DEFAULT 0,
  `last_studied_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`collection_id`) REFERENCES `vocabulary_collections`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_collection` (`user_id`, `collection_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `exam_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `exam_id` int NOT NULL,
  `score` decimal(10,2) NOT NULL,
  `total_points` int NOT NULL,
  `correct_answers` int NOT NULL,
  `total_questions` int NOT NULL,
  `time_spent` int DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `exam_results_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_results_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_unicode_ci;

CREATE TABLE `exam_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `result_id` int NOT NULL,
  `question_id` int NOT NULL,
  `user_answer` text,
  `is_correct` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `result_id` (`result_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `exam_submissions_ibfk_1` FOREIGN KEY (`result_id`) REFERENCES `exam_results` (`id`) ON DELETE CASCADE,
  CONSTRAINT `exam_submissions_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
