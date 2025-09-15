import { format, parseISO, isValid, differenceInDays, isAfter, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';

// ============================================================================
// DATE FORMATTING UTILITIES
// ============================================================================

/**
 * Standard German date format used throughout the application
 */
export const GERMAN_DATE_FORMAT = 'dd.MM.yyyy';

/**
 * German date-time format for timestamps
 */
export const GERMAN_DATETIME_FORMAT = 'dd.MM.yyyy HH:mm';

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
 * Format a date-time using German locale and format
 */
export function formatGermanDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, GERMAN_DATETIME_FORMAT, { locale: de });
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

/**
 * Format a date with relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    const now = new Date();
    const daysDiff = differenceInDays(now, dateObj);
    
    if (daysDiff === 0) return 'Heute';
    if (daysDiff === 1) return 'Gestern';
    if (daysDiff < 7) return `vor ${daysDiff} Tagen`;
    if (daysDiff < 30) return `vor ${Math.floor(daysDiff / 7)} Wochen`;
    
    return formatGermanDate(dateObj);
  } catch {
    return formatGermanDate(date);
  }
}

// ============================================================================
// DATE VALIDATION UTILITIES
// ============================================================================

/**
 * Check if a date is valid
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && isValid(date);
}

/**
 * Check if a date string can be parsed
 */
export function isValidDateString(dateString: string): boolean {
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch {
    return false;
  }
}

/**
 * Safely parse a date from string or return null
 */
export function safeParseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  if (date instanceof Date) return isValid(date) ? date : null;
  
  try {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// ============================================================================
// DATE COMPARISON UTILITIES
// ============================================================================

/**
 * Check if a date is in the past
 */
export function isDateInPast(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  
  const dateObj = safeParseDate(date);
  if (!dateObj) return false;
  
  return isBefore(dateObj, new Date());
}

/**
 * Check if a date is in the future
 */
export function isDateInFuture(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  
  const dateObj = safeParseDate(date);
  if (!dateObj) return false;
  
  return isAfter(dateObj, new Date());
}

/**
 * Check if a date is today
 */
export function isDateToday(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  
  const dateObj = safeParseDate(date);
  if (!dateObj) return false;
  
  const today = new Date();
  return format(dateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
}

/**
 * Get days until a date (negative if in the past)
 */
export function getDaysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  
  const dateObj = safeParseDate(date);
  if (!dateObj) return null;
  
  return differenceInDays(dateObj, new Date());
}

// ============================================================================
// EXPIRATION UTILITIES
// ============================================================================

/**
 * Check if an inquiry is expired based on validity date
 */
export function isInquiryExpired(validityDate: Date | string | null | undefined): boolean {
  if (!validityDate) return false;
  return isDateInPast(validityDate);
}

/**
 * Check if a quotation is expired based on valid until date
 */
export function isQuotationExpired(validUntil: Date | string | null | undefined): boolean {
  if (!validUntil) return false;
  return isDateInPast(validUntil);
}

/**
 * Get expiration status with formatted date
 */
export function getExpirationStatus(validityDate: Date | string | null | undefined) {
  if (!validityDate) {
    return { isExpired: false, formattedDate: '', daysUntil: null };
  }
  
  const dateObj = safeParseDate(validityDate);
  if (!dateObj) {
    return { isExpired: false, formattedDate: '', daysUntil: null };
  }
  
  const isExpired = isDateInPast(validityDate);
  const daysUntil = getDaysUntil(validityDate);
  
  return {
    isExpired,
    formattedDate: formatGermanDate(dateObj),
    daysUntil,
    statusText: isExpired 
      ? `Abgelaufen am ${formatGermanDate(dateObj)}`
      : daysUntil !== null && daysUntil <= 7
      ? `Läuft ab in ${daysUntil} Tag${daysUntil !== 1 ? 'en' : ''}`
      : `Gültig bis ${formatGermanDate(dateObj)}`
  };
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

// ============================================================================
// FORM UTILITIES
// ============================================================================

/**
 * Convert date to input value format (YYYY-MM-DD)
 */
export function dateToInputValue(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = safeParseDate(date);
  if (!dateObj) return '';
  
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Convert input value to Date object
 */
export function inputValueToDate(value: string): Date | null {
  if (!value) return null;
  
  try {
    const date = parseISO(value);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DateInfo {
  formattedDate: string;
  isExpired: boolean;
  daysUntil: number | null;
  statusText: string;
}

export interface StatusDateInfo {
  formattedSentDate: string;
  formattedViewedDate: string | null;
  statusDetail: string;
}

export interface ExpirationStatus {
  isExpired: boolean;
  formattedDate: string;
  daysUntil: number | null;
  statusText: string;
}
