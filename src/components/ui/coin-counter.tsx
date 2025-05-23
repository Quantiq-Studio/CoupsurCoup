
import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinCounterProps {
  value: number;
  change?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const CoinCounter: React.FC<CoinCounterProps> = ({
  value,
  change = 0,
  size = 'md',
  showIcon = true,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(value - change);
  const [isAnimating, setIsAnimating] = useState(false);
  const [changeDisplay, setChangeDisplay] = useState<string | null>(null);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-1.5',
    lg: 'text-lg gap-2'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 22
  };

  // Animate value change
  useEffect(() => {
    if (change !== 0) {
      // Show the change amount with sign
      setChangeDisplay(change > 0 ? `+${change}` : `${change}`);
      setIsAnimating(true);

      // Start counting animation
      const duration = 1000; // 1 second animation
      const startTime = Date.now();
      const startValue = value - change;
      const endValue = value;

      const updateValue = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smoother animation
        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOut(progress);
        
        const current = Math.round(startValue + (endValue - startValue) * easedProgress);
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(updateValue);
        } else {
          // Animation complete
          setTimeout(() => {
            setChangeDisplay(null);
            setIsAnimating(false);
          }, 800); // Show the change amount for a bit longer
        }
      };

      requestAnimationFrame(updateValue);
    } else {
      setDisplayValue(value);
    }
  }, [value, change]);

  return (
    <div className={cn("flex items-center font-medium relative", sizeClasses[size], className)}>
      {showIcon && (
        <Coins 
          className="text-yellow-500" 
          size={iconSizes[size]} 
          strokeWidth={2.5}
        />
      )}
      
      <span className="transition-colors">
        {displayValue.toLocaleString()}
      </span>
      
      {changeDisplay && (
        <span 
          className={cn(
            "absolute -right-10 font-bold animate-fade-out",
            changeDisplay.startsWith('+') ? "text-green-400" : "text-red-400"
          )}
        >
          {changeDisplay}
        </span>
      )}
    </div>
  );
};
