import React, { useState, useEffect } from 'react';
import { VscGraph, VscCloudDownload, VscInfo } from 'react-icons/vsc';
import { BsCheckCircleFill, BsXCircleFill, BsPlayCircle } from 'react-icons/bs';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
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
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <BsCheckCircleFill className="text-green-400" />;
      case 'failed':
        return <BsXCircleFill className="text-red-400" />;
      case 'in-progress':
        return <BsPlayCircle className="text-yellow-400 animate-pulse" />;
      default:
        return null;
    }
  };

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
  };

  const handleDownloadLogs = async (activity) => {
    try {
      // Create a formatted log content with all activity details
      const logContent = {
        pipelineInfo: {
          name: activity.pipelineName,
          status: activity.state,
          type: activity.type
        },
        github: {
          repository: activity.github?.repository || 'N/A',
          branch: activity.github?.branch || 'N/A'
        },
        testing: {
          tools: activity.testingTools || [],
          security: activity.security?.tools || []
        },
        containerization: {
          dockerRegistry: activity.docker?.registry || 'N/A',
          deploymentPlatform: activity.deployment?.platform || 'N/A',
          namespace: activity.deployment?.namespace || 'N/A'
        },
        team: {
          name: activity.team.name,
          email: activity.team.email
        },
        trigger: {
          triggeredBy: activity.triggeredBy.name,
          email: activity.triggeredBy.email,
          startTime: activity.startTime,
          completionTime: activity.completionTime || null,
          failureReason: activity.failureReason || null
        }
      };

      // Convert the object to a formatted JSON string
      const jsonString = JSON.stringify(logContent, null, 2);
      
      // Create a blob with the JSON content
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `pipeline-${activity.pipelineName}-${new Date(activity.triggerDate).toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading logs:', err);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading activities...</div>;
  }

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <VscGraph className="text-2xl text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
      </div>

      <div className="space-y-2 h-[280px] overflow-y-auto pr-2 custom-scrollbar">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {getStatusIcon(activity.state)}
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{activity.pipelineName}</div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="text-xs text-gray-400">
                      <span className="text-blue-400">Repo:</span> {activity.github?.repository || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">
                      <span className="text-blue-400">Branch:</span> {activity.github?.branch || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">
                      <span className="text-blue-400">Testing:</span> {activity.testingTools?.join(', ') || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">
                      <span className="text-blue-400">Security:</span> {activity.security?.tools?.join(', ') || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">
                      <span className="text-blue-400">Docker:</span> {activity.docker?.registry || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">
                      <span className="text-blue-400">Deployment:</span> {activity.deployment?.platform || 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span>Team: {activity.team.name}</span>
                    <span>Triggered by: {activity.triggeredBy.name}</span>
                    <span>{new Date(activity.triggerDate).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleViewDetails(activity)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                title="View Details"
              >
                <VscInfo className="text-sm" />
              </button>
              <button
                onClick={() => handleDownloadLogs(activity)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-green-400 hover:text-green-300 transition-colors"
                title="Download Logs"
              >
                <VscCloudDownload className="text-sm" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Pipeline Details</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-400">Pipeline Information</h4>
                <p className="text-white">Name: {selectedActivity.pipelineName}</p>
                <p className="text-white">Status: {selectedActivity.state}</p>
                <p className="text-white">Type: {selectedActivity.type}</p>
              </div>

              <div>
                <h4 className="text-gray-400">GitHub Information</h4>
                <p className="text-white">Repository: {selectedActivity.github?.repository || 'N/A'}</p>
                <p className="text-white">Branch: {selectedActivity.github?.branch || 'N/A'}</p>
              </div>

              <div>
                <h4 className="text-gray-400">Testing & Security</h4>
                <p className="text-white">Testing Tools: {selectedActivity.testingTools?.join(', ') || 'N/A'}</p>
                <p className="text-white">Security Tools: {selectedActivity.security?.tools?.join(', ') || 'N/A'}</p>
              </div>

              <div>
                <h4 className="text-gray-400">Containerization & Deployment</h4>
                <p className="text-white">Docker Registry: {selectedActivity.docker?.registry || 'N/A'}</p>
                <p className="text-white">Deployment Platform: {selectedActivity.deployment?.platform || 'N/A'}</p>
                <p className="text-white">Namespace: {selectedActivity.deployment?.namespace || 'N/A'}</p>
              </div>

              <div>
                <h4 className="text-gray-400">Team Information</h4>
                <p className="text-white">Team: {selectedActivity.team.name}</p>
                <p className="text-white">Contact: {selectedActivity.team.email}</p>
              </div>

              <div>
                <h4 className="text-gray-400">Trigger Information</h4>
                <p className="text-white">Triggered By: {selectedActivity.triggeredBy.name}</p>
                <p className="text-white">Email: {selectedActivity.triggeredBy.email}</p>
                <p className="text-white">Start Time: {new Date(selectedActivity.startTime).toLocaleString()}</p>
                {selectedActivity.completionTime && (
                  <p className="text-white">
                    Completion Time: {new Date(selectedActivity.completionTime).toLocaleString()}
                  </p>
                )}
              </div>

              {selectedActivity.failureReason && (
                <div>
                  <h4 className="text-red-400">Failure Reason</h4>
                  <p className="text-white">{selectedActivity.failureReason}</p>
                </div>
              )}

              <button
                onClick={() => setSelectedActivity(null)}
                className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;