import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Project } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId?: string | null;
  onSelectProject: (projectId: string | null) => void;
  onCreateProject?: () => void;
  showAllOption?: boolean;
  className?: string;
}

export function ProjectSelector({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  showAllOption = true,
  className,
}: ProjectSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [projects]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={cn('relative group/scroll', className)}>
      {/* Left scroll button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8',
          'bg-background border-2 border-foreground shadow-brutal-sm',
          'transition-all duration-200',
          'hover:bg-foreground hover:text-background',
          canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={cn(
          'flex items-center gap-2 overflow-x-auto scrollbar-hide px-1 py-1',
          'scroll-smooth'
        )}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All Projects option */}
        {showAllOption && (
          <button
            onClick={() => onSelectProject(null)}
            className={cn(
              'shrink-0 px-4 py-2 border-2 border-foreground font-mono text-sm font-semibold uppercase tracking-wide',
              'transition-all duration-200 ease-out',
              'hover:scale-[1.02] active:scale-[0.98]',
              selectedProjectId === null
                ? 'bg-foreground text-background shadow-none'
                : 'bg-background text-foreground shadow-brutal-sm hover:shadow-brutal'
            )}
          >
            <span className="flex items-center gap-2">
              Tutti
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 border',
                selectedProjectId === null
                  ? 'border-background/30 bg-background/10'
                  : 'border-foreground bg-muted'
              )}>
                {projects.length}
              </span>
            </span>
          </button>
        )}

        {/* Project pills */}
        {projects.map((project, index) => {
          const isSelected = selectedProjectId === project.id;

          return (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={cn(
                'shrink-0 px-4 py-2 border-2 border-foreground font-mono text-sm font-medium',
                'transition-all duration-200 ease-out',
                'hover:scale-[1.02] active:scale-[0.98]',
                'animate-fade-in',
                isSelected
                  ? 'bg-foreground text-background shadow-none'
                  : 'bg-background text-foreground shadow-brutal-sm hover:shadow-brutal'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="max-w-[140px] truncate">{project.name}</span>
            </button>
          );
        })}

        {/* Create new project button */}
        {onCreateProject && (
          <button
            onClick={onCreateProject}
            className={cn(
              'shrink-0 px-3 py-2 border-2 border-dashed border-muted-foreground',
              'font-mono text-sm text-muted-foreground',
              'transition-all duration-200 ease-out',
              'hover:border-foreground hover:text-foreground hover:scale-[1.02]',
              'active:scale-[0.98]'
            )}
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Right scroll button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8',
          'bg-background border-2 border-foreground shadow-brutal-sm',
          'transition-all duration-200',
          'hover:bg-foreground hover:text-background',
          canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Gradient overlays for scroll indication */}
      <div
        className={cn(
          'absolute left-8 top-0 bottom-0 w-8 pointer-events-none',
          'bg-gradient-to-r from-background to-transparent',
          'transition-opacity duration-200',
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        className={cn(
          'absolute right-8 top-0 bottom-0 w-8 pointer-events-none',
          'bg-gradient-to-l from-background to-transparent',
          'transition-opacity duration-200',
          canScrollRight ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}
