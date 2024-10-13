import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './components/Login';
import SystemInit from './components/SystemInit';
import { ToastProvider } from './components/Toast';

import { API_BASE_URL } from './config';

axios.defaults.baseURL = API_BASE_URL;

const queryClient = new QueryClient();

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
      <div className="min-h-screen w-full bg-bg-primary">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ToastProvider>
          <div className="App bg-bg-primary min-h-screen">
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
    </QueryClientProvider>
  );
}

export default App;
