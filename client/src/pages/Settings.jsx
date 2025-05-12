import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          setError('Authentication required');
          return;
        }

        const user = JSON.parse(userStr);
        
        if (!user.orgId) {
          setError('Organization ID not found');
          return;
        }

        // Fetch current user details
        const userResponse = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(userResponse.data.user);

        // Fetch users in the same organization
        const orgResponse = await axios.get(`http://localhost:5000/api/users/organization/${user.orgId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrgUsers(orgResponse.data.users);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-6">
        <div className="text-center text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-6">
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        {/* User Profile Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">User Profile</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <div className="text-white text-lg">{currentUser?.fullName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="text-white text-lg">{currentUser?.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Team</label>
              <div className="text-white text-lg capitalize">{currentUser?.team}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Organization ID</label>
              <div className="text-white text-lg">{currentUser?.orgId}</div>
            </div>
          </div>
        </div>

        {/* Organization Users Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-2xl font-semibold text-white mb-6">Organization Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/10">
                  <th className="pb-3 text-gray-300">Name</th>
                  <th className="pb-3 text-gray-300">Email</th>
                  <th className="pb-3 text-gray-300">Team</th>
                  <th className="pb-3 text-gray-300">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {orgUsers.map((user) => (
                  <tr key={user._id} className="border-b border-white/5">
                    <td className="py-4 text-white">{user.fullName}</td>
                    <td className="py-4 text-white">{user.email}</td>
                    <td className="py-4 text-white capitalize">{user.team}</td>
                    <td className="py-4 text-white">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;