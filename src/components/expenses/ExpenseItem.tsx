import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Expense } from '@/types';
import { useExpenses } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';

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
    <div className="group flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
      <div
        className="h-10 w-10 border-2 border-foreground flex items-center justify-center shrink-0 font-mono font-bold"
        style={{ 
          backgroundColor: expense.category?.color || 'hsl(var(--muted))',
          color: expense.category?.color ? '#fff' : 'hsl(var(--foreground))'
        }}
      >
        {expense.category?.name?.charAt(0).toUpperCase() || '$'}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-mono font-medium text-foreground truncate">
          {expense.description}
        </p>
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
        </div>
      </div>
      
      <div className="text-right shrink-0">
        <p className="text-sm font-mono font-bold text-foreground">
          {formatCurrency(Number(expense.amount))}
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          {format(new Date(expense.date), 'MMM d, yyyy')}
        </p>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-2 border-transparent hover:border-destructive shrink-0"
        onClick={() => deleteExpense.mutate(expense.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
