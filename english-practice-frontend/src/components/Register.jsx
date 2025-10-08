import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const { email, phone, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      toast.success(res.data.message || "Đăng ký thành công!");
    } catch (err) {
      console.error("Lỗi khi đăng ký:", err.response?.data);
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleFacebookRegister = () => {
    window.location.href = "http://localhost:5000/api/auth/facebook";
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=60')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          width: "400px",
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.75)", // 👈 độ trong suốt
          border: "2px solid rgba(0, 123, 255, 0.5)", // viền xanh nhạt
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(10px)", // 👈 hiệu ứng kính mờ
          transition: "all 0.3s ease",
        }}
      >
        <h3 className="text-center mb-4 fw-bold text-primary">Đăng ký tài khoản</h3>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label text-primary fw-semibold">Email</label>
            <input
              type="email"
              className="form-control border-primary"
              placeholder="Nhập email"
              name="email"
              value={email}
              onChange={onChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-primary fw-semibold">Số điện thoại</label>
            <input
              type="text"
              className="form-control border-primary"
              placeholder="Nhập số điện thoại (tùy chọn)"
              name="phone"
              value={phone}
              onChange={onChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-primary fw-semibold">Mật khẩu</label>
            <input
              type="password"
              className="form-control border-primary"
              placeholder="Nhập mật khẩu"
              name="password"
              value={password}
              onChange={onChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            style={{
              fontWeight: "bold",
              backgroundColor: "#007bff",
              border: "none",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Đăng ký
          </button>
        </form>

        <div className="text-center small mb-3">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-decoration-none text-primary fw-semibold">
            Đăng nhập ngay
          </Link>
        </div>

        <div className="text-center text-muted mb-3">Hoặc đăng ký bằng</div>

        <div className="d-flex justify-content-between">
          <button
            onClick={handleGoogleRegister}
            className="btn w-50 me-2"
            style={{ backgroundColor: "#DB4437", color: "white" }}
          >
            <i className="bi bi-google me-1"></i> Google
          </button>

          <button
            onClick={handleFacebookRegister}
            className="btn w-50"
            style={{ backgroundColor: "#4267B2", color: "white" }}
          >
            <i className="bi bi-facebook me-1"></i> Facebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
