
import React from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarData {
  src?: string;
  name?: string;
  fallback?: string;
}

interface AvatarGroupProps {
  avatars: AvatarData[];
  limit?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  limit = 5,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  const displayAvatars = avatars.slice(0, limit);
  const remaining = avatars.length - limit;
  
  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayAvatars.map((avatar, index) => (
        <Avatar 
          key={index} 
          className={cn(
            sizeClasses[size],
            "border-2 border-background"
          )}
        >
          <AvatarImage src={avatar.src} alt={avatar.name || `User ${index + 1}`} />
          <AvatarFallback>
            {avatar.fallback || avatar.name?.substring(0, 2).toUpperCase() || `U${index + 1}`}
          </AvatarFallback>
        </Avatar>
      ))}
      
      {remaining > 0 && (
        <div className={cn(
          sizeClasses[size],
          "rounded-full bg-muted flex items-center justify-center border-2 border-background text-xs font-medium"
        )}>
          +{remaining}
        </div>
      )}
    </div>
  );
};
