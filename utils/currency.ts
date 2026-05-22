/**
 * Currency formatting utilities
 */

/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'INR')
 * @param locale - The locale for formatting (default: 'en-IN')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = "INR", locale = "en-IN"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount)
}

/**
 * Formats a number as currency with custom options
 * @param amount - The amount to format
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted currency string
 */
export function formatCurrencyWithOptions(amount: number, options: Intl.NumberFormatOptions = {}): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "INR",
    ...options,
  }

  return new Intl.NumberFormat("en-IN", defaultOptions).format(amount)
}

/**
 * Parses a currency string to a number
 * @param currencyString - The currency string to parse
 * @returns The parsed number or 0 if invalid
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and spaces, keep numbers and decimal points
  const cleanString = currencyString.replace(/[^\d.-]/g, "")
  const parsed = Number.parseFloat(cleanString)
  return isNaN(parsed) ? 0 : parsed
}
