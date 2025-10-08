import React, { useState } from "react";
// import './ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Lấy token từ URL
  const getTokenFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("token");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Kiểm tra mật khẩu
    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp!");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự!");
      setIsLoading(false);
      return;
    }

    const token = getTokenFromURL();

    if (!token) {
      setMessage("Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập bằng mật khẩu mới."
        );
        setSuccess(true);
      } else {
        setMessage(data.message || "Có lỗi xảy ra khi đặt lại mật khẩu.");
      }
    } catch (error) {
      setMessage("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Nếu không có token, hiển thị thông báo lỗi
  if (!getTokenFromURL()) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <h2>Đặt Lại Mật Khẩu</h2>
          <div className="error-message">
            Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </div>
          <a href="/login" className="back-to-login">
            Quay lại trang đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Đặt Lại Mật Khẩu</h2>

        {success ? (
          <div className="success-section">
            <div className="success-icon">✓</div>
            <p className="success-message">{message}</p>
            <a href="/login" className="login-button">
              Đăng Nhập
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu mới</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            {message && (
              <div
                className={`message ${
                  success ? "success-message" : "error-message"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
            </button>

            <a href="/login" className="back-to-login">
              Quay lại trang đăng nhậpfghfg h
            </a>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
