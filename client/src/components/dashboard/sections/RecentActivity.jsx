import React from 'react';
import { VscGraph } from 'react-icons/vsc';
import { BsCheckCircleFill, BsXCircleFill, BsPlayCircle } from 'react-icons/bs';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      name: 'Frontend Deploy',
      status: 'success',
      time: '2 mins ago'
    },
    {
      id: 2,
      name: 'Backend Tests',
      status: 'failed',
      time: '15 mins ago'
    },
    {
      id: 3,
      name: 'API Build',
      status: 'in-progress',
      time: 'Just now'
    }
  ];

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

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <VscGraph className="text-2xl text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(activity.status)}
              <div>
                <div className="text-white font-medium">{activity.name}</div>
                <div className="text-sm text-gray-400">{activity.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity; 