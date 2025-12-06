import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { ImportProjectDialog } from '@/components/projects/ImportProjectDialog';
import { useProjects } from '@/hooks/useProjects';
import { FolderKanban } from 'lucide-react';

export default function Projects() {
  const { projects, isLoading } = useProjects();

  return (
    <AppLayout title="Projects">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-muted-foreground font-mono text-sm">
            Manage your projects and track budgets
          </p>
          <div className="flex items-center gap-2">
            <ImportProjectDialog />
            <CreateProjectDialog />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="h-[200px] border-2 border-foreground bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="border-2 border-foreground bg-card p-12 text-center">
            <div className="h-16 w-16 border-2 border-foreground bg-muted mx-auto flex items-center justify-center mb-4">
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-mono mb-6">No projects yet</p>
            <CreateProjectDialog />
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, index) => (
              <div 
                key={project.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
