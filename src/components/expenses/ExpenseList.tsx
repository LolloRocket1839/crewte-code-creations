import { Expense } from '@/types';
import { ExpenseItem } from './ExpenseItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          {title}
          <span className="text-sm font-mono font-semibold text-primary">
            {formatCurrency(totalAmount)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No expenses yet</p>
        ) : (
          <div className="divide-y divide-border">
            {expenses.map((expense) => (
              <ExpenseItem key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}