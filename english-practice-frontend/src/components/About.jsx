import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/about.css";
import { Link } from "react-router-dom";
function AboutUs() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero text-center text-light d-flex flex-column justify-content-center align-items-center">
        <div className="overlay"></div>
        <div className="content">
          <h1 className="display-4 fw-bold">Về Chúng Tôi</h1>
          <p className="lead">
            Nơi giúp bạn học tiếng Anh hiệu quả, thông minh và vui vẻ hơn mỗi ngày.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="about-intro container py-5">
        <h2 className="text-center fw-bold mb-4">Chúng Tôi Là Ai?</h2>
        <p className="text-center fs-5 text-muted mx-auto" style={{ maxWidth: "800px" }}>
          English Practice được thành lập với sứ mệnh mang đến một nền tảng học tiếng Anh 
          thân thiện, dễ tiếp cận và hiệu quả cho mọi người — từ người mới bắt đầu cho đến 
          người học nâng cao. Chúng tôi tin rằng việc học ngôn ngữ không chỉ là ghi nhớ từ vựng, 
          mà còn là hành trình mở rộng thế giới của bạn.
        </p>
      </section>

      {/* Mission Section */}
      <section className="about-mission bg-light py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <img
                src="https://cdn.pixabay.com/photo/2016/03/09/09/30/learn-1245770_960_720.jpg"
                alt="Mission"
                className="img-fluid rounded-4 shadow"
              />
            </div>
            <div className="col-md-6">
              <h3 className="fw-bold">Sứ Mệnh Của Chúng Tôi</h3>
              <p className="fs-5 text-muted">
                Chúng tôi hướng đến việc tạo ra một cộng đồng học tập hiện đại, 
                nơi mọi người có thể luyện thi, học ngữ pháp, trau dồi từ vựng và 
                rèn luyện kỹ năng giao tiếp thông qua trải nghiệm tương tác, trực quan.
              </p>
              <ul className="fs-6">
                <li>✔️ Lộ trình học rõ ràng, phù hợp từng cấp độ.</li>
                <li>✔️ Tài liệu được biên soạn bởi giáo viên giàu kinh nghiệm.</li>
                <li>✔️ Cập nhật thường xuyên theo xu hướng học tập mới nhất.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team container py-5">
        <h2 className="text-center fw-bold mb-5">Đội Ngũ Của Chúng Tôi</h2>
        <div className="row g-4">
          {[
            { name: "Trần Tuấn Anh", role: "Nhà sáng lập & Lập trình viên", img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" },
            { name: "Ngọc Mai", role: "Chuyên gia Ngữ pháp", img: "https://cdn.pixabay.com/photo/2016/03/23/04/01/woman-1274056_1280.jpg" },
            { name: "Hoàng Dũng", role: "Giảng viên Từ vựng", img: "https://cdn.pixabay.com/photo/2015/01/27/09/58/man-614199_1280.jpg" },
            { name: "Thanh Hương", role: "Thiết kế & Truyền thông", img: "https://cdn.pixabay.com/photo/2016/11/29/03/52/woman-1867093_1280.jpg" },
          ].map((member, index) => (
            <div className="col-md-3 text-center" key={index}>
              <img
                src={member.img}
                alt={member.name}
                className="rounded-circle mb-3 shadow"
                width="130"
                height="130"
              />
              <h5 className="fw-bold">{member.name}</h5>
              <p className="text-muted">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section className="about-achievements bg-light py-5 text-center">
        <div className="container">
          <h2 className="fw-bold mb-4">Thành Tựu Của Chúng Tôi</h2>
          <div className="row">
            <div className="col-md-4">
              <h3 className="fw-bold text-primary">+50,000</h3>
              <p>Học viên đã tham gia</p>
            </div>
            <div className="col-md-4">
              <h3 className="fw-bold text-primary">+300</h3>
              <p>Khoá học và bài luyện tập</p>
            </div>
            <div className="col-md-4">
              <h3 className="fw-bold text-primary">98%</h3>
              <p>Học viên hài lòng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="about-contact container py-5 text-center">
        <h2 className="fw-bold mb-3">Liên Hệ Với Chúng Tôi</h2>
        <p className="text-muted mb-4">
          Có câu hỏi hoặc góp ý? Chúng tôi luôn sẵn lòng lắng nghe.
        </p>
        <a href="/contact" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
          Liên Hệ Ngay
        </a>
      </section>
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
}

export default AboutUs;
