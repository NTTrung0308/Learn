import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = ({ setAuth }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      if (setAuth) setAuth(true);
      alert('Login successful!');
      navigate('/dashboard');
    } else {
      alert('Login failed!');
      navigate('/login');
    }
  }, [searchParams, setAuth, navigate]);

  return <div>Processing login...</div>;
};

export default AuthSuccess;