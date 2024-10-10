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
              className="inline-block animate-opacity-change"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>
        
        {/* Animated underline */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-white animate-expand"
          style={{
            transformOrigin: 'left',
          }}
        ></div>
      </div>
    </div>
  );
}

export default LoadingSpinner;