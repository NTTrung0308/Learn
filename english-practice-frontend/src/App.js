import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Register from "./components/Register";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./components/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import AuthSuccess from "./pages/AuthSuccess";
import Home from "./components/Home";
import Navbar from "./components/Navbar";

function App() {
  const [isAuthenticated, setAuth] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  // Hàm cập nhật state từ localStorage
  const syncAuthState = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const id = localStorage.getItem("userId");
    setAuth(!!token);
    setUserRole(role);
    setUserId(id);
  };

  useEffect(() => {
    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    setAuth(false);
    setUserRole(null);
    setUserId(null);
  };

  return (
    <>
    <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    <Router>
      <div className="App">
        {/* Thêm Navbar để hiển thị trạng thái đăng nhập */}
        <Navbar 
          isAuthenticated={isAuthenticated} 
          userRole={userRole} 
          onLogout={handleLogout} 
        />
        
        <Routes>
          <Route
            path="/"
            element={
              <Home 
                isAuthenticated={isAuthenticated} 
                userRole={userRole} 
                userId={userId} 
              />
            }
          />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                (userRole === "superadmin" || userRole === "admin" ? 
                  <Navigate to="/dashboard" /> : 
                  <Navigate to="/" />) : 
                <Login setAuth={setAuth} setUserRole={setUserRole} setUserId={setUserId} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated && (userRole === "superadmin" || userRole === "admin") ? 
                <Dashboard /> : 
                <Navigate to="/" />
            } 
          />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/auth/success"
            element={
              <AuthSuccess setAuth={setAuth} setUserRole={setUserRole} setUserId={setUserId} />
            }
          />
        </Routes>
      </div>
    </Router>
    </>
  );
}

export default App;