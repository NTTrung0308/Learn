import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import ExamManagement from "../components/ExamManagement";

function AdminRoutes({ isAuthenticated, userRole }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="exam-management" element={<ExamManagement />} />
    </Routes>
  );
}

export default AdminRoutes;