import { ReactNode, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
  index?: number;
}

export function StatsCard({ title, value, icon, trend, className, index = 0 }: StatsCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <div 
      className={cn(
        'relative border-2 border-foreground bg-card p-5 shadow-brutal overflow-hidden',
        'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg',
        'active:translate-x-0 active:translate-y-0 active:shadow-brutal-sm',
        'transition-all duration-200 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Content */}
      <div className="relative z-10">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
          {title}
        </p>
        <p className="text-2xl md:text-3xl font-mono font-bold text-foreground tracking-tight">
          {displayValue}
        </p>
        {trend && (
          <div className={cn(
            'flex items-center gap-1.5 mt-3 text-xs font-mono font-medium',
            'transition-all duration-300',
            trend.positive ? 'text-success' : 'text-destructive'
          )}>
            {trend.positive ? (
              <TrendingUp className="h-3.5 w-3.5 animate-pulse" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 animate-pulse" />
            )}
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-muted-foreground font-normal">vs last month</span>
          </div>
        )}
      </div>

      {/* Icon - Bottom Right */}
      <div className={cn(
        'absolute bottom-3 right-3',
        'h-12 w-12 border-2 border-foreground bg-muted',
        'flex items-center justify-center',
        'transition-all duration-200 ease-out',
        'group-hover:scale-110 group-hover:rotate-3',
        '[&_svg]:h-6 [&_svg]:w-6 [&_svg]:text-foreground'
      )}>
        {icon}
      </div>
    </div>
  );
}
