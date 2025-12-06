import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskList } from '@/components/tasks/TaskList';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { CreateExpenseDialog } from '@/components/expenses/CreateExpenseDialog';
import { CreateCategoryDialog } from '@/components/expenses/CreateCategoryDialog';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useExpenses } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ListTodo, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { tasks } = useTasks(id);
  const { expenses, totalExpenses } = useExpenses(id);

  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <AppLayout title="Project Not Found">
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">This project doesn't exist</p>
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>
      </AppLayout>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const budgetPercentage = project.budget > 0 ? (totalExpenses / project.budget) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Spent"
            value={formatCurrency(totalExpenses)}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatsCard
            title="Tasks"
            value={`${completedTasks}/${tasks.length}`}
            icon={<ListTodo className="h-5 w-5" />}
          />
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Budget</p>
                  <p className="text-2xl font-semibold text-foreground mt-2">
                    {formatCurrency(project.budget)}
                  </p>
                  {project.budget > 0 && (
                    <div className="mt-3 space-y-2">
                      <Progress
                        value={Math.min(budgetPercentage, 100)}
                        className={cn(
                          'h-2',
                          budgetPercentage > 90 && 'bg-destructive/20'
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        {budgetPercentage.toFixed(0)}% used
                      </p>
                    </div>
                  )}
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Target className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tasks</h2>
              <CreateTaskDialog projectId={id} />
            </div>
            <TaskList tasks={tasks} title="" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Expenses</h2>
              <div className="flex items-center gap-2">
                <CreateCategoryDialog />
                <CreateExpenseDialog projectId={id} />
              </div>
            </div>
            <ExpenseList expenses={expenses} title="" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}