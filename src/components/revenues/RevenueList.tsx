import { Revenue } from '@/types';
import { RevenueItem } from './RevenueItem';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RevenueListProps {
  revenues: Revenue[];
  title?: string;
  maxHeight?: string;
}

export function RevenueList({ revenues, title = "Entrate", maxHeight = "400px" }: RevenueListProps) {
  if (revenues.length === 0) {
    return (
      <div className="border-2 border-foreground bg-card shadow-brutal animate-fade-in">
        <div className="border-b-2 border-foreground p-4">
          <h3 className="font-mono font-bold uppercase tracking-wider">{title}</h3>
        </div>
        <div className="p-8 text-center text-muted-foreground font-mono">
          Nessuna entrata registrata
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-foreground bg-card shadow-brutal animate-fade-in">
      <div className="border-b-2 border-foreground p-4 flex items-center justify-between">
        <h3 className="font-mono font-bold uppercase tracking-wider">{title}</h3>
        <span className="text-xs font-mono text-muted-foreground">
          {revenues.length} {revenues.length === 1 ? 'entrata' : 'entrate'}
        </span>
      </div>
      <ScrollArea style={{ maxHeight }}>
        <div className="divide-y-2 divide-border">
          {revenues.map((revenue) => (
            <RevenueItem key={revenue.id} revenue={revenue} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
