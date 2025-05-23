
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge as BadgeType } from '@/context/GameContext';
import { Trophy, Award, Star, Medal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { badgeImages } from '@/data/avatars';

interface BadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const rarityColors = {
  common: 'bg-gray-400',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-400'
};

const rarityIcons = {
  common: Trophy,
  uncommon: Award,
  rare: Star,
  epic: Medal,
  legendary: Trophy
};

const getBadgeIcon = (badge: BadgeType) => {
  // If we have a custom icon ID in the format "badge-1" to "badge-6", extract the number
  if (badge.icon && badge.icon.startsWith('badge-')) {
    const iconNumber = parseInt(badge.icon.split('-')[1], 10);
    if (!isNaN(iconNumber) && iconNumber <= badgeImages.length) {
      return badgeImages[iconNumber - 1];
    }
  }
  return null;
};

const BadgeComponent: React.FC<BadgeProps> = ({ badge, size = 'md', showTooltip = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  const IconComponent = rarityIcons[badge.rarity] || Trophy;
  const badgeImage = getBadgeIcon(badge);
  
  const BadgeIcon = () => (
    <div className={cn(
      'rounded-full flex items-center justify-center',
      rarityColors[badge.rarity],
      sizeClasses[size],
      'relative overflow-hidden'
    )}>
      {badgeImage ? (
        <img
          src={badgeImage}
          alt={badge.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <IconComponent className="text-white" />
      )}
      
      {/* Badge earned indicator */}
      {badge.earnedAt && (
        <div className="absolute bottom-0 w-full h-1/4 bg-green-400/50 flex items-center justify-center">
          <span className="text-[8px] text-white font-bold">Obtenu</span>
        </div>
      )}
    </div>
  );
  
  return showTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <BadgeIcon />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-bold">{badge.name}</p>
            <p className="text-xs">{badge.description}</p>
            {badge.earnedAt && (
              <p className="text-xs opacity-75">
                Obtenu le {new Date(badge.earnedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <BadgeIcon />
  );
};

export default BadgeComponent;
