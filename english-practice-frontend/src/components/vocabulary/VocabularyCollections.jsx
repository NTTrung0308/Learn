import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api";

const VocabularyCollections = ({ isAuthenticated }) => {
  const [collections, setCollections] = useState([]);
  const [learningProgress, setLearningProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const [collectionsRes, progressRes] = await Promise.all([
        api.get("/vocabulary/collections"),
        isAuthenticated
          ? api.get("/vocabulary/learning/progress")
          : Promise.resolve({ data: [] }),
      ]);

      setCollections(collectionsRes.data);

      // Tạo map progress theo collection
      const progressMap = {};
      progressRes.data.forEach((item) => {
        if (!progressMap[item.collection_id]) {
          progressMap[item.collection_id] = [];
        }
        progressMap[item.collection_id].push(item);
      });
      setLearningProgress(progressMap);
      setLoading(false);
    } catch (error) {
      // console.error("Error fetching collections:", error);
      toast.error("Không thể tải danh sách bộ từ vựng");
      setLoading(false);
    }
  };

  const getProgressStats = (collectionId) => {
    const progress = learningProgress[collectionId] || [];
    const totalCards =
      collections.find((c) => c.id === collectionId)?.total_cards || 0;
    const mastered = progress.filter((p) => p.status === "mastered").length;
    const learning = progress.filter((p) => p.status === "learning").length;

    return {
      mastered,
      learning,
      total: totalCards,
      progress: totalCards > 0 ? Math.round((mastered / totalCards) * 100) : 0,
    };
  };

  const filteredCollections = collections.filter((collection) => {
    const matchesSearch =
      collection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !levelFilter || collection.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <div className="vocabulary-collections-container">
        <div className="container">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            {/* <p>Đang tải danh sách bộ từ vựng...</p> */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vocabulary-collections-container">
      <div className="container">
        <div className="collections-header">
          <h1>Học Từ Vựng với Flashcard</h1>
          <p>Hệ thống Spaced Repetition giúp bạn ghi nhớ từ vựng hiệu quả</p>
        </div>

        <div className="collections-filters">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm bộ từ vựng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-select">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="">Tất cả trình độ</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="collections-grid">
          {filteredCollections.length === 0 ? (
            <div className="no-collections">
              <i className="fas fa-book"></i>
              <h3>Không tìm thấy bộ từ vựng phù hợp</h3>
              <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
          ) : (
            filteredCollections.map((collection) => {
              const stats = getProgressStats(collection.id);

              return (
                <div key={collection.id} className="collection-card">
                  <div className="collection-card-header">
                    <span className={`collection-level ${collection.level}`}>
                      {collection.level}
                    </span>
                    <span className="collection-category">
                      {collection.category}
                    </span>
                  </div>
                  <div className="collection-card-body">
                    <h3>{collection.title}</h3>
                    <p>{collection.description}</p>

                    {isAuthenticated && (
                      <div className="progress-section">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${stats.progress}%` }}
                          ></div>
                        </div>
                        <div className="progress-stats">
                          <span>{stats.progress}% đã thuộc</span>
                          <span>
                            {stats.mastered}/{stats.total} từ
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="collection-stats">
                      <span>
                        <i className="fas fa-list"></i> {collection.total_cards} từ
                      </span>
                      <span>
                        <i className="fas fa-user"></i> {collection.creator_name}
                      </span>
                    </div>
                  </div>
                  <div className="collection-card-footer">
                    {isAuthenticated ? (
                      <Link
                        to={`/vocabulary-collections/${collection.id}/study`}
                        className="btn btn-primary"
                      >
                        {stats.learning > 0
                          ? `Tiếp tục học (${stats.learning})`
                          : "Bắt đầu học"}
                      </Link>
                    ) : (
                      <Link to="/login" className="btn btn-primary">
                        Đăng nhập để học
                      </Link>
                    )}
                    <Link
                      to={`/vocabulary-collections/${collection.id}/preview`}
                      className="btn btn-outline"
                    >
                      Xem trước
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabularyCollections;