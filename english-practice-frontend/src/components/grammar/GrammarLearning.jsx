import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import GrammarLessonView from "./GrammarLessonView";
import GrammarQuiz from "./GrammarQuiz";
import ProgressTracker from "./ProgressTracker";

const GrammarLearning = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentStep, setCurrentStep] = useState("lesson"); // 'lesson', 'quiz', 'result'
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({
    completed: false,
    score: 0,
    timeSpent: 0
  });

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`http://localhost:5000/api/grammar/lessons/${lessonId}`);
      // console.log("Full lesson data from API:", response.data);
      setLesson(response.data);
      
      // Create quiz from lesson's practices
      if (response.data.practices && response.data.practices.length > 0) {
        let allQuestions = [];
        response.data.practices.forEach((practice) => {
          try {
            const content = JSON.parse(practice.content);
            if (content && Array.isArray(content.questions)) {
              const questionsWithContext = content.questions.map((q) => ({
                ...q,
                practice_id: practice.id,
                correct_answer: q.correctAnswer,
              }));
              allQuestions = allQuestions.concat(questionsWithContext);
            }
          } catch (e) {
            console.error(
              `Error parsing content for practice ID ${practice.id}:`,
              e
            );
          }
        });

        const firstPractice = response.data.practices[0];
        setQuiz({
          title: firstPractice.title || `Luyện tập: ${response.data.title}`,
          instructions: firstPractice.instructions,
          timeLimit: firstPractice.time_limit || 10, // Default to 10 minutes
          exercises: allQuestions,
        });
      }
    } catch (error) {
      console.error("Error fetching lesson:", error);
      toast.error("Không thể tải bài học");
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = () => {
    setCurrentStep("quiz");
    toast.info("Bắt đầu làm quiz!");
  };

  const handleQuizSubmit = async (answers, timeSpent) => {
    try {
      // Tính điểm
      let score = 0;
      const results = quiz.exercises.map((exercise, index) => {
        const isCorrect = answers[index] === exercise.correct_answer;
        if (isCorrect) score += exercise.points || 1;
        return {
          exerciseId: exercise.id,
          userAnswer: answers[index],
          isCorrect,
          correctAnswer: exercise.correct_answer
        };
      });

      const totalScore = (score / quiz.exercises.reduce((sum, ex) => sum + (ex.points || 1), 0)) * 100;
      
      setQuizResult({
        score: totalScore,
        totalQuestions: quiz.exercises.length,
        correctAnswers: results.filter(r => r.isCorrect).length,
        results,
        timeSpent
      });

      setCurrentStep("result");
      
      // Lưu kết quả
      await saveProgress(totalScore, timeSpent);
      
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Lỗi khi nộp bài");
    }
  };

  const saveProgress = async (score, timeSpent) => {
    try {
      await api.post("http://localhost:5000/api/grammar/progress", {
        lesson_id: parseInt(lessonId),
        score,
        time_spent: timeSpent,
        completed: true
      });
      
      setProgress({
        completed: true,
        score,
        timeSpent
      });
      
      toast.success("Đã lưu tiến độ học tập!");
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleRetryQuiz = () => {
    setCurrentStep("quiz");
    setUserAnswers([]);
    setQuizResult(null);
  };

  const handleNextLesson = () => {
    // Logic để chuyển đến bài học tiếp theo
    // Có thể implement dựa trên display_order
    navigate("/grammar");
  };

  const handleAnalyzeResult = async () => {
    try {
      setAnalyzing(true);
      const response = await api.post("http://localhost:5000/api/grammar/progress/analyze", {
        quiz,
        results: quizResult.results,
      });
      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error("Error analyzing result:", error);
      toast.error("Lỗi khi phân tích kết quả");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="grammar-learning-container min-vh-100 bg-light py-5">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}}></div>
            <h4 className="text-muted">Đang tải bài học...</h4>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="grammar-learning-container min-vh-100 bg-light py-5">
        <div className="container">
          <div className="text-center py-5">
            <i className="fas fa-book text-muted mb-3" style={{fontSize: '3rem'}}></i>
            <h2 className="text-dark mb-3">Không tìm thấy bài học</h2>
            <p className="text-muted mb-4">Bài học không tồn tại hoặc đã bị xóa.</p>
            <Link to="/grammar" className="btn btn-primary">
              <i className="fas fa-arrow-left me-2"></i>Quay lại danh sách bài học
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grammar-learning-container min-vh-100 bg-light">
      {/* Progress Header */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container py-3">
          <ProgressTracker 
            lesson={lesson}
            currentStep={currentStep}
            progress={progress}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-4">
        <div className="row">
          {/* Lesson Content */}
          <div className="col-lg-8">
            {currentStep === "lesson" && (
              <GrammarLessonView 
                lesson={lesson}
                onComplete={handleLessonComplete}
              />
            )}

            {currentStep === "quiz" && quiz && (
              <GrammarQuiz 
                quiz={quiz}
                onSubmit={handleQuizSubmit}
                onBack={() => setCurrentStep("lesson")}
              />
            )}

            {currentStep === "result" && quizResult && (
              <QuizResult 
                result={quizResult}
                lesson={lesson}
                quiz={quiz}
                onRetry={handleRetryQuiz}
                onNext={handleNextLesson}
                onAnalyze={handleAnalyzeResult}
                analysis={analysis}
                analyzing={analyzing}
              />
            )}
          </div>

          {/* Sidebar - Additional Resources */}
          <div className="col-lg-4">
            <div className="sticky-top" style={{top: '20px'}}>
              <LessonResources lesson={lesson} />
              <RelatedLessons topicId={lesson.topic_id} currentLessonId={lesson.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component hiển thị kết quả quiz
const QuizResult = ({ result, lesson, quiz, onRetry, onNext, onAnalyze, analysis, analyzing }) => {
  const percentage = Math.round(result.score);
  
  const getPerformanceMessage = () => {
    if (percentage >= 90) return "Xuất sắc! 🎉";
    if (percentage >= 80) return "Rất tốt! 👍";
    if (percentage >= 70) return "Tốt! 👏";
    if (percentage >= 60) return "Đạt yêu cầu ✅";
    return "Cần ôn tập thêm 💪";
  };

  const getPerformanceColor = () => {
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
  };

  return (
    <div className="quiz-result card shadow-sm border-0">
      <div className="card-body">
        <div className="text-center mb-4">
          <div className={`score-circle mx-auto mb-3 bg-${getPerformanceColor()} bg-opacity-10`}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `4px solid var(--bs-${getPerformanceColor()})`
            }}>
            <div className="text-center">
              <h2 className={`mb-0 text-${getPerformanceColor()}`} style={{fontWeight: 'bold'}}>
                {percentage}%
              </h2>
              <small className="text-muted">Điểm số</small>
            </div>
          </div>
          <h4 className={`text-${getPerformanceColor()} mb-2`}>
            {getPerformanceMessage()}
          </h4>
          <p className="text-muted">
            Bạn đã trả lời đúng {result.correctAnswers}/{result.totalQuestions} câu
          </p>
        </div>

        <div className="result-details mb-4">
          <h5 className="mb-3">Chi tiết kết quả:</h5>
          {result.results.map((item, index) => (
            <div key={index} className={`d-flex align-items-center p-3 rounded mb-2 ${item.isCorrect ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
              <i className={`fas ${item.isCorrect ? 'fa-check text-success' : 'fa-times text-danger'} me-3`}></i>
              <div className="flex-grow-1">
                <p className="mb-1 small">
                  Câu {index + 1}: {item.isCorrect ? 'Đúng' : 'Sai'}
                </p>
                {!item.isCorrect && (
                  <p className="mb-0 small text-muted">
                    Đáp án đúng: {quiz.exercises[index].question_type === 'multiple_choice' && quiz.exercises[index].options ? quiz.exercises[index].options[item.correctAnswer] : item.correctAnswer}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="action-buttons d-grid gap-2">
          <button onClick={onRetry} className="btn btn-outline-primary">
            <i className="fas fa-redo me-2"></i>Làm lại quiz
          </button>
          <button onClick={onNext} className="btn btn-primary">
            <i className="fas fa-arrow-right me-2"></i>Bài học tiếp theo
          </button>
          {!analysis && (
            <button onClick={onAnalyze} className="btn btn-info" disabled={analyzing}>
              {analyzing ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang phân tích...</>
              ) : (
                <><i className="fas fa-lightbulb me-2"></i> Phân tích kết quả bằng AI</>
              )}
            </button>
          )}
        </div>

        {analysis && (
          <div className="ai-analysis mt-4">
            <h5 className="mb-3">Phân tích từ AI</h5>
            <div className="card bg-light border-0">
              <div className="card-body">
                <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Component tài nguyên bổ sung
const LessonResources = ({ lesson }) => (
  <div className="card shadow-sm border-0 mb-4">
    <div className="card-body">
      <h6 className="card-title d-flex align-items-center">
        <i className="fas fa-bookmark text-primary me-2"></i>
        Tài nguyên bài học
      </h6>
      
      {lesson.pronunciation_audio && (
        <div className="resource-item mb-3">
          <h6 className="small fw-bold">Phát âm</h6>
          <audio controls className="w-100">
            <source src={lesson.pronunciation_audio} type="audio/mpeg" />
            Trình duyệt không hỗ trợ phát audio.
          </audio>
        </div>
      )}

      {lesson.example_image && (
        <div className="resource-item mb-3">
          <h6 className="small fw-bold">Hình ảnh minh họa</h6>
          <img 
            src={lesson.example_image} 
            alt="Example" 
            className="img-fluid rounded"
          />
        </div>
      )}

      <div className="resource-item">
        <h6 className="small fw-bold">Tags</h6>
        <div className="d-flex flex-wrap gap-1">
          {lesson.tags.map((tag, index) => (
            <span key={index} className="badge bg-light text-dark border">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Component bài học liên quan
const RelatedLessons = ({ topicId, currentLessonId }) => {
  const [relatedLessons, setRelatedLessons] = useState([]);

  useEffect(() => {
    fetchRelatedLessons();
  }, [topicId]);

  const fetchRelatedLessons = async () => {
    try {
      const response = await api.get(`http://localhost:5000/api/grammar/lessons?topic_id=${topicId}`);
      setRelatedLessons(response.data.lessons.filter(lesson => lesson.id !== currentLessonId));
    } catch (error) {
      console.error("Error fetching related lessons:", error);
    }
  };

  if (relatedLessons.length === 0) return null;

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h6 className="card-title d-flex align-items-center">
          <i className="fas fa-link text-primary me-2"></i>
          Bài học liên quan
        </h6>
        <div className="list-group list-group-flush">
          {relatedLessons.slice(0, 5).map(lesson => (
            <Link 
              key={lesson.id}
              to={`/grammar/learn/${lesson.id}`}
              className="list-group-item list-group-item-action border-0 px-0 py-2"
            >
              <div className="d-flex align-items-center">
                <i className="fas fa-book text-muted me-3"></i>
                <div>
                  <p className="mb-0 small fw-bold">{lesson.title}</p>
                  <small className="text-muted">{lesson.difficulty_level}</small>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GrammarLearning;