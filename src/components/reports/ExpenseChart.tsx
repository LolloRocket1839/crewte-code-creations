import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Expense, getCurrencySymbol, Currency } from '@/types';

interface ExpenseChartProps {
  expenses: Expense[];
  defaultCurrency?: Currency;
}

const COLORS = ['#000000', '#404040', '#666666', '#808080', '#999999', '#B3B3B3', '#CCCCCC', '#E6E6E6'];

export function ExpenseChart({ expenses, defaultCurrency = 'EUR' }: ExpenseChartProps) {
  const chartData = useMemo(() => {
    const byCategory = expenses.reduce((acc, expense) => {
      const categoryName = expense.category?.name || 'Senza categoria';
      acc[categoryName] = (acc[categoryName] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const currencyData = useMemo(() => {
    const byCurrency = expenses.reduce((acc, expense) => {
      const currency = expense.currency || 'EUR';
      acc[currency] = (acc[currency] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byCurrency).map(([currency, value]) => ({
      currency,
      value,
      symbol: getCurrencySymbol(currency as Currency),
    }));
  }, [expenses]);

  const paidData = useMemo(() => {
    const paid = expenses.filter(e => e.is_paid).reduce((sum, e) => sum + Number(e.amount), 0);
    const unpaid = expenses.filter(e => !e.is_paid).reduce((sum, e) => sum + Number(e.amount), 0);
    return [
      { name: 'Pagato', value: paid, color: '#10B981' },
      { name: 'Non pagato', value: unpaid, color: '#EF4444' },
    ].filter(d => d.value > 0);
  }, [expenses]);

  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol(defaultCurrency);
    return `${symbol} ${new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  if (chartData.length === 0) {
    return (
      <div className="border-2 border-foreground bg-card shadow-brutal animate-fade-in">
        <div className="border-b-2 border-foreground p-4">
          <h3 className="font-mono font-bold uppercase tracking-wider">Spese per Categoria</h3>
        </div>
        <div className="p-4">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground font-mono">
            Nessuna spesa da visualizzare
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-foreground bg-card shadow-brutal animate-fade-in">
      <div className="border-b-2 border-foreground p-4">
        <h3 className="font-mono font-bold uppercase tracking-wider">Analisi Spese</h3>
      </div>
      <div className="p-4 space-y-6">
        {/* Pie Chart by Category */}
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Per Categoria</p>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
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
                    <span className="text-xs font-mono text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Paid vs Unpaid Bar */}
        {paidData.length > 0 && (
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Stato Pagamento</p>
            <div className="h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paidData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '2px solid hsl(var(--foreground))',
                      borderRadius: '0',
                      fontFamily: 'JetBrains Mono, Space Mono, monospace',
                    }}
                  />
                  <Bar dataKey="value" fill="#000" stroke="hsl(var(--foreground))" strokeWidth={2}>
                    {paidData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Currency breakdown */}
        {currencyData.length > 1 && (
          <div className="border-t-2 border-border pt-4">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Per Valuta</p>
            <div className="grid grid-cols-2 gap-2">
              {currencyData.map((item) => (
                <div key={item.currency} className="flex items-center justify-between p-2 border-2 border-border">
                  <span className="text-xs font-mono font-bold">{item.symbol} {item.currency}</span>
                  <span className="text-xs font-mono">
                    {new Intl.NumberFormat('it-IT', { minimumFractionDigits: 0 }).format(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
