import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const BUCKET_NAME = 'expense-receipts';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export function useReceiptUpload() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato non supportato. Usa JPG, PNG, WEBP o PDF.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File troppo grande. Massimo 10MB.';
    }
    return null;
  };

  const uploadReceipt = async (file: File, expenseId: string): Promise<string | null> => {
    if (!user) {
      toast.error('Devi essere autenticato per caricare file');
      return null;
    }

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return null;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${expenseId}-${Date.now()}.${fileExt}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);
      setProgress(100);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      toast.success('Ricevuta caricata con successo');
      return publicUrl;
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('Errore durante il caricamento: ' + err.message);
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const deleteReceipt = async (receiptUrl: string): Promise<boolean> => {
    if (!user) {
      toast.error('Devi essere autenticato per eliminare file');
      return false;
    }

    try {
      // Extract file path from URL
      const urlParts = receiptUrl.split(`${BUCKET_NAME}/`);
      if (urlParts.length < 2) {
        throw new Error('URL ricevuta non valido');
      }
      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      toast.success('Ricevuta eliminata');
      return true;
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error('Errore durante l\'eliminazione: ' + err.message);
      return false;
    }
  };

  return {
    uploadReceipt,
    deleteReceipt,
    isUploading,
    progress,
    validateFile,
    allowedTypes: ALLOWED_TYPES,
    maxFileSize: MAX_FILE_SIZE,
  };
}
