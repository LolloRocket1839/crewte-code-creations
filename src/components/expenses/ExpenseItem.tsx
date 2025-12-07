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
        'group flex items-center gap-3 p-4 border-b-2 border-border/50 last:border-b-0',
        'transition-all duration-200 ease-out',
        'hover:bg-muted/30 hover:border-foreground/20',
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Paid Status Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-9 w-9 shrink-0 border-2 transition-all duration-200',
          expense.is_paid 
            ? 'border-success bg-success/10 text-success hover:bg-success/20 hover:scale-105' 
            : 'border-muted-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground hover:scale-105',
          'active:scale-95'
        )}
        onClick={handleTogglePaid}
        disabled={togglePaidStatus.isPending}
      >
        {expense.is_paid ? (
          <Check className="h-4 w-4 animate-check-bounce" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
      
      {/* Category Color */}
      <div
        className={cn(
          'h-10 w-10 border-2 border-foreground flex items-center justify-center shrink-0 font-mono font-bold text-sm',
          'transition-transform duration-200 ease-out',
          'group-hover:scale-105 group-hover:shadow-brutal-sm'
        )}
        style={{ 
          backgroundColor: expense.category?.color || 'hsl(var(--muted))',
          color: expense.category?.color ? '#fff' : 'hsl(var(--foreground))'
        }}
      >
        {expense.category?.name?.charAt(0).toUpperCase() || '$'}
      </div>
      
      {/* Description & Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            'text-sm font-mono font-medium truncate transition-all duration-200',
            expense.is_paid ? 'text-muted-foreground line-through' : 'text-foreground'
          )}>
            {expense.description}
          </p>
          {!expense.is_paid && (
            <Badge 
              variant="destructive" 
              className="shrink-0 text-[10px] px-1.5 py-0 animate-pulse border-2 border-destructive"
            >
              Non pagato
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {expense.category && (
            <span className="text-xs font-mono text-muted-foreground">
              {expense.category.name}
            </span>
          )}
          {expense.project && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-mono text-muted-foreground">
                {expense.project.name}
              </span>
            </>
          )}
          {expense.notes && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-mono text-muted-foreground/70 truncate max-w-[100px]">
                {expense.notes}
              </span>
            </>
          )}
        </div>
      </div>
      
      {/* Amount & Date */}
      <div className="text-right shrink-0">
        <p className={cn(
          'text-sm font-mono font-bold transition-colors duration-200',
          expense.is_paid ? 'text-muted-foreground' : 'text-destructive'
        )}>
          -{formatCurrency(Number(expense.amount), expense.currency)}
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          {format(new Date(expense.date), 'd MMM yyyy', { locale: it })}
        </p>
      </div>
      
      {/* Receipt Icon */}
      {expense.receipt_url && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 text-accent border-2 border-transparent shrink-0',
            'hover:border-accent hover:bg-accent/10 hover:scale-105',
            'transition-all duration-200 active:scale-95'
          )}
          onClick={() => setPreviewOpen(true)}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      )}
      
      {/* Actions - Always visible on mobile, slide in on desktop */}
      <div className={cn(
        'flex items-center gap-1',
        'md:translate-x-2 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100',
        'transition-all duration-200 ease-out'
      )}>
        <EditExpenseDialog expense={expense} />
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 text-muted-foreground border-2 border-transparent shrink-0',
            'hover:text-destructive hover:bg-destructive/10 hover:border-destructive hover:scale-105',
            'transition-all duration-200 active:scale-95'
          )}
          onClick={() => deleteExpense.mutate(expense.id)}
        >
          <Trash2 className="h-4 w-4" />
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
