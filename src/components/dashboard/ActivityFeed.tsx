import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, PlusCircle, Pencil, FolderKanban, ListTodo, Receipt } from 'lucide-react';
import { useActivity } from '@/hooks/useActivity';
import { ActivityLog } from '@/types';
import { cn } from '@/lib/utils';

const getActivityIcon = (activity: ActivityLog) => {
  const iconProps = { className: 'h-4 w-4' };
  
  switch (activity.action) {
    case 'completed':
      return <CheckCircle2 {...iconProps} className={cn(iconProps.className, 'text-success')} />;
    case 'created':
      return <PlusCircle {...iconProps} className={cn(iconProps.className, 'text-primary')} />;
    case 'updated':
      return <Pencil {...iconProps} className={cn(iconProps.className, 'text-warning')} />;
    default:
      return <PlusCircle {...iconProps} />;
  }
};

const getEntityIcon = (entityType: string) => {
  switch (entityType) {
    case 'project':
      return <FolderKanban className="h-3.5 w-3.5" />;
    case 'task':
      return <ListTodo className="h-3.5 w-3.5" />;
    case 'expense':
      return <Receipt className="h-3.5 w-3.5" />;
    default:
      return null;
  }
};

const getActivityText = (activity: ActivityLog) => {
  const action = activity.action;
  const entityType = activity.entity_type;
  const entityName = activity.entity_name;
  
  return (
    <span className="font-mono text-sm">
      <span className="capitalize font-bold">{action}</span>{' '}
      {entityType}{' '}
      {entityName && <span className="font-bold">"{entityName}"</span>}
    </span>
  );
};

export function ActivityFeed() {
  const { activities, isLoading } = useActivity();

  if (isLoading) {
    return (
      <div className="border-2 border-foreground bg-card shadow-brutal animate-fade-in">
        <div className="border-b-2 border-foreground p-4">
          <h3 className="font-mono font-bold uppercase tracking-wider">Recent Activity</h3>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-8 w-8 border-2 border-muted bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted w-3/4" />
                <div className="h-3 bg-muted w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-foreground bg-card shadow-brutal animate-fade-in">
      <div className="border-b-2 border-foreground p-4">
        <h3 className="font-mono font-bold uppercase tracking-wider">Recent Activity</h3>
      </div>
      <div className="p-4">
        {activities.length === 0 ? (
          <p className="text-muted-foreground font-mono text-center py-8">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex gap-3 p-2 border-2 border-transparent hover:border-foreground hover:bg-muted/50 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="h-8 w-8 border-2 border-foreground bg-muted flex items-center justify-center shrink-0">
                  {getActivityIcon(activity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground">
                    {getActivityText(activity)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                      {getEntityIcon(activity.entity_type)}
                      {activity.entity_type}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
