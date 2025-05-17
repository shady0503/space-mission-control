'use client'
import React, { useState, useEffect } from 'react';
import { enterpriseService, Enterprise, Operator, Spacecraft } from '@/lib/services/enterpriseService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Rocket, Target, Edit, Check, X, 
  Satellite, Globe, ChevronRight, AlertTriangle, Loader2,
  Search, Plus, UserPlus
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { operatorService } from '@/lib/services';

const EnterpriseHeader = ({ enterprise, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(enterprise?.name || '');
  const [description, setDescription] = useState(enterprise?.description || '');
  
  useEffect(() => {
    if (enterprise) {
      setName(enterprise.name);
      setDescription(enterprise.description || '');
    }
  }, [enterprise]);
  
  const handleSave = () => {
    onUpdate({ name, description });
    setIsEditing(false);
  };
  
  return (
    <div className="relative rounded-lg p-6 mb-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
      <div className="absolute top-4 right-4">
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700"
            onClick={() => setIsEditing(true)}
          >
            <Edit size={16} />
          </motion.button>
        ) : (
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-green-600/20 text-green-400 hover:bg-green-600/30"
              onClick={handleSave}
            >
              <Check size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/30"
              onClick={() => setIsEditing(false)}
            >
              <X size={16} />
            </motion.button>
          </div>
        )}
      </div>
      
      {!isEditing ? (
        <div>
          <div className="flex items-center mb-2">
            <div className="mr-3 relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                <Globe className="text-slate-900" size={20} />
              </div>
              <div className="absolute inset-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-40 blur-sm animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {enterprise?.name || 'Loading Enterprise...'}
            </h1>
          </div>
          <p className="text-slate-300 ml-13">
            {enterprise?.description || 'No description available'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-1">
              Enterprise Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-400 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, color, delay }) => {
  const progress = Math.min(100, value > 0 ? 100 : 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-slate-900/80 rounded-lg border border-slate-800 p-4 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div 
          className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}
        >
          <Icon size={18} className="text-slate-900" />
        </div>
        <span className="text-2xl font-bold text-slate-200">{value}</span>
      </div>
      
      <h3 className="text-sm font-medium text-slate-400 mb-2">{title}</h3>
      
      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: delay + 0.3 }}
          className={`h-full ${color.replace('bg-', 'bg-opacity-80 ')} rounded-full`}
        />
      </div>
    </motion.div>
  );
};

const OperatorCard = ({ operator }) => {
  const initials = operator.username
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Format the date to be more readable
  const formattedDate = new Date(operator.createdAt).toLocaleDateString();

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-slate-900/80 rounded-lg border border-slate-800 p-4"
    >
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center mr-3">
          <span className="font-bold text-slate-900">{initials}</span>
        </div>
        <div>
          <h3 className="text-slate-200 font-medium">{operator.username}</h3>
          <p className="text-slate-400 text-sm">{operator.email}</p>
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">ID: <span className="text-slate-300">{operator.id.substring(0, 8)}...</span></span>
        <span className="text-slate-400">Member since: <span className="text-slate-300">{formattedDate}</span></span>
      </div>
    </motion.div>
  );
};

const SpacecraftCard = ({ spacecraft }) => {
  // Determine spacecraft type using the 'type' property from API
  const isRover = spacecraft.type === "ROVER";
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-slate-900/80 rounded-lg border border-slate-800 p-4"
    >
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center mr-3 relative">
          {isRover ? <Globe size={20} className="text-slate-900" /> : <Satellite size={20} className="text-slate-900" />}
          <div className="absolute inset-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-40 blur-sm animate-pulse" />
        </div>
        <div>
          <h3 className="text-slate-200 font-medium">{spacecraft.displayName}</h3>
          <p className="text-slate-400 text-sm">{spacecraft.type}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-slate-400">External ID</p>
          <p className="text-slate-300">{spacecraft.externalId}</p>
        </div>
        <div>
          <p className="text-slate-400">External Name</p>
          <p className="text-slate-300">{spacecraft.externalName}</p>
        </div>
      </div>
    </motion.div>
  );
};

const MissionCard = ({ mission }) => {
  // Since the enterprise service doesn't fully specify mission type, 
  // we'll create a placeholder with realistic data structure
  const startDate = new Date(mission.createdAt || Date.now());
  const endDate = mission.endDate ? new Date(mission.endDate) : null;
  const progress = mission.progress || Math.floor(Math.random() * 100);
  const isActive = !mission.endDate;
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-slate-900/80 rounded-lg border border-slate-800 p-4"
    >
      <div className="flex items-center mb-3">
        <div className={`w-3 h-3 rounded-full mr-3 ${isActive ? 'bg-green-400' : 'bg-slate-400'}`} />
        <h3 className="text-slate-200 font-medium">{mission.name}</h3>
      </div>
      
      <p className="text-slate-300 text-sm mb-3">{mission.description || 'No description available'}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Start: <span className="text-slate-300">{startDate.toLocaleDateString()}</span></span>
          {endDate && (
            <span className="text-slate-400">End: <span className="text-slate-300">{endDate.toLocaleDateString()}</span></span>
          )}
        </div>
        
        {isActive && (
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// New component for search results
const OperatorSearchResult = ({ operator, onAdd, enterpriseId, adding }) => {
  const handleAdd = () => {
    onAdd(operator.id, enterpriseId);
  };
  
  const initials = operator.username
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between bg-slate-800 rounded-lg p-4 mb-2"
    >
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center mr-3">
          <span className="font-bold text-slate-900">{initials}</span>
        </div>
        <div>
          <h3 className="text-slate-200 font-medium">{operator.username}</h3>
          <p className="text-slate-400 text-sm">{operator.email}</p>
        </div>
      </div>
      <button
        onClick={handleAdd}
        disabled={adding}
        className="p-2 rounded-full bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
      >
        {adding ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <UserPlus size={16} />
        )}
      </button>
    </motion.div>
  );
};

// New component for operator search box
const OperatorSearchBox = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };
  
  return (
    <form onSubmit={handleSearch} className="flex mb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search operators by username or email"
        className="flex-grow px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-l-md text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-r-md flex items-center justify-center"
        disabled={loading}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Search size={16} />
        )}
      </button>
    </form>
  );
};

const TabButton = ({ active, children, onClick }) => (
  <button
    className={`px-4 py-2 rounded-md text-sm font-medium ${
      active ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-300'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center">
      <Loader2 size={40} className="animate-spin text-indigo-400 mb-4" />
      <p className="text-slate-400">Loading enterprise data...</p>
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center text-center max-w-md">
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
        <AlertTriangle size={32} className="text-red-400" />
      </div>
      <h3 className="text-slate-200 font-medium mb-2">Unable to load data</h3>
      <p className="text-slate-400 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-200 text-sm font-medium"
      >
        Retry
      </button>
    </div>
  </div>
);

const EnterpriseDashboard = () => {
  const { user } = useAuth();
  const [enterprise, setEnterprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('operators');
  
  const [operators, setOperators] = useState([]);
  const [spacecraft, setSpacecraft] = useState([]);
  const [missions, setMissions] = useState([]);
  
  // New state variables for search and add functionality
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addingOperator, setAddingOperator] = useState(null);
  const [showSearchBox, setShowSearchBox] = useState(false);
  
  const fetchEnterpriseData = async () => {
    if (!user?.enterpriseId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const enterpriseData = await enterpriseService.getEnterprise(user.enterpriseId);
      setEnterprise(enterpriseData);
      
      // Fetch related data
      const [operatorsData, spacecraftData, missionsData] = await Promise.all([
        enterpriseService.getEnterpriseOperators(user.enterpriseId),
        enterpriseService.getEnterpriseSpacecraft(user.enterpriseId),
        enterpriseService.getEnterpriseMissions(user.enterpriseId)
      ]);
      
      setOperators(operatorsData);
      setSpacecraft(spacecraftData);
      setMissions(missionsData);
    } catch (err) {
      console.error("Failed to fetch enterprise data:", err);
      setError("There was an error loading the enterprise data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEnterpriseData();
  }, [user?.enterpriseId]);
  
  const handleUpdateEnterprise = async (data) => {
    if (!enterprise?.id) return;
    
    // Optimistic update
    setEnterprise({ ...enterprise, ...data });
    
    try {
      const updatedEnterprise = await enterpriseService.updateEnterprise(
        enterprise.id,
        data
      );
      setEnterprise(updatedEnterprise);
    } catch (err) {
      console.error("Failed to update enterprise:", err);
      // Revert to original data
      fetchEnterpriseData();
      setError("Failed to update enterprise information.");
    }
  };
  
  // New handler for searching operators
  const handleSearchOperators = async (query) => {
    setSearching(true);
    setSearchResults([]);
    setError(null);
    
    try {
      const results = await operatorService.searchOperators(query);
      // Filter out operators already in the enterprise
      const filteredResults = results.filter(
        result => !operators.some(op => op.id === result.id)
      );
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Failed to search operators:", err);
      setError("Failed to search for operators. Please try again.");
    } finally {
      setSearching(false);
    }
  };
  
  // New handler for adding an operator to the enterprise
  const handleAddOperator = async (operatorId, enterpriseId) => {
    setAddingOperator(operatorId);
    setError(null);
    
    try {
      const addedOperator = await operatorService.addOperatorToEnterprise(operatorId, enterpriseId);
      // Update operators list
      setOperators([...operators, addedOperator]);
      // Remove from search results
      setSearchResults(searchResults.filter(op => op.id !== operatorId));
    } catch (err) {
      console.error("Failed to add operator:", err);
      setError("Failed to add operator to enterprise. Please try again.");
    } finally {
      setAddingOperator(null);
    }
  };
  
  // Toggle search box
  const toggleSearchBox = () => {
    setShowSearchBox(!showSearchBox);
    if (!showSearchBox) {
      setSearchResults([]);
    }
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorState message={error} onRetry={fetchEnterpriseData} />;
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 min-h-screen text-slate-200">
      <EnterpriseHeader 
        enterprise={enterprise} 
        onUpdate={handleUpdateEnterprise} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard 
          icon={Users} 
          title="Operators" 
          value={operators.length} 
          color="bg-indigo-400" 
          delay={0.1}
        />
        <StatCard 
          icon={Rocket} 
          title="Spacecraft" 
          value={spacecraft.length} 
          color="bg-purple-400" 
          delay={0.2}
        />
        <StatCard 
          icon={Target} 
          title="Missions" 
          value={missions.length} 
          color="bg-gradient-to-r from-indigo-400 to-purple-400" 
          delay={0.3}
        />
      </div>
      
      <div className="bg-slate-900/80 rounded-lg border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex justify-between">
          <div className="flex space-x-2">
            <TabButton 
              active={activeTab === 'operators'} 
              onClick={() => setActiveTab('operators')}
            >
              Operators
            </TabButton>
            <TabButton 
              active={activeTab === 'spacecraft'} 
              onClick={() => setActiveTab('spacecraft')}
            >
              Spacecraft
            </TabButton>
            <TabButton 
              active={activeTab === 'missions'} 
              onClick={() => setActiveTab('missions')}
            >
              Missions
            </TabButton>
          </div>
          
          {/* Add operator button (only visible in operators tab) */}
          {activeTab === 'operators' && (
            <button
              onClick={toggleSearchBox}
              className="flex items-center space-x-1 px-3 py-1 bg-indigo-500 hover:bg-indigo-400 rounded-md text-sm font-medium text-white"
            >
              {showSearchBox ? <X size={14} /> : <Plus size={14} />}
              <span>{showSearchBox ? 'Cancel' : 'Add Operator'}</span>
            </button>
          )}
        </div>
        
        <div className="p-4">
          {/* Search box */}
          {activeTab === 'operators' && showSearchBox && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-200 mb-3">Search Operators</h3>
              <OperatorSearchBox onSearch={handleSearchOperators} loading={searching} />
              
              {searchResults.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Results</h4>
                  {searchResults.map((operator) => (
                    <OperatorSearchResult 
                      key={operator.id} 
                      operator={operator} 
                      onAdd={handleAddOperator}
                      enterpriseId={enterprise.id}
                      adding={addingOperator === operator.id}
                    />
                  ))}
                </div>
              )}
              
              {searching && (
                <div className="text-center py-4">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2 text-indigo-400" />
                  <p className="text-slate-400">Searching...</p>
                </div>
              )}
              
              {!searching && searchResults.length === 0 && (
                <div className="text-center py-4 text-slate-400">
                  <p>Search for operators to add to your enterprise</p>
                </div>
              )}
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {activeTab === 'operators' && (
              <motion.div
                key="operators"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {operators.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {operators.map((operator) => (
                      <OperatorCard key={operator.id} operator={operator} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Users size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No operators found in this enterprise</p>
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'spacecraft' && (
              <motion.div
                key="spacecraft"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {spacecraft.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {spacecraft.map((craft) => (
                      <SpacecraftCard key={craft.id} spacecraft={craft} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Satellite size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No spacecraft found in this enterprise</p>
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'missions' && (
              <motion.div
                key="missions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {missions.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {missions.map((mission) => (
                      <MissionCard key={mission.id} mission={mission} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Target size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No missions found in this enterprise</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseDashboard;