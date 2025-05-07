import React, { useState, useEffect } from 'react';
import { VscSourceControl, VscPlay, VscDebugStart, VscTrash } from 'react-icons/vsc';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const PipelineList = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const tabs = ['ALL', 'ACTIVE', 'COMPLETED', 'FAILED'];

  useEffect(() => {
    fetchPipelines();
  }, [activeTab]);

  const fetchPipelines = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      let status = '';
      if (activeTab !== 'ALL') {
        status = activeTab.toLowerCase();
      }

      const response = await axios.get(`${API_BASE_URL}/pipelines`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status }
      });

      if (response.data.success) {
        setPipelines(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch pipelines');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch pipelines');
      console.error('Error fetching pipelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPipeline = async (pipelineId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Check if pipeline is already running
      const pipeline = pipelines.find(p => p._id === pipelineId);
      if (pipeline.status === 'active') {
        setError('Pipeline is already running');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/pipelines/${pipelineId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        setPipelines(prev => prev.map(p => 
          p._id === pipelineId ? { ...p, status: 'active' } : p
        ));
        
        // Simulate pipeline completion after 35 seconds
        setTimeout(() => {
          setPipelines(prev => prev.map(p => 
            p._id === pipelineId ? { ...p, status: 'completed' } : p
          ));
        }, 35000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start pipeline');
      console.error('Error starting pipeline:', error);
    }
  };

  const handleDeletePipeline = async (pipelineId) => {
    if (!window.confirm('Are you sure you want to delete this pipeline?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const response = await axios.delete(`${API_BASE_URL}/pipelines/${pipelineId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPipelines(prev => prev.filter(p => p._id !== pipelineId));
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete pipeline');
      console.error('Error deleting pipeline:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-yellow-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden p-6">
        <div className="text-center text-gray-400">Loading pipelines...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden p-6">
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <VscSourceControl className="text-2xl text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Pipelines</h3>
          </div>
          <button 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors duration-200"
            onClick={() => window.location.href = '/create-pipeline'}
          >
            <VscPlay />
            New Pipeline
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline List */}
      <div className="divide-y divide-white/10">
        {pipelines.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No pipelines found
          </div>
        ) : (
          pipelines.map((pipeline) => (
            <div
              key={pipeline._id}
              className="p-6 hover:bg-white/5 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`text-2xl ${getStatusColor(pipeline.status)}`}>
                    <VscSourceControl />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">{pipeline.name}</h4>
                    <p className="text-sm text-gray-400">
                      {pipeline.environment} • {pipeline.type}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="text-white capitalize">{pipeline.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStartPipeline(pipeline._id)}
                      disabled={pipeline.status === 'active'}
                      className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <VscDebugStart />
                    </button>
                    <button 
                      onClick={() => handleDeletePipeline(pipeline._id)}
                      className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <VscTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PipelineList; 