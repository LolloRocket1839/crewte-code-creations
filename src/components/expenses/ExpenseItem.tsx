import { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Trash2, Check, X, Paperclip } from 'lucide-react';
import { Expense, getCurrencySymbol } from '@/types';
import { useExpenses } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditExpenseDialog } from './EditExpenseDialog';
import { ReceiptPreview } from './ReceiptPreview';
import { cn } from '@/lib/utils';

interface ExpenseItemProps {
  expense: Expense;
  index?: number;
}

export function ExpenseItem({ expense, index = 0 }: ExpenseItemProps) {
  const { deleteExpense, togglePaidStatus } = useExpenses();
  const [previewOpen, setPreviewOpen] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = getCurrencySymbol(currency as any);
    return `${symbol} ${new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const handleTogglePaid = () => {
    togglePaidStatus.mutate({ id: expense.id, is_paid: !expense.is_paid });
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
        {/* Paid Status Toggle - WCAG 44px touch target */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={expense.is_paid ? "Segna come non pagato" : "Segna come pagato"}
          className={cn(
            'h-11 w-11 shrink-0 border-2 transition-all duration-200 touch-action-manipulation',
            'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground',
            expense.is_paid 
              ? 'border-success bg-success/10 text-success hover:bg-success/20' 
              : 'border-muted-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground',
          )}
          onClick={handleTogglePaid}
          disabled={togglePaidStatus.isPending}
        >
          {expense.is_paid ? (
            <Check className="h-5 w-5" aria-hidden="true" />
          ) : (
            <X className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
        
        {/* Category Color */}
        <div
          className={cn(
            'h-11 w-11 border-2 border-foreground flex items-center justify-center shrink-0 font-mono font-bold text-sm',
            'transition-transform duration-200 ease-out'
          )}
          style={{ 
            backgroundColor: expense.category?.color || 'hsl(var(--muted))',
            color: expense.category?.color ? '#fff' : 'hsl(var(--foreground))'
          }}
          aria-hidden="true"
        >
          {expense.category?.name?.charAt(0).toUpperCase() || '$'}
        </div>
        
        {/* Content area - grows to fill */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Top row: Description + Amount */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className={cn(
                'text-sm font-mono font-medium truncate transition-all duration-200',
                expense.is_paid ? 'text-muted-foreground line-through' : 'text-foreground'
              )}>
                {expense.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={cn(
                'text-sm font-mono font-bold transition-colors duration-200',
                expense.is_paid ? 'text-muted-foreground' : 'text-destructive'
              )}>
                -{formatCurrency(Number(expense.amount), expense.currency)}
              </p>
            </div>
          </div>
          
          {/* Bottom row: Meta info */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
            {!expense.is_paid && (
              <Badge 
                variant="destructive" 
                className="text-[10px] px-1.5 py-0 animate-pulse border-2 border-destructive"
              >
                Non pagato
              </Badge>
            )}
            {expense.category && (
              <span className="text-xs font-mono text-muted-foreground">
                {expense.category.name}
              </span>
            )}
            {expense.project && (
              <>
                <span className="text-xs text-muted-foreground" aria-hidden="true">•</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {expense.project.name}
                </span>
              </>
            )}
            <span className="text-xs font-mono text-muted-foreground">
              {format(new Date(expense.date), 'd MMM yyyy', { locale: it })}
            </span>
          </div>
        </div>
      </div>
      
      {/* Actions row - always visible, good spacing */}
      <div className="flex items-center justify-end gap-1 mt-2 pl-[92px]">
        {/* Receipt Icon */}
        {expense.receipt_url && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Visualizza ricevuta"
            className={cn(
              'h-11 w-11 text-accent border-2 border-transparent',
              'hover:border-accent hover:bg-accent/10',
              'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground',
              'transition-all duration-200 touch-action-manipulation'
            )}
            onClick={() => setPreviewOpen(true)}
          >
            <Paperclip className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}
        
        <EditExpenseDialog expense={expense} />
        
        <Button
          variant="ghost"
          size="icon"
          aria-label="Elimina spesa"
          className={cn(
            'h-11 w-11 text-muted-foreground border-2 border-transparent',
            'hover:text-destructive hover:bg-destructive/10 hover:border-destructive',
            'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground',
            'transition-all duration-200 touch-action-manipulation'
          )}
          onClick={() => deleteExpense.mutate(expense.id)}
        >
          <Trash2 className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
      
      {/* Receipt Preview Modal */}
      {expense.receipt_url && (
        <ReceiptPreview
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          receiptUrl={expense.receipt_url}
        />
      )}
    </div>
  );
}
