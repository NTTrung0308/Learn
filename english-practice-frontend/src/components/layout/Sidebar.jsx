import React from "react";
import { Link } from "react-router-dom";
const Sidebar = ({ toggleSidebar }) => {
  return (
    <>
      <div className="sidebar" data-background-color="dark">
        <div className="sidebar-logo">
          <div className="logo-header" data-background-color="dark">
            <a href="index.html" className="logo">
              <img
                src="/assets/img/kaiadmin/logo_light.svg"
                alt="navbar brand"
                className="navbar-brand"
                height="20"
              />
            </a>
            <div className="nav-toggle">
              <button
                className="btn btn-toggle toggle-sidebar"
                onClick={toggleSidebar}
              >
                <i class="fa-solid fa-bars-staggered"></i>
              </button>
              <button
                className="btn btn-toggle sidenav-toggler"
                onClick={toggleSidebar}
              >
                <i class="fa-solid fa-bars-staggered"></i>
              </button>
            </div>
            <button className="topbar-toggler more">
              <i className="gg-more-vertical-alt"></i>
            </button>
          </div>
        </div>
        <div className="sidebar-wrapper scrollbar scrollbar-inner">
          <div className="sidebar-content">
            <ul className="nav nav-secondary">
              <li className="nav-item active">
                <a
                  data-bs-toggle="collapse"
                  href="#dashboard"
                  className="collapsed"
                  aria-expanded="false"
                >
                  <i className="fas fa-home"></i>
                  <p>Dashboard</p>
                  <span className="caret"></span>
                </a>
                <div className="collapse" id="dashboard">
                  <ul className="nav nav-collapse">
                    <li>
                      <a href="../demo1/index.html">
                        <span className="sub-item">Dashboard 1</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="nav-section">
                <span className="sidebar-mini-icon">
                  <i className="fa fa-ellipsis-h"></i>
                </span>
                <h4 className="text-section">Components</h4>
              </li>
              <li className="nav-item">
                <a data-bs-toggle="collapse" href="#base">
                  <i className="fas fa-layer-group"></i>
                  <p>Quản lý nội dung học tập </p>
                  <span className="caret"></span>
                </a>
                <div className="collapse" id="base">
                  <ul className="nav nav-collapse">
                    <li>
                      <Link to="/exam-management">
                        <span className="sub-item">Quản lý đề thi IELTS</span>
                      </Link>
                    </li>
                    <li>
                      <a href="/grammar-management">
                        <span className="sub-item">Quản lý ngữ pháp</span>
                      </a>
                    </li>
                    <li>
                      <a href="/vocabulary-management">
                        <span className="sub-item">Quản lý từ vựng</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
