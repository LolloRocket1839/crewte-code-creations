import { DollarSign, FolderKanban, ListTodo, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { TaskList } from '@/components/tasks/TaskList';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useExpenses } from '@/hooks/useExpenses';

export default function Dashboard() {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { totalExpenses } = useExpenses();

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
  const recentTasks = tasks.slice(0, 5);
  
  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget), 0);
  const budgetUsed = totalBudget > 0 ? ((totalExpenses / totalBudget) * 100).toFixed(0) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatsCard
            title="Active Projects"
            value={activeProjects}
            icon={<FolderKanban className="h-5 w-5" />}
          />
          <StatsCard
            title="Pending Tasks"
            value={pendingTasks}
            icon={<ListTodo className="h-5 w-5" />}
          />
          <StatsCard
            title="Budget Used"
            value={`${budgetUsed}%`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TaskList tasks={recentTasks} title="Recent Tasks" />
          <ActivityFeed />
        </div>
      </div>
    </AppLayout>
  );
}