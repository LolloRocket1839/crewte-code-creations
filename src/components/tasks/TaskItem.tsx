import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Circle, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { Task } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  level?: number;
}

const priorityColors = {
  high: 'bg-priority-high/10 text-priority-high border-priority-high/20',
  medium: 'bg-priority-medium/10 text-priority-medium border-priority-medium/20',
  low: 'bg-priority-low/10 text-priority-low border-priority-low/20',
};

export function TaskItem({ task, level = 0 }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { updateTask, deleteTask } = useTasks();
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const toggleComplete = () => {
    updateTask.mutate({
      id: task.id,
      status: task.status === 'completed' ? 'pending' : 'completed',
    });
  };

  return (
    <div className="animate-fade-in">
      <div
        className={cn(
          'group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors',
          level > 0 && 'ml-6 border-l-2 border-border pl-4'
        )}
      >
        {hasSubtasks && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        
        <button onClick={toggleComplete} className="shrink-0">
          {task.status === 'completed' ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium',
            task.status === 'completed' && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={cn('text-xs', priorityColors[task.priority])}>
            {task.priority}
          </Badge>
          
          {task.due_date && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => deleteTask.mutate(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded && hasSubtasks && (
        <div className="mt-1">
          {task.subtasks!.map((subtask) => (
            <TaskItem key={subtask.id} task={subtask} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}