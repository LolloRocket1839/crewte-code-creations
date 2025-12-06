import { TrendingUp, TrendingDown, Percent, PiggyBank, Building, DollarSign } from 'lucide-react';
import { InvestmentMetrics as Metrics, getCurrencySymbol, Currency } from '@/types';

interface InvestmentMetricsProps {
  metrics: Metrics;
  currency?: Currency;
  totalBudget?: number;
}

export function InvestmentMetrics({ metrics, currency = 'EUR', totalBudget = 0 }: InvestmentMetricsProps) {
  const symbol = getCurrencySymbol(currency);
  
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
      label: 'Entrate Totali',
      value: formatCurrency(metrics.totalRevenues),
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Spese Totali',
      value: formatCurrency(metrics.totalExpenses),
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      label: 'Profitto Netto',
      value: formatCurrency(metrics.netProfit),
      icon: PiggyBank,
      color: metrics.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bgColor: metrics.netProfit >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30',
    },
    {
      label: 'ROI',
      value: formatPercent(metrics.roi),
      subtitle: 'Return on Investment',
      icon: Percent,
      color: metrics.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bgColor: 'bg-muted',
    },
    {
      label: 'Cap Rate',
      value: formatPercent(metrics.capRate),
      subtitle: 'Capitalization Rate',
      icon: Building,
      color: 'text-foreground',
      bgColor: 'bg-muted',
    },
    {
      label: 'Cash-on-Cash',
      value: formatPercent(metrics.cashOnCash),
      subtitle: 'Cash on Cash Return',
      icon: DollarSign,
      color: metrics.cashOnCash >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bgColor: 'bg-muted',
    },
  ];

  return (
    <div className="border-2 border-foreground bg-card shadow-brutal animate-fade-in">
      <div className="border-b-2 border-foreground p-4">
        <h3 className="font-mono font-bold uppercase tracking-wider">Metriche Investimento</h3>
        {totalBudget > 0 && (
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Valore proprietà: {formatCurrency(totalBudget)}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
        {metricsData.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div 
              key={metric.label}
              className={`p-4 border-b-2 border-r-2 border-border ${
                index % 3 === 2 ? 'border-r-0 md:border-r-2' : ''
              } ${index >= 4 ? 'border-b-0' : ''} ${index % 2 === 1 ? 'border-r-0 md:border-r-2' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 border-2 border-foreground flex items-center justify-center shrink-0 ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground truncate">
                    {metric.label}
                  </p>
                  <p className={`text-lg font-mono font-bold ${metric.color} truncate`}>
                    {metric.value}
                  </p>
                  {metric.subtitle && (
                    <p className="text-[10px] font-mono text-muted-foreground/70 truncate">
                      {metric.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
