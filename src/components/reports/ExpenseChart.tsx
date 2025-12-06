import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Expense } from '@/types';

interface ExpenseChartProps {
  expenses: Expense[];
}

const COLORS = ['#000000', '#404040', '#666666', '#808080', '#999999', '#B3B3B3', '#CCCCCC', '#E6E6E6'];

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  const chartData = useMemo(() => {
    const byCategory = expenses.reduce((acc, expense) => {
      const categoryName = expense.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byCategory).map(([name, value]) => ({
      name,
      value,
    }));
  }, [expenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (chartData.length === 0) {
    return (
      <div className="border-2 border-foreground bg-card shadow-brutal animate-fade-in">
        <div className="border-b-2 border-foreground p-4">
          <h3 className="font-mono font-bold uppercase tracking-wider">Expenses by Category</h3>
        </div>
        <div className="p-4">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground font-mono">
            No expenses to display
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-foreground bg-card shadow-brutal animate-fade-in">
      <div className="border-b-2 border-foreground p-4">
        <h3 className="font-mono font-bold uppercase tracking-wider">Expenses by Category</h3>
      </div>
      <div className="p-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="hsl(var(--foreground))"
                strokeWidth={2}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '2px solid hsl(var(--foreground))',
                  borderRadius: '0',
                  fontFamily: 'JetBrains Mono, Space Mono, monospace',
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-sm font-mono text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
