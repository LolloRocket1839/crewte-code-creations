import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskCalendarProps {
  tasks: Task[];
}

const priorityDots = {
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
};

export function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), day);
    });
  };

  const startDayOfWeek = startOfMonth(currentMonth).getDay();

  return (
    <div className="border-2 border-foreground bg-card shadow-brutal animate-fade-in">
      {/* Header */}
      <div className="border-b-2 border-foreground p-4 flex items-center justify-between">
        <h2 className="font-mono font-bold uppercase tracking-wider">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 border-2 border-foreground">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="bg-foreground text-background px-2 py-3 text-center text-xs font-mono font-bold uppercase border-r-2 border-foreground last:border-r-0"
            >
              {day}
            </div>
          ))}
          
          {/* Empty cells */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div 
              key={`empty-${i}`} 
              className="bg-muted/30 p-2 min-h-[80px] md:min-h-[100px] border-r-2 border-b-2 border-foreground last:border-r-0" 
            />
          ))}
          
          {/* Day cells */}
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isLastInRow = (startDayOfWeek + index + 1) % 7 === 0;
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  'bg-card p-2 min-h-[80px] md:min-h-[100px] transition-colors hover:bg-muted/50 border-b-2 border-foreground',
                  !isLastInRow && 'border-r-2',
                  !isCurrentMonth && 'opacity-50'
                )}
              >
                <div
                  className={cn(
                    'h-7 w-7 flex items-center justify-center text-sm font-mono mb-1',
                    isToday(day) && 'bg-foreground text-background font-bold'
                  )}
                >
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-1.5 px-1.5 py-1 border border-foreground bg-muted/50 group hover:bg-muted transition-colors"
                    >
                      <span className={cn('h-2 w-2 shrink-0', priorityDots[task.priority])} />
                      <span className={cn(
                        'text-[10px] md:text-xs font-mono truncate',
                        task.status === 'completed' && 'line-through text-muted-foreground'
                      )}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <p className="text-[10px] md:text-xs font-mono text-muted-foreground px-1.5">
                      +{dayTasks.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
