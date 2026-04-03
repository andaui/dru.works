/** Invoice preview / PDF paper backgrounds — order left → right matches design. */
export const DEFAULT_INVOICE_PAPER_HEX = '#F8F8F8'

export type InvoicePaperSwatch = {
  id: string
  /** Fill for preview + PDF page */
  hex: string
  /** Accessible name */
  label: string
}

/** Swatch UI: diameter in px. */
export const INVOICE_PAPER_SWATCH_SIZE_PX = 39

/** Gap between swatch circles. */
export const INVOICE_PAPER_SWATCH_GAP_PX = 14

export const INVOICE_PAPER_SWATCHES: readonly InvoicePaperSwatch[] = [
  {id: 'white', hex: '#FFFFFF', label: 'White paper'},
  {id: 'mist', hex: '#F8F8F8', label: 'Mist paper'},
  {id: 'cream', hex: '#F1EBD8', label: 'Cream paper'},
  {id: 'tan', hex: '#DFC392', label: 'Tan paper'},
  {id: 'lavender', hex: '#D9CEFF', label: 'Lavender paper'},
  {id: 'sky', hex: '#CEE7FF', label: 'Sky paper'},
  {id: 'mint', hex: '#CEFFD6', label: 'Mint paper'},
] as const

const PILL_BG_TEMPLATE_THREE_DEFAULT = '#ededed'

/** Pill fill behind “Invoice” on template Three — pairs with {@link INVOICE_PAPER_SWATCHES} page fills. White/mist keep default grey pill. */
export function invoiceTemplateThreePillBackground(paperBackgroundHex: string): string {
  const n = paperBackgroundHex.trim().toUpperCase().replace(/^#/, '')
  const key = `#${n}`
  switch (key) {
    case '#F1EBD8':
      return '#DED8CA'
    case '#DFC392':
      return '#F1E5D0'
    case '#D9CEFF':
      return '#EBE5FF'
    case '#CEE7FF':
      return '#E5F3FF'
    case '#CEFFD6':
      return '#FAFFFB'
    default:
      return PILL_BG_TEMPLATE_THREE_DEFAULT
  }
}

const ACCENT_TEMPLATE_THREE_DEFAULT = '#de2475'

/** Total / accent pink on template Three — cream, tan, lavender get bespoke hues; others stay default pink. */
export function invoiceTemplateThreeAccent(paperBackgroundHex: string): string {
  const n = paperBackgroundHex.trim().toUpperCase().replace(/^#/, '')
  const key = `#${n}`
  switch (key) {
    case '#F1EBD8':
      return '#7416E0'
    case '#DFC392':
      return '#5F6518'
    case '#D9CEFF':
      return '#971B7E'
    default:
      return ACCENT_TEMPLATE_THREE_DEFAULT
  }
}
