
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="relative w-16 h-16">
      <div className="absolute w-16 h-16 border-4 border-t-primary border-r-accent border-b-secondary border-l-primary border-solid rounded-full animate-spin"></div>
      <div className="absolute w-14 h-14 m-1 border-4 border-t-accent border-r-secondary border-b-primary border-l-accent border-solid rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
    </div>
  );
};

export default LoadingSpinner;
