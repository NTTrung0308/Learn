import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const ExamList = ({ isAuthenticated }) => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [examType, setExamType] = useState("");

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    filterExams();
  }, [exams, searchTerm, examType]);

  const fetchExams = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/exams");
      setExams(response.data.exams);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Không thể tải danh sách đề thi");
      setLoading(false);
    }
  };

  const filterExams = () => {
    let filtered = exams;

    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (examType) {
      filtered = filtered.filter(exam => exam.exam_type === examType);
    }

    setFilteredExams(filtered);
  };

  if (loading) {
    return (
      <div className="exam-list-container">
        <div className="container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Đang tải danh sách đề thi...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-list-container">
      <div className="container">
        <div className="exam-header">
          <h1 className="text-dark">Luyện Đề Thi Tiếng Anh</h1>
          <p>Chọn đề thi phù hợp với trình độ và mục tiêu của bạn</p>
        </div>

        <div className="exam-filters">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm đề thi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-select">
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
            >
              <option value="">Tất cả loại đề</option>
              <option value="ielts">IELTS</option>
              <option value="toeic">TOEIC</option>
              <option value="toefl">TOEFL</option>
              <option value="general">Tổng quát</option>
            </select>
          </div>
        </div>

        <div className="exams-grid">
          {filteredExams.length === 0 ? (
            <div className="no-exams">
              <i className="fas fa-file-alt"></i>
              <h3>Không tìm thấy đề thi phù hợp</h3>
              <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
          ) : (
            filteredExams.map((exam) => (
              <div key={exam.id} className="exam-card">
                <div className="exam-card-header">
                  <span className={`exam-type ${exam.exam_type}`}>
                    {exam.exam_type.toUpperCase()}
                  </span>
                  <span className="exam-duration">
                    <i className="far fa-clock"></i> {exam.duration} phút
                  </span>
                </div>
                <div className="exam-card-body">
                  <h3>{exam.title}</h3>
                  <p>{exam.description}</p>
                  <div className="exam-stats">
                    <span>
                      <i className="fas fa-question-circle"></i>{" "}
                      {exam.total_questions || 0} câu
                    </span>
                    <span>
                      <i className="fas fa-users"></i> {exam.attempt_count || 0} lượt thi
                    </span>
                  </div>
                </div>
                <div className="exam-card-footer">
                  {isAuthenticated ? (
                    <Link
                      to={`/exams/${exam.id}/take`}
                      className="btn btn-primary"
                    >
                      Bắt đầu làm bài
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="btn btn-primary"
                    >
                      Đăng nhập để làm bài
                    </Link>
                  )}
                  <Link
                    to={`/exams/${exam.id}/preview`}
                    className="btn btn-outline"
                  >
                    Xem trước
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamList;