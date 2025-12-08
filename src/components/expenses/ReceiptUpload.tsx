import { useState, useRef, useEffect } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useReceiptUpload } from '@/hooks/useReceiptUpload';

interface ReceiptUploadProps {
  expenseId?: string;
  currentUrl?: string | null;
  onUpload: (url: string | null) => void;
  onRemove?: () => void;
}

export function ReceiptUpload({ expenseId, currentUrl, onUpload, onRemove }: ReceiptUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const { uploadReceipt, deleteReceipt, getSignedUrl, isUploading, progress, validateFile } = useReceiptUpload();
  const [isDragging, setIsDragging] = useState(false);

  // Get signed URL when currentUrl changes
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (currentUrl && !file) {
        const url = await getSignedUrl(currentUrl);
        setSignedUrl(url);
      }
    };
    fetchSignedUrl();
  }, [currentUrl, file]);

  const handleFileSelect = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      return;
    }

    setFile(selectedFile);
    
    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!file || !expenseId) return;
    
    const url = await uploadReceipt(file, expenseId);
    if (url) {
      onUpload(url);
      setFile(null);
      setPreview(null);
    }
  };

  const handleRemove = async () => {
    if (currentUrl) {
      const success = await deleteReceipt(currentUrl);
      if (success) {
        onUpload(null);
        setSignedUrl(null);
        onRemove?.();
      }
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenReceipt = async () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    } else if (currentUrl) {
      // Try to get a fresh signed URL
      const url = await getSignedUrl(currentUrl);
      if (url) {
        setSignedUrl(url);
        window.open(url, '_blank');
      }
    }
  };

  const isPdf = file?.type === 'application/pdf' || currentUrl?.toLowerCase().endsWith('.pdf');
  const isImage = file?.type?.startsWith('image/') || (currentUrl && !currentUrl.toLowerCase().endsWith('.pdf'));

  // Show current uploaded file
  if (currentUrl && !file) {
    return (
      <div className="border-2 border-foreground p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPdf ? (
              <FileText className="h-5 w-5 text-red-500" />
            ) : (
              <ImageIcon className="h-5 w-5 text-green-500" />
            )}
            <span className="text-sm font-mono truncate max-w-[200px]">
              Ricevuta allegata
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenReceipt}
              className="text-xs"
            >
              Apri
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="text-xs"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {isImage && signedUrl && (
          <img 
            src={signedUrl} 
            alt="Ricevuta" 
            className="w-full max-h-32 object-contain border border-muted"
          />
        )}
      </div>
    );
  }

  // Show file to upload
  if (file) {
    return (
      <div className="border-2 border-foreground p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPdf ? (
              <FileText className="h-5 w-5 text-red-500" />
            ) : (
              <ImageIcon className="h-5 w-5 text-green-500" />
            )}
            <span className="text-sm font-mono truncate max-w-[180px]">
              {file.name}
            </span>
            <span className="text-xs text-muted-foreground">
              ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearSelection}
            className="h-6 w-6"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {preview && (
          <img 
            src={preview} 
            alt="Anteprima" 
            className="w-full max-h-32 object-contain border border-muted"
          />
        )}
        
        {isUploading && (
          <Progress value={progress} className="h-2" />
        )}
        
        {expenseId && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
            size="sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Caricamento... {progress}%
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Carica Ricevuta
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  // Show upload area
  return (
    <div
      className={`border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
        isDragging 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/30 hover:border-foreground'
      }`}
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        onChange={handleInputChange}
        className="hidden"
      />
      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm font-mono text-muted-foreground">
        Clicca o trascina per caricare
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        JPG, PNG, WEBP, PDF • Max 10MB
      </p>
    </div>
  );
}
