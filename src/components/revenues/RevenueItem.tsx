import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Trash2, RefreshCw } from 'lucide-react';
import { Revenue, getCurrencySymbol } from '@/types';
import { useRevenues } from '@/hooks/useRevenues';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditRevenueDialog } from './EditRevenueDialog';
import { cn } from '@/lib/utils';

interface RevenueItemProps {
  revenue: Revenue;
  index?: number;
}

export function RevenueItem({ revenue, index = 0 }: RevenueItemProps) {
  const { deleteRevenue } = useRevenues();

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = getCurrencySymbol(currency as any);
    return `${symbol} ${new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const getRecurrenceLabel = () => {
    if (!revenue.is_recurring) return null;
    switch (revenue.recurrence_type) {
      case 'monthly': return 'Mensile';
      case 'quarterly': return 'Trimestrale';
      case 'yearly': return 'Annuale';
      default: return null;
    }
  };

  return (
    <div 
      className={cn(
        'group p-3 sm:p-4 border-b-2 border-border/50 last:border-b-0',
        'transition-all duration-200 ease-out',
        'hover:bg-muted/30 hover:border-foreground/20',
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Mobile: Stacked layout, Desktop: Horizontal */}
      <div className="flex items-start gap-3">
        {/* Category Color */}
        <div
          className={cn(
            'h-11 w-11 border-2 border-foreground flex items-center justify-center shrink-0 font-mono font-bold text-sm',
            'transition-transform duration-200 ease-out'
          )}
          style={{ 
            backgroundColor: revenue.category?.color || 'hsl(var(--accent))',
            color: '#fff'
          }}
          aria-hidden="true"
        >
          {revenue.category?.name?.charAt(0).toUpperCase() || '€'}
        </div>
        
        {/* Content area - grows to fill */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Top row: Description + Amount */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-mono font-medium text-foreground truncate">
                {revenue.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-mono font-bold text-success">
                +{formatCurrency(Number(revenue.amount), revenue.currency)}
              </p>
            </div>
          </div>
          
          {/* Bottom row: Meta info */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
            {revenue.is_recurring && (
              <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0">
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                {getRecurrenceLabel()}
              </Badge>
            )}
            {revenue.category && (
              <span className="text-xs font-mono text-muted-foreground">
                {revenue.category.name}
              </span>
            )}
            {revenue.project && (
              <>
                <span className="text-xs text-muted-foreground" aria-hidden="true">•</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {revenue.project.name}
                </span>
              </>
            )}
            <span className="text-xs font-mono text-muted-foreground">
              {format(new Date(revenue.date), 'd MMM yyyy', { locale: it })}
            </span>
          </div>
        </div>
      </div>
      
      {/* Actions row - always visible, good spacing */}
      <div className="flex items-center justify-end gap-1 mt-2 pl-[56px]">
        <EditRevenueDialog revenue={revenue} />
        
        <Button
          variant="ghost"
          size="icon"
          aria-label="Elimina entrata"
          className={cn(
            'h-11 w-11 text-muted-foreground border-2 border-transparent',
            'hover:text-destructive hover:bg-destructive/10 hover:border-destructive',
            'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground',
            'transition-all duration-200 touch-action-manipulation'
          )}
          onClick={() => deleteRevenue.mutate(revenue.id)}
        >
          <Trash2 className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
