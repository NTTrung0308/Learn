import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";
import {
  Card,
  Button,
  ProgressBar,
  Container,
  Row,
  Col,
} from "react-bootstrap";

const SelfTestQuiz = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizData();
  }, [collectionId]);

  const fetchQuizData = async () => {
    try {
      const [collectionRes, questionsRes] = await Promise.all([
        api.get(`/vocabulary/collections/${collectionId}`),
        api.get(`/vocabulary/questions?collection_id=${collectionId}`),
      ]);
      setCollection(collectionRes.data);
      setQuestions(questionsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      toast.error("Không thể tải dữ liệu cho bài kiểm tra.");
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer,
    });
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <ProgressBar animated now={100} />
          <p className="mt-3">Loading quiz...</p>
        </div>
      </Container>
    );
  }

  if (showResults) {
    const score = questions.reduce((acc, question) => {
      return userAnswers[question.id] === question.correct_answer
        ? acc + 1
        : acc;
    }, 0);

    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="text-center">
              <Card.Header as="h2">Quiz Results</Card.Header>
              <Card.Body>
                <Card.Title>
                  Your score: {score} / {questions.length}
                </Card.Title>
                <Card.Text>
                  You have completed the quiz for the collection:
                  <strong>{collection.title}</strong>
                </Card.Text>
                <Link to={`/vocabulary-collections/${collectionId}`}>
                  <Button variant="primary">Back to Collection</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const options =
    currentQuestion && Array.isArray(currentQuestion.options)
      ? currentQuestion.options
      : [];

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h2">
              {collection?.title} - Self-Test Quiz
            </Card.Header>
            <Card.Body>
              {currentQuestion && (
                <div>
                  <Card.Title className="mb-4">
                    {currentQuestion.question_text}
                  </Card.Title>
                  <div className="d-grid gap-2">
                    {options.map((option, index) => (
                      <Button
                        key={index}
                        variant={
                          userAnswers[currentQuestion.id] === option
                            ? "primary"
                            : "outline-primary"
                        }
                        onClick={() =>
                          handleAnswerSelect(currentQuestion.id, option)
                        }
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {currentQuestionIndex < questions.length - 1 ? (
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex(currentQuestionIndex + 1)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmitQuiz}>Submit</Button>
              )}
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SelfTestQuiz;
