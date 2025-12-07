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
  index?: number;
}

const priorityStyles = {
  high: 'bg-destructive text-destructive-foreground border-destructive',
  medium: 'bg-warning text-warning-foreground border-warning',
  low: 'bg-success text-success-foreground border-success',
};

export function TaskItem({ task, level = 0, index = 0 }: TaskItemProps) {
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
    <div 
      className="animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div
        className={cn(
          'group flex items-center gap-3 p-3 border-2 border-transparent',
          'transition-all duration-200 ease-out',
          'hover:border-foreground hover:bg-muted/30',
          'active:scale-[0.995]',
          level > 0 && 'ml-6 border-l-2 border-l-foreground/30 pl-4 hover:border-l-foreground'
        )}
      >
        {hasSubtasks && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7 shrink-0 border-2 border-transparent',
              'hover:border-foreground hover:scale-105',
              'transition-all duration-200 active:scale-95'
            )}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
            )}
          </Button>
        )}
        
        <button 
          onClick={toggleComplete} 
          className={cn(
            'shrink-0 transition-all duration-200',
            'hover:scale-110 active:scale-90'
          )}
        >
          {task.status === 'completed' ? (
            <CheckSquare className="h-5 w-5 text-success animate-check-bounce" />
          ) : (
            <Square className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-mono font-medium transition-all duration-200',
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
            'text-[10px] font-mono uppercase px-2 py-1 border-2 font-semibold',
            'transition-transform duration-200 group-hover:scale-105',
            priorityStyles[task.priority]
          )}>
            {task.priority}
          </span>
          
          {task.due_date && (
            <span className={cn(
              'text-xs font-mono text-muted-foreground flex items-center gap-1',
              'border-2 border-foreground px-2 py-1 bg-muted',
              'transition-all duration-200 group-hover:shadow-brutal-sm'
            )}>
              <Clock className="h-3 w-3" />
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 text-muted-foreground border-2 border-transparent',
              'translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
              'hover:text-destructive hover:bg-destructive/10 hover:border-destructive hover:scale-105',
              'transition-all duration-200 active:scale-95'
            )}
            onClick={() => deleteTask.mutate(task.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {expanded && hasSubtasks && (
        <div className="mt-1 animate-accordion-down">
          {task.subtasks!.map((subtask, i) => (
            <TaskItem key={subtask.id} task={subtask} level={level + 1} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
