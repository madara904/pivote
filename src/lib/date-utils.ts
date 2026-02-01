import { format, parseISO, isValid } from 'date-fns';
import { de } from 'date-fns/locale';

// ============================================================================
// DATE FORMATTING UTILITIES
// ============================================================================

/**
 * Standard German date format used throughout the application
 */
export const GERMAN_DATE_FORMAT = 'dd.MM.yyyy';

/**
 * Format a date using German locale and format
 */
export function formatGermanDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, GERMAN_DATE_FORMAT, { locale: de });
  } catch {
    return '';
  }
}

/**
 * Format a date for display in status information
 */
export function formatStatusDate(date: Date | string | null | undefined): string {
  return formatGermanDate(date);
}

// ============================================================================
// STATUS DATE INFO UTILITIES
// ============================================================================

/**
 * Create status date information for inquiries
 */
export function createStatusDateInfo(
  sentAt: Date | string | null | undefined,
  viewedAt: Date | string | null | undefined,
  status: string
) {
  const formattedSentDate = formatStatusDate(sentAt);
  const formattedViewedDate = viewedAt ? formatStatusDate(viewedAt) : null;
  
  let statusDetail = '';
  
  if (status === 'open' && viewedAt) {
    statusDetail = `Angesehen ${formattedViewedDate}`;
  } else if (status === 'open' && sentAt) {
    statusDetail = `Gesendet ${formattedSentDate}`;
  } else if (status === 'draft') {
    statusDetail = 'Noch nicht gesendet';
  }
  
  return {
    formattedSentDate,
    formattedViewedDate,
    statusDetail
  };
}

