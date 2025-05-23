
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface CountdownTimerProps {
  seconds: number;
  onComplete?: () => void;
  className?: string;
  showProgress?: boolean;
  progressClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  seconds,
  onComplete,
  className,
  showProgress = true,
  progressClassName,
  size = 'md'
}) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;
    
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(intervalId);
          setIsActive(false);
          onComplete && onComplete();
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [timeLeft, isActive, onComplete]);
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const remainingSeconds = time % 60;
    
    return `${minutes.toString().padStart(1, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const progressPercentage = (timeLeft / seconds) * 100;
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };
  
  return (
    <div className={cn("space-y-1", className)}>
      <div className={cn(
        "font-mono font-bold",
        sizeClasses[size],
        timeLeft < 10 && "text-red-500 animate-pulse"
      )}>
        {formatTime(timeLeft)}
      </div>
      
      {showProgress && (
        <Progress 
          value={progressPercentage} 
          className={cn(
            "h-1.5",
            timeLeft < 10 && "bg-red-300",
            progressClassName
          )} 
        />
      )}
    </div>
  );
};
