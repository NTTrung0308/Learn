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
import Dashboard from "../components/admin/Dashboard";
import ExamManagement from "../components/admin/ExamManagement";
import GrammarManagement from "../components/admin/GrammarManagement";
import VocabularyManagement from "../components/admin/VocabularyManagement";

function AppRoutes({
  isAuthenticated,
  userRole,
  userId,
  setAuth,
  setUserRole,
  setUserId,
}) {
  return (
    <Routes>
      {/* Public Routes */}
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

      {/* Protected User Routes */}
      <Route
        path="/profile"
        element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
      />

      {/* Admin Routes */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated &&
          (userRole === "superadmin" || userRole === "admin") ? (
            <Dashboard />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/exam-management"
        element={
          isAuthenticated &&
          (userRole === "superadmin" || userRole === "admin") ? (
            <ExamManagement />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/grammar-management"
        element={
          isAuthenticated &&
          (userRole === "superadmin" || userRole === "admin") ? (
            <GrammarManagement />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/vocabulary-management"
        element={
          isAuthenticated &&
          (userRole === "superadmin" || userRole === "admin") ? (
            <VocabularyManagement />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
