import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(name, email, password);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Title */}
      <div className="flex flex-col items-center mb-10 text-center">
        <h1 className="text-3xl font-bold text-black tracking-tight">Create Account</h1>
        <p className="text-iosGray mt-2 text-[15px]">Join ChatApp today</p>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        {/* iOS grouped input card */}
        <div className="bg-iosLightGray rounded-[12px] overflow-hidden mb-6">
          {/* Name Input */}
          <div className="px-4 py-3 border-b border-gray-200/50">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-transparent outline-none text-[17px] text-black placeholder:text-iosGray"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email Input */}
          <div className="px-4 py-3 border-b border-gray-200/50">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-transparent outline-none text-[17px] text-black placeholder:text-iosGray"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="px-4 py-3 flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-transparent outline-none text-[17px] text-black placeholder:text-iosGray"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-iosGray ml-2"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-iosBlue text-white font-semibold text-[17px] py-[14px] rounded-[14px] mb-6 active:opacity-80 transition-opacity"
        >
          Sign Up
        </button>

        {/* Link to Login */}
        <div className="text-center">
          <Link to="/login" className="text-iosBlue text-[15px]">
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
