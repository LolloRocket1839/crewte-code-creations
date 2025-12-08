import { DollarSign, FolderKanban, ListTodo, TrendingUp, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ProjectSummaryCard } from '@/components/dashboard/ProjectSummaryCard';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { TaskList } from '@/components/tasks/TaskList';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { CreateExpenseDialog } from '@/components/expenses/CreateExpenseDialog';
import { CreateRevenueDialog } from '@/components/revenues/CreateRevenueDialog';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useExpenses } from '@/hooks/useExpenses';
import { useRevenues } from '@/hooks/useRevenues';
import { formatMultiCurrency } from '@/lib/currencyUtils';

export default function Dashboard() {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { expenses, expensesByCurrency } = useExpenses();
  const { revenues } = useRevenues();

  const activeProjects = projects.filter(p => p.status === 'active');
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
  const recentTasks = tasks.slice(0, 5);
  
  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget), 0);
  const totalExpenses = Object.values(expensesByCurrency).reduce((sum, amount) => sum + amount, 0);
  const budgetUsed = totalBudget > 0 ? ((totalExpenses / totalBudget) * 100).toFixed(0) : 0;

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <CreateProjectDialog />
          <CreateExpenseDialog />
          <CreateRevenueDialog />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatsCard
            title="Spese Totali"
            value={formatMultiCurrency(expensesByCurrency)}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatsCard
            title="Progetti Attivi"
            value={activeProjects.length}
            icon={<FolderKanban className="h-5 w-5" />}
          />
          <StatsCard
            title="Task Pendenti"
            value={pendingTasks}
            icon={<ListTodo className="h-5 w-5" />}
          />
          <StatsCard
            title="Budget Usato"
            value={`${budgetUsed}%`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* Project Summaries */}
        <div className="space-y-3">
          <h2 className="font-mono font-bold text-lg">Riepilogo Progetti</h2>
          {activeProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProjects.map((project) => (
                <ProjectSummaryCard
                  key={project.id}
                  project={project}
                  expenses={expenses.filter(e => e.project_id === project.id)}
                  revenues={revenues.filter(r => r.project_id === project.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FolderKanban className="h-6 w-6" />}
              title="Nessun progetto attivo"
              description="Crea il tuo primo progetto immobiliare per iniziare a tracciare spese e ricavi."
              action={<CreateProjectDialog />}
            />
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {recentTasks.length > 0 ? (
            <TaskList tasks={recentTasks} title="Task Recenti" />
          ) : (
            <EmptyState
              icon={<ListTodo className="h-6 w-6" />}
              title="Nessun task"
              description="I task appariranno qui quando li creerai nei tuoi progetti."
            />
          )}
          <ActivityFeed />
        </div>
      </div>
    </AppLayout>
  );
}
