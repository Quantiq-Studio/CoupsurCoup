
import React from 'react';
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface GameButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
}

export const GameButton: React.FC<GameButtonProps> = ({
  variant = 'primary',
  className,
  children,
  ...props
}) => {
  const baseClasses = {
    'primary': 'button-primary',
    'secondary': 'button-secondary',
    'accent': 'button-accent',
    'outline': 'border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white rounded-full py-2 px-6 transition-all',
    'ghost': 'bg-transparent hover:bg-white/10 text-white rounded-full py-2 px-6 transition-all'
  };

  return (
    <Button 
      className={cn(baseClasses[variant], className)}
      {...props}
    >
      {children}
    </Button>
  );
};
