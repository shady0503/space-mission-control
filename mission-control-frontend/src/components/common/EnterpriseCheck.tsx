'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Building, UserPlus, Loader2, LogOut } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { enterpriseService } from '@/lib/services/enterpriseService';
import { operatorService } from '@/lib/services/operatorService';
import apiClient from '@/lib/api/apiClient';
import { API_CONFIG } from '@/lib/api/config';
import { signOut } from 'next-auth/react';

// Routes that don't need enterprise checks (public routes and routes that handle enterprise management)
const EXEMPT_ROUTES = ['/', '/login', '/signup', '/auth/callback', '/logout', '/enterprise/create', '/enterprise/join'];

// Function to update operator with enterprise ID
const updateOperatorEnterpriseId = async (operatorId: string, enterpriseId: string): Promise<void> => {
  try {
    await apiClient.post(
      `${API_CONFIG.ENDPOINTS.OPERATOR.ADD_TO_ENTERPRISE}?enterpriseId=${enterpriseId}&operatorId=${operatorId}`
    );
  } catch (error) {
    console.error('Error updating operator enterprise ID:', error);
    throw error;
  }
};

export default function EnterpriseCheck({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, enterpriseId, logout } = useAuth();
  const pathname = usePathname();
  const isExemptRoute = EXEMPT_ROUTES.some(route => pathname === route);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [formView, setFormView] = useState<'options' | 'create-form' | 'await-invitation'>('options');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'creating' | 'updating-profile' | 'completed'>('creating');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle creating a new enterprise
  const handleCreateEnterprise = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setStep('creating');
    
    try {
      if (!formData.name.trim()) {
        throw new Error('Enterprise name is required');
      }
      
      if (!user?.id) {
        throw new Error('User ID not found. Please try logging in again.');
      }
      
      // Call the API to create the enterprise
      const createdEnterprise = await enterpriseService.createEnterprise({
        name: formData.name,
        description: formData.description
      });
      
      // Now update the user's profile with the new enterprise ID
      setStep('updating-profile');
      
      if (createdEnterprise && createdEnterprise.id) {
        // Update operator with the new enterprise ID
        await updateOperatorEnterpriseId(user.id, createdEnterprise.id.toString());
        setStep('completed');
      } else {
        throw new Error('Enterprise created but no ID was returned');
      }
      
      // Show success message but don't auto-refresh
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create enterprise. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logging out
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Common logout button component
  const LogoutButton = () => (
    <Button
      variant="ghost" 
      size="sm"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-gray-800"
    >
      {isLoggingOut ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4 mr-2" />
      )}
      Log Out
    </Button>
  );

  // Show enterprise options or form based on user's status
  if (isAuthenticated && !enterpriseId && !isExemptRoute) {
    if (formView === 'options') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 relative">
          <LogoutButton />
          <div className="w-full max-w-3xl p-8 mx-4">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-4">
                Enterprise Membership Required
              </h1>
              <p className="text-gray-300 text-lg">
                Welcome {user?.username || 'User'}! To continue using the platform, you need to be part of an enterprise.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-gray-800 rounded-lg hover:border-indigo-500/50 hover:bg-indigo-900/30 transition-colors group h-full">
                <div className="flex flex-col h-full">
                  <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30 w-fit mx-auto mb-4">
                    <Building className="w-8 h-8" />
                  </div>
                  <h3 className="font-medium text-gray-100 group-hover:text-indigo-300 transition-colors text-xl text-center mb-2">
                    Create a New Enterprise
                  </h3>
                  <p className="text-gray-400 mb-6 text-center flex-grow">
                    Set up your own enterprise and manage your own space missions and spacecraft. You'll be the administrator with full control.
                  </p>
                  <div className="mt-auto text-center">
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 h-auto text-lg cursor-pointer"
                      onClick={() => setFormView('create-form')}
                    >
                      Create Enterprise
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border border-gray-800 rounded-lg hover:border-blue-500/50 hover:bg-blue-900/30 transition-colors group h-full">
                <div className="flex flex-col h-full">
                  <div className="p-3 rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 w-fit mx-auto mb-4">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <h3 className="font-medium text-gray-100 group-hover:text-blue-300 transition-colors text-xl text-center mb-2">
                    Await Enterprise Invitation
                  </h3>
                  <p className="text-gray-400 mb-6 text-center flex-grow">
                    Contact an administrator to add you to their enterprise. You'll receive a notification when invited.
                  </p>
                  <div className="mt-auto text-center">
                    <Button 
                      variant="outline"
                      className="bg-transparent border-blue-300/30 hover:border-blue-300/50 hover:bg-blue-900/10 text-blue-300 hover:text-blue-200 px-8 py-6 h-auto text-lg cursor-pointer transition-all duration-200"
                      onClick={() => setFormView('await-invitation')}
                    >
                      Wait for Invitation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (formView === 'create-form') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 relative">
          <LogoutButton />
          <div className="w-full max-w-xl p-8 mx-4 bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg">
            <div className="text-center mb-8">
              <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400 w-fit mx-auto mb-4">
                <Building className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Create Your Enterprise</h1>
              <p className="text-gray-300">
                Set up your organization to manage missions and spacecraft
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-md text-red-200">
                {error}
              </div>
            )}
            
            {success ? (
              <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-md text-green-200 flex flex-col items-center gap-4">
                <div className="bg-green-900/50 rounded-full p-3">
                  <Building className="w-8 h-8 text-green-300" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Enterprise Created Successfully!</h3>
                  <p className="mb-4">Your enterprise has been created and your account has been updated.</p>
                  <p className="text-sm text-green-300 mb-6">Please log out and log in again to access your new enterprise.</p>
                </div>
                <Button 
                  className="bg-green-700 hover:bg-green-800 text-white cursor-pointer"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging Out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out Now
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateEnterprise} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-200">Enterprise Name *</Label>
                  <Input 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter enterprise name"
                    required
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-200">Description (Optional)</Label>
                  <Textarea 
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of your enterprise"
                    rows={3}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setFormView('options')}
                    className="border-blue-300/30 hover:border-blue-300/50 hover:bg-blue-900/10 text-blue-300 hover:text-blue-200 cursor-pointer transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  
                  <Button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {step === 'creating' ? 'Creating...' : 
                         step === 'updating-profile' ? 'Updating...' : 'Processing...'}
                      </>
                    ) : (
                      'Create Enterprise'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      );
    }
    
    if (formView === 'await-invitation') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 relative">
          <LogoutButton />
          <div className="w-full max-w-xl p-8 mx-4 bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg text-center">
            <div className="p-3 rounded-full bg-blue-500/20 text-blue-400 w-fit mx-auto mb-4">
              <UserPlus className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Awaiting Enterprise Invitation</h1>
            <p className="text-gray-300 mb-8">
              You've chosen to wait for an invitation to join an existing enterprise.
            </p>
            
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-8">
              <p className="text-gray-400 mb-4">
                Please contact your enterprise administrator and provide them with your information:
              </p>
              <div className="bg-gray-800 rounded p-4 mb-6 text-left">
                <p className="text-gray-300"><span className="text-gray-500">Username:</span> {user?.username}</p>
                <p className="text-gray-300"><span className="text-gray-500">Email:</span> {user?.email}</p>
                <p className="text-gray-300"><span className="text-gray-500">User ID:</span> {user?.id}</p>
              </div>
              <p className="text-gray-500 text-sm">
                Once you've been added to an enterprise, you'll be able to access all features.
              </p>
            </div>
            
            <Button 
              variant="outline"
              onClick={() => setFormView('options')}
              className="border-blue-300/30 hover:border-blue-300/50 hover:bg-blue-900/10 text-blue-300 hover:text-blue-200 cursor-pointer transition-all duration-200"
            >
              Back to Options
            </Button>
          </div>
        </div>
      );
    }
  }

  // Otherwise, render the children as normal
  return <>{children}</>;
} 