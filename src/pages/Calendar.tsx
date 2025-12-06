import { AppLayout } from '@/components/layout/AppLayout';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { useTasks } from '@/hooks/useTasks';

export default function Calendar() {
  const { tasks } = useTasks();

  return (
    <AppLayout title="Calendar">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-muted-foreground font-mono text-sm">
            View tasks and deadlines on your calendar
          </p>
          <CreateTaskDialog />
        </div>
        
        {/* Calendar */}
        <TaskCalendar tasks={tasks} />
      </div>
    </AppLayout>
  );
}
