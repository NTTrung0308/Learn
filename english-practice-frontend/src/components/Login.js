import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const Login = ({ setAuth, setUserRole, setUserId }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ gom xử lý login thành công vào 1 hàm
  const handleLoginSuccess = useCallback(
    (token, role, id) => {
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", id);

      setAuth(true);
      setUserRole(role);
      if (typeof setUserId === "function") setUserId(id);

      toast.success("Đăng nhập thành công!");

      if (role === "superadmin" || role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    },
    [navigate, setAuth, setUserRole, setUserId]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

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

    if (token && role && id) {
      handleLoginSuccess(token, role, id);
    }
  }, [navigate, setAuth, setUserRole, setUserId, handleLoginSuccess]);
  // Đã thêm handleLoginSuccess vào dependency array

  return (
    <div>
  
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={onChange}
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={onChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <hr />
      <button
        onClick={handleGoogleLogin}
        style={{ background: "#4285F4", color: "#fff", margin: "5px" }}
      >
        Login with Google
      </button>
      <button
        onClick={handleFacebookLogin}
        style={{ background: "#4267B2", color: "#fff", margin: "5px" }}
      >
        Login with Facebook
      </button>
    </div>
  );
};

export default Login;
