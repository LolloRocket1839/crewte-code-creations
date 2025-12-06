import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { useProjects } from '@/hooks/useProjects';
import { Skeleton } from '@/components/ui/skeleton';

export default function Projects() {
  const { projects, isLoading } = useProjects();

  return (
    <AppLayout title="Projects">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Manage your projects and track budgets
          </p>
          <CreateProjectDialog />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[200px] rounded-lg" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <CreateProjectDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}