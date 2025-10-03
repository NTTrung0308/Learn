import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Table, Tabs, Tab, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Layout from "../layout/admin/Layout";

const MySwal = withReactContent(Swal);

const ExamManagement = ({ handleLogout }) => {
  const [exams, setExams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [currentExam, setCurrentExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("exams");
  const [currentPage, setCurrentPage] = useState(1);
  const [examsPerPage] = useState(10);
  const [totalExams, setTotalExams] = useState(0);
  const [search, setSearch] = useState("");
  const [examType, setExamType] = useState("");

  const [examForm, setExamForm] = useState({
    title: "",
    description: "",
    exam_type: "listening",
    duration: 30,
  });

  const [questionForm, setQuestionForm] = useState({
    question_type: "multiple_choice",
    question_text: "",
    question_order: 1,
    options: ["", "", "", ""],
    correct_answer: "",
    points: 1,
  });

  useEffect(() => {
    fetchExams();
  }, [currentPage, search, examType]);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/exams", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: examsPerPage,
          search: search,
          exam_type: examType,
        },
      });
      setExams(response.data.exams);
      setTotalExams(response.data.totalExams);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách đề thi");
    }
  };

  const fetchExamQuestions = async (examId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/exams/${examId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQuestions(response.data.questions || []);
    } catch (error) {
      toast.error("Lỗi khi tải câu hỏi");
    }
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (editingExam) {
        await axios.put(
          `http://localhost:5000/api/exams/${editingExam.id}`,
          examForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Đề thi đã được cập nhật");
      } else {
        await axios.post("http://localhost:5000/api/exams", examForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Đề thi đã được tạo");
      }

      setShowModal(false);
      setEditingExam(null);
      setExamForm({
        title: "",
        description: "",
        exam_type: "listening",
        duration: 30,
      });
      fetchExams();
    } catch (error) {
      toast.error("Lỗi khi lưu đề thi");
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append all text fields from state
      Object.keys(questionForm).forEach((key) => {
        if (key === "options") {
          formData.append(key, JSON.stringify(questionForm.options));
        } else if (key === "correct_answer") {
          // Ensure correct_answer is an object before stringifying
          formData.append(
            key,
            JSON.stringify({ answer: questionForm.correct_answer })
          );
        } else if (
          key !== "id" &&
          key !== "created_at" &&
          key !== "updated_at" &&
          key !== "audio_url" &&
          key !== "image_url"
        ) {
          formData.append(key, questionForm[key]);
        }
      });

      // Append files if they exist
      if (form.audio.files[0]) {
        formData.append("audio", form.audio.files[0]);
      }
      if (form.image.files[0]) {
        formData.append("image", form.image.files[0]);
      }

      if (editingQuestion) {
        await axios.put(
          `http://localhost:5000/api/exams/questions/${editingQuestion.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Câu hỏi đã được cập nhật");
      } else {
        formData.append("exam_id", currentExam.id);
        await axios.post(
          `http://localhost:5000/api/exams/${currentExam.id}/questions`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Câu hỏi đã được thêm");
      }

      setShowQuestionModal(false);
      setEditingQuestion(null);
      setQuestionForm({
        question_type: "multiple_choice",
        question_text: "",
        question_order: questions.length + 1,
        options: ["", "", "", ""],
        correct_answer: "",
        points: 1,
      });
      fetchExamQuestions(currentExam.id);
    } catch (error) {
      console.error(error.response || error);
      toast.error(
        editingQuestion ? "Lỗi khi cập nhật câu hỏi" : "Lỗi khi thêm câu hỏi"
      );
    }
  };

  const deleteExam = async (id) => {
    MySwal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ không thể khôi phục lại điều này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Vâng, xóa nó!",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`http://localhost:5000/api/exams/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Đề thi đã được xóa");
          fetchExams();
        } catch (error) {
          toast.error("Lỗi khi xóa đề thi");
        }
      }
    });
  };

  const deleteQuestion = async (id) => {
    MySwal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ không thể khôi phục lại điều này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Vâng, xóa nó!",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(
            `http://localhost:5000/api/exams/questions/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          toast.success("Câu hỏi đã được xóa");
          fetchExamQuestions(currentExam.id);
        } catch (error) {
          toast.error("Lỗi khi xóa câu hỏi");
        }
      }
    });
  };

  const openQuestionModal = (exam) => {
    setCurrentExam(exam);
    setEditingQuestion(null);
    setQuestionForm({
      question_type: "multiple_choice",
      question_text: "",
      question_order: questions.length + 1,
      options: ["", "", "", ""],
      correct_answer: "",
      points: 1,
    });
    setShowQuestionModal(true);
    fetchExamQuestions(exam.id);
  };

  const openEditQuestionModal = (question) => {
    setEditingQuestion(question);

    let options = ["", "", "", ""];
    if (typeof question.options === "string") {
      try {
        options = JSON.parse(question.options);
      } catch (e) {
        console.error("Lỗi phân tích cú pháp tùy chọn câu hỏi:", e);
      }
    } else if (Array.isArray(question.options)) {
      options = question.options;
    }

    let correctAnswerValue = "";
    if (question.correct_answer) {
      if (typeof question.correct_answer === "string") {
        try {
          const parsed = JSON.parse(question.correct_answer);
          correctAnswerValue = parsed.answer;
        } catch (e) {
          correctAnswerValue = question.correct_answer;
        }
      } else if (question.correct_answer.answer) {
        correctAnswerValue = question.correct_answer.answer;
      }
    }

    setQuestionForm({
      ...question,
      options: options,
      correct_answer: correctAnswerValue.toString(),
    });

    setShowQuestionModal(true);
  };

  return (
    <Layout handleLogout={handleLogout}>
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Quản lý Đề thi IELTS</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Tạo Đề thi Mới
          </Button>
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          id="exam-management-tabs"
        >
          <Tab eventKey="exams" title="Danh sách Đề thi">
            <Row className="mb-3 mt-3">
              <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select value={examType} onChange={(e) => setExamType(e.target.value)}>
                  <option value="">Tất cả các loại</option>
                  <option value="listening">Listening</option>
                  <option value="reading">Reading</option>
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                  <option value="full_test">Full Test</option>
                </Form.Select>
              </Col>
            </Row>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Loại</th>
                  <th>Thời gian</th>
                  <th>Số câu hỏi</th>
                  <th>Người tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id}>
                    <td>{exam.title}</td>
                    <td>
                      {exam.exam_type === "listening" && "Listening"}
                      {exam.exam_type === "reading" && "Reading"}
                      {exam.exam_type === "writing" && "Writing"}
                      {exam.exam_type === "speaking" && "Speaking"}
                      {exam.exam_type === "full_test" && "Full Test"}
                    </td>
                    <td>{exam.duration} phút</td>
                    <td>{exam.total_questions}</td>
                    <td>{exam.creator_name}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setCurrentExam(exam);
                          setActiveTab("questions");
                          fetchExamQuestions(exam.id);
                        }}
                      >
                        Xem Câu hỏi
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => openQuestionModal(exam)}
                      >
                        Thêm Câu hỏi
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => deleteExam(exam.id)}
                      >
                        Xóa
                      </Button>
                    </td>{" "}
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-end">
              <Button
                variant="outline-primary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="me-2"
              >
                Trước
              </Button>
              <span className="align-self-center">
                Trang {currentPage} / {Math.ceil(totalExams / examsPerPage)}
              </span>
              <Button
                variant="outline-primary"
                disabled={currentPage === Math.ceil(totalExams / examsPerPage)}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="ms-2"
              >
                Sau
              </Button>
            </div>
          </Tab>

          <Tab eventKey="questions" title="Quản lý Câu hỏi">
            {currentExam ? (
              <div>
                <h4>Câu hỏi trong: {currentExam.title}</h4>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Câu hỏi</th>
                      <th>Loại</th>
                      <th>Điểm</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.length > 0 ? (
                      questions.map((q) => (
                        <tr key={q.id}>
                          <td>{q.question_order}</td>
                          <td>{q.question_text}</td>
                          <td>
                            {q.question_type === "multiple_choice" &&
                              "Multiple Choice"}
                            {q.question_type === "matching" && "Matching"}
                            {q.question_type === "fill_blanks" &&
                              "Fill in Blanks"}
                            {q.question_type === "essay" && "Essay"}
                            {q.question_type === "short_answer" &&
                              "Short Answer"}
                          </td>
                          <td>{q.points}</td>
                          <td>
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-2"
                              onClick={() => openEditQuestionModal(q)}
                            >
                              Sửa
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => deleteQuestion(q.id)}
                            >
                              Xóa
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          Không có câu hỏi nào trong đề thi này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            ) : (
              <p>Vui lòng chọn một đề thi để xem câu hỏi</p>
            )}
          </Tab>
        </Tabs>

        {/* Modal tạo/sửa đề thi */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingExam ? "Sửa Đề thi" : "Tạo Đề thi Mới"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleExamSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề</Form.Label>
                <Form.Control
                  type="text"
                  value={examForm.title}
                  onChange={(e) =>
                    setExamForm({ ...examForm, title: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={examForm.description}
                  onChange={(e) =>
                    setExamForm({ ...examForm, description: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Loại đề thi</Form.Label>
                <Form.Select
                  value={examForm.exam_type}
                  onChange={(e) =>
                    setExamForm({ ...examForm, exam_type: e.target.value })
                  }
                >
                  <option value="listening">Listening</option>
                  <option value="reading">Reading</option>
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                  <option value="full_test">Full Test</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Thời gian (phút)</Form.Label>
                <Form.Control
                  type="number"
                  value={examForm.duration}
                  onChange={(e) =>
                    setExamForm({
                      ...examForm,
                      duration: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                {editingExam ? "Cập nhật" : "Tạo"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal thêm/sửa câu hỏi */}
        <Modal
          show={showQuestionModal}
          onHide={() => setShowQuestionModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingQuestion ? "Sửa Câu hỏi" : "Thêm Câu hỏi Mới"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleQuestionSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Loại câu hỏi</Form.Label>
                <Form.Select
                  value={questionForm.question_type}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      question_type: e.target.value,
                    })
                  }
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="matching">Matching</option>
                  <option value="fill_blanks">Fill in Blanks</option>
                  <option value="essay">Essay</option>
                  <option value="short_answer">Short Answer</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Câu hỏi</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={questionForm.question_text}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      question_text: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Thứ tự</Form.Label>
                <Form.Control
                  type="number"
                  value={questionForm.question_order}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      question_order: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </Form.Group>

              {questionForm.question_type === "multiple_choice" && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Lựa chọn</Form.Label>
                    {questionForm.options.map((option, index) => (
                      <Form.Control
                        key={index}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...questionForm.options];
                          newOptions[index] = e.target.value;
                          setQuestionForm({
                            ...questionForm,
                            options: newOptions,
                          });
                        }}
                        placeholder={`Option ${index + 1}`}
                        className="mb-2"
                        required
                      />
                    ))}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Đáp án đúng (nhập số thứ tự)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max={questionForm.options.length}
                      value={questionForm.correct_answer}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          correct_answer: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Điểm</Form.Label>
                <Form.Control
                  type="number"
                  step="0.5"
                  value={questionForm.points}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      points: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Upload Audio (cho Listening)</Form.Label>
                <Form.Control type="file" accept="audio/*" name="audio" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Upload Image</Form.Label>
                <Form.Control type="file" accept="image/*" name="image" />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowQuestionModal(false)}
              >
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                {editingQuestion ? "Cập nhật" : "Thêm Câu hỏi"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ExamManagement;
