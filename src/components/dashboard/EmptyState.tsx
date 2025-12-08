import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
      <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center border-2 border-foreground bg-background">
        {icon}
      </div>
      <h3 className="font-mono font-bold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground font-mono text-sm mb-4 max-w-md mx-auto">
        {description}
      </p>
      {action}
    </div>
  );
}
