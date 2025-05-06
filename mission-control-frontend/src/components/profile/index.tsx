'use client';
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock, Rocket, Settings, Building2, Award, Activity, Calendar, User } from 'lucide-react';

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
  stats: {
    missionsCompleted: 42,
    missionsInProgress: 3,
    commandsIssued: 1354,
    spacecraftsManaged: 7,
    totalFlightHours: 2876
  },
  missionActivity: [
    { name: 'Jan', missions: 4, commands: 120 },
    { name: 'Feb', missions: 3, commands: 98 },
    { name: 'Mar', missions: 5, commands: 167 },
    { name: 'Apr', missions: 7, commands: 235 },
    { name: 'May', missions: 2, commands: 72 }
  ],
  missionBreakdown: [
    { name: 'Orbital', value: 18 },
    { name: 'Lunar', value: 12 },
    { name: 'Mars', value: 5 },
    { name: 'Deep Space', value: 7 }
  ],
  missionLogs: [
    {
      name: "Mercury Orbit",
      type: "Orbital",
      status: "Completed",
      date: "May 1, 2025",
      description: "Successfully completed orbit insertion and deployed communication satellites."
    },
    {
      name: "Lunar Base Supply",
      type: "Lunar",
      status: "In Progress",
      date: "Apr 28, 2025",
      description: "Delivered critical supplies to Artemis Base. Return mission scheduled for next month."
    },
    {
      name: "Mars Reconnaissance",
      type: "Mars",
      status: "Completed",
      date: "Apr 22, 2025",
      description: "Captured high-resolution imagery of Olympus Mons and surrounding areas."
    },
    {
      name: "Europa Survey",
      type: "Deep Space",
      status: "Planned",
      date: "Apr 15, 2025",
      description: "Mission preparations underway. Launch window opens in 45 days."
    },
    {
      name: "Asteroid Belt Mining",
      type: "Asteroid",
      status: "In Progress",
      date: "Apr 8, 2025",
      description: "Resource extraction proceeding as planned. Currently at 67% of target."
    }
  ],
  spacecraftFleet: [
    { 
      name: 'Odyssey', 
      type: 'Explorer', 
      status: 'Active', 
      location: 'Mars Orbit', 
      fuelLevel: 78 
    },
    { 
      name: 'Phoenix', 
      type: 'Lander', 
      status: 'Standby', 
      location: 'Lunar Base Alpha', 
      fuelLevel: 92 
    },
    { 
      name: 'Voyager', 
      type: 'Deep Space', 
      status: 'Active', 
      location: 'Jupiter Approach', 
      fuelLevel: 45 
    },
    { 
      name: 'Pathfinder', 
      type: 'Rover', 
      status: 'Active', 
      location: 'Olympus Mons', 
      fuelLevel: 63 
    },
    { 
      name: 'Horizon', 
      type: 'Cargo', 
      status: 'Docked', 
      location: 'Earth Orbit', 
      fuelLevel: 100 
    }
  ],
  achievements: [
    { title: 'Certified Mission Commander', date: 'Oct 2024', icon: 'Award' },
    { title: 'Mars Landing Specialist', date: 'Jul 2024', icon: 'Award' },
    { title: 'Deep Space Navigation Expert', date: 'Mar 2024', icon: 'Award' },
    { title: '100 Commands Milestone', date: 'Jan 2024', icon: 'Activity' },
    { title: 'First Lunar Mission', date: 'Nov 2023', icon: 'Rocket' },
    { title: 'Orbital Mechanics Mastery', date: 'Sep 2023', icon: 'Settings' }
  ]
};

// Helper function to get the appropriate icon component
const getIconComponent = (iconName) => {
  switch (iconName) {
    case 'Award': return Award;
    case 'Activity': return Activity;
    case 'Rocket': return Rocket;
    case 'Settings': return Settings;
    default: return Award;
  }
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
        
        {/* Stats & Activity */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-1">User Statistics</h2>
              <p className="text-sm text-gray-400 mb-6">Overview of your cosmic journey</p>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg">
                  <Rocket className="h-8 w-8 text-indigo-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{userData.stats.missionsCompleted}</p>
                  <p className="text-sm text-gray-400">Missions</p>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg">
                  <Activity className="h-8 w-8 text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{userData.stats.commandsIssued}</p>
                  <p className="text-sm text-gray-400">Commands</p>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg">
                  <Settings className="h-8 w-8 text-teal-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{userData.stats.spacecraftsManaged}</p>
                  <p className="text-sm text-gray-400">Spacecrafts</p>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg">
                  <Calendar className="h-8 w-8 text-amber-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{userData.stats.missionsInProgress}</p>
                  <p className="text-sm text-gray-400">Active</p>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-gray-700/50 rounded-lg">
                  <Clock className="h-8 w-8 text-rose-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{userData.stats.totalFlightHours}</p>
                  <p className="text-sm text-gray-400">Flight Hours</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
            <div className="border-b border-gray-700">
              <div className="flex">
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'activity'
                      ? 'border-b-2 border-indigo-500 text-indigo-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('activity')}
                >
                  Recent Activity
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'missions'
                      ? 'border-b-2 border-indigo-500 text-indigo-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('missions')}
                >
                  Mission Breakdown
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeTab === 'activity' ? (
                <>
                  <h2 className="text-xl font-bold text-white mb-1">Activity Overview</h2>
                  <p className="text-sm text-gray-400 mb-6">Your missions and commands over time</p>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={userData.missionActivity}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#374151', 
                            border: 'none', 
                            borderRadius: '4px',
                            color: '#f9fafb'
                          }} 
                        />
                        <Legend wrapperStyle={{ color: '#e5e7eb' }} />
                        <Bar dataKey="missions" fill="#6366f1" name="Missions" />
                        <Bar dataKey="commands" fill="#a855f7" name="Commands" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white mb-1">Mission Breakdown</h2>
                  <p className="text-sm text-gray-400 mb-6">Types of missions you've completed</p>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={userData.missionBreakdown}
                        margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9ca3af" />
                        <YAxis dataKey="name" type="category" stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#374151', 
                            border: 'none', 
                            borderRadius: '4px',
                            color: '#f9fafb'
                          }} 
                        />
                        <Legend wrapperStyle={{ color: '#e5e7eb' }} />
                        <Bar dataKey="value" fill="#10b981" name="Missions Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mission Logs Section */}
      <div className="mt-6">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-1">Recent Mission Log</h2>
            <p className="text-sm text-gray-400 mb-6">Your latest cosmic adventures</p>
            
            <div className="space-y-4">
              {userData.missionLogs.map((mission, i) => (
                <div key={i} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-white">{mission.name}</h3>
                      <p className="text-sm text-gray-400">{mission.status} • {mission.date}</p>
                    </div>
                    <div className="bg-gray-700 text-indigo-300 text-xs px-2 py-1 rounded-full">
                      {mission.type}
                    </div>
                  </div>
                  <p className="text-sm mt-2 text-gray-300">{mission.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="px-6 pb-6 flex justify-center">
            <button className="py-2 px-4 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors text-gray-300">
              View All Mission Logs
            </button>
          </div>
        </div>
      </div>
      
      {/* Enterprise and Fleet Section */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-1">Enterprise Details</h2>
            <p className="text-sm text-gray-400 mb-6">Your organization information</p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{userData.enterprise.name}</h3>
                  <p className="text-sm text-gray-400">{userData.enterprise.industry}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Team Members</h4>
                <div className="flex -space-x-2 overflow-hidden">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-xs text-gray-300">
                      {['JD', 'KL', 'MN', 'OP', 'QR'][i]}
                    </div>
                  ))}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-800 bg-indigo-900/60 text-xs font-medium text-indigo-300">
                    +{userData.enterprise.teamMembers - 5}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Active Projects</h4>
                <div className="space-y-2">
                  {userData.enterprise.activeProjects.map((project, i) => (
                    <div key={i} className="text-sm flex items-center justify-between">
                      <span className="text-gray-300">{project}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-teal-300">Active</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-2">
                <button className="w-full py-2 px-4 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors text-gray-300">
                  View Enterprise Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2 bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-1">Spacecraft Fleet</h2>
            <p className="text-sm text-gray-400 mb-6">Vehicles under your command</p>
            
            <div className="space-y-4">
              {userData.spacecraftFleet.map((craft, i) => (
                <div key={i} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        craft.status === 'Active' ? 'bg-gray-700 text-teal-400' : 
                        craft.status === 'Standby' ? 'bg-gray-700 text-amber-400' : 'bg-gray-700 text-indigo-400'
                      }`}>
                        <Rocket className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{craft.name}</h3>
                        <p className="text-sm text-gray-400">{craft.type}</p>
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-gray-700 text-indigo-300">
                      {craft.status}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500">LOCATION</p>
                      <p className="text-sm text-gray-300">{craft.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">FUEL LEVEL</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              craft.fuelLevel > 70 ? 'bg-teal-500' : 
                              craft.fuelLevel > 30 ? 'bg-amber-500' : 'bg-rose-500'
                            }`} 
                            style={{ width: `${craft.fuelLevel}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-300">{craft.fuelLevel}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="px-6 pb-6 flex justify-center">
            <button className="py-2 px-4 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors text-gray-300">
              Manage Fleet
            </button>
          </div>
        </div>
      </div>
      
      {/* Achievements Section */}
      <div className="mt-6">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-1">Achievements & Certifications</h2>
            <p className="text-sm text-gray-400 mb-6">Your cosmic accomplishments</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userData.achievements.map((achievement, i) => {
                const IconComponent = getIconComponent(achievement.icon);
                return (
                  <div key={i} className="flex items-start space-x-3 p-3 border border-gray-700 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-white">{achievement.title}</h3>
                      <p className="text-xs text-gray-400">{achievement.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;