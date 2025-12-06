import { Expense } from '@/types';
import { ExpenseItem } from './ExpenseItem';

interface ExpenseListProps {
  expenses: Expense[];
  title?: string;
}

export function ExpenseList({ expenses, title = 'Expenses' }: ExpenseListProps) {
  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="border-2 border-foreground bg-card shadow-brutal animate-fade-in">
      <div className="border-b-2 border-foreground p-4 flex items-center justify-between">
        <h3 className="font-mono font-bold uppercase tracking-wider">{title}</h3>
        <span className="text-sm font-mono font-bold text-primary border-2 border-foreground px-2 py-0.5 bg-accent">
          {formatCurrency(totalAmount)}
        </span>
      </div>
      <div className="p-4">
        {expenses.length === 0 ? (
          <p className="text-muted-foreground font-mono text-center py-8">No expenses yet</p>
        ) : (
          <div className="divide-y-2 divide-foreground border-2 border-foreground">
            {expenses.map((expense, index) => (
              <div
                key={expense.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <ExpenseItem expense={expense} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
