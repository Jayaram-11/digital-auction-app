// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ❌ The 'role' state is gone
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    // ✅ We no longer pass 'role'. The backend will default it
    register(name, email, password);
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2>Register</h2>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        {/* ❌ The 'role' <select> dropdown is removed */}
        
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;