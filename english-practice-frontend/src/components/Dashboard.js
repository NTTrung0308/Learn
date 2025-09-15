import React from "react";

const Dashboard = () => {
  // Lấy email từ localStorage nếu có
  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to your Dashboard!</h1>
      <p>This is your personal space to practice English and track your progress.</p>
      {user.email && (
        <div>
          <strong>Email:</strong> {user.email}
        </div>  
      )}
      <hr />
      <ul>
        <li>Practice new vocabulary</li>
        <li>Take grammar quizzes</li>
        <li>View your learning statistics</li>
      </ul>
    </div>
  );
};

export default Dashboard;