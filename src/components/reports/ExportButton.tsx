import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Expense } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  expenses: Expense[];
}

export function ExportButton({ expenses }: ExportButtonProps) {
  const { toast } = useToast();

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Project', 'Amount'];
    const rows = expenses.map(e => [
      e.date,
      e.description,
      e.category?.name || '',
      e.project?.name || '',
      e.amount.toString(),
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({ title: 'Exported successfully', description: 'CSV file downloaded' });
  };

  const exportToJSON = () => {
    const data = expenses.map(e => ({
      date: e.date,
      description: e.description,
      category: e.category?.name || null,
      project: e.project?.name || null,
      amount: Number(e.amount),
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    toast({ title: 'Exported successfully', description: 'JSON file downloaded' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}