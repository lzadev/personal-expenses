// Currency symbol mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: 'USD $',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  CHF: 'Fr',
  CNY: '¥',
  INR: '₹',
  MXN: 'MX$',
  DOP: 'DOP $',
}

// Format number with commas and decimals
function formatNumber(num: number): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  return `${symbol}${formatNumber(amount)}`
}
