import React, { useState, useEffect } from 'react';
import { VscGitPullRequest } from 'react-icons/vsc';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const PipelineOverview = () => {
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
          setStats(response.data.stats);
        } else {
          setError(response.data.message || 'Failed to fetch pipeline stats');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch pipeline stats');
        console.error('Error fetching pipeline stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPipelineStats();
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
      <div className="flex items-center gap-2 mb-6">
        <VscGitPullRequest className="text-2xl text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Pipeline Overview</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-400 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-300">Total</div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-green-400 mb-1">{stats.success}</div>
          <div className="text-sm text-gray-300">Success</div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold text-red-400 mb-1">{stats.failed}</div>
          <div className="text-sm text-gray-300">Failed</div>
        </div>
      </div>
    </div>
  );
};

export default PipelineOverview; 