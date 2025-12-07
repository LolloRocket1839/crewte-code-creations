import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileJson, AlertCircle, Check } from 'lucide-react';
import { useProjectImportExport, ImportFormat, ImportPreview } from '@/hooks/useProjectImportExport';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ImportProjectDialogProps {
  children?: React.ReactNode;
}

export function ImportProjectDialog({ children }: ImportProjectDialogProps) {
  const navigate = useNavigate();
  const { importProject, validateImportData, isImporting } = useProjectImportExport();
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [detectedFormat, setDetectedFormat] = useState<ImportFormat | null>(null);

  const resetState = () => {
    setError(null);
    setPreview(null);
    setJsonData(null);
    setDetectedFormat(null);
  };

  const processFile = async (file: File) => {
    resetState();

    if (!file.name.endsWith('.json')) {
      setError('Please select a JSON file');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const validation = validateImportData(data);
      
      if (!validation.valid || !validation.format || !validation.preview) {
        setError('Invalid file format. Please use a Cost Ledger Pro export file or a compatible legacy format.');
        return;
      }

      setJsonData(data);
      setDetectedFormat(validation.format);
      setPreview(validation.preview);
    } catch (e) {
      setError('Failed to parse JSON file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleImport = async () => {
    if (!jsonData || !detectedFormat) return;
    const projectId = await importProject(jsonData, detectedFormat);
    if (projectId) {
      setOpen(false);
      resetState();
      navigate(`/projects/${projectId}`);
    }
  };

  const formatLabel = detectedFormat === 'legacy' ? 'Legacy Format' : 'Cost Ledger Pro';

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState(); }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed border-foreground p-8 text-center
              transition-colors cursor-pointer
              ${isDragging ? 'bg-accent' : 'bg-muted/50 hover:bg-muted'}
            `}
            onClick={() => document.getElementById('import-file-input')?.click()}
          >
            <input
              id="import-file-input"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileJson className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-mono text-sm text-muted-foreground">
              {isDragging ? 'Drop file here' : 'Click or drag JSON file here'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 border-2 border-destructive bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="font-mono text-sm">{error}</p>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="border-2 border-foreground bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span className="font-mono text-sm font-bold">File valid</span>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {formatLabel}
                </Badge>
              </div>
              
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project:</span>
                  <span className="font-bold">{preview.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expenses:</span>
                  <span>{preview.expensesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenues:</span>
                  <span>{preview.revenuesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tasks:</span>
                  <span>{preview.tasksCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categories:</span>
                  <span>{preview.expenseCategoriesCount + preview.revenueCategoriesCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleImport}
              disabled={!preview || isImporting}
            >
              {isImporting ? 'Importing...' : 'Import Project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
