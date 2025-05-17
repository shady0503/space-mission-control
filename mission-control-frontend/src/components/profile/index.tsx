'use client';
import React, { useState } from 'react';
import { Clock, Rocket, Settings, Building2, Award , User } from 'lucide-react';

// Mock data - in a real app, this would come from an API
const userData = {
  id: "91e988a6-9547-4e15-a1ec-aaffb26b26c7",
  username: "chadi",
  email: "chadi@gmail.com",
  createdAt: "2025-05-01T19:45:51.903688",
  enterprise: {
    name: "SpaceX Corporation",
    role: "Mission Commander",
    industry: "Space Exploration",
    teamMembers: 17,
    activeProjects: [
      "Mars Colonization Initiative", 
      "Lunar Gateway Construction", 
      "Asteroid Mining Program"
    ]
  },
};

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userForm, setUserForm] = useState({
    username: userData.username,
    email: userData.email,
    enterpriseName: userData.enterprise.name,
    enterpriseRole: userData.enterprise.role
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleFormChange = (e) => {
    setUserForm({
      ...userForm,
      [e.target.name]: e.target.value
    });
  };

  const [activeTab, setActiveTab] = useState('activity');

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl">
                {userData.username.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">{userData.username}</h2>
            <p className="text-gray-400">{userData.enterprise.role} at {userData.enterprise.name}</p>
          </div>
          
          <div className="px-6 pb-4">
            <div className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Username</label>
                    <input 
                      type="text"
                      name="username"
                      value={userForm.username} 
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Email</label>
                    <input 
                      type="email"
                      name="email"
                      value={userForm.email} 
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Enterprise</label>
                    <input 
                      type="text"
                      name="enterpriseName"
                      value={userForm.enterpriseName} 
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Role</label>
                    <input 
                      type="text"
                      name="enterpriseRole"
                      value={userForm.enterpriseRole} 
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Username</p>
                      <p className="text-sm text-gray-400">{userData.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Member Since</p>
                      <p className="text-sm text-gray-400">{formatDate(userData.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Enterprise</p>
                      <p className="text-sm text-gray-400">{userData.enterprise.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">Role</p>
                      <p className="text-sm text-gray-400">{userData.enterprise.role}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <button 
              onClick={handleEditToggle} 
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
        </div>
        
        
      </div>
    </div>
  );
};

export default UserProfile;