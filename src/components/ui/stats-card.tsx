
import React from 'react';
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className
}) => {
  return (
    <div className={cn(
      "bg-white/20 backdrop-blur-sm rounded-lg p-4 flex flex-col",
      className
    )}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-white/90">{title}</h3>
        {Icon && <Icon className="h-5 w-5 text-white/70" />}
      </div>
      
      <div className="font-playfair text-2xl font-bold text-white mt-1">
        {value}
      </div>
      
      {trend && (
        <div className={cn(
          "text-xs mt-2 flex items-center",
          trend.positive ? "text-green-400" : "text-red-400"
        )}>
          {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
          <span className="text-white/60 ml-1">depuis la dernière semaine</span>
        </div>
      )}
    </div>
  );
};
