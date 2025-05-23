
import React from 'react';
import { cn } from '@/lib/utils';
import { Player } from '@/context/GameContext';
import { GameAvatar } from '@/components/ui/game-avatar';
import { CoinCounter } from '@/components/ui/coin-counter';

type PlayerStatus = 'green' | 'orange' | 'red' | 'eliminated';

interface PlayerStatusProps {
  player: Player;
  isActive?: boolean;
  showCoins?: boolean;
  coinChange?: number;
  status?: PlayerStatus;
  compact?: boolean;
  onClick?: () => void;
  showHost?: boolean; // Added missing prop
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({
  player,
  isActive = false,
  showCoins = true,
  coinChange = 0,
  status = 'green',
  compact = false,
  onClick,
  showHost = true // Default to true to maintain existing behavior
}) => {
  // Status colors
  const statusColors = {
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    eliminated: 'bg-gray-500'
  };

  // Status label
  const statusLabels = {
    green: 'Actif',
    orange: 'Attention',
    red: 'Danger',
    eliminated: 'Éliminé'
  };
  
  return (
    <div 
      className={cn(
        "flex items-center p-2 rounded-lg transition-all",
        isActive ? "bg-white/30 scale-105 shadow-lg" : "bg-white/10", 
        player.isEliminated && "opacity-60",
        onClick && "cursor-pointer hover:bg-white/20"
      )}
      onClick={onClick}
    >
      <div className="relative">
        <GameAvatar 
          src={player.avatar} 
          name={player.name} 
          size={compact ? "sm" : "md"} 
          bordered={isActive}
          className={cn(
            player.isEliminated && "grayscale"
          )}
        />
        
        <div className={cn(
          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white",
          statusColors[player.isEliminated ? 'eliminated' : status]
        )} />
      </div>
      
      <div className="ml-2 flex-grow overflow-hidden">
        <div className="flex items-center justify-between">
          <p className={cn(
            "font-medium truncate",
            compact ? "text-sm" : "text-base"
          )}>
            {player.name}
            {showHost && player.isHost && <span className="text-xs ml-1">(H)</span>}
          </p>
          
          {!compact && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-white/20 ml-1">
              {player.isEliminated ? 'Éliminé' : statusLabels[status]}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-sm">{player.score} pts</span>
          
          {showCoins && (
            <CoinCounter 
              value={player.coins || 1000} 
              change={coinChange}
              size="sm" 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStatus;
