import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Form,
  Table,
  Tabs,
  Tab,
  Card,
  Row,
  Col,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Layout from "../layout/admin/Layout";

const VocabularyManagement = ({ handleLogout }) => {
  const [collections, setCollections] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editingFlashcard, setEditingFlashcard] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [activeTab, setActiveTab] = useState("collections");
  const [searchTerm, setSearchTerm] = useState("");

  const [collectionForm, setCollectionForm] = useState({
    title: "",
    description: "",
    level: "beginner",
    category: "",
    tags: "",
    is_public: true,
    display_order: 0,
  });

  const [flashcardForm, setFlashcardForm] = useState({
    word: "",
    meaning: "",
    pronunciation: "",
    example_sentence: "",
    example_meaning: "",
    part_of_speech: "noun",
    synonyms: "",
    antonyms: "",
    tags: "",
    difficulty_level: "medium",
    display_order: 0,
  });

  const [questionForm, setQuestionForm] = useState({
    question_type: "multiple_choice",
    question_text: "",
    options: "",
    correct_answer: "",
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async (filters = {}) => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (filters.level) params.append("level", filters.level);
      if (filters.category) params.append("category", filters.category);

      const response = await axios.get(
        `http://localhost:5000/api/vocabulary/collections?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCollections(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách bộ từ vựng");
    }
  };

  const fetchFlashcards = async (collectionId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/vocabulary/flashcards?collection_id=${collectionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFlashcards(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách flashcards");
    }
  };

  const fetchQuestions = async (collectionId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/vocabulary/questions?collection_id=${collectionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQuestions(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách câu hỏi");
    }
  };

  const searchVocabulary = async (term) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/vocabulary/search?q=${encodeURIComponent(
          term
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm từ vựng");
      return [];
    }
  };

  const handleCollectionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (editingCollection) {
        await axios.put(
          `http://localhost:5000/api/vocabulary/collections/${editingCollection.id}`,
          collectionForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Bộ từ vựng đã được cập nhật");
      } else {
        await axios.post(
          "http://localhost:5000/api/vocabulary/collections",
          collectionForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Bộ từ vựng đã được tạo");
      }

      setShowCollectionModal(false);
      setEditingCollection(null);
      setCollectionForm({
        title: "",
        description: "",
        level: "beginner",
        category: "",
        tags: "",
        is_public: true,
        display_order: 0,
      });
      fetchCollections();
    } catch (error) {
      toast.error("Lỗi khi lưu bộ từ vựng");
    }
  };

  const handleFlashcardSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Append all text fields
      Object.keys(flashcardForm).forEach((key) => {
        if (["synonyms", "antonyms", "tags"].includes(key)) {
          // Convert string to array
          const arrayValue = flashcardForm[key]
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item);
          formData.append(key, JSON.stringify(arrayValue));
        } else {
          formData.append(key, flashcardForm[key]);
        }
      });

      // Append files
      const audioFile = e.target.elements.audio.files[0];
      if (audioFile) {
        formData.append("audio", audioFile);
      }

      const imageFile = e.target.elements.image.files[0];
      if (imageFile) {
        formData.append("image", imageFile);
      }

      formData.append("collection_id", currentCollection.id);

      if (editingFlashcard) {
        await axios.put(
          `http://localhost:5000/api/vocabulary/flashcards/${editingFlashcard.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Flashcard đã được cập nhật");
      } else {
        await axios.post(
          "http://localhost:5000/api/vocabulary/flashcards",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Flashcard đã được thêm");
      }

      setShowFlashcardModal(false);
      setEditingFlashcard(null);
      setFlashcardForm({
        word: "",
        meaning: "",
        pronunciation: "",
        example_sentence: "",
        example_meaning: "",
        part_of_speech: "noun",
        synonyms: "",
        antonyms: "",
        tags: "",
        difficulty_level: "medium",
        display_order: 0,
      });
      if (currentCollection) {
        fetchFlashcards(currentCollection.id);
      }
    } catch (error) {
      toast.error("Lỗi khi lưu flashcard");
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (editingQuestion) {
        await axios.put(
          `http://localhost:5000/api/vocabulary/questions/${editingQuestion.id}`,
          questionForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Câu hỏi đã được cập nhật");
      } else {
        await axios.post(
          "http://localhost:5000/api/vocabulary/questions",
          { ...questionForm, collection_id: currentCollection.id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Câu hỏi đã được tạo");
      }

      setShowQuestionModal(false);
      setEditingQuestion(null);
      setQuestionForm({
        question_type: "multiple_choice",
        question_text: "",
        options: "",
        correct_answer: "",
      });
      if (currentCollection) {
        fetchQuestions(currentCollection.id);
      }
    } catch (error) {
      toast.error("Lỗi khi lưu câu hỏi");
    }
  };

  const deleteCollection = (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ không thể khôi phục lại bộ từ vựng này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Vâng, xóa nó đi!",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(
            `http://localhost:5000/api/vocabulary/collections/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          Swal.fire("Đã xóa!", "Bộ từ vựng của bạn đã được xóa.", "success");
          fetchCollections();
        } catch (error) {
          Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa bộ từ vựng.", "error");
        }
      }
    });
  };

  const deleteFlashcard = (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ không thể khôi phục lại flashcard này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Vâng, xóa nó đi!",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(
            `http://localhost:5000/api/vocabulary/flashcards/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          Swal.fire("Đã xóa!", "Flashcard của bạn đã được xóa.", "success");
          if (currentCollection) {
            fetchFlashcards(currentCollection.id);
          }
        } catch (error) {
          Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa flashcard.", "error");
        }
      }
    });
  };

  const deleteQuestion = (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ không thể khôi phục lại câu hỏi này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Vâng, xóa nó đi!",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(
            `http://localhost:5000/api/vocabulary/questions/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          Swal.fire("Đã xóa!", "Câu hỏi của bạn đã được xóa.", "success");
          if (currentCollection) {
            fetchQuestions(currentCollection.id);
          }
        } catch (error) {
          Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa câu hỏi.", "error");
        }
      }
    });
  };

  const openCollectionModal = (collection = null) => {
    if (collection) {
      setEditingCollection(collection);
      setCollectionForm({
        title: collection.title,
        description: collection.description,
        level: collection.level,
        category: collection.category || "",
        tags: Array.isArray(collection.tags)
          ? collection.tags.join(", ")
          : collection.tags || "",
        is_public: collection.is_public,
        display_order: collection.display_order,
      });
    } else {
      setEditingCollection(null);
      setCollectionForm({
        title: "",
        description: "",
        level: "beginner",
        category: "",
        tags: "",
        is_public: true,
        display_order: 0,
      });
    }
    setShowCollectionModal(true);
  };

  const openFlashcardModal = (flashcard = null) => {
    if (flashcard) {
      setEditingFlashcard(flashcard);
      setFlashcardForm({
        word: flashcard.word,
        meaning: flashcard.meaning,
        pronunciation: flashcard.pronunciation || "",
        example_sentence: flashcard.example_sentence || "",
        example_meaning: flashcard.example_meaning || "",
        part_of_speech: flashcard.part_of_speech,
        synonyms: Array.isArray(flashcard.synonyms)
          ? flashcard.synonyms.join(", ")
          : flashcard.synonyms || "",
        antonyms: Array.isArray(flashcard.antonyms)
          ? flashcard.antonyms.join(", ")
          : flashcard.antonyms || "",
        tags: Array.isArray(flashcard.tags)
          ? flashcard.tags.join(", ")
          : flashcard.tags || "",
        difficulty_level: flashcard.difficulty_level,
        display_order: flashcard.display_order,
      });
    } else {
      setEditingFlashcard(null);
      setFlashcardForm({
        word: "",
        meaning: "",
        pronunciation: "",
        example_sentence: "",
        example_meaning: "",
        part_of_speech: "noun",
        synonyms: "",
        antonyms: "",
        tags: "",
        difficulty_level: "medium",
        display_order: flashcards.length + 1,
      });
    }
    setShowFlashcardModal(true);
  };

  const openQuestionModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        question_type: question.question_type,
        question_text: question.question_text,
        options: Array.isArray(question.options)
          ? question.options.join(", ")
          : question.options || "",
        correct_answer: question.correct_answer,
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        question_type: "multiple_choice",
        question_text: "",
        options: "",
        correct_answer: "",
      });
    }
    setShowQuestionModal(true);
  };

  const handleCollectionSelect = (collection) => {
    setCurrentCollection(collection);
    fetchFlashcards(collection.id);
    fetchQuestions(collection.id);
    setActiveTab("flashcards");
  };

  const getLevelBadgeVariant = (level) => {
    switch (level) {
      case "beginner":
        return "success";
      case "intermediate":
        return "warning";
      case "advanced":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getPartOfSpeechBadge = (pos) => {
    const variants = {
      noun: "primary",
      verb: "success",
      adjective: "warning",
      adverb: "info",
      preposition: "dark",
      conjunction: "secondary",
      interjection: "danger",
    };
    return variants[pos] || "secondary";
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const results = await searchVocabulary(searchTerm);
      setFlashcards(results);
    }
  };

  const exportCSV = async () => {
    if (!currentCollection) {
      toast.error("Vui lòng chọn một bộ từ vựng");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/vocabulary/export/csv?collection_id=${currentCollection.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // Tạo URL tải xuống
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `vocabulary-${currentCollection.title}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Đã xuất file CSV thành công");
    } catch (error) {
      toast.error("Lỗi khi xuất file CSV");
    }
  };

  return (
    <Layout handleLogout={handleLogout}>
      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Quản lý Từ vựng</h2>
          <div>
            <Button
              variant="outline-primary"
              className="me-2"
              onClick={() => openCollectionModal()}
            >
              Tạo Bộ Từ vựng
            </Button>
            <Button
              variant="primary"
              onClick={() => openFlashcardModal()}
              disabled={!currentCollection}
            >
              Thêm Flashcard
            </Button>
            <Button
              variant="success"
              onClick={() => openQuestionModal()}
              disabled={!currentCollection}
            >
              Thêm Câu hỏi
            </Button>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={(tab) => setActiveTab(tab)}
          className="mb-4"
        >
          <Tab eventKey="collections" title="Bộ Từ vựng">
            <Row>
              {collections.map((collection) => (
                <Col md={6} lg={4} key={collection.id} className="mb-4">
                  <Card className="h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="h6">
                          {collection.title}
                        </Card.Title>
                        <Badge bg={getLevelBadgeVariant(collection.level)}>
                          {collection.level}
                        </Badge>
                      </div>

                      <Card.Text className="text-muted small mb-2">
                        {collection.description}
                      </Card.Text>

                      <div className="mb-2">
                        <Badge bg="info" className="me-1">
                          {collection.total_cards} từ
                        </Badge>
                        {collection.category && (
                          <Badge bg="secondary" className="me-1">
                            {collection.category}
                          </Badge>
                        )}
                      </div>

                      {collection.tags &&
                        JSON.parse(collection.tags).length > 0 && (
                          <div className="mb-2">
                            {JSON.parse(collection.tags)
                              .slice(0, 3)
                              .map((tag, index) => (
                                <Badge
                                  key={index}
                                  bg="light"
                                  text="dark"
                                  className="me-1 small"
                                >
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        )}
                    </Card.Body>
                    <Card.Footer>
                      <div className="d-flex justify-content-end">
                        <Button
                          className="me-2"
                          variant="outline-info"
                          size="sm"
                          onClick={() => openCollectionModal(collection)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleCollectionSelect(collection)}
                        >
                          Xem Flashcards
                        </Button>
                        <Button
                          className="ms-2"
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteCollection(collection.id)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>

            {collections.length === 0 && (
              <div className="text-center py-5">
                <p>Chưa có bộ từ vựng nào.</p>
                <Button variant="primary" onClick={() => openCollectionModal()}>
                  Tạo Bộ Từ vựng Đầu tiên
                </Button>
              </div>
            )}
          </Tab>

          <Tab eventKey="flashcards" title="Flashcards">
            <div className="mb-3">
              {currentCollection && (
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Flashcards trong: {currentCollection.title}</h5>
                  <div>
                    <Button
                      variant="outline-success"
                      size="sm"
                      className="me-2"
                      onClick={exportCSV}
                    >
                      Export CSV
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setCurrentCollection(null)}
                    >
                      Xem tất cả bộ từ vựng
                    </Button>
                  </div>
                </div>
              )}

              <Form onSubmit={handleSearch}>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm từ vựng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-primary" type="submit">
                    Tìm kiếm
                  </Button>
                </InputGroup>
              </Form>
            </div>

            <Row>
              {flashcards.map((flashcard) => (
                <Col md={6} lg={4} key={flashcard.id} className="mb-4">
                  <Card className="h-100 flashcard">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="h5 text-primary">
                          {flashcard.word}
                        </Card.Title>
                        <Badge
                          bg={getPartOfSpeechBadge(flashcard.part_of_speech)}
                        >
                          {flashcard.part_of_speech}
                        </Badge>
                      </div>

                      <Card.Text className="mb-2">
                        <strong>Nghĩa:</strong> {flashcard.meaning}
                      </Card.Text>

                      {flashcard.pronunciation && (
                        <Card.Text className="text-muted small mb-2">
                          <strong>Phát âm:</strong> /{flashcard.pronunciation}/
                        </Card.Text>
                      )}

                      {flashcard.example_sentence && (
                        <Card.Text className="mb-2">
                          <strong>Ví dụ:</strong> {flashcard.example_sentence}
                        </Card.Text>
                      )}

                      {flashcard.example_meaning && (
                        <Card.Text className="text-muted small mb-2">
                          {flashcard.example_meaning}
                        </Card.Text>
                      )}

                      {(flashcard.synonyms.length > 0 ||
                        flashcard.antonyms.length > 0) && (
                        <div className="mb-2">
                          {flashcard.synonyms.length > 0 && (
                            <div>
                              <strong>Đồng nghĩa:</strong>{" "}
                              {flashcard.synonyms.join(", ")}
                            </div>
                          )}
                          {flashcard.antonyms.length > 0 && (
                            <div>
                              <strong>Trái nghĩa:</strong>{" "}
                              {flashcard.antonyms.join(", ")}
                            </div>
                          )}
                        </div>
                      )}

                      {flashcard.tags.length > 0 && (
                        <div className="mb-2">
                          {flashcard.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              bg="light"
                              text="dark"
                              className="me-1 small"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                    <Card.Footer>
                      <div className="d-flex justify-content-between">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => openFlashcardModal(flashcard)}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteFlashcard(flashcard.id)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>

            {flashcards.length === 0 && (
              <div className="text-center py-5">
                <p>Chưa có flashcard nào.</p>
                <Button
                  variant="primary"
                  onClick={() => openFlashcardModal()}
                  disabled={!currentCollection}
                >
                  Thêm Flashcard Đầu tiên
                </Button>
              </div>
            )}
          </Tab>

          <Tab eventKey="questions" title="Câu hỏi">
            <div className="mb-3">
              {currentCollection && (
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Câu hỏi trong: {currentCollection.title}</h5>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setCurrentCollection(null)}
                  >
                    Xem tất cả bộ từ vựng
                  </Button>
                </div>
              )}
            </div>

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Loại câu hỏi</th>
                  <th>Câu hỏi</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question, index) => (
                  <tr key={question.id}>
                    <td>{index + 1}</td>
                    <td>{question.question_type}</td>
                    <td>{question.question_text}</td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-2"
                        onClick={() => openQuestionModal(question)}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {questions.length === 0 && (
              <div className="text-center py-5">
                <p>Chưa có câu hỏi nào.</p>
                <Button
                  variant="primary"
                  onClick={() => openQuestionModal()}
                  disabled={!currentCollection}
                >
                  Thêm Câu hỏi Đầu tiên
                </Button>
              </div>
            )}
          </Tab>
        </Tabs>

        {/* Modal bộ từ vựng */}
        <Modal
          show={showCollectionModal}
          onHide={() => setShowCollectionModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingCollection ? "Sửa Bộ Từ vựng" : "Tạo Bộ Từ vựng Mới"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCollectionSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Tiêu đề</Form.Label>
                <Form.Control
                  type="text"
                  value={collectionForm.title}
                  onChange={(e) =>
                    setCollectionForm({
                      ...collectionForm,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={collectionForm.description}
                  onChange={(e) =>
                    setCollectionForm({
                      ...collectionForm,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Level</Form.Label>
                    <Form.Select
                      value={collectionForm.level}
                      onChange={(e) =>
                        setCollectionForm({
                          ...collectionForm,
                          level: e.target.value,
                        })
                      }
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chuyên mục</Form.Label>
                    <Form.Control
                      type="text"
                      value={collectionForm.category}
                      onChange={(e) =>
                        setCollectionForm({
                          ...collectionForm,
                          category: e.target.value,
                        })
                      }
                      placeholder="Ví dụ: TOEIC, IELTS, Business..."
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Tags (phân cách bằng dấu phẩy)</Form.Label>
                <Form.Control
                  type="text"
                  value={collectionForm.tags}
                  onChange={(e) =>
                    setCollectionForm({
                      ...collectionForm,
                      tags: e.target.value,
                    })
                  }
                  placeholder="business, travel, food..."
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Công khai"
                      checked={collectionForm.is_public}
                      onChange={(e) =>
                        setCollectionForm({
                          ...collectionForm,
                          is_public: e.target.checked,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thứ tự hiển thị</Form.Label>
                    <Form.Control
                      type="number"
                      value={collectionForm.display_order}
                      onChange={(e) =>
                        setCollectionForm({
                          ...collectionForm,
                          display_order: parseInt(e.target.value),
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowCollectionModal(false)}
              >
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                {editingCollection ? "Cập nhật" : "Tạo"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal flashcard */}
        <Modal
          show={showFlashcardModal}
          onHide={() => setShowFlashcardModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingFlashcard ? "Sửa Flashcard" : "Thêm Flashcard Mới"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleFlashcardSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Từ *</Form.Label>
                    <Form.Control
                      type="text"
                      value={flashcardForm.word}
                      onChange={(e) =>
                        setFlashcardForm({
                          ...flashcardForm,
                          word: e.target.value,
                        })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Loại từ *</Form.Label>
                    <Form.Select
                      value={flashcardForm.part_of_speech}
                      onChange={(e) =>
                        setFlashcardForm({
                          ...flashcardForm,
                          part_of_speech: e.target.value,
                        })
                      }
                    >
                      <option value="noun">Danh từ</option>
                      <option value="verb">Động từ</option>
                      <option value="adjective">Tính từ</option>
                      <option value="adverb">Trạng từ</option>
                      <option value="preposition">Giới từ</option>
                      <option value="conjunction">Liên từ</option>
                      <option value="interjection">Thán từ</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Nghĩa *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={flashcardForm.meaning}
                  onChange={(e) =>
                    setFlashcardForm({
                      ...flashcardForm,
                      meaning: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phát âm (IPA)</Form.Label>
                <Form.Control
                  type="text"
                  value={flashcardForm.pronunciation}
                  onChange={(e) =>
                    setFlashcardForm({
                      ...flashcardForm,
                      pronunciation: e.target.value,
                    })
                  }
                  placeholder="/prəˌnʌn.siˈeɪ.ʃən/"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Câu ví dụ</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={flashcardForm.example_sentence}
                  onChange={(e) =>
                    setFlashcardForm({
                      ...flashcardForm,
                      example_sentence: e.target.value,
                    })
                  }
                  placeholder="She speaks English fluently."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nghĩa câu ví dụ</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={flashcardForm.example_meaning}
                  onChange={(e) =>
                    setFlashcardForm({
                      ...flashcardForm,
                      example_meaning: e.target.value,
                    })
                  }
                  placeholder="Cô ấy nói tiếng Anh trôi chảy."
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Từ đồng nghĩa (phân cách bằng dấu phẩy)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={flashcardForm.synonyms}
                      onChange={(e) =>
                        setFlashcardForm({
                          ...flashcardForm,
                          synonyms: e.target.value,
                        })
                      }
                      placeholder="happy, joyful, delighted"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Từ trái nghĩa (phân cách bằng dấu phẩy)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={flashcardForm.antonyms}
                      onChange={(e) =>
                        setFlashcardForm({
                          ...flashcardForm,
                          antonyms: e.target.value,
                        })
                      }
                      placeholder="sad, unhappy, miserable"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Tags (phân cách bằng dấu phẩy)</Form.Label>
                <Form.Control
                  type="text"
                  value={flashcardForm.tags}
                  onChange={(e) =>
                    setFlashcardForm({ ...flashcardForm, tags: e.target.value })
                  }
                  placeholder="common, formal, informal"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Độ khó</Form.Label>
                    <Form.Select
                      value={flashcardForm.difficulty_level}
                      onChange={(e) =>
                        setFlashcardForm({
                          ...flashcardForm,
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
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thứ tự hiển thị</Form.Label>
                    <Form.Control
                      type="number"
                      value={flashcardForm.display_order}
                      onChange={(e) =>
                        setFlashcardForm({
                          ...flashcardForm,
                          display_order: parseInt(e.target.value),
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>File phát âm (audio)</Form.Label>
                    <Form.Control type="file" accept="audio/*" name="audio" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hình ảnh minh họa</Form.Label>
                    <Form.Control type="file" accept="image/*" name="image" />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowFlashcardModal(false)}
              >
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                {editingFlashcard ? "Cập nhật" : "Thêm"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal câu hỏi */}
        <Modal
          show={showQuestionModal}
          onHide={() => setShowQuestionModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingQuestion ? "Sửa Câu hỏi" : "Tạo Câu hỏi Mới"}
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
                  <option value="multiple_choice">Trắc nghiệm</option>
                  <option value="fill_in_the_blank">Điền vào chỗ trống</option>
                  <option value="translation">Dịch</option>
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
                <Form.Label>Lựa chọn (phân cách bằng dấu phẩy)</Form.Label>
                <Form.Control
                  type="text"
                  value={questionForm.options}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      options: e.target.value,
                    })
                  }
                  placeholder="Lựa chọn 1, Lựa chọn 2, Lựa chọn 3"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Đáp án đúng</Form.Label>
                <Form.Control
                  type="text"
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
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowQuestionModal(false)}
              >
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                {editingQuestion ? "Cập nhật" : "Tạo"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default VocabularyManagement;
