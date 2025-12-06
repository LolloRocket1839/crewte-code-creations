import { AppLayout } from '@/components/layout/AppLayout';
import { ExpenseChart } from '@/components/reports/ExpenseChart';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { ExportButton } from '@/components/reports/ExportButton';
import { CreateExpenseDialog } from '@/components/expenses/CreateExpenseDialog';
import { CreateCategoryDialog } from '@/components/expenses/CreateCategoryDialog';
import { useExpenses } from '@/hooks/useExpenses';
import { useProjects } from '@/hooks/useProjects';
import { DollarSign, Wallet, Tag } from 'lucide-react';

export default function Reports() {
  const { expenses, totalExpenses, categories } = useExpenses();
  const { projects } = useProjects();

  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AppLayout title="Reports">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-muted-foreground font-mono text-sm">
            View expense reports and export data
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <CreateCategoryDialog />
            <CreateExpenseDialog />
            <ExportButton expenses={expenses} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {/* Total Expenses */}
          <div className="border-2 border-foreground bg-card p-4 shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all active:translate-x-0 active:translate-y-0 active:shadow-brutal-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Total Expenses
                </p>
                <p className="text-2xl md:text-3xl font-mono font-bold mt-2">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="h-10 w-10 border-2 border-foreground bg-accent flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          {/* Total Budget */}
          <div className="border-2 border-foreground bg-card p-4 shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all active:translate-x-0 active:translate-y-0 active:shadow-brutal-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Total Budget
                </p>
                <p className="text-2xl md:text-3xl font-mono font-bold mt-2">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
              <div className="h-10 w-10 border-2 border-foreground bg-accent flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          {/* Categories */}
          <div className="border-2 border-foreground bg-card p-4 shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all active:translate-x-0 active:translate-y-0 active:shadow-brutal-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Categories
                </p>
                <p className="text-2xl md:text-3xl font-mono font-bold mt-2">
                  {categories.length}
                </p>
              </div>
              <div className="h-10 w-10 border-2 border-foreground bg-accent flex items-center justify-center">
                <Tag className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Expense List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <ExpenseChart expenses={expenses} />
          <ExpenseList expenses={expenses} title="All Expenses" />
        </div>
      </div>
    </AppLayout>
  );
}
