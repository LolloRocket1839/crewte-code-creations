import { AppLayout } from '@/components/layout/AppLayout';
import { ExpenseChart } from '@/components/reports/ExpenseChart';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { ExportButton } from '@/components/reports/ExportButton';
import { CreateExpenseDialog } from '@/components/expenses/CreateExpenseDialog';
import { CreateCategoryDialog } from '@/components/expenses/CreateCategoryDialog';
import { useExpenses } from '@/hooks/useExpenses';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            View expense reports and export data
          </p>
          <div className="flex items-center gap-2">
            <CreateCategoryDialog />
            <CreateExpenseDialog />
            <ExportButton expenses={expenses} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatCurrency(totalExpenses)}</p>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatCurrency(totalBudget)}</p>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{categories.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseChart expenses={expenses} />
          <ExpenseList expenses={expenses} title="All Expenses" />
        </div>
      </div>
    </AppLayout>
  );
}