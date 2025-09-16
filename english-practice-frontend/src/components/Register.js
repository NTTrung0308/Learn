import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });

  const { email, phone, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      alert(res.data.message);
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleFacebookRegister = () => {
    window.location.href = 'http://localhost:5000/api/auth/facebook';
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={onChange}
          required
        />
        <input
          type="text"
          placeholder="Phone (optional)"
          name="phone"
          value={phone}
          onChange={onChange}
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={onChange}
          required
        />
        <button type="submit">Register</button>
      </form>
      <hr />
      <button onClick={handleGoogleRegister} style={{ background: '#4285F4', color: '#fff', margin: '5px' }}>
        Register with Google
      </button>
      <button onClick={handleFacebookRegister} style={{ background: '#4267B2', color: '#fff', margin: '5px' }}>
        Register with Facebook
      </button>
    </div>
  );
};

export default Register;