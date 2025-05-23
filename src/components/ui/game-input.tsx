
import React from 'react';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GameInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
}

export const GameInput: React.FC<GameInputProps> = ({
  label,
  description,
  containerClassName,
  labelClassName,
  descriptionClassName,
  className,
  id,
  ...props
}) => {
  const inputId = id || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <Label 
          htmlFor={inputId} 
          className={cn("block text-sm font-medium", labelClassName)}
        >
          {label}
        </Label>
      )}
      
      <Input
        id={inputId}
        className={cn("border-accent/30 focus-visible:ring-primary", className)}
        {...props}
      />
      
      {description && (
        <p className={cn("text-xs text-muted-foreground", descriptionClassName)}>
          {description}
        </p>
      )}
    </div>
  );
};
