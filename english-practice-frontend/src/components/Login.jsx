import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const Login = ({ setAuth, setUserRole, setUserId }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLoginSuccess = useCallback(
    (token, role, id) => {
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", id);

      setAuth(true);
      setUserRole(role);
      if (typeof setUserId === "function") setUserId(id);

      toast.success("Đăng nhập thành công!");
      navigate(role === "superadmin" || role === "admin" ? "/dashboard" : "/");
    },
    [navigate, setAuth, setUserRole, setUserId]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      handleLoginSuccess(res.data.token, res.data.user.role, res.data.user.id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleFacebookLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/facebook";
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const role = urlParams.get("role");
    const id = urlParams.get("id");
    if (token && role && id) handleLoginSuccess(token, role, id);
  }, [handleLoginSuccess]);

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
        background: "rgba(255, 255, 255, 0.75)", 
        border: "2px solid rgba(0, 123, 255, 0.5)", 
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(10px)", 
        transition: "all 0.3s ease",
      }}
    >
      <h3 className="text-center mb-4 fw-bold text-primary">Đăng nhập</h3>

      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label text-primary fw-semibold">Email</label>
          <input
            type="email"
            className="form-control border-primary"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Nhập email"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-primary fw-semibold">Mật khẩu</label>
          <input
            type="password"
            className="form-control border-primary"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Nhập mật khẩu"
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
          Đăng nhập
        </button>
      </form>

      <div className="d-flex justify-content-between mb-3">
        <Link to="/forgot-password" className="text-decoration-none small text-primary">
          Quên mật khẩu?
        </Link>
        <Link to="/register" className="text-decoration-none small text-primary">
          Đăng ký
        </Link>
      </div>

      <div className="text-center text-muted mb-3">Hoặc đăng nhập bằng</div>

      <div className="d-flex justify-content-between">
        <button
          onClick={handleGoogleLogin}
          className="btn w-50 me-2"
          style={{ backgroundColor: "#DB4437", color: "white" }}
        >
          <i className="bi bi-google me-1"></i> Google
        </button>

        <button
          onClick={handleFacebookLogin}
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

export default Login;
