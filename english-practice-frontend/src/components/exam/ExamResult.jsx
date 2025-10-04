import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
const ExamResult = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [showExplanations, setShowExplanations] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadResult();
  }, [id]);

  const loadResult = () => {
    const savedResult = localStorage.getItem(`exam_result_${id}`);
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    } else {
      toast.error("Không tìm thấy kết quả bài thi");
    }
  };

  const calculatePercentage = (correct, total) => {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "excellent";
    if (percentage >= 60) return "good";
    if (percentage >= 40) return "average";
    return "poor";
  };

  const getSkillLevel = (percentage) => {
    if (percentage >= 90) return "Xuất sắc";
    if (percentage >= 80) return "Rất tốt";
    if (percentage >= 70) return "Tốt";
    if (percentage >= 60) return "Khá";
    if (percentage >= 50) return "Trung bình";
    return "Cần cải thiện";
  };

  if (!result) {
    return (
      <div className="exam-result-container">
        <div className="container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Đang tải kết quả...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-result-container">
      <div className="container">
        <div className="result-header">
          <h1>Kết Quả Bài Thi</h1>
          <h2>{result.exam.title}</h2>
          <div className="result-summary">
            <div className="score-card">
              <div className="score-circle">
                <div className={`score-value ${getScoreColor(result.score_percentage)}`}>
                  {result.score_percentage}%
                </div>
              </div>
              <div className="score-info">
                <h3>Điểm tổng quan</h3>
                <p>
                  {result.correct_answers}/{result.total_questions} câu đúng
                </p>
                <span className={`skill-level ${getScoreColor(result.score_percentage)}`}>
                  {getSkillLevel(result.score_percentage)}
                </span>
              </div>
            </div>

            <div className="result-stats">
              <div className="stat-item">
                <i className="fas fa-check-circle"></i>
                <div>
                  <h4>{result.correct_answers}</h4>
                  <p>Câu đúng</p>
                </div>
              </div>
              <div className="stat-item">
                <i className="fas fa-times-circle"></i>
                <div>
                  <h4>{result.incorrect_answers}</h4>
                  <p>Câu sai</p>
                </div>
              </div>
              <div className="stat-item">
                <i className="fas fa-clock"></i>
                <div>
                  <h4>{Math.floor(result.time_spent / 60)}:{String(result.time_spent % 60).padStart(2, '0')}</h4>
                  <p>Thời gian làm</p>
                </div>
              </div>
              <div className="stat-item">
                <i className="fas fa-tachometer-alt"></i>
                <div>
                  <h4>{Math.round(result.average_time_per_question)}s</h4>
                  <p>Trung bình/câu</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="result-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Tổng quan
          </button>
          <button
            className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            Chi tiết từng câu
          </button>
          <button
            className={`tab-btn ${activeTab === "analysis" ? "active" : ""}`}
            onClick={() => setActiveTab("analysis")}
          >
            Phân tích lỗi
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="skill-breakdown">
                <h3>Phân tích kỹ năng</h3>
                <div className="skill-chart">
                  {result.skill_analysis?.map((skill, index) => (
                    <div key={index} className="skill-item">
                      <div className="skill-header">
                        <span className="skill-name">{skill.name}</span>
                        <span className="skill-score">
                          {skill.correct}/{skill.total} ({calculatePercentage(skill.correct, skill.total)}%)
                        </span>
                      </div>
                      <div className="skill-progress">
                        <div
                          className={`skill-progress-bar ${getScoreColor(calculatePercentage(skill.correct, skill.total))}`}
                          style={{ width: `${calculatePercentage(skill.correct, skill.total)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="recommendations">
                <h3>Đề xuất cải thiện</h3>
                <div className="recommendation-list">
                  {result.recommendations?.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <i className="fas fa-lightbulb"></i>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="details-tab">
              <div className="questions-review">
                {result.questions?.map((q, index) => (
                  <div key={q.id} className="question-review">
                    <div className="question-header">
                      <h4>Câu {index + 1}</h4>
                      <span className={`status ${q.is_correct ? "correct" : "incorrect"}`}>
                        {q.is_correct ? "✓ Đúng" : "✗ Sai"}
                      </span>
                    </div>
                    
                    <div className="question-content">
                      <p><strong>Câu hỏi:</strong> {q.question_text}</p>
                      
                      <div className="answer-comparison">
                        <div className="answer-row">
                          <span className="answer-label">Đáp án của bạn:</span>
                          <span className={`user-answer ${!q.is_correct ? "wrong" : ""}`}>
                            {q.user_answer || "Không trả lời"}
                          </span>
                        </div>
                        {!q.is_correct && (
                          <div className="answer-row">
                            <span className="answer-label">Đáp án đúng:</span>
                            <span className="correct-answer">{q.correct_answer}</span>
                          </div>
                        )}
                      </div>

                      {showExplanations && q.explanation && (
                        <div className="explanation">
                          <strong>Giải thích:</strong>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                className="btn btn-outline toggle-explanations"
                onClick={() => setShowExplanations(!showExplanations)}
              >
                {showExplanations ? "Ẩn giải thích" : "Hiện giải thích chi tiết"}
              </button>
            </div>
          )}

          {activeTab === "analysis" && (
            <div className="analysis-tab">
              <div className="weak-areas">
                <h3>Điểm yếu cần cải thiện</h3>
                <div className="weakness-list">
                  {result.weak_areas?.map((area, index) => (
                    <div key={index} className="weakness-item">
                      <div className="weakness-header">
                        <i className="fas fa-exclamation-triangle"></i>
                        <h4>{area.topic}</h4>
                        <span className="weakness-score">{area.accuracy}%</span>
                      </div>
                      <p>{area.description}</p>
                      <div className="suggested-actions">
                        <strong>Gợi ý học tập:</strong>
                        <ul>
                          {area.suggestions?.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="result-actions">
          <Link to="/exams" className="btn btn-primary">
            Làm đề thi khác
          </Link>
          <Link to={`/exam/${id}`} className="btn btn-outline">
            Làm lại đề này
          </Link>
          <button className="btn btn-secondary">
            <i className="fas fa-download"></i> Tải kết quả
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResult;