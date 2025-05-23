
import React from 'react';
import { cn } from "@/lib/utils";
import { LucideIcon, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";

interface GameNotificationProps {
  title: string;
  message: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'error';
  onClose?: () => void;
  timestamp?: string;
  className?: string;
}

export const GameNotification: React.FC<GameNotificationProps> = ({
  title,
  message,
  icon: Icon = Bell,
  variant = 'default',
  onClose,
  timestamp,
  className,
}) => {
  const variants = {
    default: 'bg-white/20 border-accent/40',
    success: 'bg-green-500/20 border-green-500/40',
    warning: 'bg-yellow-500/20 border-yellow-500/40',
    error: 'bg-red-500/20 border-red-500/40'
  };
  
  const iconColors = {
    default: 'text-accent',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };
  
  return (
    <Card 
      className={cn(
        'p-4 backdrop-blur-sm border',
        variants[variant],
        className
      )}
    >
      <div className="flex gap-3">
        <div>
          <Icon className={cn('h-5 w-5', iconColors[variant])} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{title}</h4>
            {onClose && (
              <button onClick={onClose} className="text-white/60 hover:text-white">
                &times;
              </button>
            )}
          </div>
          <p className="text-sm text-white/80 mt-1">{message}</p>
          {timestamp && (
            <p className="text-xs text-white/60 mt-2">{timestamp}</p>
          )}
        </div>
      </div>
    </Card>
  );
};
