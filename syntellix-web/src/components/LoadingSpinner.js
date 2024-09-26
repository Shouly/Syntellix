import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Syntellix text with white color */}
        <div className="text-4xl font-bold font-tech text-white">
          {'Syntellix'.split('').map((letter, index) => (
            <span
              key={index}
              className="inline-block"
              style={{
                animation: `opacityChange 2s infinite ${index * 0.1}s`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>
        
        {/* Animated underline */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-white"
          style={{
            animation: 'expand 2s infinite',
            transformOrigin: 'left',
          }}
        ></div>
      </div>

      {/* Styles for animations */}
      <style jsx>{`
        @keyframes opacityChange {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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