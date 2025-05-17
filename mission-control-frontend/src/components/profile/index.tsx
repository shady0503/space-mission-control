'use client';
import React, { useState, useEffect } from 'react';
import { Clock, Rocket, Settings, Building2, Award, User, Mail, Shield, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { operatorService } from '@/lib/services/operatorService';
import { enterpriseService } from '@/lib/services/enterpriseService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Animation variants
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface Enterprise {
  id: string;
  name: string;
  description?: string;
}

interface UserForm {
  username: string;
  email: string;
  enterpriseName: string;
  enterpriseRole: string;
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  color: string;
  description?: string;
}

const UserProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  const [userForm, setUserForm] = useState<UserForm>({
    username: '',
    email: '',
    enterpriseName: '',
    enterpriseRole: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch enterprise data if user has an enterprise ID
        if (user.enterpriseId) {
          const enterpriseData = await enterpriseService.getEnterprise(user.enterpriseId);
          setEnterprise(enterpriseData);
        }
        
        // Initialize form with user data
        setUserForm({
          username: user.username || '',
          email: user.email || '',
          enterpriseName: enterprise?.name || '',
          enterpriseRole: user.role || ''
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  useEffect(() => {
    // Update form when enterprise data is loaded
    if (enterprise) {
      setUserForm(prev => ({
        ...prev,
        enterpriseName: enterprise.name || ''
      }));
    }
  }, [enterprise]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Submit form data
      handleSaveChanges();
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    try {
      await operatorService.updateProfile({
        id: user?.id,
        username: userForm.username,
        email: userForm.email,
        role: userForm.enterpriseRole
      });
      
      // Refresh user data (handled by auth context)
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserForm({
      ...userForm,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" message="Loading profile..." className="" />
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="overflow-hidden border-gray-700 bg-gray-800/70 backdrop-blur-md shadow-lg hover:shadow-blue-800/10 transition-shadow">
            <div className="relative h-32 bg-gradient-to-r from-blue-900 to-indigo-800 overflow-hidden">
              {/* Decorative stars pattern */}
              <div className="absolute inset-0 stars-sm opacity-40"></div>
              
              {/* Decorative orbit path */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[200px] h-[200px] rounded-full border border-dashed border-blue-400/30 animate-spin-slow"></div>
              </div>
            </div>
            
            <div className="px-6 -mt-12 relative z-10 flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-white text-3xl font-medium overflow-hidden">
                  {user?.username ? (
                    <span>{user.username.slice(0, 2).toUpperCase()}</span>
                  ) : (
                    <User className="h-12 w-12 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            
            <CardHeader className="text-center pt-3">
              <Badge className="mx-auto mb-2 bg-indigo-900/80 text-indigo-200 border-indigo-700/50">
                {user?.role || 'Astronaut'}
              </Badge>
              <CardTitle className="text-2xl font-bold text-white">{user?.username || 'User'}</CardTitle>
              {enterprise && (
                <p className="text-gray-400 text-sm">at {enterprise.name}</p>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4 mt-2">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Username</label>
                      <input 
                        type="text"
                        name="username"
                        value={userForm.username} 
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 bg-gray-700/80 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Email</label>
                      <input 
                        type="email"
                        name="email"
                        value={userForm.email} 
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 bg-gray-700/80 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Role</label>
                      <input 
                        type="text"
                        name="enterpriseRole"
                        value={userForm.enterpriseRole} 
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 bg-gray-700/80 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-800/80 rounded-lg border border-gray-700 hover:border-blue-600/30 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400">Email</p>
                        <p className="text-sm text-white">{user?.email || 'Not set'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-800/80 rounded-lg border border-gray-700 hover:border-indigo-600/30 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-indigo-300" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-400">Member Since</p>
                        <p className="text-sm text-white">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
                      </div>
                    </div>
                    
                    {enterprise && (
                      <div className="flex items-center gap-3 p-3 bg-gray-800/80 rounded-lg border border-gray-700 hover:border-purple-600/30 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-purple-300" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400">Enterprise</p>
                          <p className="text-sm text-white">{enterprise.name || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="pb-6">
              <Button 
                onClick={handleEditToggle} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all"
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Mission Stats */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="grid gap-6">
            <Card className="border-gray-700 bg-gray-800/70 backdrop-blur-md shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-900/50 text-blue-300 border border-blue-800/50">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl text-white">Mission Stats</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    icon={Rocket}
                    title="Active Missions"
                    value="0"
                    color="bg-gradient-to-br from-blue-600 to-cyan-600"
                    description="Missions currently in progress"
                  />
                  
                  <StatCard
                    icon={Calendar}
                    title="Completed"
                    value="0"
                    color="bg-gradient-to-br from-green-600 to-emerald-600"
                    description="Successfully completed missions"
                  />
                  
                  <StatCard
                    icon={Shield}
                    title="Security Level"
                    value="Level 1"
                    color="bg-gradient-to-br from-indigo-600 to-purple-600"
                    description="Your current security clearance"
                  />
                  
                  <StatCard
                    icon={Award}
                    title="Achievements"
                    value="0"
                    color="bg-gradient-to-br from-amber-600 to-yellow-600"
                    description="Milestones and badges earned"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-gray-700 bg-gray-800/70 backdrop-blur-md shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-900/50 text-indigo-300 border border-indigo-800/50">
                    <Settings className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl text-white">Preferences</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-400 text-sm">Account and notification preferences will appear here once available.</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Stats card component
const StatCard = ({ icon: Icon, title, value, color, description }: StatCardProps) => {
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 hover:border-blue-700/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          <p className="text-sm text-gray-400">{title}</p>
        </div>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
};

export default UserProfile;