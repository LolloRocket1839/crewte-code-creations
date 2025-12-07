import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useRevenues } from '@/hooks/useRevenues';
import { useProjects } from '@/hooks/useProjects';
import { Revenue, CURRENCIES, Currency } from '@/types';

interface EditRevenueDialogProps {
  revenue: Revenue;
}

export function EditRevenueDialog({ revenue }: EditRevenueDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(revenue.description);
  const [amount, setAmount] = useState(revenue.amount.toString());
  const [currency, setCurrency] = useState<Currency>(revenue.currency || 'EUR');
  const [categoryId, setCategoryId] = useState(revenue.category_id || '');
  const [selectedProject, setSelectedProject] = useState(revenue.project_id || '');
  const [date, setDate] = useState(revenue.date);
  const [isRecurring, setIsRecurring] = useState(revenue.is_recurring);
  const [recurrenceType, setRecurrenceType] = useState<'monthly' | 'quarterly' | 'yearly'>(
    (revenue.recurrence_type as 'monthly' | 'quarterly' | 'yearly') || 'monthly'
  );
  const [recurrenceDay, setRecurrenceDay] = useState(revenue.recurrence_day?.toString() || '1');
  const [notes, setNotes] = useState(revenue.notes || '');
  
  const { updateRevenue, categories } = useRevenues();
  const { projects } = useProjects();

  useEffect(() => {
    if (open) {
      setDescription(revenue.description);
      setAmount(revenue.amount.toString());
      setCurrency(revenue.currency || 'EUR');
      setCategoryId(revenue.category_id || '');
      setSelectedProject(revenue.project_id || '');
      setDate(revenue.date);
      setIsRecurring(revenue.is_recurring);
      setRecurrenceType((revenue.recurrence_type as 'monthly' | 'quarterly' | 'yearly') || 'monthly');
      setRecurrenceDay(revenue.recurrence_day?.toString() || '1');
      setNotes(revenue.notes || '');
    }
  }, [open, revenue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRevenue.mutate({
      id: revenue.id,
      description,
      amount: parseFloat(amount),
      currency,
      category_id: categoryId && categoryId !== 'none' ? categoryId : null,
      project_id: selectedProject && selectedProject !== 'none' ? selectedProject : null,
      date,
      is_recurring: isRecurring,
      recurrence_type: isRecurring ? recurrenceType : null,
      recurrence_day: isRecurring ? parseInt(recurrenceDay) : null,
      notes: notes || null,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted border-2 border-transparent hover:border-foreground"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica Entrata</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-revenue-description">Descrizione</Label>
            <Input
              id="edit-revenue-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrizione dell'entrata"
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-revenue-amount">Importo</Label>
              <Input
                id="edit-revenue-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Valuta</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.symbol} {c.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-revenue-date">Data</Label>
              <Input
                id="edit-revenue-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Recurring Toggle */}
          <div className="flex items-center justify-between p-3 border-2 border-foreground bg-muted/50">
            <div>
              <Label htmlFor="edit-is-recurring" className="font-mono font-bold">Ricorrente</Label>
              <p className="text-xs text-muted-foreground font-mono">Entrata periodica</p>
            </div>
            <Switch
              id="edit-is-recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>
          
          {isRecurring && (
            <div className="grid grid-cols-2 gap-3 p-3 border-2 border-dashed border-muted-foreground/50">
              <div className="space-y-2">
                <Label>Frequenza</Label>
                <Select value={recurrenceType} onValueChange={(v) => setRecurrenceType(v as 'monthly' | 'quarterly' | 'yearly')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensile</SelectItem>
                    <SelectItem value="quarterly">Trimestrale</SelectItem>
                    <SelectItem value="yearly">Annuale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-recurrence-day">Giorno</Label>
                <Input
                  id="edit-recurrence-day"
                  type="number"
                  min="1"
                  max="31"
                  value={recurrenceDay}
                  onChange={(e) => setRecurrenceDay(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessuna categoria</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3 w-3"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Progetto</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona progetto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessun progetto</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-revenue-notes">Note</Label>
            <Textarea
              id="edit-revenue-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note aggiuntive..."
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={updateRevenue.isPending}>
              {updateRevenue.isPending ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
