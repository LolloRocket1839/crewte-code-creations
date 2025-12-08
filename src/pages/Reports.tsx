import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExpenseChart } from '@/components/reports/ExpenseChart';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { ExportButton } from '@/components/reports/ExportButton';
import { CreateExpenseDialog } from '@/components/expenses/CreateExpenseDialog';
import { CreateCategoryDialog } from '@/components/expenses/CreateCategoryDialog';
import { ExpenseFilters } from '@/components/expenses/ExpenseFilters';
import { CreateRevenueDialog } from '@/components/revenues/CreateRevenueDialog';
import { CreateRevenueCategoryDialog } from '@/components/revenues/CreateRevenueCategoryDialog';
import { RevenueList } from '@/components/revenues/RevenueList';
import { InvestmentMetrics } from '@/components/reports/InvestmentMetrics';
import { useExpenses } from '@/hooks/useExpenses';
import { useRevenues } from '@/hooks/useRevenues';
import { useProjects } from '@/hooks/useProjects';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { formatCurrency, formatMultiCurrency } from '@/lib/currencyUtils';
import { ExpenseFilters as Filters, InvestmentMetrics as MetricsType } from '@/types';
import { DollarSign, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Reports() {
  const { expenses, categories, filterExpenses, paidExpenses, unpaidExpenses, expensesByCurrency } = useExpenses();
  const { revenues, totalRevenues, revenuesByCurrency } = useRevenues();
  const { projects } = useProjects();
  const { defaultCurrency } = useUserCurrency();

  const [filters, setFilters] = useState<Filters>({
    search: '',
    categoryId: null,
    projectId: null,
    isPaid: null,
    currency: null,
    dateFrom: null,
    dateTo: null,
  });

  const filteredExpenses = filterExpenses(filters);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget), 0);

  // Calculate investment metrics
  const metrics: MetricsType = {
    totalRevenues,
    totalExpenses,
    netProfit: totalRevenues - totalExpenses,
    roi: totalBudget > 0 ? ((totalRevenues - totalExpenses) / totalBudget) * 100 : 0,
    capRate: totalBudget > 0 ? (totalRevenues / totalBudget) * 100 : 0,
    cashOnCash: totalExpenses > 0 ? ((totalRevenues - totalExpenses) / totalExpenses) * 100 : 0,
  };

  return (
    <AppLayout title="Reports">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-muted-foreground font-mono text-sm">
            Analisi spese, entrate e metriche di investimento
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <CreateCategoryDialog />
            <CreateRevenueCategoryDialog />
            <CreateExpenseDialog />
            <CreateRevenueDialog />
            <ExportButton expenses={expenses} />
          </div>
        </div>

        {/* Investment Metrics */}
        <InvestmentMetrics metrics={metrics} totalBudget={totalBudget} />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="border-2 border-foreground bg-card p-4 shadow-brutal">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Spese Pagate</p>
                <p className="text-xl font-mono font-bold mt-1 text-green-600">{formatCurrency(paidExpenses, defaultCurrency)}</p>
              </div>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="border-2 border-foreground bg-card p-4 shadow-brutal">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Da Pagare</p>
                <p className="text-xl font-mono font-bold mt-1 text-red-600">{formatCurrency(unpaidExpenses, defaultCurrency)}</p>
              </div>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="border-2 border-foreground bg-card p-4 shadow-brutal">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Entrate</p>
                <p className="text-xl font-mono font-bold mt-1 text-green-600">{formatMultiCurrency(revenuesByCurrency)}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="border-2 border-foreground bg-card p-4 shadow-brutal">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Budget Totale</p>
                <p className="text-xl font-mono font-bold mt-1">{formatCurrency(totalBudget, defaultCurrency)}</p>
              </div>
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Tabs for Expenses/Revenues */}
        <Tabs defaultValue="expenses" className="space-y-4">
          <TabsList className="border-2 border-foreground">
            <TabsTrigger value="expenses">Spese</TabsTrigger>
            <TabsTrigger value="revenues">Entrate</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <ExpenseFilters filters={filters} onFiltersChange={setFilters} categories={categories} projects={projects} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ExpenseChart expenses={filteredExpenses} />
              <ExpenseList expenses={filteredExpenses} title="Spese" />
            </div>
          </TabsContent>

          <TabsContent value="revenues">
            <RevenueList revenues={revenues} title="Entrate" />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
