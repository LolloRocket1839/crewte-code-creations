import { ExternalLink, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ReceiptPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptUrl: string;
}

export function ReceiptPreview({ open, onOpenChange, receiptUrl }: ReceiptPreviewProps) {
  const isPdf = receiptUrl.toLowerCase().endsWith('.pdf');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = receiptUrl;
    link.download = 'ricevuta';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Ricevuta</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(receiptUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Apri
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Scarica
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {isPdf ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-muted bg-muted/20">
              <p className="text-muted-foreground font-mono mb-4">
                Anteprima PDF non disponibile
              </p>
              <Button onClick={() => window.open(receiptUrl, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Apri PDF in nuova scheda
              </Button>
            </div>
          ) : (
            <img
              src={receiptUrl}
              alt="Ricevuta"
              className="w-full max-h-[60vh] object-contain border-2 border-foreground"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
