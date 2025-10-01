// GrammarExamplesAndPractices.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Form,
  Table,
  Card,
  Row,
  Col,
  Badge,
  Tab,
  Tabs,
} from "react-bootstrap";
import { toast } from "react-toastify";

const GrammarExamplesAndPractices = ({ lessonId, lessonTitle }) => {
  const [examples, setExamples] = useState([]);
  const [practices, setPractices] = useState([]);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [editingExample, setEditingExample] = useState(null);
  const [editingPractice, setEditingPractice] = useState(null);
  const [activeTab, setActiveTab] = useState("examples");

  const [exampleForm, setExampleForm] = useState({
    example_sentence: "",
    meaning: "",
    notes: "",
    display_order: 0,
  });

  const [practiceForm, setPracticeForm] = useState({
    title: "",
    instructions: "",
    content: "",
    practice_type: "sentence_building",
    difficulty_level: "medium",
    time_limit: 10,
    points: 10,
    display_order: 0,
  });

  useEffect(() => {
    if (lessonId) {
      fetchExamples();
      fetchPractices();
    }
  }, [lessonId]);

  const fetchExamples = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/grammar/examples?lesson_id=${lessonId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExamples(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách ví dụ");
    }
  };

  const fetchPractices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/grammar/practices?lesson_id=${lessonId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPractices(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách bài thực hành");
    }
  };

  const handleExampleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("lesson_id", lessonId);
      Object.keys(exampleForm).forEach(key => {
        formData.append(key, exampleForm[key]);
      });

      if (editingExample) {
        await axios.put(
          `http://localhost:5000/api/grammar/examples/${editingExample.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Ví dụ đã được cập nhật");
      } else {
        await axios.post(
          "http://localhost:5000/api/grammar/examples",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Ví dụ đã được thêm");
      }

      setShowExampleModal(false);
      setEditingExample(null);
      setExampleForm({
        example_sentence: "",
        meaning: "",
        notes: "",
        display_order: 0,
      });
      fetchExamples();
    } catch (error) {
      toast.error("Lỗi khi lưu ví dụ");
    }
  };

  const handlePracticeSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const practiceData = {
        lesson_id: lessonId,
        ...practiceForm,
        content: JSON.stringify({
          questions: [
            {
              question: "Sample question",
              correctAnswer: "sample answer"
            }
          ]
        })
      };

      if (editingPractice) {
        await axios.put(
          `http://localhost:5000/api/grammar/practices/${editingPractice.id}`,
          practiceData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Bài thực hành đã được cập nhật");
      } else {
        await axios.post(
          "http://localhost:5000/api/grammar/practices",
          practiceData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Bài thực hành đã được thêm");
      }

      setShowPracticeModal(false);
      setEditingPractice(null);
      setPracticeForm({
        title: "",
        instructions: "",
        content: "",
        practice_type: "sentence_building",
        difficulty_level: "medium",
        time_limit: 10,
        points: 10,
        display_order: 0,
      });
      fetchPractices();
    } catch (error) {
      toast.error("Lỗi khi lưu bài thực hành");
    }
  };

  const openExampleModal = (example = null) => {
    if (example) {
      setEditingExample(example);
      setExampleForm({
        example_sentence: example.example_sentence,
        meaning: example.meaning || "",
        notes: example.notes || "",
        display_order: example.display_order,
      });
    } else {
      setEditingExample(null);
      setExampleForm({
        example_sentence: "",
        meaning: "",
        notes: "",
        display_order: examples.length + 1,
      });
    }
    setShowExampleModal(true);
  };

  const openPracticeModal = (practice = null) => {
    if (practice) {
      setEditingPractice(practice);
      setPracticeForm({
        title: practice.title,
        instructions: practice.instructions,
        content: practice.content ? JSON.stringify(practice.content) : "",
        practice_type: practice.practice_type,
        difficulty_level: practice.difficulty_level,
        time_limit: practice.time_limit,
        points: practice.points,
        display_order: practice.display_order,
      });
    } else {
      setEditingPractice(null);
      setPracticeForm({
        title: "",
        instructions: "",
        content: "",
        practice_type: "sentence_building",
        difficulty_level: "medium",
        time_limit: 10,
        points: 10,
        display_order: practices.length + 1,
      });
    }
    setShowPracticeModal(true);
  };

  if (!lessonId) {
    return (
      <Card>
        <Card.Body className="text-center">
          <p>Vui lòng chọn một bài học để quản lý ví dụ và bài tập</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Quản lý Ví dụ & Bài tập - {lessonTitle}</h4>
        <div>
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={() => openExampleModal()}
          >
            Thêm Ví dụ
          </Button>
          <Button
            variant="primary"
            onClick={() => openPracticeModal()}
          >
            Thêm Bài tập
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(tab) => setActiveTab(tab)}
        className="mb-4"
      >
        <Tab eventKey="examples" title="Ví dụ minh họa">
          <Row>
            {examples.map((example) => (
              <Col md={6} key={example.id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title className="h6">
                      {example.example_sentence}
                    </Card.Title>
                    {example.meaning && (
                      <Card.Text className="text-muted">
                        {example.meaning}
                      </Card.Text>
                    )}
                    {example.notes && (
                      <Card.Text className="small">
                        <strong>Ghi chú:</strong> {example.notes}
                      </Card.Text>
                    )}
                    <div className="d-flex justify-content-between mt-3">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => openExampleModal(example)}
                      >
                        Sửa
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {examples.length === 0 && (
            <div className="text-center py-5">
              <p>Chưa có ví dụ nào cho bài học này.</p>
              <Button
                variant="primary"
                onClick={() => openExampleModal()}
              >
                Thêm Ví dụ Đầu tiên
              </Button>
            </div>
          )}
        </Tab>

        <Tab eventKey="practices" title="Bài tập thực hành">
          <Row>
            {practices.map((practice) => (
              <Col md={6} lg={4} key={practice.id} className="mb-4">
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="h6">{practice.title}</Card.Title>
                      <Badge bg="info">{practice.practice_type}</Badge>
                    </div>
                    <Card.Text className="small">
                      {practice.instructions}
                    </Card.Text>
                    <div className="mt-auto">
                      <Badge bg="secondary" className="me-2">
                        {practice.points} điểm
                      </Badge>
                      <Badge bg="warning" text="dark">
                        {practice.time_limit} phút
                      </Badge>
                    </div>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-flex justify-content-between">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => openPracticeModal(practice)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {/* Xem chi tiết */}}
                      >
                        Xem
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          {practices.length === 0 && (
            <div className="text-center py-5">
              <p>Chưa có bài thực hành nào cho bài học này.</p>
              <Button
                variant="primary"
                onClick={() => openPracticeModal()}
              >
                Thêm Bài tập Đầu tiên
              </Button>
            </div>
          )}
        </Tab>
      </Tabs>

      {/* Modal ví dụ */}
      <Modal show={showExampleModal} onHide={() => setShowExampleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingExample ? "Sửa Ví dụ" : "Thêm Ví dụ Mới"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleExampleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Câu ví dụ</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={exampleForm.example_sentence}
                onChange={(e) =>
                  setExampleForm({
                    ...exampleForm,
                    example_sentence: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nghĩa</Form.Label>
              <Form.Control
                type="text"
                value={exampleForm.meaning}
                onChange={(e) =>
                  setExampleForm({
                    ...exampleForm,
                    meaning: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={exampleForm.notes}
                onChange={(e) =>
                  setExampleForm({
                    ...exampleForm,
                    notes: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Thứ tự hiển thị</Form.Label>
              <Form.Control
                type="number"
                value={exampleForm.display_order}
                onChange={(e) =>
                  setExampleForm({
                    ...exampleForm,
                    display_order: parseInt(e.target.value),
                  })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowExampleModal(false)}
            >
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingExample ? "Cập nhật" : "Thêm"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal bài thực hành */}
      <Modal show={showPracticeModal} onHide={() => setShowPracticeModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingPractice ? "Sửa Bài thực hành" : "Thêm Bài thực hành Mới"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePracticeSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                type="text"
                value={practiceForm.title}
                onChange={(e) =>
                  setPracticeForm({
                    ...practiceForm,
                    title: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hướng dẫn</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={practiceForm.instructions}
                onChange={(e) =>
                  setPracticeForm({
                    ...practiceForm,
                    instructions: e.target.value,
                  })
                }
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại bài tập</Form.Label>
                  <Form.Select
                    value={practiceForm.practice_type}
                    onChange={(e) =>
                      setPracticeForm({
                        ...practiceForm,
                        practice_type: e.target.value,
                      })
                    }
                  >
                    <option value="sentence_building">Xây dựng câu</option>
                    <option value="translation">Dịch thuật</option>
                    <option value="fill_blank">Điền vào chỗ trống</option>
                    <option value="conversation">Hội thoại</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Độ khó</Form.Label>
                  <Form.Select
                    value={practiceForm.difficulty_level}
                    onChange={(e) =>
                      setPracticeForm({
                        ...practiceForm,
                        difficulty_level: e.target.value,
                      })
                    }
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian (phút)</Form.Label>
                  <Form.Control
                    type="number"
                    value={practiceForm.time_limit}
                    onChange={(e) =>
                      setPracticeForm({
                        ...practiceForm,
                        time_limit: parseInt(e.target.value),
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Điểm</Form.Label>
                  <Form.Control
                    type="number"
                    value={practiceForm.points}
                    onChange={(e) =>
                      setPracticeForm({
                        ...practiceForm,
                        points: parseInt(e.target.value),
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Thứ tự hiển thị</Form.Label>
              <Form.Control
                type="number"
                value={practiceForm.display_order}
                onChange={(e) =>
                  setPracticeForm({
                    ...practiceForm,
                    display_order: parseInt(e.target.value),
                  })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowPracticeModal(false)}
            >
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingPractice ? "Cập nhật" : "Thêm"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default GrammarExamplesAndPractices;