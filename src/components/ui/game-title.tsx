
import React from 'react';
import { cn } from "@/lib/utils";

interface GameTitleProps {
  children: React.ReactNode;
  subtitle?: React.ReactNode;
  centered?: boolean;
  badge?: React.ReactNode;
  className?: string;
  subtitleClassName?: string;
}

export const GameTitle: React.FC<GameTitleProps> = ({
  children,
  subtitle,
  centered = true,
  badge,
  className,
  subtitleClassName,
}) => {
  return (
    <div className={cn(
      "mb-6 space-y-2",
      centered && "text-center",
      className
    )}>
      {badge && (
        <div className={cn(
          "inline-flex items-center justify-center bg-gradient-to-r from-accent to-secondary backdrop-blur-sm rounded-full px-4 py-1 mb-2 shadow-md",
          centered && "mx-auto"
        )}>
          {badge}
        </div>
      )}
      
      <h1 className="text-3xl md:text-4xl font-bold text-shadow font-playfair">
        {children}
      </h1>
      
      {subtitle && (
        <p className={cn(
          "text-lg text-white/90 max-w-2xl",
          centered && "mx-auto",
          subtitleClassName
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
