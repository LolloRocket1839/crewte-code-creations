import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Percent, PiggyBank, Building, DollarSign } from 'lucide-react';
import { InvestmentMetrics as Metrics, getCurrencySymbol, Currency } from '@/types';
import { cn } from '@/lib/utils';

interface InvestmentMetricsProps {
  metrics: Metrics;
  currency?: Currency;
  totalBudget?: number;
}

export function InvestmentMetrics({ metrics, currency = 'EUR', totalBudget = 0 }: InvestmentMetricsProps) {
  const symbol = getCurrencySymbol(currency);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const formatCurrency = (amount: number) => {
    return `${symbol} ${new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const formatPercent = (value: number) => {
    if (!isFinite(value) || isNaN(value)) return '—';
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const metricsData = [
    {
      label: 'Entrate',
      value: formatCurrency(metrics.totalRevenues),
      icon: TrendingUp,
      isPositive: true,
    },
    {
      label: 'Spese',
      value: formatCurrency(metrics.totalExpenses),
      icon: TrendingDown,
      isPositive: false,
    },
    {
      label: 'Profitto',
      value: formatCurrency(metrics.netProfit),
      icon: PiggyBank,
      isPositive: metrics.netProfit >= 0,
    },
    {
      label: 'ROI',
      value: formatPercent(metrics.roi),
      subtitle: 'Return on Investment',
      icon: Percent,
      isPositive: metrics.roi >= 0,
    },
    {
      label: 'Cap Rate',
      value: formatPercent(metrics.capRate),
      subtitle: 'Capitalization Rate',
      icon: Building,
      isPositive: true,
    },
    {
      label: 'Cash-on-Cash',
      value: formatPercent(metrics.cashOnCash),
      subtitle: 'Cash on Cash Return',
      icon: DollarSign,
      isPositive: metrics.cashOnCash >= 0,
    },
  ];

  return (
    <div className={cn(
      'border-2 border-foreground bg-card shadow-brutal transition-all duration-300',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    )}>
      <div className="border-b-2 border-foreground p-4 flex items-center justify-between">
        <h3 className="font-mono font-bold uppercase tracking-wider text-sm">Metriche Investimento</h3>
        {totalBudget > 0 && (
          <span className="text-xs font-mono text-muted-foreground border-2 border-foreground px-2 py-1 bg-muted">
            Valore: {formatCurrency(totalBudget)}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3">
        {metricsData.map((metric, index) => {
          const Icon = metric.icon;
          const isLastRow = index >= metricsData.length - (metricsData.length % 3 === 0 ? 3 : metricsData.length % 3);
          const isLastInRow = (index + 1) % 3 === 0 || index === metricsData.length - 1;
          
          return (
            <div 
              key={metric.label}
              className={cn(
                'relative p-5 transition-all duration-200 ease-out group',
                'hover:bg-muted/50',
                !isLastRow && 'border-b-2 border-foreground',
                !isLastInRow && 'border-r-2 border-foreground',
                // Mobile: 2 columns
                'max-lg:nth-child-odd:border-r-2 max-lg:nth-child-even:border-r-0'
              )}
              style={{ 
                animationDelay: `${index * 80}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
                transition: `opacity 0.3s ease-out ${index * 80}ms, transform 0.3s ease-out ${index * 80}ms`
              }}
            >
              <div className="pr-12">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  {metric.label}
                </p>
                <p className={cn(
                  'text-xl lg:text-2xl font-mono font-bold tracking-tight transition-colors duration-200',
                  metric.isPositive ? 'text-foreground' : 'text-destructive'
                )}>
                  {metric.value}
                </p>
                {metric.subtitle && (
                  <p className="text-[9px] font-mono text-muted-foreground/60 mt-1 uppercase tracking-wider">
                    {metric.subtitle}
                  </p>
                )}
              </div>
              
              {/* Icon - Bottom Right */}
              <div className={cn(
                'absolute bottom-4 right-4',
                'h-10 w-10 border-2 border-foreground',
                'flex items-center justify-center',
                'transition-all duration-200 ease-out',
                'group-hover:scale-110 group-hover:shadow-brutal-sm',
                metric.isPositive ? 'bg-success/10' : 'bg-destructive/10'
              )}>
                <Icon className={cn(
                  'h-5 w-5 transition-transform duration-200',
                  'group-hover:scale-110',
                  metric.isPositive ? 'text-success' : 'text-destructive'
                )} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
