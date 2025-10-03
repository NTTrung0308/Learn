// MainLayout.jsx
import React from 'react';
import Navbar from '../Navbar';
import Footer from './Footer';

const MainLayout = ({ children, isAuthenticated, userRole, userId }) => {
  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} userRole={userRole} userId={userId} />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default MainLayout;
