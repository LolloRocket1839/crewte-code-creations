import { Link } from 'react-router-dom';
import { FolderKanban, DollarSign, ListTodo, MoreVertical, Trash2 } from 'lucide-react';
import { Project } from '@/types';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useExpenses } from '@/hooks/useExpenses';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { deleteProject } = useProjects();
  const { tasks } = useTasks(project.id);
  const { expenses } = useExpenses(project.id);
  
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const budgetPercentage = project.budget > 0 ? (totalSpent / project.budget) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statusColors = {
    active: 'bg-success/10 text-success border-success/20',
    completed: 'bg-primary/10 text-primary border-primary/20',
    archived: 'bg-muted text-muted-foreground border-muted',
  };

  return (
    <Card className="animate-fade-in hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link to={`/projects/${project.id}`} className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <Badge variant="outline" className={cn('text-xs mt-1', statusColors[project.status])}>
                {project.status}
              </Badge>
            </div>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => deleteProject.mutate(project.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ListTodo className="h-4 w-4" />
            <span>{completedTasks}/{tasks.length} tasks</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{formatCurrency(totalSpent)}</span>
          </div>
        </div>
        
        {project.budget > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-medium">
                {formatCurrency(totalSpent)} / {formatCurrency(project.budget)}
              </span>
            </div>
            <Progress
              value={Math.min(budgetPercentage, 100)}
              className={cn(
                'h-2',
                budgetPercentage > 90 && 'bg-destructive/20'
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}