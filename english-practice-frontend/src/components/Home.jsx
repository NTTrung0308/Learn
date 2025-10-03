// Home.jsx
import React from "react";
import { Link } from 'react-router-dom';
import './assets/css/style.css';

const Home = ({ isAuthenticated, userRole, userId }) => {
  return (
    <div className="home-container">


      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Học tiếng Anh hiệu quả, đột phá cùng chúng tôi</h1>
              <p>Khám phá phương pháp học tiếng Anh hiện đại, cá nhân hóa theo nhu cầu và trình độ của bạn. Bắt đầu hành trình chinh phục tiếng Anh ngay hôm nay!</p>
              <div className="hero-buttons">
                {isAuthenticated ? (
                  <Link to="/courses" className="btn btn-light">Bắt đầu học</Link>
                ) : (
                  <Link to="/register" className="btn btn-light">Bắt đầu học</Link>
                )}
                <Link to="/about" className="btn btn-outline">Tìm hiểu thêm</Link>
              </div>
            </div>
            <div className="hero-image">
              <i className="fas fa-graduation-cap hero-icon"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-title">
            <h2>Tại sao chọn chúng tôi?</h2>
            <p>Chúng tôi cung cấp giải pháp học tiếng Anh toàn diện với những ưu điểm vượt trội</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-book-open"></i>
              </div>
              <h3>Nội dung phong phú</h3>
              <p>Hàng nghìn bài học, bài tập và đề thi được cập nhật thường xuyên theo chuẩn quốc tế.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-user-graduate"></i>
              </div>
              <h3>Lộ trình cá nhân hóa</h3>
              <p>Hệ thống AI sẽ phân tích trình độ và xây dựng lộ trình học tập phù hợp nhất với bạn.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Theo dõi tiến độ</h3>
              <p>Hệ thống báo cáo chi tiết giúp bạn theo dõi sự tiến bộ và điều chỉnh phương pháp học.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses">
        <div className="container">
          <div className="section-title">
            <h2>Khóa học nổi bật</h2>
            <p>Khám phá các khóa học được thiết kế bởi chuyên gia hàng đầu</p>
          </div>
          
          <div className="courses-grid">
            <div className="course-card">
              <div className="course-image">
                <i className="fas fa-microphone-alt"></i>
              </div>
              <div className="course-content">
                <span className="course-category">Giao tiếp</span>
                <h3>Tiếng Anh giao tiếp cơ bản</h3>
                <p>Làm chủ các tình huống giao tiếp hàng ngày với người bản xứ.</p>
                <div className="course-meta">
                  <span><i className="far fa-clock"></i> 30 giờ</span>
                  <span className="course-price">Miễn phí</span>
                </div>
              </div>
            </div>
            
            <div className="course-card">
              <div className="course-image">
                <i className="fas fa-pen-fancy"></i>
              </div>
              <div className="course-content">
                <span className="course-category">Luyện thi</span>
                <h3>IELTS Masterclass</h3>
                <p>Chiến lược và kỹ năng cần thiết để đạt điểm cao trong kỳ thi IELTS.</p>
                <div className="course-meta">
                  <span><i className="far fa-clock"></i> 60 giờ</span>
                  <span className="course-price">699.000 VNĐ</span>
                </div>
              </div>
            </div>
            
            <div className="course-card">
              <div className="course-image">
                <i className="fas fa-briefcase"></i>
              </div>
              <div className="course-content">
                <span className="course-category">Chuyên ngành</span>
                <h3>Tiếng Anh thương mại</h3>
                <p>Nâng cao kỹ năng giao tiếp trong môi trường công sở và kinh doanh.</p>
                <div className="course-meta">
                  <span><i className="far fa-clock"></i> 45 giờ</span>
                  <span className="course-price">499.000 VNĐ</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="section-cta">
            <Link to="/courses" className="btn btn-primary">Xem tất cả khóa học</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>50,000+</h3>
              <p>Học viên đã tham gia</p>
            </div>
            
            <div className="stat-item">
              <h3>95%</h3>
              <p>Học viên hài lòng</p>
            </div>
            
            <div className="stat-item">
              <h3>2,500+</h3>
              <p>Bài học và bài tập</p>
            </div>
            
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Hỗ trợ học tập</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-title">
            <h2>Học viên nói gì về chúng tôi</h2>
            <p>Những phản hồi chân thực từ cộng đồng học viên của chúng tôi</p>
          </div>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-text">
                "Tôi đã cải thiện đáng kể kỹ năng nghe và nói chỉ sau 3 tháng học. Phương pháp giảng dạy rất thú vị và dễ hiểu."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="author-info">
                  <h4>Nguyễn Minh Anh</h4>
                  <p>Sinh viên</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-text">
                "Khóa học IELTS tại đây đã giúp tôi đạt được 7.5 điểm. Tôi đặc biệt ấn tượng với phần luyện nói và viết."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="author-info">
                  <h4>Trần Quang Huy</h4>
                  <p>Nhân viên văn phòng</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-text">
                "Lộ trình học được cá nhân hóa đã giúp tôi tiết kiệm rất nhiều thời gian. Tôi tập trung vào đúng những kỹ năng cần cải thiện."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="author-info">
                  <h4>Lê Thị Hương</h4>
                  <p>Giáo viên</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Sẵn sàng bắt đầu hành trình chinh phục tiếng Anh?</h2>
          <p>Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt và trải nghiệm học tập tuyệt vời</p>
          {isAuthenticated ? (
            <Link to="/courses" className="btn btn-light">Bắt đầu học ngay</Link>
          ) : (
            <Link to="/register" className="btn btn-light">Đăng ký ngay</Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h3>EnglishMaster</h3>
              <p>Nền tảng học tiếng Anh trực tuyến hàng đầu Việt Nam, cung cấp giải pháp học tập toàn diện và hiệu quả.</p>
              <div className="social-links">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-youtube"></i></a>
              </div>
            </div>
            
            <div className="footer-col">
              <h3>Về chúng tôi</h3>
              <ul>
                <li><Link to="/about">Giới thiệu</Link></li>
                <li><Link to="/teachers">Đội ngũ giảng viên</Link></li>
                <li><Link to="/method">Phương pháp giảng dạy</Link></li>
                <li><Link to="/achievements">Thành tựu</Link></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h3>Khóa học</h3>
              <ul>
                <li><Link to="/courses?category=communication">Tiếng Anh giao tiếp</Link></li>
                <li><Link to="/courses?category=ielts">Luyện thi IELTS</Link></li>
                <li><Link to="/courses?category=business">Tiếng Anh thương mại</Link></li>
                <li><Link to="/courses?category=kids">Tiếng Anh cho trẻ em</Link></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h3>Hỗ trợ</h3>
              <ul>
                <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
                <li><Link to="/contact">Liên hệ</Link></li>
                <li><Link to="/privacy">Chính sách bảo mật</Link></li>
                <li><Link to="/terms">Điều khoản sử dụng</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="copyright">
            <p>&copy; 2023 EnglishMaster. Tất cả các quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;