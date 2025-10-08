import React, { useState } from "react";
import { Link } from "react-router-dom";
import './assets/css/courses.css';


const Courses = () => {
  const [filter, setFilter] = useState("all");

  const courses = [
    {
      id: 1,
      title: "Tiếng Anh giao tiếp cơ bản",
      category: "communication",
      description: "Giúp bạn tự tin nói chuyện với người bản xứ trong mọi tình huống hàng ngày.",
      hours: 30,
      price: "Miễn phí",
      image: "https://images.unsplash.com/photo-1584697964199-8a4d1eea21f3?auto=format&fit=crop&w=900&q=60",
    },
    {
      id: 2,
      title: "IELTS Masterclass",
      category: "ielts",
      description: "Chiến lược luyện thi toàn diện giúp bạn đạt 7.0+ chỉ sau 2 tháng.",
      hours: 60,
      price: "699.000 VNĐ",
      image: "https://images.unsplash.com/photo-1581078428461-8ae0c72c9c90?auto=format&fit=crop&w=900&q=60",
    },
    {
      id: 3,
      title: "Tiếng Anh thương mại",
      category: "business",
      description: "Học ngôn ngữ chuyên ngành dành cho công việc, phỏng vấn và giao tiếp doanh nghiệp.",
      hours: 45,
      price: "499.000 VNĐ",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=60",
    },
    {
      id: 4,
      title: "Tiếng Anh cho trẻ em",
      category: "kids",
      description: "Khóa học vui nhộn giúp trẻ làm quen với tiếng Anh qua trò chơi và bài hát.",
      hours: 25,
      price: "299.000 VNĐ",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=60",
    },
  ];

  const filteredCourses =
    filter === "all" ? courses : courses.filter((c) => c.category === filter);

  return (
    <div className="courses-page">
      <section className="courses-header text-center">
        <h1>Khóa học tiếng Anh</h1>
        <p>Chọn lộ trình phù hợp nhất để nâng cao kỹ năng của bạn</p>
      </section>

      <div className="container">
        <div className="filter-bar text-center">
          <button
            className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFilter("all")}
          >
            Tất cả
          </button>
          <button
            className={`btn ${filter === "communication" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFilter("communication")}
          >
            Giao tiếp
          </button>
          <button
            className={`btn ${filter === "ielts" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFilter("ielts")}
          >
            IELTS
          </button>
          <button
            className={`btn ${filter === "business" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFilter("business")}
          >
            Thương mại
          </button>
          <button
            className={`btn ${filter === "kids" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFilter("kids")}
          >
            Trẻ em
          </button>
        </div>

        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <img src={course.image} alt={course.title} className="course-img" />
              <div className="course-info">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-meta">
                  <span><i className="far fa-clock"></i> {course.hours} giờ</span>
                  <span className="course-price">{course.price}</span>
                </div>
                <Link to={`/courses/${course.id}`} className="btn btn-outline-primary mt-2">
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
