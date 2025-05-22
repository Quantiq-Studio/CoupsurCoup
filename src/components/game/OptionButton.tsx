
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OptionButtonProps {
  label: string;
  selected: boolean;
  correct?: boolean;
  incorrect?: boolean;
  disabled?: boolean;
  onClick: () => void;
  compact?: boolean;
}

const OptionButton: React.FC<OptionButtonProps> = ({ 
  label, 
  selected, 
  correct = false, 
  incorrect = false, 
  disabled = false,
  onClick,
  compact = false
}) => {
  const getButtonClasses = () => {
    if (correct) {
      return 'bg-green-500 hover:bg-green-600 text-white shadow-lg transform scale-105';
    }
    if (incorrect) {
      return 'bg-red-500 hover:bg-red-600 text-white shadow-lg animate-shake';
    }
    if (selected) {
      return 'bg-primary hover:bg-primary/90 text-white shadow-md';
    }
    return 'bg-white/20 hover:bg-white/30 text-white shadow';
  };
  
  return (
    <Button
      className={cn(
        'w-full transition-all duration-200',
        getButtonClasses(),
        compact ? 'py-2 text-sm' : 'py-3 text-base'
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};

export default OptionButton;
