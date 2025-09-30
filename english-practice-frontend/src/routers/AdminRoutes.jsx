import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import ExamManagement from "../components/ExamManagement";
import GrammarManagement from "../components/GrammarManagement";

function AdminRoutes({ isAuthenticated, userRole }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="exam-management" element={<ExamManagement />} />
       <Route path="grammar-management" element={<GrammarManagement />} />
    </Routes>
  );
}

export default AdminRoutes;