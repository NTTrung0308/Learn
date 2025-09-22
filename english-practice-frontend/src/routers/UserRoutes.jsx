import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../components/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import ForgotPassword from "../components/ForgotPassword";
import ResetPassword from "../components/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail";
import AuthSuccess from "../pages/AuthSuccess";
import Profile from "../components/Profile";

function UserRoutes({
  isAuthenticated,
  userRole,
  userId,
  setAuth,
  setUserRole,
  setUserId,
}) {
  return (
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
          isAuthenticated ? (
            userRole === "superadmin" || userRole === "admin" ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/" />
            )
          ) : (
            <Login
              setAuth={setAuth}
              setUserRole={setUserRole}
              setUserId={setUserId}
            />
          )
        }
      />
      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <Profile />
          ) : (
            <Login setAuth={setAuth} setUserRole={setUserRole} />
          )
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/auth/success"
        element={
          <AuthSuccess
            setAuth={setAuth}
            setUserRole={setUserRole}
            setUserId={setUserId}
          />
        }
      />
    </Routes>
  );
}

export default UserRoutes;
