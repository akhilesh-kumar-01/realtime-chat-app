import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Eye, EyeOff } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Icon & Title */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-iosBlue rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-black tracking-tight">ChatApp</h1>
        <p className="text-iosGray mt-2 text-[15px]">Sign in to continue</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="bg-iosLightGray rounded-[12px] overflow-hidden mb-6">
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
          Sign In
        </button>

        {/* Link to Register */}
        <div className="text-center">
          <Link to="/register" className="text-iosBlue text-[15px]">
            Don't have an account? Register
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
