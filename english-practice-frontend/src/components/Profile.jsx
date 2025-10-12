import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../public/assets/css/style.css";

const Profile = () => {
  const [user, setUser] = useState({
    display_name: "",
    email: "",
    phone: "",
    avatar: "",
    learning_goal: "",
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [changePw, setChangePw] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/user/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data || {};
      setUser({
        display_name: data.display_name || "",
        email: data.email || "",
        phone: data.phone || "",
        avatar: data.avatar || "",
        learning_goal: data.learning_goal || "",
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Không thể tải thông tin người dùng");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    // Xem trước ảnh ngay
    if (e.target.files[0]) {
      const previewURL = URL.createObjectURL(e.target.files[0]);
      setUser({ ...user, avatar: previewURL });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("display_name", user.display_name);
      formData.append("phone", user.phone);
      formData.append("learning_goal", user.learning_goal);

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const response = await axios.put(
        "http://localhost:5000/api/user/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Cập nhật thông tin thành công!");
      setSelectedFile(null);

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Cập nhật thông tin thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handlePwChange = (e) => {
    setChangePw({ ...changePw, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (changePw.newPassword !== changePw.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }
    setPwLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/user/change-password",
        {
          oldPassword: changePw.oldPassword,
          newPassword: changePw.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Đổi mật khẩu thành công!");
      setChangePw({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setPwLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState("profile");
  const [learningHistory, setLearningHistory] = useState({
    examHistory: [],
    grammarHistory: [],
    vocabularyHistory: [],
  });

  useEffect(() => {
    if (activeTab === "history") {
      fetchLearningHistory();
    }
  }, [activeTab]);

  const fetchLearningHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/user/learning-history",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
            setLearningHistory({
        examHistory: [],
        grammarHistory: [],
        vocabularyHistory: [],
        ...response.data,
      });
    } catch (error) {
      console.error("Error fetching learning history:", error);
      toast.error("Không thể tải lịch sử học tập");
    }
  };

  const renderLearningHistory = () => (
    <div>
      <h3>Lịch sử học tập</h3>
      <div className="history-section">
        <h4>Lịch sử làm bài thi</h4>
        {learningHistory.examHistory.length > 0 ? (
          <ul>
            {learningHistory.examHistory.map((item) => (
              <li key={item.result_id}>
                <strong>{item.exam_title}</strong> - Điểm: {item.score} - Ngày:{" "}
                {new Date(item.submitted_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Chưa có lịch sử làm bài thi.</p>
        )}
      </div>
      <div className="history-section">
        <h4>Lịch sử học ngữ pháp</h4>
        {learningHistory.grammarHistory.length > 0 ? (
          <ul>
            {learningHistory.grammarHistory.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong> - Hoàn thành:{" "}
                {new Date(item.completed_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Chưa có lịch sử học ngữ pháp.</p>
        )}
      </div>
      <div className="history-section">
        <h4>Lịch sử học từ vựng</h4>
        {learningHistory.vocabularyHistory.length > 0 ? (
          <ul>
            {learningHistory.vocabularyHistory.map((item) => (
              <li key={item.id}>
                <strong>{item.collection_title}</strong> - Hoàn thành:{" "}
                {new Date(item.last_reviewed_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Chưa có lịch sử học từ vựng.</p>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>Hồ sơ cá nhân</h2>
      <div className="tab-buttons">
        <button
          onClick={() => setActiveTab("profile")}
          className={activeTab === "profile" ? "active" : ""}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={activeTab === "history" ? "active" : ""}
        >
          Lịch sử học tập
        </button>
      </div>

      {activeTab === "profile" ? (
        <div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label>Ảnh đại diện:</label>
              <div
                onClick={() => fileInputRef.current.click()}
                className="avatar-container"
              >
                {user.avatar ? (
                  <img
                    src={
                      user.avatar.startsWith("blob:")
                        ? user.avatar
                        : `http://localhost:5000${user.avatar}`
                    }
                    alt="Avatar"
                    className="avatar"
                  />
                ) : (
                  <div className="no-avatar">No Avatar</div>
                )}
                <span className="edit-avatar-icon">✏️</span>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>Họ và tên:</label>
              <input
                type="text"
                name="display_name"
                value={user.display_name}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={user.email}
                disabled
                style={{
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  backgroundColor: "#f5f5f5",
                }}
              />
              <small style={{ color: "#666" }}>
                Email không thể thay đổi
              </small>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>Số điện thoại:</label>
              <input
                type="text"
                name="phone"
                value={user.phone || ""}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>Mục tiêu học tập (target band IELTS):</label>
              <input
                type="text"
                name="learning_goal"
                value={user.learning_goal || ""}
                onChange={handleInputChange}
                placeholder="Ví dụ: IELTS 7.0"
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Đang xử lý..." : "Cập nhật thông tin"}
            </button>
          </form>

          <form onSubmit={handleChangePassword} style={{ marginTop: 32 }}>
            <h3>Đổi mật khẩu</h3>
            <div style={{ marginBottom: 10 }}>
              <input
                type="password"
                name="oldPassword"
                placeholder="Mật khẩu hiện tại"
                value={changePw.oldPassword}
                onChange={handlePwChange}
                style={{ width: "100%", padding: 8 }}
                required
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <input
                type="password"
                name="newPassword"
                placeholder="Mật khẩu mới"
                value={changePw.newPassword}
                onChange={handlePwChange}
                style={{ width: "100%", padding: 8 }}
                required
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
                value={changePw.confirmPassword}
                onChange={handlePwChange}
                style={{ width: "100%", padding: 8 }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={pwLoading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: pwLoading ? "not-allowed" : "pointer",
              }}
            >
              {pwLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      ) : (
        renderLearningHistory()
      )}
    </div>
  );
};

export default Profile;
