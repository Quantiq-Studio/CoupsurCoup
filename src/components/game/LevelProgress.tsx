
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface LevelProgressProps {
  level: number;
  experience: number;
  compact?: boolean;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ level, experience, compact = false }) => {
  // Calculate XP for current level and next level
  const xpPerLevel = 100;
  const xpForCurrentLevel = (level - 1) * xpPerLevel;
  const xpForNextLevel = level * xpPerLevel;
  const currentLevelProgress = experience - xpForCurrentLevel;
  const progressPercentage = Math.floor((currentLevelProgress / xpPerLevel) * 100);
  
  return (
    <div className={`${compact ? 'p-2' : 'p-4'} bg-white/20 backdrop-blur-sm rounded-lg`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-gradient-to-br from-game-purple to-game-blue flex items-center justify-center text-white font-bold`}>
            {level}
          </div>
          <div className={`ml-3 ${compact ? '' : 'space-y-0.5'}`}>
            <h3 className={`font-bold text-gradient ${compact ? 'text-sm' : 'text-lg'}`}>
              Niveau {level}
            </h3>
            {!compact && (
              <p className="text-xs text-white/80">
                {getLevelTitle(level)}
              </p>
            )}
          </div>
        </div>
        
        {!compact && (
          <div className="bg-white/30 px-3 py-1 rounded-full text-sm">
            {currentLevelProgress}/{xpPerLevel} XP
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <Progress value={progressPercentage} className="h-2" />
        {compact && (
          <div className="flex justify-between text-xs">
            <span>{currentLevelProgress} XP</span>
            <span>{xpPerLevel - currentLevelProgress} XP pour niveau {level + 1}</span>
          </div>
        )}
        {!compact && (
          <div className="flex justify-between text-xs mt-1">
            <span>Niveau {level}</span>
            <span>Niveau {level + 1}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get title based on level
function getLevelTitle(level: number): string {
  if (level < 3) return 'Débutant';
  if (level < 5) return 'Amateur';
  if (level < 10) return 'Connaisseur';
  if (level < 15) return 'Expert';
  if (level < 25) return 'Maître';
  return 'Légende';
}

export default LevelProgress;
