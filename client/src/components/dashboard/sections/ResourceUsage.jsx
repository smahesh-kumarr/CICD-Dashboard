import React, { useState, useEffect } from 'react';
import { VscHistory } from 'react-icons/vsc';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ResourceUsage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/pipelines/activities/recent`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setActivities(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch activities');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch activities');
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchRecentActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <VscHistory className="text-2xl text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Recent Triggers</h3>
        </div>
        <div className="text-center text-gray-400">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <VscHistory className="text-2xl text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Recent Triggers</h3>
        </div>
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <VscHistory className="text-2xl text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Recent Triggers</h3>
      </div>

      <div className="space-y-2 h-[280px] overflow-y-auto pr-2 custom-scrollbar">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-white font-medium text-sm">{activity.pipelineName}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Team: {activity.team.name}</span>
                  <span>•</span>
                  <span>{activity.triggeredBy.name}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activity.state === 'success' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {activity.state}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(activity.triggerDate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ResourceUsage;