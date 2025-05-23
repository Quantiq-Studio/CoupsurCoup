
import React from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GameAvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
  fallbackClassName?: string;
  imageClassName?: string;
  badge?: React.ReactNode;
  bordered?: boolean;
}

export const GameAvatar: React.FC<GameAvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  className,
  fallbackClassName,
  imageClassName,
  badge,
  bordered = false,
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };
  
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  };
  
  const getFallbackText = () => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="relative inline-block">
      <Avatar 
        className={cn(
          sizeClasses[size],
          bordered && 'border-2 border-primary',
          className
        )}
      >
        <AvatarImage 
          src={src} 
          alt={name || "Avatar"}
          className={imageClassName}
        />
        <AvatarFallback className={cn("bg-muted", fallbackClassName)}>
          {getFallbackText()}
        </AvatarFallback>
      </Avatar>
      
      {status && (
        <span className={cn(
          'absolute bottom-0 right-0 block rounded-full',
          statusColors[status],
          size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-3 w-3',
          'ring-2 ring-white'
        )} />
      )}
      
      {badge && (
        <div className="absolute -bottom-2 -right-2">
          {badge}
        </div>
      )}
    </div>
  );
};
