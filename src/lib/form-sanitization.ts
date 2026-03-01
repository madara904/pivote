/**
 * Utility functions for sanitizing form inputs
 * Based on best practices for money and number input handling
 */

const MAX_VALUE = 1000000; // 1 million
const MAX_DIGITS = 7; // Maximum digits for numbers up to 1 million

/**
 * Removes leading zeros from a number string
 * @param value - The input string value
 * @returns The value without leading zeros (empty string if all zeros)
 */
export function removeLeadingZeros(value: string): string {
  if (!value) return "";
  
  // Handle decimal numbers specially
  if (value.includes(".")) {
    const parts = value.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1] || "";
    
    // Remove leading zeros from integer part, but allow "0" before decimal
    if (integerPart === "" || integerPart === "0") {
      // Keep "0.5" or ".5" as "0.5"
      return `0.${decimalPart}`;
    }
    
    // Remove leading zeros from integer part
    const cleanedInteger = integerPart.replace(/^0+/, '');
    if (cleanedInteger === "") {
      return `0.${decimalPart}`;
    }
    
    // Dezimalpunkt immer behalten, damit "650." → "650." bleibt (User tippt Cents)
    return `${cleanedInteger}.${decimalPart}`;
  }
  
  // For non-decimal numbers, remove all leading zeros
  const cleaned = value.replace(/^0+/, '');
  
  // If result is empty (all zeros), return "0"
  return cleaned === "" ? "0" : cleaned;
}

/**
 * Sanitizes a number input value, removing leading zeros and enforcing max value
 * @param value - The raw input value
 * @param options - Configuration options
 * @returns Sanitized value as string
 */
export function sanitizeNumberInput(
  value: string,
  options: {
    allowDecimals?: boolean;
    maxValue?: number;
    minValue?: number;
    maxDigits?: number;
    maxDecimalPlaces?: number;
  } = {}
): string {
  if (!value) return "";
  
  const {
    allowDecimals = false,
    maxValue = MAX_VALUE,
    minValue = 0,
    maxDigits = MAX_DIGITS,
    maxDecimalPlaces,
  } = options;

  // Normalize: Komma als Dezimaltrennzeichen (DE) zu Punkt konvertieren
  let normalized = allowDecimals ? value.replace(',', '.') : value;

  // Remove any non-numeric characters except decimal point if allowed
  let cleaned = allowDecimals
    ? normalized.replace(/[^\d.]/g, '')
    : normalized.replace(/\D/g, '');

  // Remove multiple decimal points, keep only the first one
  if (allowDecimals) {
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
  }

  // Limit decimal places (e.g. 2 for cents in EUR)
  if (allowDecimals && maxDecimalPlaces !== undefined) {
    const parts = cleaned.split('.');
    if (parts.length > 1 && parts[1].length > maxDecimalPlaces) {
      cleaned = `${parts[0] || '0'}.${parts[1].slice(0, maxDecimalPlaces)}`;
    }
  }

  // Remove leading zeros (but preserve "0." for decimals)
  cleaned = removeLeadingZeros(cleaned);

  // Limit to max digits (integer part only)
  if (cleaned && cleaned !== "0") {
    const parts = cleaned.split('.');
    const integerPart = parts[0];
    
    if (integerPart.length > maxDigits) {
      // Truncate to max digits
      const truncated = integerPart.slice(0, maxDigits);
      cleaned = parts.length > 1 ? `${truncated}.${parts[1]}` : truncated;
    }
  }

  // Validate numeric value
  const numValue = parseFloat(cleaned);
  if (!isNaN(numValue)) {
    // Enforce min value
    if (numValue < minValue) {
      return minValue.toString();
    }
    
    // Enforce max value
    if (numValue > maxValue) {
      return maxValue.toString();
    }
  }

  return cleaned;
}

/**
 * Sanitizes a money/currency input value
 * Removes leading zeros and enforces max value of 1 million
 * @param value - The raw input value
 * @returns Sanitized value as string
 */
export function sanitizeMoneyInput(value: string): string {
  return sanitizeNumberInput(value, {
    allowDecimals: true,
    maxValue: MAX_VALUE,
    minValue: 0,
    maxDigits: MAX_DIGITS,
    maxDecimalPlaces: 2, // Cent-Beträge (2 Nachkommastellen)
  });
}

/**
 * Sanitizes an integer input value (no decimals)
 * @param value - The raw input value
 * @param options - Configuration options
 * @returns Sanitized value as string
 */
export function sanitizeIntegerInput(
  value: string,
  options: {
    maxValue?: number;
    minValue?: number;
    maxDigits?: number;
  } = {}
): string {
  return sanitizeNumberInput(value, {
    allowDecimals: false,
    maxValue: options.maxValue ?? MAX_VALUE,
    minValue: options.minValue ?? 0,
    maxDigits: options.maxDigits ?? MAX_DIGITS,
  });
}

/**
 * Sanitizes a decimal number input (for weights, dimensions, etc.)
 * @param value - The raw input value
 * @param options - Configuration options
 * @returns Sanitized value as string
 */
export function sanitizeDecimalInput(
  value: string,
  options: {
    maxValue?: number;
    minValue?: number;
    maxDigits?: number;
  } = {}
): string {
  return sanitizeNumberInput(value, {
    allowDecimals: true,
    maxValue: options.maxValue ?? MAX_VALUE,
    minValue: options.minValue ?? 0,
    maxDigits: options.maxDigits ?? MAX_DIGITS,
  });
}

/**
 * Rounds a number to 2 decimal places (cent precision).
 * Avoids floating-point errors when summing money values.
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

