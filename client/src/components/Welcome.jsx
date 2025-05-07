import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  const devopsQuote = "DevOps - Where Automation Meets Innovation";

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with DevOps-themed gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.8)_100%)]"></div>
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-8">
        <div className="max-w-4xl w-full bg-white/10 backdrop-blur-sm rounded-2xl p-12 shadow-2xl border border-white/10">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-white mb-4 font-mono tracking-tight">
                DevOps Pipeline Manager
              </h1>
              <p className="text-2xl text-blue-200 italic font-light">
                "{devopsQuote}"
              </p>
            </div>
            
            <div className="flex justify-center space-x-8 mt-12">
              <Link
                to="/login"
                className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20"
              >
                <span className="relative z-10">Register</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 