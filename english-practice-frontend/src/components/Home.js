import React from "react";
import { Link } from "react-router-dom";

const Home = ({ isAuthenticated, userRole }) => {
  // Nếu không truyền props thì fallback về localStorage
  const auth = isAuthenticated ?? localStorage.getItem("token");
  const role = userRole ?? localStorage.getItem("userRole");
  return (
    <div style={{ padding: "20px" }}>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>English Learning</h1>
        <div>
          {auth ? (
            <>
              {role === "superadmin" || role === "admin" ? (
                <Link to="/dashboard" style={{ marginRight: "15px" }}>
                  Dashboard
                </Link>
              ) : null}
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("userRole");
                  window.location.reload();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: "15px" }}>
                Login
              </Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>

      <div style={{ marginTop: "30px" }}>
        <Link
          to="/login"
          style={{
            marginRight: "15px",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Login
        </Link>
        <Link
          to="/register"
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Register
        </Link>
      </div>

      <div style={{ marginTop: "50px" }}>
        <h2>Features</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>✓ Interactive exercises</li>
          <li>✓ Vocabulary building</li>
          <li>✓ Grammar practice</li>
          <li>✓ Speaking practice</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
