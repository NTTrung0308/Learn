import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./components/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";
import AuthSuccess from "./pages/AuthSuccess";

function App() {
  const [isAuthenticated, setAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuth(true);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Login setAuth={setAuth} />
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? <Dashboard /> : <Login setAuth={setAuth} />
            }
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/success" element={<AuthSuccess setAuth={setAuth} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
