import React from 'react';
import { VscServer } from 'react-icons/vsc';

const ResourceUsage = () => {
  const resources = [
    {
      name: 'CPU Usage',
      usage: 65,
      color: 'bg-blue-400'
    },
    {
      name: 'Memory Usage',
      usage: 82,
      color: 'bg-purple-400'
    },
    {
      name: 'Storage Usage',
      usage: 45,
      color: 'bg-green-400'
    }
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <VscServer className="text-2xl text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Resource Usage</h3>
      </div>

      <div className="space-y-6">
        {resources.map((resource) => (
          <div key={resource.name}>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">{resource.name}</span>
              <span className="text-gray-300">{resource.usage}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${resource.color} transition-all duration-500`}
                style={{ width: `${resource.usage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceUsage; 