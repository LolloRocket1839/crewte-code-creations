import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpenseFilters as Filters, CURRENCIES, ExpenseCategory, Currency } from '@/types';
import { Project } from '@/types';

interface ExpenseFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  categories: ExpenseCategory[];
  projects: Project[];
}

export function ExpenseFilters({ filters, onFiltersChange, categories, projects }: ExpenseFiltersProps) {
  const hasActiveFilters = 
    filters.search || 
    filters.categoryId || 
    filters.projectId || 
    filters.isPaid !== null || 
    filters.currency ||
    filters.dateFrom ||
    filters.dateTo;

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      categoryId: null,
      projectId: null,
      isPaid: null,
      currency: null,
      dateFrom: null,
      dateTo: null,
    });
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca spese..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10 font-mono"
        />
      </div>
      
      {/* Filter Row */}
      <div className="flex flex-wrap gap-2">
        {/* Paid Status */}
        <Select 
          value={filters.isPaid === null ? 'all' : filters.isPaid ? 'paid' : 'unpaid'} 
          onValueChange={(v) => onFiltersChange({ 
            ...filters, 
            isPaid: v === 'all' ? null : v === 'paid' 
          })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti</SelectItem>
            <SelectItem value="paid">Pagati</SelectItem>
            <SelectItem value="unpaid">Non pagati</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Currency */}
        <Select 
          value={filters.currency || 'all'} 
          onValueChange={(v) => onFiltersChange({ 
            ...filters, 
            currency: v === 'all' ? null : v as Currency 
          })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Valuta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte</SelectItem>
            {CURRENCIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.symbol} {c.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Category */}
        <Select 
          value={filters.categoryId || 'all'} 
          onValueChange={(v) => onFiltersChange({ 
            ...filters, 
            categoryId: v === 'all' ? null : v 
          })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Project */}
        <Select 
          value={filters.projectId || 'all'} 
          onValueChange={(v) => onFiltersChange({ 
            ...filters, 
            projectId: v === 'all' ? null : v 
          })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Progetto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i progetti</SelectItem>
            {projects.map((proj) => (
              <SelectItem key={proj.id} value={proj.id}>
                {proj.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Date Range */}
        <Input
          type="date"
          placeholder="Da"
          value={filters.dateFrom || ''}
          onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value || null })}
          className="w-[140px]"
        />
        <Input
          type="date"
          placeholder="A"
          value={filters.dateTo || ''}
          onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value || null })}
          className="w-[140px]"
        />
        
        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="icon" onClick={clearFilters} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Filter className="h-3 w-3" />
          <span>Filtri attivi</span>
        </div>
      )}
    </div>
  );
}
