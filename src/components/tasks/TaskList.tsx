import { Task } from '@/types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  title?: string;
  showProject?: boolean;
}

export function TaskList({ tasks, title = 'Tasks' }: TaskListProps) {
  return (
    <div className="border-2 border-foreground bg-card shadow-brutal animate-fade-in">
      <div className="border-b-2 border-foreground p-4 flex items-center justify-between">
        <h3 className="font-mono font-bold uppercase tracking-wider">{title}</h3>
        <span className="text-sm font-mono text-muted-foreground border-2 border-foreground px-2 py-0.5 bg-muted">
          {tasks.length}
        </span>
      </div>
      <div className="p-4">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground font-mono text-center py-8">No tasks yet</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div 
                key={task.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TaskItem task={task} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
