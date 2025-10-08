import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, { email });
      setSent(true);
      toast.success("Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư!");
    } catch (err) {
      console.error("Lỗi khi gửi email:", err);
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
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ width: "400px", borderRadius: "1rem" }}>
        <h3 className="text-center mb-3 text-primary fw-bold">🔑 Quên Mật Khẩu</h3>

        {sent ? (
          <div className="text-center">
            <p className="text-success fw-semibold">
              📧 Vui lòng kiểm tra email để đặt lại mật khẩu.
            </p>
            <p className="text-muted">Nếu không thấy, hãy kiểm tra thư mục spam.</p>
            <button
              className="btn btn-outline-primary mt-3 w-100"
              onClick={() => setSent(false)}
            >
              Gửi lại yêu cầu
            </button>
          </div>
        ) : (
          <>
            <p className="text-muted text-center">
              Nhập email để nhận liên kết đặt lại mật khẩu.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold py-2"
                disabled={isLoading}
              >
                {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </form>
          </>
        )}

        <div className="text-center mt-3">
          <a href="/login" className="text-decoration-none">
            ← Quay lại đăng nhập
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
