import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import Login from './components/Login';
import SystemInit from './components/SystemInit';
import Dashboard from './components/Dashboard';

function App() {
  const [isInitialized, setIsInitialized] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkSystemInit();
    checkAuthentication();
  }, []);

  const checkSystemInit = async () => {
    try {
      const response = await axios.get('/console/api/sys_init');
      setIsInitialized(response.data.sys_init_status);
    } catch (error) {
      console.error('Error checking system init status:', error);
      setIsInitialized(false);
    }
  };

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
  };

  if (isInitialized === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-300 to-purple-400 font-tech">
        <ArrowPathIcon className="h-16 w-16 text-white animate-spin" />
        <div className="mt-4 text-3xl font-bold text-white tracking-wide">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/system-init" element={
            isInitialized ? <Navigate to="/" /> : <SystemInit setIsInitialized={setIsInitialized} />
          } />
          <Route path="/" element={
            isInitialized ? (
              isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />
            ) : <Navigate to="/system-init" />
          } />
          <Route path="/dashboard" element={
            isAuthenticated ? <Dashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
