import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    // Kiểm tra nếu không phải admin thì chuyển hướng về home
    if (userRole !== "superadmin" && userRole !== "admin") {
      navigate("/");
    }
  }, [userRole, navigate]);

  if (userRole !== "superadmin" && userRole !== "admin") {
    return null; // Hoặc hiển thị loading
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin panel</p>
      {/* Nội dung dashboard */}
    </div>
  );
};

export default Dashboard;
