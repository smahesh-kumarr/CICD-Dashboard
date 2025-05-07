import React, { useState, useEffect } from 'react';
import { VscGitPullRequest, VscRefresh } from 'react-icons/vsc';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const PipelineOverview = () => {
  const [stats, setStats] = useState({
    total: 0,
    created: 0,
    active: 0,
    completed: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPipelineStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/pipelines/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Ensure all stats are numbers and have default values
        const newStats = {
          total: Number(response.data.stats.total) || 0,
          created: Number(response.data.stats.created) || 0,
          active: Number(response.data.stats.active) || 0,
          completed: Number(response.data.stats.completed) || 0,
          failed: Number(response.data.stats.failed) || 0
        };
        setStats(newStats);
      } else {
        setError(response.data.message || 'Failed to fetch pipeline stats');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch pipeline stats');
      console.error('Error fetching pipeline stats:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLoading(true);
    await fetchPipelineStats();
  };

  useEffect(() => {
    fetchPipelineStats();
    // Set up polling every 5 seconds to update pipeline statuses
    const interval = setInterval(fetchPipelineStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <VscGitPullRequest className="text-2xl text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Pipeline Overview</h3>
        </div>
        <div className="text-center text-gray-400">Loading pipeline statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <VscGitPullRequest className="text-2xl text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Pipeline Overview</h3>
        </div>
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <VscGitPullRequest className="text-2xl text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Pipeline Overview</h3>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors duration-200"
          title="Refresh statistics"
        >
          <VscRefresh className={`text-xl ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-white/5 rounded-lg">
          <div className="text-3xl font-bold text-blue-400 mb-1">{stats.total || 0}</div>
          <div className="text-sm text-gray-300">Total Pipelines</div>
        </div>
        
        <div className="text-center p-4 bg-white/5 rounded-lg">
          <div className="text-3xl font-bold text-green-400 mb-1">{stats.completed || 0}</div>
          <div className="text-sm text-gray-300">Completed</div>
        </div>
        
        <div className="text-center p-4 bg-white/5 rounded-lg">
          <div className="text-3xl font-bold text-red-400 mb-1">{stats.failed || 0}</div>
          <div className="text-sm text-gray-300">Failed</div>
        </div>

        <div className="text-center p-4 bg-white/5 rounded-lg">
          <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.active || 0}</div>
          <div className="text-sm text-gray-300">Active</div>
        </div>

        <div className="text-center p-4 bg-white/5 rounded-lg">
          <div className="text-3xl font-bold text-purple-400 mb-1">{stats.created || 0}</div>
          <div className="text-sm text-gray-300">Created</div>
        </div>

        <div className="text-center p-4 bg-white/5 rounded-lg">
          <div className="text-3xl font-bold text-emerald-400 mb-1">
            {stats.completed + stats.failed > 0 
              ? Math.round((stats.completed / (stats.completed + stats.failed)) * 100) 
              : 0}%
          </div>
          <div className="text-sm text-gray-300">Success Rate</div>
        </div>
      </div>
    </div>
  );
};

export default PipelineOverview; 