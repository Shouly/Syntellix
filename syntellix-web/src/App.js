import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastProvider } from './components/Toast';
import Login from './components/Login';
import SystemInit from './components/SystemInit';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner'; // 导入 LoadingSpinner 组件

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-indigo-300 to-purple-300 relative overflow-hidden">
        {/* Subtle tech-inspired background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmZmZmMTAiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iIzAwMDAwMDIwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-30"></div>
        </div>
        <LoadingSpinner /> {/* 使用 LoadingSpinner 组件 */}
      </div>
    );
  }

  return (
    <Router>
      <ToastProvider>
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
      </ToastProvider>
    </Router>
  );
}

export default App;
