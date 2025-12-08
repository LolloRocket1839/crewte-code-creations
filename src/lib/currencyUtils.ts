import { Currency } from '@/types';

// Map timezone to default currency
const TIMEZONE_CURRENCY_MAP: Record<string, Currency> = {
  // Switzerland
  'Europe/Zurich': 'CHF',
  'Europe/Bern': 'CHF',
  
  // Eurozone countries
  'Europe/Rome': 'EUR',
  'Europe/Milan': 'EUR',
  'Europe/Berlin': 'EUR',
  'Europe/Paris': 'EUR',
  'Europe/Madrid': 'EUR',
  'Europe/Amsterdam': 'EUR',
  'Europe/Brussels': 'EUR',
  'Europe/Vienna': 'EUR',
  'Europe/Dublin': 'EUR',
  'Europe/Lisbon': 'EUR',
  'Europe/Athens': 'EUR',
  'Europe/Helsinki': 'EUR',
  
  // United Kingdom
  'Europe/London': 'GBP',
  
  // United States
  'America/New_York': 'USD',
  'America/Los_Angeles': 'USD',
  'America/Chicago': 'USD',
  'America/Denver': 'USD',
  'America/Phoenix': 'USD',
  'America/Anchorage': 'USD',
  'Pacific/Honolulu': 'USD',
};

// Currency symbols map
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CHF: 'CHF',
  EUR: '€',
  USD: '$',
  GBP: '£',
};

/**
 * Get the user's browser timezone
 */
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Europe/Rome'; // Default fallback
  }
}

/**
 * Get default currency based on timezone
 * Returns EUR as the default fallback (not USD)
 */
export function getCurrencyFromTimezone(timezone?: string): Currency {
  const tz = timezone || getBrowserTimezone();
  return TIMEZONE_CURRENCY_MAP[tz] || 'EUR';
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency] || currency;
}

/**
 * Format amount with currency
 */
export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format multi-currency totals (e.g., "€8,500 | CHF 4,135")
 */
export function formatMultiCurrency(byCurrency: Record<string, number>): string {
  const entries = Object.entries(byCurrency).filter(([_, amount]) => amount > 0);
  if (entries.length === 0) return '€0';
  
  return entries
    .map(([currency, amount]) => formatCurrency(amount, currency as Currency))
    .join(' | ');
}
