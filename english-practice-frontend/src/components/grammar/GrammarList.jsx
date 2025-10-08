import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-toastify';

const GrammarList = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch topics and lessons in parallel
        const [topicsRes, lessonsRes] = await Promise.all([
          api.get('/grammar/topics'),
          api.get('/grammar/lessons') 
        ]);

        const topicsData = topicsRes.data.topics || [];
        const lessonsData = lessonsRes.data.lessons || [];

        // Map lessons to their topics
        const topicsWithLessons = topicsData.map(topic => ({
          ...topic,
          lessons: lessonsData.filter(lesson => lesson.topic_id === topic.id)
        }));

        setTopics(topicsWithLessons);

      } catch (error) {
        console.error('Error fetching grammar data:', error);
        toast.error('Không thể tải dữ liệu ngữ pháp.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="text-center mb-5">
        <h1 className="display-4">Ngữ Pháp Tiếng Anh</h1>
        <p className="lead text-muted">Chọn một chủ đề để bắt đầu học và làm bài tập.</p>
      </div>

      {topics.length === 0 ? (
        <div className="text-center">
          <p>Chưa có chủ đề ngữ pháp nào.</p>
        </div>
      ) : (
        <div className="row">
          {topics.map((topic) => (
            <div key={topic.id} className="col-md-12 mb-4">
              <div className="card shadow-sm">
                <div className="card-header">
                  <h4 className="mb-0">{topic.title}</h4>
                </div>
                <div className="card-body">
                  <p className="card-text">{topic.description}</p>
                  <ul className="list-group list-group-flush">
                    {topic.lessons && topic.lessons.length > 0 ? (
                      topic.lessons.map(lesson => (
                        <li key={lesson.id} className="list-group-item d-flex justify-content-between align-items-center">
                          {lesson.title}
                          <Link to={`/grammar/learn/${lesson.id}`} className="btn btn-sm btn-outline-primary">
                            Bắt đầu học <i className="fas fa-arrow-right ms-1"></i>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item">Chưa có bài học nào trong chủ đề này.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrammarList;
