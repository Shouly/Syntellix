import React from 'react';
import logo from '../assets/logo.svg';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-bg-primary">
      {/* Rotating logo */}
      <img
        src={logo}
        alt="Syntellix Logo"
        className="w-28 h-28 animate-spin"
        style={{ animationDuration: '3s' }}
      />
    </div>
  );
}

export default LoadingSpinner;
