import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { registerUser } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    orgId: '',
    email: '',
    fullName: '',
    team: 'dev',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      const response = await registerUser(userData);
      
      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message || 'An error occurred during registration');
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
                Join a platform designed to streamline your CI/CD workflows, enhance team collaboration, and deliver faster with confidence.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-white">Streamlined CI/CD</h3>
                <p className="mt-2 text-gray-200">
                  Automate your pipelines for faster, error-free deployments.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-white">Team Collaboration</h3>
                <p className="mt-2 text-gray-200">
                  Work seamlessly with role-based access and shared dashboards.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-white">Real-Time Insights</h3>
                <p className="mt-2 text-gray-200">
                  Monitor pipelines with live updates to catch issues early.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Section: Registration Form */}
          <motion.div
            className="lg:w-1/2 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 border border-white/10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-xl sm:text-2xl text-blue-200 font-light">
                Start Streamlining Your CI/CD Today
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm text-center">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-white/90 text-sm font-medium">Organization ID</label>
                <input
                  type="text"
                  name="orgId"
                  value={formData.orgId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter Organization ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-white/90 text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter Email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-white/90 text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Enter Full Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-white/90 text-sm font-medium">Team</label>
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  required
                >
                  <option value="dev">Development</option>
                  <option value="devops">DevOps</option>
                  <option value="operations">Operations</option>
                  <option value="qa">QA</option>
                </select>
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
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-white/90 text-sm font-medium">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                  placeholder="Confirm Password"
                  required
                  minLength={8}
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </motion.button>
            </form>

            <p className="text-white/80 text-center mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                Login here
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;