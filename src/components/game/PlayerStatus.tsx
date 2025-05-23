
import React from 'react';
import { cn } from '@/lib/utils';
import { Player } from '@/context/GameContext';
import { GameAvatar } from '@/components/ui/game-avatar';
import { CoinCounter } from '@/components/ui/coin-counter';
import { Badge } from '@/components/ui/badge';

type PlayerStatus = 'green' | 'orange' | 'red' | 'eliminated';

interface PlayerStatusProps {
  player: Player;
  isActive?: boolean;
  showCoins?: boolean;
  coinChange?: number;
  status?: PlayerStatus;
  compact?: boolean;
  onClick?: () => void;
  showHost?: boolean;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({
  player,
  isActive = false,
  showCoins = true,
  coinChange = 0,
  status = 'green',
  compact = false,
  onClick,
  showHost = false
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

  // Status background
  const statusBackgrounds = {
    green: 'bg-green-500/10',
    orange: 'bg-orange-500/10',
    red: 'bg-red-500/10',
    eliminated: 'bg-gray-500/10'
  };
  
  // Status text colors
  const statusTextColors = {
    green: 'text-green-500',
    orange: 'text-orange-500',
    red: 'text-red-500',
    eliminated: 'text-gray-500'
  };
  
  const playerStatus = player.isEliminated ? 'eliminated' : status;
  
  return (
    <div 
      className={cn(
        "flex items-center p-2 rounded-lg transition-all",
        isActive ? "bg-white/30 scale-105 shadow-lg" : "bg-white/10", 
        player.isEliminated && "opacity-60",
        onClick && "cursor-pointer hover:bg-white/20",
        statusBackgrounds[playerStatus]
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
          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
          statusColors[playerStatus]
        )} />
      </div>
      
      <div className="ml-2 flex-grow overflow-hidden">
        <div className="flex items-center justify-between">
          <p className={cn(
            "font-medium truncate",
            compact ? "text-sm" : "text-base"
          )}>
            {player.name}
            {(player.isHost && showHost) && <span className="text-xs ml-1">(H)</span>}
          </p>
          
          <Badge 
            variant="outline" 
            className={cn(
              "ml-1 px-2 text-xs",
              statusTextColors[playerStatus]
            )}
          >
            {statusLabels[playerStatus]}
          </Badge>
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
