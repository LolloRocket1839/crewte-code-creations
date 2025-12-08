import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Project, Expense, Revenue, Currency } from '@/types';
import { formatCurrency } from '@/lib/currencyUtils';

interface ProjectSummaryCardProps {
  project: Project;
  expenses: Expense[];
  revenues: Revenue[];
}

export function ProjectSummaryCard({ project, expenses, revenues }: ProjectSummaryCardProps) {
  // Calculate totals by currency for this project
  const expensesByCurrency = expenses.reduce((acc, expense) => {
    const currency = expense.currency as Currency;
    acc[currency] = (acc[currency] || 0) + Number(expense.amount);
    return acc;
  }, {} as Partial<Record<Currency, number>>);

  const revenuesByCurrency = revenues.reduce((acc, revenue) => {
    const currency = revenue.currency as Currency;
    acc[currency] = (acc[currency] || 0) + Number(revenue.amount);
    return acc;
  }, {} as Partial<Record<Currency, number>>);

  // Get all currencies used
  const allCurrencies = new Set([
    ...Object.keys(expensesByCurrency),
    ...Object.keys(revenuesByCurrency),
  ]) as Set<Currency>;

  // Calculate net per currency
  const netByCurrency: Partial<Record<Currency, number>> = {};
  allCurrencies.forEach((currency) => {
    const rev = revenuesByCurrency[currency] || 0;
    const exp = expensesByCurrency[currency] || 0;
    netByCurrency[currency] = rev - exp;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalRevenues = revenues.reduce((sum, r) => sum + Number(r.amount), 0);
  const overallNet = totalRevenues - totalExpenses;
  const isPositive = overallNet >= 0;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block border-2 border-foreground bg-card p-4 shadow-brutal hover:translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-mono font-bold text-lg">{project.name}</h3>
          <span className={`inline-block px-2 py-0.5 text-xs font-mono border border-foreground mt-1 ${
            project.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'
          }`}>
            {project.status === 'active' ? 'Attivo' : project.status === 'completed' ? 'Completato' : 'In Attesa'}
          </span>
        </div>
        <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Currency breakdown */}
      <div className="space-y-2 text-sm font-mono">
        {Array.from(allCurrencies).length > 0 ? (
          Array.from(allCurrencies).map((currency) => (
            <div key={currency} className="flex items-center justify-between border-b border-border pb-1">
              <span className="text-muted-foreground">{currency}</span>
              <div className="flex items-center gap-3">
                <span className="text-red-600">-{formatCurrency(expensesByCurrency[currency] || 0, currency)}</span>
                <span className="text-green-600">+{formatCurrency(revenuesByCurrency[currency] || 0, currency)}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-xs">Nessuna transazione</p>
        )}
      </div>

      {/* Net indicator */}
      {Array.from(allCurrencies).length > 0 && (
        <div className={`mt-3 pt-2 border-t-2 border-foreground flex items-center justify-between ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className="font-mono text-xs uppercase">Netto</span>
          <div className="flex items-center gap-1 font-mono font-bold">
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Object.entries(netByCurrency).map(([currency, amount], idx) => (
              <span key={currency}>
                {idx > 0 && ' | '}
                {amount >= 0 ? '+' : ''}{formatCurrency(amount, currency as Currency)}
              </span>
            ))}
          </div>
        </div>
      )}
    </Link>
  );
}
