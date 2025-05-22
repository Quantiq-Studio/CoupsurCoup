
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Player } from '@/context/GameContext';

interface ScoreBoardProps {
  players: Player[];
  compact?: boolean;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ players, compact = false }) => {
  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  return (
    <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-4">
      <h2 className={`font-bold mb-4 ${compact ? 'text-lg' : 'text-xl'}`}>Tableau des scores</h2>
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <div 
            key={player.id} 
            className={`flex items-center p-2 rounded-lg ${
              player.isEliminated ? 'opacity-60 bg-black/10' : 'bg-white/10'
            }`}
          >
            <div className="w-6 mr-2">{index + 1}</div>
            <Avatar className={`h-8 w-8 mr-2 ${player.isEliminated ? 'grayscale' : ''}`}>
              <AvatarImage src={player.avatar} alt={player.name} />
              <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-grow font-medium">
              {player.name} {player.isHost && compact && <span className="text-xs">(H)</span>}
            </div>
            <div className="font-bold text-sm">{player.score}</div>
            {player.isEliminated && <div className="text-xs ml-2 text-red-400">Éliminé</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBoard;
