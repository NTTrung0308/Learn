// Navbar.jsx
import React from "react";
import { Link } from 'react-router-dom';
import './assets/css/style.css';

const Navbar = ({ isAuthenticated, userRole, userId }) => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-container">
          <Link to="/" className="logo">
            <i className="fas fa-language"></i>
            EnglishMaster
          </Link>
          
          <nav className="nav">
            <ul>
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/courses">Khóa học</Link></li>
              <li><Link to="/exams">Luyện thi</Link></li>
              <li><Link to="/grammar">Ngữ pháp</Link></li>
              <li><Link to="/vocabulary">Từ vựng</Link></li>
              <li><Link to="/about">Về chúng tôi</Link></li>
            </ul>
          </nav>
          
          <div className="auth-buttons">
            {isAuthenticated ? (
              <div className="user-menu">
                <span>Xin chào, {userId}</span>
                <Link to="/profile" className="btn btn-outline">Hồ sơ</Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">Đăng nhập</Link>
                <Link to="/register" className="btn btn-primary">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;