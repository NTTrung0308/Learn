import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function Grammar() {
  const topics = [
    "Thì trong tiếng Anh",
    "Câu điều kiện",
    "Câu bị động",
    "Danh từ và đại từ",
    "Câu gián tiếp",
  ];

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 text-success fw-bold">📘 Ngữ Pháp</h2>
      <div className="list-group shadow-sm rounded-4">
        {topics.map((topic, i) => (
          <button
            key={i}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            {topic}
            <span className="badge bg-success rounded-pill">Học ngay</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Grammar;
