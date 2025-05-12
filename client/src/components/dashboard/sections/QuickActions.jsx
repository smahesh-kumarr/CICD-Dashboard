import React from 'react';
import { Link } from 'react-router-dom';
import { VscAdd, VscSourceControl, VscKey, VscExtensions, VscSettingsGear } from 'react-icons/vsc';

const QuickActions = ({ onNavigateToPlugins }) => {
  const actions = [
    {
      id: 'create',
      name: 'Create Pipeline',
      icon: <VscAdd className="text-2xl" />,
      color: 'from-blue-500 to-blue-600',
      linkTo: '/create-pipeline'
    },
    // {
    //   id: 'categories',
    //   name: 'Pipeline Categories',
    //   icon: <VscSourceControl className="text-2xl" />,
    //   color: 'from-purple-500 to-purple-600',
    //   onClick: () => console.log('Pipeline Categories clicked')
    // },
    {
      id: 'credentials',
      name: 'Manage Credentials',
      icon: <VscKey className="text-2xl" />,
      color: 'from-green-500 to-green-600',
      linkTo: '/manage-credentials'
    },
    {
      id: 'plugins',
      name: 'Jenkins Plugins',
      icon: <VscExtensions className="text-2xl" />,
      color: 'from-orange-500 to-orange-600',
      onClick: () => onNavigateToPlugins && onNavigateToPlugins()
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <VscSettingsGear className="text-2xl" />,
      color: 'from-gray-500 to-gray-600',
      linkTo: '/settings'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {actions.map((action) => {
        const ActionElement = action.linkTo ? Link : 'button';
        const props = {
          key: action.id,
          className: `flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br ${action.color} hover:scale-105 transition-transform duration-200 group text-white no-underline`,
          ...(action.linkTo ? { to: action.linkTo } : { onClick: action.onClick, type: 'button' })
        };

        return (
          <ActionElement {...props}>
            <div className="bg-white/10 p-4 rounded-lg mb-3 group-hover:bg-white/20 transition-colors duration-200">
              {action.icon}
            </div>
            <span className="font-medium text-sm">{action.name}</span>
          </ActionElement>
        );
      })}
    </div>
  );
};

export default QuickActions;