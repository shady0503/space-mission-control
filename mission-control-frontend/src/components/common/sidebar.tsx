'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Rocket, 
  Globe, 
  Telescope, 
  Menu, 
  X, 
  User, 
  Settings,
  LogOut,
  Satellite,
  Building,
  Activity
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Handle responsive state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
        setIsMobile(true);
      } else {
        setIsOpen(true);
        setIsMobile(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation items
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Enterprise', href: '/enterprise', icon: Building},
    { name: 'Missions', href: '/missions', icon: Rocket },
    { name: 'Spacecrafts', href: '/spacecrafts', icon: Satellite },
    { name: 'Telemetry', href: '/telemetry', icon: Activity },
  ];

  // Account items
  const accountItems = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    {name: 'Log out', href: '/logout', icon: LogOut },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-slate-900 p-2 rounded-md text-slate-200 hover:bg-slate-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`top-0 left-0 h-full bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200 z-40 transition-all duration-300 ease-in-out shadow-xl shadow-indigo-900/20 overflow-hidden ${
          isOpen ? 'w-64' : 'w-0 lg:w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-4 flex items-center justify-center h-24 border-b border-slate-800">
            <div className={`flex items-center space-x-3 ${!isOpen && 'lg:justify-center'}`}>
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 animate-pulse"></div>
                <div className="absolute inset-1 rounded-full bg-slate-900 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
              <span className={`font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 ${!isOpen && 'lg:hidden'}`}>
                CosmicNav
              </span>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 overflow-y-auto pt-4 pb-4">
            <div className="px-4 mb-6">
              <h2 className={`text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ${!isOpen && 'lg:text-center'}`}>
                {isOpen ? 'Navigation' : ''}
              </h2>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-indigo-900/30 text-indigo-300' 
                          : 'hover:bg-slate-800/60 text-slate-300'
                      } ${!isOpen && 'lg:justify-center'}`}
                      onClick={() => isMobile && setIsOpen(false)}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      {isOpen && <span className="ml-3">{item.name}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Account Section */}
            <div className="px-4">
              <h2 className={`text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ${!isOpen && 'lg:text-center'}`}>
                {isOpen ? 'Account' : ''}
              </h2>
              <nav className="space-y-1">
                {accountItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-indigo-900/30 text-indigo-300' 
                          : 'hover:bg-slate-800/60 text-slate-300'
                      } ${!isOpen && 'lg:justify-center'}`}
                      onClick={() => isMobile && setIsOpen(false)}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      {isOpen && <span className="ml-3">{item.name}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* User Info Section */}
          <div className="border-t border-slate-800 p-4">
            {session ? (
              <div className={`flex items-center ${!isOpen && 'lg:justify-center'}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white font-medium">
                  {session.user?.name?.charAt(0) || 'U'}
                </div>
                {isOpen && (
                  <div className="ml-3">
                    <p className="text-sm font-medium text-slate-200">{session.user?.name || 'User'}</p>
                    <p className="text-xs text-slate-400">{session.user?.email || ''}</p>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login"
                className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors hover:bg-slate-800 text-slate-300 ${!isOpen && 'lg:justify-center'}`}
                onClick={() => isMobile && setIsOpen(false)}
              >
                <LogOut className="h-5 w-5 text-slate-400" />
                {isOpen && <span className="ml-3">Sign in</span>}
              </Link>
            )}
          </div>
          
          {/* Collapse Button (Desktop Only) */}
          <button 
            className="hidden lg:flex items-center justify-center p-4 border-t border-slate-800 text-slate-400 hover:text-slate-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}