import { Link } from 'react-router-dom';
import { FolderKanban, DollarSign, ListTodo, MoreVertical, Trash2 } from 'lucide-react';
import { Project } from '@/types';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useExpenses } from '@/hooks/useExpenses';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ShareProjectDialog } from './ShareProjectDialog';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { user } = useAuth();
  const { deleteProject } = useProjects();
  const { tasks } = useTasks(project.id);
  const { expenses } = useExpenses(project.id);
  
  const isOwner = user?.id === project.user_id;
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

  const statusStyles = {
    active: 'bg-success text-white',
    completed: 'bg-primary text-primary-foreground',
    archived: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="border-2 border-foreground bg-card shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all active:translate-x-0 active:translate-y-0 active:shadow-brutal-sm">
      {/* Header */}
      <div className="border-b-2 border-foreground p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/projects/${project.id}`} className="flex items-center gap-3 group flex-1 min-w-0">
            <div className="h-10 w-10 border-2 border-foreground bg-accent flex items-center justify-center shrink-0">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-mono font-bold text-foreground group-hover:underline truncate">
                {project.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  'inline-block text-[10px] font-mono uppercase px-2 py-0.5 border-2 border-foreground',
                  statusStyles[project.status]
                )}>
                  {project.status}
                </span>
                {!isOwner && (
                  <span className="inline-block text-[10px] font-mono uppercase px-2 py-0.5 border-2 border-foreground bg-accent">
                    Shared
                  </span>
                )}
              </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-1">
            <ShareProjectDialog project={project} />
            
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive font-mono"
                    onClick={() => deleteProject.mutate(project.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {project.description && (
          <p className="text-sm font-mono text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        
        {/* Stats */}
        <div className="flex items-center justify-between text-sm font-mono">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ListTodo className="h-4 w-4" />
            <span>{completedTasks}/{tasks.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{formatCurrency(totalSpent)}</span>
          </div>
        </div>
        
        {/* Budget Progress */}
        {project.budget > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-bold">
                {formatCurrency(totalSpent)} / {formatCurrency(project.budget)}
              </span>
            </div>
            <div className="h-3 bg-muted border-2 border-foreground overflow-hidden">
              <div 
                className={cn(
                  'h-full transition-all duration-500',
                  budgetPercentage > 90 ? 'bg-destructive' : budgetPercentage > 70 ? 'bg-warning' : 'bg-success'
                )}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
