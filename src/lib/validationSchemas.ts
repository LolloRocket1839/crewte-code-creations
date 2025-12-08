import { z } from 'zod';

// Expense validation schema
export const expenseSchema = z.object({
  description: z.string()
    .trim()
    .min(1, 'La descrizione è obbligatoria')
    .max(200, 'La descrizione deve essere massimo 200 caratteri'),
  amount: z.number()
    .positive('L\'importo deve essere maggiore di zero')
    .max(999999999, 'L\'importo è troppo grande'),
  currency: z.enum(['EUR', 'CHF', 'USD', 'GBP'], {
    errorMap: () => ({ message: 'Valuta non valida' })
  }),
  category_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido'),
  is_paid: z.boolean(),
  notes: z.string().max(1000, 'Le note devono essere massimo 1000 caratteri').nullable().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

// Revenue validation schema
export const revenueSchema = z.object({
  description: z.string()
    .trim()
    .min(1, 'La descrizione è obbligatoria')
    .max(200, 'La descrizione deve essere massimo 200 caratteri'),
  amount: z.number()
    .positive('L\'importo deve essere maggiore di zero')
    .max(999999999, 'L\'importo è troppo grande'),
  currency: z.enum(['EUR', 'CHF', 'USD', 'GBP'], {
    errorMap: () => ({ message: 'Valuta non valida' })
  }),
  category_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido'),
  is_recurring: z.boolean(),
  recurrence_type: z.enum(['monthly', 'quarterly', 'yearly']).nullable().optional(),
  recurrence_day: z.number().min(1).max(31).nullable().optional(),
  notes: z.string().max(1000, 'Le note devono essere massimo 1000 caratteri').nullable().optional(),
});

export type RevenueFormData = z.infer<typeof revenueSchema>;

// Validation result types
type ValidationSuccess<T> = { success: true; data: T };
type ValidationError = { success: false; error: string };

// Helper to validate expense
export function validateExpense(data: unknown): ValidationSuccess<ExpenseFormData> | ValidationError {
  const result = expenseSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.errors[0];
  return { success: false, error: firstError?.message || 'Dati non validi' };
}

// Helper to validate revenue
export function validateRevenue(data: unknown): ValidationSuccess<RevenueFormData> | ValidationError {
  const result = revenueSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.errors[0];
  return { success: false, error: firstError?.message || 'Dati non validi' };
}
