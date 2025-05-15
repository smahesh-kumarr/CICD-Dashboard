import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Welcome = () => {
  const appName = "ShipTogether";
  const tagline = "Unify Your CI/CD, Empower Your Team.";

  // Subtle animation for hero section
  const heroVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)" },
    tap: { scale: 0.95 },
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay: 0.2, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Extended Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            className="text-center lg:text-left lg:flex lg:items-center lg:justify-between"
            variants={heroVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Text Content */}
            <div className="lg:max-w-lg">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                Welcome to <span className="text-yellow-300">{appName}</span>
              </h1>
              <p className="mt-4 text-xl sm:text-2xl font-light">
                {tagline}
              </p>
              <p className="mt-6 text-base sm:text-lg leading-relaxed">
                ShipTogether streamlines your CI/CD pipelines with seamless automation, real-time monitoring, and team collaboration tools. Deliver faster, together.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link
                    to="/login"
                    className="block w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-center"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link
                    to="/register"
                    className="block w-full sm:w-auto bg-white hover:bg-gray-100 text-blue-900 font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-center"
                  >
                    Register
                  </Link>
                </motion.div>
              </div>
            </div>
            {/* Placeholder Illustration */}
            <div className="mt-12 lg:mt-0 lg:max-w-md flex justify-center">
              <img
                src="/images/Devops.jpg"
                alt="CI/CD Pipeline"
                className="w-full max-w-xs sm:max-w-sm"
              />
            </div>
          </motion.div>

          {/* Extended Sub-Section: CI/CD Stats */}
          <motion.div
            className="mt-16 grid gap-8 sm:grid-cols-3"
            variants={statVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="text-center">
              <h3 className="text-4xl font-bold text-yellow-300">50%</h3>
              <p className="mt-2 text-lg">Faster Deployments</p>
              <p className="mt-1 text-sm text-gray-200">
                Automate pipelines to reduce deployment time significantly.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-yellow-300">30%</h3>
              <p className="mt-2 text-lg">Error Reduction</p>
              <p className="mt-1 text-sm text-gray-200">
                Catch issues early with real-time pipeline monitoring.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-yellow-300">2x</h3>
              <p className="mt-2 text-lg">Team Efficiency</p>
              <p className="mt-1 text-sm text-gray-200">
                Collaborate seamlessly with integrated tools.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-none">
          <svg
            className="relative block w-full h-16 sm:h-24 text-gray-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,0 C280,100 720,0 1440,100 L1440,100 L0,100 Z"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 text-center">
          Why Choose ShipTogether?
        </h2>
        <p className="mt-4 text-lg text-gray-600 text-center max-w-2xl mx-auto">
          Optimize your CI/CD workflows with tools designed for speed, reliability, and collaboration.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900">Automated Pipelines</h3>
            <p className="mt-2 text-gray-600">
              Configure and automate your build, test, and deploy stages with minimal setup.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900">Real-Time Monitoring</h3>
            <p className="mt-2 text-gray-600">
              Track pipeline performance and catch issues instantly with live Dashboards.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900">Team Collaboration</h3>
            <p className="mt-2 text-gray-600">
              Enable seamless communication and role-based access for your DevOps team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;