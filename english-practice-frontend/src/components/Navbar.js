import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isAuthenticated, userRole, onLogout }) => {
  return (
    <nav style={{ padding: '10px', background: '#f0f0f0' }}>
      <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
      
      {isAuthenticated ? (
        <>
          {userRole === "superadmin" || userRole === "admin" ? (
            <Link to="/dashboard" style={{ marginRight: '15px' }}>Dashboard</Link>
          ) : null}
          <span style={{ marginRight: '15px' }}>
            Welcome! Role: {userRole}
          </span>
          <button onClick={onLogout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
};

export default Navbar;