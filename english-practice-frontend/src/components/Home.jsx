import React from "react";
import { Link } from 'react-router-dom';
const Home = ({ isAuthenticated, userRole, userId }) => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome to English Learning Platform</h1>

      {isAuthenticated ? (
        <div>
          <h2>Hello User!</h2>
          <p>Your role: {userRole}</p>
          <p>Your ID: {userId}</p>
          <p>This is the home page for regular users.</p>
          {isAuthenticated && (
            <Link to="/profile" style={{ marginRight: "15px" }}>
              Hồ sơ
            </Link>
          )}
        </div>
      ) : (
        <div>
          <h2>Welcome Guest!</h2>
          <p>Please login or register to access more features.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
