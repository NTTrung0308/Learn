import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../components/admin/Dashboard";
import ExamManagement from "../components/admin/ExamManagement";
import GrammarManagement from "../components/admin/GrammarManagement";
import VocabularyManagement from "../components/admin/VocabularyManagement";

function AdminRoutes({ isAuthenticated, userRole }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="exam-management" element={<ExamManagement />} />
      <Route path="grammar-management" element={<GrammarManagement />} />
      <Route path="vocabulary-management" element={<VocabularyManagement />} />
    </Routes>
  );
}

export default AdminRoutes;
