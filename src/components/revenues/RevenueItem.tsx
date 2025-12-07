import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Trash2, RefreshCw } from 'lucide-react';
import { Revenue, getCurrencySymbol } from '@/types';
import { useRevenues } from '@/hooks/useRevenues';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditRevenueDialog } from './EditRevenueDialog';

interface RevenueItemProps {
  revenue: Revenue;
}

export function RevenueItem({ revenue }: RevenueItemProps) {
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
    <div className="group flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
      <div
        className="h-10 w-10 border-2 border-foreground flex items-center justify-center shrink-0 font-mono font-bold"
        style={{ 
          backgroundColor: revenue.category?.color || 'hsl(var(--accent))',
          color: '#fff'
        }}
      >
        {revenue.category?.name?.charAt(0).toUpperCase() || '€'}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-mono font-medium text-foreground truncate">
            {revenue.description}
          </p>
          {revenue.is_recurring && (
            <Badge variant="outline" className="shrink-0 gap-1 text-xs">
              <RefreshCw className="h-3 w-3" />
              {getRecurrenceLabel()}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {revenue.category && (
            <span className="text-xs font-mono text-muted-foreground">
              {revenue.category.name}
            </span>
          )}
          {revenue.project && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-mono text-muted-foreground">
                {revenue.project.name}
              </span>
            </>
          )}
        </div>
      </div>
      
      <div className="text-right shrink-0">
        <p className="text-sm font-mono font-bold text-green-600 dark:text-green-400">
          +{formatCurrency(Number(revenue.amount), revenue.currency)}
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          {format(new Date(revenue.date), 'd MMM yyyy', { locale: it })}
        </p>
      </div>
      
      {/* Actions - Always visible on mobile, fade in on desktop */}
      <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
        <EditRevenueDialog revenue={revenue} />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-2 border-transparent hover:border-destructive"
          onClick={() => deleteRevenue.mutate(revenue.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
