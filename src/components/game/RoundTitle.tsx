
import React from 'react';

interface RoundTitleProps {
  roundNumber: number;
  title: string;
  description?: string;
}

const RoundTitle: React.FC<RoundTitleProps> = ({ roundNumber, title, description }) => {
  return (
    <div className="text-center mb-8 animate-bounce-in">
      <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 mb-2">
        <span className="text-sm font-medium">Manche {roundNumber}</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
      {description && (
        <p className="text-lg text-white/80">{description}</p>
      )}
    </div>
  );
};

export default RoundTitle;
