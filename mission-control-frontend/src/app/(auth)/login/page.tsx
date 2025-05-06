'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { API_CONFIG } from '@/lib/api/config';
import { 
  Rocket, 
  User, 
  Mail, 
  Lock, 
  ArrowLeft
} from 'lucide-react';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function SpaceAuthPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState('login');
  const { login, register, error: authError, isLoading } = useAuth();

  // Login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup state
  const [signupForm, setSignupForm] = useState({ username: '', email: '', password: '' });
  const [signupError, setSignupError] = useState('');

  // Update local errors when auth hook error changes
  useEffect(() => {
    if (authError) {
      if (authMode === 'login') {
        setLoginError(authError);
      } else {
        setSignupError(authError);
      }
    }
  }, [authError, authMode]);

  // Set dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Handle login form submission using the auth hook
  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    const success = await login({
      identifier,
      password
    });

    if (success) {
      router.push('/telemetry');
    }
  };

  // Handle signup form submission using the auth hook
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    
    const success = await register(signupForm);
    
    if (success) {
      // Switch to login after successful signup
      setAuthMode('login');
      setIdentifier(signupForm.email); // Pre-fill the email
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    // Reset errors when switching
    setLoginError('');
    setSignupError('');
  };

  // Common input style classes
  const inputClasses = "w-full p-3 pl-10 rounded-md bg-gray-800/60 backdrop-blur-sm text-white border border-gray-700 focus:border-blue-500 focus:outline-none transition duration-300";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900">
      {/* Simple starry background with CSS */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-sm"></div>
        <div className="stars-md"></div>
        <div className="stars-lg"></div>
      </div>
      
      {/* Simple decorative elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-500/10 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-indigo-500/10 to-transparent"></div>
      
      {/* Subtle gradient circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full radial-gradient opacity-20"></div>

      {/* Header navigation */}
      <motion.nav
        initial="hidden"
        animate="show"
        variants={fadeIn}
        className="relative z-10 w-full p-6 flex justify-between items-center"
      >
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-white transform -rotate-45" />
          </div>
          <span>SMC</span>
        </Link>
        
        <Link href="/" className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </motion.nav>

      {/* Floating panel with animated reveal */}
      <motion.div 
        initial="hidden"
        animate="show"
        variants={slideUp}
        className="relative z-10 p-8 rounded-2xl w-full max-w-md backdrop-blur-xl bg-gray-900/40 border border-gray-800/80 shadow-xl"
      >
        {/* Subtle gradient accents */}
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-blue-600/20 filter blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-indigo-600/20 filter blur-xl pointer-events-none"></div>

        {/* Toggle switch */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900/70 backdrop-blur-md p-1 rounded-full flex">
            <button
              onClick={() => setAuthMode('login')}
              className={`py-2 px-6 rounded-full transition-all duration-300 ${authMode === 'login'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-700/20'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`py-2 px-6 rounded-full transition-all duration-300 ${authMode === 'signup'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-700/20'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-indigo-200 mb-3">
            {authMode === 'login' ? 'Access Mission Control' : 'Join the Mission'}
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
        </div>

        {/* Login Form */}
        {authMode === 'login' && (
          <form onSubmit={handleCredentialsLogin} className="space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                placeholder="Username or Email"
                className={inputClasses}
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Password"
                className={inputClasses}
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-gray-800 border-gray-700 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  Forgot password?
                </a>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-2 rounded-md text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition duration-300 shadow-lg shadow-blue-900/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : 'Sign In'}
            </button>

            <div className="mt-8 text-center">
              <p className="text-gray-400 mb-4">Or continue with</p>
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => window.location.href = `${API_CONFIG.BASE_URL}/oauth2/authorization/github`}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-md hover:bg-gray-700 text-white transition duration-300 border border-gray-700 shadow-lg shadow-black/20"
                  disabled={isLoading}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => window.location.href = `${API_CONFIG.BASE_URL}/oauth2/authorization/google`}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-md hover:bg-gray-700 text-white transition duration-300 border border-gray-700 shadow-lg shadow-black/20"
                  disabled={isLoading}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Signup Form */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Username"
                required
                value={signupForm.username}
                onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                className={inputClasses}
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="Email"
                required
                value={signupForm.email}
                onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                className={inputClasses}
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                placeholder="Password"
                required
                value={signupForm.password}
                onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                className={inputClasses}
                disabled={isLoading}
              />
              <div className="text-xs text-gray-500 mt-1 ml-1">
                Password must be at least 8 characters
              </div>
            </div>

            {signupError && (
              <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-2 rounded-md text-sm">
                {signupError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium hover:from-indigo-700 hover:to-blue-700 transition duration-300 shadow-lg shadow-indigo-900/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>

            <div className="mt-4 text-center text-sm text-gray-400">
              By signing up, you agree to our{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </a>
            </div>
          </form>
        )}
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial="hidden"
        animate="show"
        variants={fadeIn}
        className="relative z-10 w-full p-6 text-center text-gray-500 text-sm"
      >
        &copy; {new Date().getFullYear()} Space Mission Control • All systems nominal
      </motion.footer>
    </div>
  );
}

/* Add these CSS classes to your global.css file */
/*
.stars-sm {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0, 0, 0, 0)),
                    radial-gradient(2px 2px at 40px 70px, #ffffff, rgba(0, 0, 0, 0)),
                    radial-gradient(1px 1px at 90px 40px, #ffffff, rgba(0, 0, 0, 0)),
                    radial-gradient(1px 1px at 130px 80px, #ffffff, rgba(0, 0, 0, 0)),
                    radial-gradient(1px 1px at 160px 120px, #ffffff, rgba(0, 0, 0, 0));
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.3;
  animation: twinkle 5s ease-in-out infinite alternate;
}

.stars-md {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(2px 2px at 100px 150px, #ffffff, rgba(0, 0, 0, 0)),
                    radial-gradient(2px 2px at 200px 220px, #ffffff, rgba(0, 0, 0, 0)),
                    radial-gradient(2px 2px at 300px 250px, #ffffff, rgba(0, 0, 0, 0)),
                    radial-gradient(2px 2px at 400px 280px, #ffffff, rgba(0, 0, 0, 0)),
                    radial-gradient(2px 2px at 500px 320px, #ffffff, rgba(0, 0, 0, 0));
  background-repeat: repeat;
  background-size: 500px 500px;
  opacity: 0.4;
  animation: twinkle 7s ease-in-out infinite alternate;
}

.stars-lg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(3px 3px at 250px 350px, #ffffff, rgba(0, 0, 0, 0)),
                    radial-gradient(3px 3px at 550px 150px, #ffffff, rgba(0, 0, 0, 0)),
                    radial-gradient(3px 3px at 150px 650px, #ffffff, rgba(0, 0, 0, 0)),
                    radial-gradient(3px 3px at 450px 350px, #ffffff, rgba(0, 0, 0, 0)),
                    radial-gradient(3px 3px at 650px 450px, #ffffff, rgba(0, 0, 0, 0));
  background-repeat: repeat;
  background-size: 700px 700px;
  opacity: 0.5;
  animation: twinkle 9s ease-in-out infinite alternate;
}

.radial-gradient {
  background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(59,130,246,0.1) 50%, rgba(0,0,0,0) 100%);
}

@keyframes twinkle {
  0% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.6;
  }
}
*/