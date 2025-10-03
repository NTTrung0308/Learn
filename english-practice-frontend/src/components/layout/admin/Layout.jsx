import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children, handleLogout }) => {
  const [isSidebarMinimized, setSidebarMinimized] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarMinimized(!isSidebarMinimized);
    document.body.classList.toggle("sidebar_minimize");
  };

  useEffect(() => {
    // Đảm bảo DOM đã sẵn sàng
    if (typeof window !== "undefined" && window.$) {
      // Khởi tạo lại các plugin nếu cần
      try {
        // Gọi các hàm khởi tạo từ kaiadmin.js nếu cần
        if (window.initKaiAdmin) {
          window.initKaiAdmin();
        }
      } catch (error) {
        console.warn("Lỗi khởi tạo plugin:", error);
      }
    }
  }, [location.pathname]);

  return (
    <div className={`wrapper ${isSidebarMinimized ? "sidebar_minimize" : ""}`}>
      <Sidebar toggleSidebar={toggleSidebar} />
      <div className="main-panel">
        <Header toggleSidebar={toggleSidebar} handleLogout={handleLogout} />
        <div className="container">{children}</div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
