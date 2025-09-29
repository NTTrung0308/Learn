import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import AdminRoutes from "./routers/AdminRoutes";
import UserRoutes from "./routers/UserRoutes";
import AppRoutes from "./routers/AppRoutes";

function AppContent({
  isAuthenticated,
  userRole,
  userId,
  handleLogout,
  setAuth,
  setUserRole,
  setUserId,
  isLoading
}) {
  const location = useLocation();

  // Các route không hiển thị navbar
  const hideNavbarPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  // Hiển thị loading trong khi kiểm tra auth
  if (isLoading) {
    return <div>Loading...</div>; // Hoặc component loading của bạn
  }

  return (
    <>
      {!hideNavbarPaths.includes(location.pathname) && (
        <Navbar
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          onLogout={handleLogout}
        />
      )}

      <AppRoutes
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        userId={userId}
        setAuth={setAuth}
        setUserRole={setUserRole}
        setUserId={setUserId}
      />
    </>
  );
}

function App() {
  const [isAuthenticated, setAuth] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Thêm trạng thái loading

  const syncAuthState = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const id = localStorage.getItem("userId");
    setAuth(!!token);
    setUserRole(role);
    setUserId(id);
    setIsLoading(false); // Kết thúc loading sau khi lấy dữ liệu
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
      <ToastContainer position="top-right" autoClose={5000} />
      <Router>
        <AppContent
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          userId={userId}
          handleLogout={handleLogout}
          setAuth={setAuth}
          setUserRole={setUserRole}
          setUserId={setUserId}
          isLoading={isLoading}
        />
      </Router>
    </>
  );
}

export default App;