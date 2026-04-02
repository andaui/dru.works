export type InvoiceCurrency = 'GBP' | 'USD' | 'EUR'

export function formatMoney(amount: number, currency: InvoiceCurrency) {
  const n = Math.abs(amount).toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${currency} ${n}`
}

export function formatMoneyCompact(amount: number, currency: InvoiceCurrency) {
  const n = Math.abs(amount).toLocaleString('en-GB', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
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
