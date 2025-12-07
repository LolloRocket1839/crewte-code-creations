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
