import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const BUCKET_NAME = 'expense-receipts';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const SIGNED_URL_EXPIRY = 3600; // 1 hour

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

  // Extract file path from stored receipt URL
  const extractFilePath = (receiptUrl: string): string | null => {
    // Handle both public URLs and signed URLs
    // Public URL format: https://...supabase.co/storage/v1/object/public/expense-receipts/user-id/file.jpg
    // Signed URL format: https://...supabase.co/storage/v1/object/sign/expense-receipts/user-id/file.jpg?token=...
    
    const publicMatch = receiptUrl.match(/\/object\/public\/expense-receipts\/(.+?)(?:\?|$)/);
    if (publicMatch) {
      return publicMatch[1];
    }
    
    const signMatch = receiptUrl.match(/\/object\/sign\/expense-receipts\/(.+?)(?:\?|$)/);
    if (signMatch) {
      return signMatch[1];
    }
    
    // Fallback: try to extract after bucket name
    const bucketMatch = receiptUrl.split(`${BUCKET_NAME}/`);
    if (bucketMatch.length >= 2) {
      return bucketMatch[1].split('?')[0]; // Remove query params
    }
    
    return null;
  };

  // Generate a signed URL for viewing a receipt
  const getSignedUrl = async (receiptUrl: string): Promise<string | null> => {
    if (!user) return null;
    
    const filePath = extractFilePath(receiptUrl);
    if (!filePath) {
      console.error('Could not extract file path from URL:', receiptUrl);
      return null;
    }
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, SIGNED_URL_EXPIRY);
    
    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
    
    return data.signedUrl;
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

      // Store the file path reference (not a public URL since bucket is now private)
      // We'll generate signed URLs when displaying
      const storedPath = `${BUCKET_NAME}/${fileName}`;

      toast.success('Ricevuta caricata con successo');
      return storedPath;
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('Errore durante il caricamento');
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
      const filePath = extractFilePath(receiptUrl);
      if (!filePath) {
        throw new Error('URL ricevuta non valido');
      }

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
      toast.error('Errore durante l\'eliminazione');
      return false;
    }
  };

  return {
    uploadReceipt,
    deleteReceipt,
    getSignedUrl,
    isUploading,
    progress,
    validateFile,
    allowedTypes: ALLOWED_TYPES,
    maxFileSize: MAX_FILE_SIZE,
  };
}
