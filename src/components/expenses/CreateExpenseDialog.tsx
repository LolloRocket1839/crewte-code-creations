import { useState, useRef } from 'react';
import { Plus, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useExpenses } from '@/hooks/useExpenses';
import { useProjects } from '@/hooks/useProjects';
import { useReceiptUpload } from '@/hooks/useReceiptUpload';
import { CURRENCIES, Currency } from '@/types';

interface CreateExpenseDialogProps {
  projectId?: string;
}

export function CreateExpenseDialog({ projectId }: CreateExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [categoryId, setCategoryId] = useState('');
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { createExpense, categories } = useExpenses();
  const { projects } = useProjects();
  const { uploadReceipt, validateFile, isUploading } = useReceiptUpload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    createExpense.mutate({
      description,
      amount: parseFloat(amount),
      currency,
      category_id: categoryId && categoryId !== 'none' ? categoryId : null,
      project_id: selectedProject && selectedProject !== 'none' ? selectedProject : null,
      date,
      is_paid: isPaid,
      notes: notes || null,
    }, {
      onSuccess: async (data) => {
        // Upload receipt if file was selected
        if (receiptFile && data?.id) {
          await uploadReceipt(receiptFile, data.id);
        }
        setOpen(false);
        resetForm();
      }
    });
  };
  
  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) return;
    
    setReceiptFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setReceiptPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };
  
  const clearReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCurrency('EUR');
    setCategoryId('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsPaid(false);
    setNotes('');
    clearReceipt();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Aggiungi Spesa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuova Spesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrizione della spesa"
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Importo</Label>
              <Input
                id="amount"
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
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Paid Toggle */}
          <div className="flex items-center justify-between p-3 border-2 border-foreground bg-muted/50">
            <div>
              <Label htmlFor="is-paid" className="font-mono font-bold">Pagato</Label>
              <p className="text-xs text-muted-foreground font-mono">Segna come già pagato</p>
            </div>
            <Switch
              id="is-paid"
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
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note aggiuntive..."
              rows={2}
            />
          </div>
          
          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label>Ricevuta / Allegato</Label>
            {receiptFile ? (
              <div className="border-2 border-foreground p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {receiptFile.type === 'application/pdf' ? (
                      <FileText className="h-5 w-5 text-red-500" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-green-500" />
                    )}
                    <span className="text-sm font-mono truncate max-w-[180px]">
                      {receiptFile.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearReceipt}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {receiptPreview && (
                  <img 
                    src={receiptPreview} 
                    alt="Anteprima" 
                    className="w-full max-h-24 object-contain border border-muted"
                  />
                )}
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-muted-foreground/30 p-4 text-center cursor-pointer hover:border-foreground transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs font-mono text-muted-foreground">
                  JPG, PNG, PDF • Max 10MB
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={createExpense.isPending || isUploading}>
              {createExpense.isPending || isUploading ? 'Salvataggio...' : 'Aggiungi'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
