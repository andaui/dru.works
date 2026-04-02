export type InvoiceCurrency =
  | 'GBP'
  | 'USD'
  | 'EUR'
  | 'CHF'
  | 'KRW'
  | 'RUB'
  | 'JPY'
  | 'CNY'
  | 'INR'
  | 'AUD'

function currencyFractionDigits(currency: InvoiceCurrency): {min: number; max: number} {
  switch (currency) {
    case 'JPY':
    case 'KRW':
      return {min: 0, max: 0}
    default:
      return {min: 2, max: 2}
  }
}

export function formatMoney(amount: number, currency: InvoiceCurrency) {
  const {min, max} = currencyFractionDigits(currency)
  const n = Math.abs(amount).toLocaleString('en-GB', {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  })
  return `${currency} ${n}`
}

export function formatMoneyCompact(amount: number, currency: InvoiceCurrency) {
  const {min, max} = currencyFractionDigits(currency)
  const n = Math.abs(amount).toLocaleString('en-GB', {
    minimumFractionDigits: max === 0 ? 0 : amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: max,
  })
  return `${currency} ${n}`
}

/** DD.MM.YYYY for preview (matches Figma sample). */
export function formatDateDots(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return iso
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

/** DD / MM / YYYY for editor (matches Figma). */
export function formatDateSlashes(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return iso
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd} / ${mm} / ${yyyy}`
}

/** YYYY-MM-DD in local timezone (for `<input type="date" />`). */
export function isoDateLocal(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Shown when due date is unset — same pattern as {@link formatDateSlashes}. */
export function dueDatePlaceholderDisplay(date = new Date()) {
  const yyyy = date.getFullYear()
  return `00 / 00 / ${yyyy}`
}
