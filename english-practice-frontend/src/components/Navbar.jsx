import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = ({ isAuthenticated }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            "http://localhost:5000/api/user/profile",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top border-bottom">
      <div className="container">
        {/* Logo */}
        <Link
          className="navbar-brand fw-bold text-primary d-flex align-items-center"
          to="/"
          title="EnglishMaster - Trang chủ"
        >
          <i className="fas fa-language me-2 text-primary fs-4"></i>
          <span className="fs-4">English<span className="text-dark">Master</span></span>
        </Link>

        {/* Toggle for mobile */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            {[
              { path: "/", label: "Trang chủ" },
              { path: "/courses", label: "Khóa học" },
              { path: "/exams", label: "Luyện thi" },
              { path: "/grammar", label: "Ngữ pháp" },
              { path: "/vocabulary", label: "Từ vựng" },
              { path: "/about", label: "Về chúng tôi" },
            ].map((item, idx) => (
              <li className="nav-item px-2" key={idx}>
                <NavLink
                  end={item.path === "/"}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link position-relative fw-medium ${
                      isActive ? "text-primary" : "text-dark"
                    }`
                  }
                >
                  {item.label}
                  <span className="underline-hover"></span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Auth Buttons */}
          <div className="d-flex">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary rounded-pill px-3 dropdown-toggle d-flex align-items-center"
                  type="button"
                  id="userMenu"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="rounded-circle me-2"
                      style={{ width: "30px", height: "30px", objectFit: "cover" }}
                    />
                  ) : (
                    <i className="fas fa-user-circle me-2 fs-5"></i>
                  )}
                  {user ? user.display_name : "Người dùng"}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userMenu">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="fas fa-id-card me-2"></i> Hồ sơ
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/settings">
                      <i className="fas fa-cog me-2"></i> Cài đặt
                    </Link>
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => {
                        localStorage.removeItem("token");
                        window.location.reload();
                      }}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i> Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary rounded-pill me-2 px-3">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-primary rounded-pill px-3">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        .nav-link {
          transition: all 0.2s ease;
        }
        .nav-link .underline-hover {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 0%;
          background-color: #0d6efd;
          transition: width 0.3s ease;
        }
        .nav-link:hover .underline-hover {
          width: 100%;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
