import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useRevenues } from '@/hooks/useRevenues';
import { useProjects } from '@/hooks/useProjects';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { CURRENCIES, Currency } from '@/types';
import { validateRevenue } from '@/lib/validationSchemas';
import { toast } from 'sonner';

interface CreateRevenueDialogProps {
  projectId?: string;
}

export function CreateRevenueDialog({ projectId }: CreateRevenueDialogProps) {
  const { defaultCurrency } = useUserCurrency();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  
  // Update currency when defaultCurrency changes (after profile loads)
  useEffect(() => {
    setCurrency(defaultCurrency);
  }, [defaultCurrency]);
  const [categoryId, setCategoryId] = useState('');
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [recurrenceDay, setRecurrenceDay] = useState('1');
  const [notes, setNotes] = useState('');
  
  const { createRevenue, categories } = useRevenues();
  const { projects } = useProjects();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const formData = {
      description: description.trim(),
      amount: parseFloat(amount) || 0,
      currency,
      category_id: categoryId && categoryId !== 'none' ? categoryId : null,
      project_id: selectedProject && selectedProject !== 'none' ? selectedProject : null,
      date,
      is_recurring: isRecurring,
      recurrence_type: isRecurring ? recurrenceType : null,
      recurrence_day: isRecurring ? parseInt(recurrenceDay) || 1 : null,
      notes: notes.trim() || null,
    };
    
    const validation = validateRevenue(formData);
    if ('error' in validation) {
      toast.error(validation.error);
      return;
    }
    
    createRevenue.mutate(validation.data as any);
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCurrency(defaultCurrency);
    setCategoryId('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsRecurring(false);
    setRecurrenceType('monthly');
    setRecurrenceDay('1');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Aggiungi Entrata
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuova Entrata</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="revenue-description">Descrizione</Label>
            <Input
              id="revenue-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrizione dell'entrata"
              maxLength={200}
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="revenue-amount">Importo</Label>
              <Input
                id="revenue-amount"
                type="number"
                step="0.01"
                min="0.01"
                max="999999999"
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
              <Label htmlFor="revenue-date">Data</Label>
              <Input
                id="revenue-date"
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
              <Label htmlFor="is-recurring" className="font-mono font-bold">Ricorrente</Label>
              <p className="text-xs text-muted-foreground font-mono">Entrata periodica</p>
            </div>
            <Switch
              id="is-recurring"
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
                <Label htmlFor="recurrence-day">Giorno</Label>
                <Input
                  id="recurrence-day"
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
          
          {!projectId && (
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
          )}
          
          <div className="space-y-2">
            <Label htmlFor="revenue-notes">Note</Label>
            <Textarea
              id="revenue-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note aggiuntive..."
              rows={2}
              maxLength={1000}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={createRevenue.isPending}>
              {createRevenue.isPending ? 'Salvataggio...' : 'Aggiungi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
