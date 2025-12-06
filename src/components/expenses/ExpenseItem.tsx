import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Expense } from '@/types';
import { useExpenses } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExpenseItemProps {
  expense: Expense;
}

export function ExpenseItem({ expense }: ExpenseItemProps) {
  const { deleteExpense } = useExpenses();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="group flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in">
      <div
        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: expense.category?.color + '20' }}
      >
        <span
          className="text-sm font-medium"
          style={{ color: expense.category?.color }}
        >
          {expense.category?.name?.charAt(0) || '$'}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {expense.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {expense.category && (
            <span className="text-xs text-muted-foreground">
              {expense.category.name}
            </span>
          )}
          {expense.project && (
            <>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {expense.project.name}
              </span>
            </>
          )}
        </div>
      </div>
      
      <div className="text-right shrink-0">
        <p className={cn('text-sm font-semibold font-mono', 'text-foreground')}>
          {formatCurrency(Number(expense.amount))}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(expense.date), 'MMM d, yyyy')}
        </p>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
        onClick={() => deleteExpense.mutate(expense.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}