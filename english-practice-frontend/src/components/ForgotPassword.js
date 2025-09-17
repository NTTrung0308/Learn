import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email,
      });
      setSent(true);
      toast.success(
        "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư!"
      );
    } catch (err) {
      console.error("Forgot password error:", err);
      if (err.code === "ERR_NETWORK") {
        toast.error("Không thể kết nối đến server. Vui lòng thử lại sau.");
      } else {
        toast.error(err.response?.data?.message || "Gửi email thất bại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Quên Mật Khẩu</h2>

        {sent ? (
          <div className="success-message">
            <p>Vui lòng kiểm tra email để đặt lại mật khẩu.</p>
            <p>Nếu không thấy email, hãy kiểm tra thư mục spam.</p>
            <button onClick={() => setSent(false)} className="try-again-button">
              Gửi lại yêu cầu
            </button>
          </div>
        ) : (
          <>
            <p>Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </form>
          </>
        )}

        <a href="/login" className="back-to-login">
          Quay lại đăng nhập
        </a>
      </div>
    </div>
  );
};

export default ForgotPassword;
