import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useExpenses } from '@/hooks/useExpenses';
import { useProjects } from '@/hooks/useProjects';
import { Expense, CURRENCIES, Currency } from '@/types';
import { ReceiptUpload } from './ReceiptUpload';

interface EditExpenseDialogProps {
  expense: Expense;
}

export function EditExpenseDialog({ expense }: EditExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [currency, setCurrency] = useState<Currency>(expense.currency || 'EUR');
  const [categoryId, setCategoryId] = useState(expense.category_id || '');
  const [selectedProject, setSelectedProject] = useState(expense.project_id || '');
  const [date, setDate] = useState(expense.date);
  const [isPaid, setIsPaid] = useState(expense.is_paid);
  const [notes, setNotes] = useState(expense.notes || '');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(expense.receipt_url || null);
  
  const { updateExpense, categories } = useExpenses();
  const { projects } = useProjects();

  useEffect(() => {
    if (open) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setCurrency(expense.currency || 'EUR');
      setCategoryId(expense.category_id || '');
      setSelectedProject(expense.project_id || '');
      setDate(expense.date);
      setIsPaid(expense.is_paid);
      setNotes(expense.notes || '');
      setReceiptUrl(expense.receipt_url || null);
    }
  }, [open, expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateExpense.mutate({
      id: expense.id,
      description,
      amount: parseFloat(amount),
      currency,
      category_id: categoryId && categoryId !== 'none' ? categoryId : null,
      project_id: selectedProject && selectedProject !== 'none' ? selectedProject : null,
      date,
      is_paid: isPaid,
      paid_at: isPaid ? new Date().toISOString() : null,
      notes: notes || null,
      receipt_url: receiptUrl,
    });
    setOpen(false);
  };
  
  const handleReceiptChange = (url: string | null) => {
    setReceiptUrl(url);
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
          <DialogTitle>Modifica Spesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrizione</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrizione della spesa"
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Importo</Label>
              <Input
                id="edit-amount"
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
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 border-2 border-foreground bg-muted/50">
            <div>
              <Label htmlFor="edit-is-paid" className="font-mono font-bold">Pagato</Label>
              <p className="text-xs text-muted-foreground font-mono">Segna come pagato/non pagato</p>
            </div>
            <Switch
              id="edit-is-paid"
              checked={isPaid}
              onCheckedChange={setIsPaid}
            />
          </div>
          
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
            <Label htmlFor="edit-notes">Note</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note aggiuntive..."
              rows={2}
            />
          </div>
          
          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label>Ricevuta / Allegato</Label>
            <ReceiptUpload
              expenseId={expense.id}
              currentUrl={receiptUrl}
              onUpload={handleReceiptChange}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={updateExpense.isPending}>
              {updateExpense.isPending ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
