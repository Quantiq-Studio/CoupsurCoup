
import React from 'react';
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface GameButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
}

export const GameButton: React.FC<GameButtonProps> = ({
  variant = 'primary',
  className,
  children,
  ...props
}) => {
  // Map our custom game variants to shadcn button variants
  const getButtonVariant = (): ButtonProps['variant'] => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'secondary':
        return 'secondary';
      case 'accent':
        return 'destructive'; // Using destructive as our accent
      case 'outline':
        return 'outline';
      case 'ghost':
        return 'ghost';
      default:
        return 'default';
    }
  };

  const baseClasses = {
    'primary': 'button-primary',
    'secondary': 'button-secondary',
    'accent': 'button-accent',
    'outline': 'border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white rounded-full py-2 px-6 transition-all',
    'ghost': 'bg-transparent hover:bg-white/10 text-white rounded-full py-2 px-6 transition-all'
  };

  return (
    <Button 
      variant={getButtonVariant()}
      className={cn(baseClasses[variant], className)}
      {...props}
    >
      {children}
    </Button>
  );
};
