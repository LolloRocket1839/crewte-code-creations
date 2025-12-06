import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, PlusCircle, Pencil, FolderKanban, ListTodo, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <span>
      <span className="capitalize font-medium">{action}</span>{' '}
      {entityType}{' '}
      {entityName && <span className="font-medium">"{entityName}"</span>}
    </span>
  );
};

export function ActivityFeed() {
  const { activities, isLoading } = useActivity();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No activity yet</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 animate-slide-in">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {getActivityIcon(activity)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    {getActivityText(activity)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {getEntityIcon(activity.entity_type)}
                      {activity.entity_type}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}