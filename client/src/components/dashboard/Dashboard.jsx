import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PipelineOverview from './sections/PipelineOverview';
import RecentActivity from './sections/RecentActivity';
import ResourceUsage from './sections/ResourceUsage';
import QuickActions from './sections/QuickActions';
import PipelineList from './sections/PipelineList';
import Plugins from './sections/Plugins';
import PluginDetail from './sections/PluginDetail';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');

  const navigateToPlugins = () => {
    setActiveSection('plugins');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'plugins':
        return <Plugins />;
      case 'overview':
      default:
        return (
          <>
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Pipeline Overview Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <PipelineOverview />
              </div>

              {/* Recent Activity Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <RecentActivity />
              </div>

              {/* Resource Usage Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <ResourceUsage />
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <QuickActions onNavigateToPlugins={navigateToPlugins} />
            </div>

            {/* Pipeline List Section */}
            <div>
              <PipelineList />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-6">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to TechCorp</h1>
          <p className="text-xl text-blue-200">
            {user.team} Department Dashboard - {user.fullName}
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button 
            onClick={() => setActiveSection('overview')}
            className={`px-4 py-2 rounded-md transition-colors ${activeSection === 'overview' 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-800/30 text-blue-200 hover:bg-blue-700/50'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveSection('plugins')}
            className={`px-4 py-2 rounded-md transition-colors ${activeSection === 'plugins' 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-800/30 text-blue-200 hover:bg-blue-700/50'}`}
          >
            Plugins
          </button>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default Dashboard; 