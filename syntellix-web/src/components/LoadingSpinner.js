import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Syntellix text with dynamic color change */}
        <div className="text-4xl font-bold font-tech">
          {'Syntellix'.split('').map((letter, index) => (
            <span
              key={index}
              className="inline-block"
              style={{
                animation: `colorChange 2s infinite ${index * 0.1}s`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>
        
        {/* Animated underline */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-info to-secondary"
          style={{
            animation: 'expand 2s infinite',
            transformOrigin: 'left',
          }}
        ></div>
      </div>

      {/* Styles for animations */}
      <style jsx>{`
        @keyframes colorChange {
          0%, 100% { color: #3a7bd5; } /* primary */
          50% { color: #94b9d0; } /* info */
        }
        @keyframes expand {
          0%, 100% { width: 0; }
          50% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;