import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Square, CheckSquare, Clock, Trash2 } from 'lucide-react';
import { Task } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  level?: number;
}

const priorityStyles = {
  high: 'bg-priority-high text-white',
  medium: 'bg-priority-medium text-foreground',
  low: 'bg-priority-low text-foreground',
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
    <div>
      <div
        className={cn(
          'group flex items-center gap-3 p-3 border-2 border-transparent',
          'hover:border-foreground hover:bg-muted/50 transition-all',
          'active:scale-[0.99]',
          level > 0 && 'ml-6 border-l-2 border-l-foreground pl-4'
        )}
      >
        {hasSubtasks && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 border-2 border-transparent hover:border-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        
        <button 
          onClick={toggleComplete} 
          className="shrink-0 hover:scale-110 active:scale-95 transition-transform"
        >
          {task.status === 'completed' ? (
            <CheckSquare className="h-5 w-5 text-success animate-check-bounce" />
          ) : (
            <Square className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-mono font-medium',
            task.status === 'completed' && 'line-through text-muted-foreground'
          )}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            'text-[10px] font-mono uppercase px-2 py-0.5 border-2 border-foreground',
            priorityStyles[task.priority]
          )}>
            {task.priority}
          </span>
          
          {task.due_date && (
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1 border-2 border-foreground px-2 py-0.5 bg-muted">
              <Clock className="h-3 w-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-2 border-transparent hover:border-destructive"
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
