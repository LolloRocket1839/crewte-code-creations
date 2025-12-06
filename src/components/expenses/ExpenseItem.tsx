import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Trash2, Check, X } from 'lucide-react';
import { Expense, getCurrencySymbol } from '@/types';
import { useExpenses } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditExpenseDialog } from './EditExpenseDialog';

interface ExpenseItemProps {
  expense: Expense;
}

export function ExpenseItem({ expense }: ExpenseItemProps) {
  const { deleteExpense, togglePaidStatus } = useExpenses();

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
    <div className="group flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
      {/* Paid Status Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 shrink-0 border-2 ${
          expense.is_paid 
            ? 'border-green-600 bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/50' 
            : 'border-muted-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground'
        }`}
        onClick={handleTogglePaid}
        disabled={togglePaidStatus.isPending}
      >
        {expense.is_paid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </Button>
      
      {/* Category Color */}
      <div
        className="h-10 w-10 border-2 border-foreground flex items-center justify-center shrink-0 font-mono font-bold"
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
          <p className={`text-sm font-mono font-medium truncate ${expense.is_paid ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {expense.description}
          </p>
          {!expense.is_paid && (
            <Badge variant="destructive" className="shrink-0 text-[10px] px-1.5 py-0">
              Non pagato
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
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
        <p className={`text-sm font-mono font-bold ${expense.is_paid ? 'text-muted-foreground' : 'text-red-600 dark:text-red-400'}`}>
          -{formatCurrency(Number(expense.amount), expense.currency)}
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          {format(new Date(expense.date), 'd MMM yyyy', { locale: it })}
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <EditExpenseDialog expense={expense} />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-2 border-transparent hover:border-destructive shrink-0"
          onClick={() => deleteExpense.mutate(expense.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
