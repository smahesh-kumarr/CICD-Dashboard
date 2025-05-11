import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser(formData);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, delay: 0.2, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)" },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 font-sans">
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-12">
          {/* Left Section: ShipTogether Benefits */}
          <motion.div
            className="lg:w-1/2 flex flex-col justify-center space-y-8"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl font-bold text-white">
                ShipTogether
              </h1>
              <p className="mt-4 text-xl sm:text-2xl text-blue-200 font-light">
                Unify Your CI/CD, Empower Your Team
              </p>
              <p className="mt-6 text-base sm:text-lg text-white/90 leading-relaxed">
                Access your ShipTogether account to streamline CI/CD workflows, collaborate with your team, and deploy with confidence.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-white">Fast Deployments</h3>
                <p className="mt-2 text-gray-200">
                  Automate and accelerate your CI/CD pipelines for rapid delivery.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-white">Secure Access</h3>
                <p className="mt-2 text-gray-200">
                  Log in securely with role-based permissions and encryption.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-white">Unified Workflows</h3>
                <p className="mt-2 text-gray-200">
                  Manage all your CI/CD processes in one centralized platform.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Section: Login Form */}
          <motion.div
            className="lg:w-1/2 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 border border-white/10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-xl sm:text-2xl text-blue-200 font-light">
                Sign in to ShipTogether
              </p>
            </div>
            
            {successMessage && (
              <div className="mb-6 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-200 text-sm text-center">
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm text-center">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-white/90 text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-white/90 text-sm font-medium">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter Password"
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </motion.button>
            </form>

            <p className="text-white/80 text-center mt-8">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                Register here
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;