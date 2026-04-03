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
