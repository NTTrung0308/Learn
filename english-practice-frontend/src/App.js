import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./components/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import AuthSuccess from "./pages/AuthSuccess";
import Home from "./components/Home"; // Thêm component Home

function App() {
  const [isAuthenticated, setAuth] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (token) {
      setAuth(true);
      setUserRole(role);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <Home isAuthenticated={isAuthenticated} userRole={userRole} />
            }
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/login"
            element={<Login setAuth={setAuth} setUserRole={setUserRole} />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              isAuthenticated &&
              (userRole === "superadmin" || userRole === "admin") ? (
                <Dashboard />
              ) : (
                <Home isAuthenticated={isAuthenticated} userRole={userRole} />
              )
            }
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/auth/success"
            element={
              <AuthSuccess setAuth={setAuth} setUserRole={setUserRole} />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
