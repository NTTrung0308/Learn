import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";

const ExamTaking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchExam();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const fetchExam = async () => {
    try {
      const response = await api.get(`/exams/${id}`);
      console.log('Exam data:', response.data);
      
      // Parse options nếu nó là string
      const examData = response.data;
      if (examData.questions) {
        examData.questions = examData.questions.map(question => {
          let options = question.options;
          
          // Nếu options là string, parse thành array
          if (typeof options === 'string') {
            try {
              options = JSON.parse(options);
            } catch (error) {
              console.error('Error parsing options:', error);
              // Nếu parse thất bại, tách bằng dấu phẩy hoặc chuyển thành mảng rỗng
              options = options.split(',').map(opt => opt.trim());
            }
          }
          
          // Đảm bảo options là mảng
          if (!Array.isArray(options)) {
            options = [];
          }
          
          return {
            ...question,
            options
          };
        });
      }
      
      response.data.questions.forEach((q, i) => {
        console.log(`Question ${i} options type:`, typeof q.options, 'value:', q.options);
      });
      
      setExam(examData);
      setTimeLeft(examData.duration * 60); // Convert minutes to seconds
      startTimer();
    } catch (error) {
      console.error("Error fetching exam:", error);
      toast.error("Không thể tải đề thi");
      navigate("/exams");
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionNav = (index) => {
    setCurrentQuestion(index);
  };

  const handleAutoSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await submitExam();
  };

  const submitExam = async () => {
    try {
      // Chuyển đổi object answers thành mảng theo định dạng backend yêu cầu
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        question_id: parseInt(questionId, 10),
        answer: answers[questionId],
      }));

      const response = await api.post(`/exams/${id}/submit`, {
        answers: formattedAnswers,
        time_spent: exam.duration * 60 - timeLeft,
      });

      const { resultId } = response.data;

      // Redirect to the result page with the resultId
      navigate(`/exams/result/${resultId}`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Lỗi khi nộp bài");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!exam) {
    return (
      <div className="exam-taking-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  // Xử lý trường hợp đề thi không có câu hỏi
  if (!exam.questions || exam.questions.length === 0) {
    return (
      <div className="exam-taking-container">
        <div className="container text-center">
          <h1>{exam.title}</h1>
          <p>Đề thi này hiện chưa có câu hỏi.</p>
          <button onClick={() => navigate("/exams")} className="btn btn-primary">
            Quay lại danh sách đề thi
          </button>
        </div>
      </div>
    );
  }

  const question = exam.questions[currentQuestion];

  // Đảm bảo options là mảng trước khi render
  const safeOptions = Array.isArray(question.options) ? question.options : [];

  return (
    <div className="exam-taking-container">
      <div className="exam-header">
        <div className="container">
          <div className="exam-info">
            <h1>{exam.title}</h1>
            <div className="timer">
              <i className="fas fa-clock"></i>
              <span className={timeLeft < 300 ? "time-warning" : ""}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="exam-content">
          <div className="question-navigation">
            <h3>Câu hỏi</h3>
            <div className="question-grid">
              {exam.questions.map((q, index) => (
                <button
                  key={q.id}
                  className={`question-btn ${
                    index === currentQuestion ? "active" : ""
                  } ${answers[q.id] ? "answered" : ""}`}
                  onClick={() => handleQuestionNav(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="question-content">
            <div className="question-header">
              <h3>
                Câu {currentQuestion + 1}/{exam.questions.length}
              </h3>
              <span className="question-points">{question.points} điểm</span>
            </div>

            <div className="question-body">
              {question.audio_url && (
                <div className="question-audio">
                  <audio controls>
                    <source src={question.audio_url} type="audio/mpeg" />
                    Trình duyệt của bạn không hỗ trợ phát audio.
                  </audio>
                </div>
              )}

              {question.image_url && (
                <div className="question-image">
                  <img src={question.image_url} alt="Question visual" />
                </div>
              )}

              <div className="question-text">
                <p>{question.question_text}</p>
              </div>

              <div className="question-options">
                {safeOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`option ${
                      answers[question.id] === index ? "selected" : ""
                    }`}
                    onClick={() => handleAnswerSelect(question.id, index)}
                  >
                    <span className="option-label">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="option-text">{option}</span>
                  </div>
                ))}
                {safeOptions.length === 0 && (
                  <p className="text-muted">Không có lựa chọn nào cho câu hỏi này.</p>
                )}
              </div>
            </div>

            <div className="question-navigation-buttons">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
                className="btn btn-outline"
              >
                <i className="fas fa-arrow-left"></i> Câu trước
              </button>
              
              {currentQuestion === exam.questions.length - 1 ? (
                <button
                  onClick={handleAutoSubmit}
                  disabled={isSubmitting}
                  className="btn btn-primary submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Đang nộp...
                    </>
                  ) : (
                    "Nộp bài"
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="btn btn-primary"
                >
                  Câu tiếp theo <i className="fas fa-arrow-right"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamTaking; 