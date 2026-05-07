import React, { useState, useEffect } from 'react';

// Import Components
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Product from './components/Product';
import StockIn from './components/StockIn';
import StockOut from './components/StockOut';
import Report from './components/Report';
import { AlertCircle, Home } from 'lucide-react'; // Icons for 404

function App() {
  // --- State Management ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // --- Auth Check ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // --- Actions ---
  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  // --- Helper: Check if tab is valid ---
  const validTabs = ['dashboard', 'products', 'stockin', 'stockout', 'reports'];
  const isTabValid = validTabs.includes(activeTab);

  // --- Render Logic ---
  
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 1. ROUTER PROTECTION: If not authenticated, always show Login
  if (!isAuthenticated) {
    return <Login setAuth={setIsAuthenticated} />;
  }

  // 2. PROTECTED LAYOUT: Only shown if authenticated
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 font-sans antialiased overflow-hidden">
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Component Switcher with Fallback (Not Found) */}
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === 'products' && <Product />}
          {activeTab === 'stockin' && <StockIn />}
          {activeTab === 'stockout' && <StockOut />}
          {activeTab === 'reports' && <Report />}

          {/* 3. NOT FOUND FALLBACK */}
          {!isTabValid && (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
              <div className="p-4 bg-red-100 text-red-600 rounded-full">
                <AlertCircle size={48} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Page Not Found</h2>
              <p className="text-gray-500 max-w-xs">
                The section you are looking for does not exist or has been moved.
              </p>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                <Home size={18} /> Back to Dashboard
              </button>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}

export default App;