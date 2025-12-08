import { useState, useEffect } from 'react';
import { ExternalLink, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useReceiptUpload } from '@/hooks/useReceiptUpload';

interface ReceiptPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptUrl: string;
}

export function ReceiptPreview({ open, onOpenChange, receiptUrl }: ReceiptPreviewProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getSignedUrl } = useReceiptUpload();
  
  const isPdf = receiptUrl.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (open && receiptUrl) {
        setIsLoading(true);
        const url = await getSignedUrl(receiptUrl);
        setSignedUrl(url);
        setIsLoading(false);
      }
    };
    fetchSignedUrl();
  }, [open, receiptUrl]);

  const handleOpen = () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (!signedUrl) return;
    
    const link = document.createElement('a');
    link.href = signedUrl;
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
                onClick={handleOpen}
                disabled={!signedUrl}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Apri
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!signedUrl}
              >
                <Download className="h-4 w-4 mr-1" />
                Scarica
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-muted bg-muted/20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-muted-foreground font-mono">
                Caricamento ricevuta...
              </p>
            </div>
          ) : isPdf ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-muted bg-muted/20">
              <p className="text-muted-foreground font-mono mb-4">
                Anteprima PDF non disponibile
              </p>
              <Button onClick={handleOpen} disabled={!signedUrl}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Apri PDF in nuova scheda
              </Button>
            </div>
          ) : signedUrl ? (
            <img
              src={signedUrl}
              alt="Ricevuta"
              className="w-full max-h-[60vh] object-contain border-2 border-foreground"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-muted bg-muted/20">
              <p className="text-muted-foreground font-mono">
                Impossibile caricare la ricevuta
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
