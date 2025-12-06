import { AppLayout } from '@/components/layout/AppLayout';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { useTasks } from '@/hooks/useTasks';

export default function Calendar() {
  const { tasks } = useTasks();

  return (
    <AppLayout title="Calendar">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            View tasks and deadlines on your calendar
          </p>
          <CreateTaskDialog />
        </div>
        
        <TaskCalendar tasks={tasks} />
      </div>
    </AppLayout>
  );
}