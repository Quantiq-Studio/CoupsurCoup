
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface QuestionDisplayProps {
  question: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  compact?: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
  question, 
  category, 
  difficulty = 'medium',
  compact = false 
}) => {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-500 hover:bg-green-500/30';
      case 'medium':
        return 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-500 hover:bg-red-500/30';
      default:
        return 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30';
    }
  };
  
  return (
    <div className={`${compact ? 'text-left' : 'text-center'}`}>
      {(category || difficulty) && (
        <div className={`flex ${compact ? 'justify-start' : 'justify-center'} gap-2 mb-3`}>
          {category && (
            <Badge variant="outline" className="bg-white/10 hover:bg-white/20 text-white">
              {category}
            </Badge>
          )}
          {difficulty && (
            <Badge variant="outline" className={getDifficultyColor()}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
          )}
        </div>
      )}
      <h2 className={`font-bold ${compact ? 'text-lg' : 'text-2xl'} mb-2 text-white`}>{question}</h2>
    </div>
  );
};

export default QuestionDisplay;
