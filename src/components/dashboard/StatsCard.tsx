import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <div 
      className={cn(
        'border-2 border-foreground bg-card p-4 shadow-brutal',
        'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg',
        'active:translate-x-0 active:translate-y-0 active:shadow-brutal-sm',
        'transition-all duration-150 animate-fade-in',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground truncate">
            {title}
          </p>
          <p className="text-xl md:text-2xl font-mono font-bold text-foreground mt-2 truncate">
            {value}
          </p>
          {trend && (
            <p className={cn(
              'text-xs font-mono mt-2',
              trend.positive ? 'text-success' : 'text-destructive'
            )}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className="h-10 w-10 border-2 border-foreground bg-accent flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}
