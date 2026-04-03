import {Font} from '@react-pdf/renderer'

/** Matches preview `var(--font-inter)` — register before rendering any invoice PDF. */
export const PDF_FONT_INTER = 'Inter'

let interFontsRegistered = false

export function registerInvoicePdfInterFonts(): void {
  if (interFontsRegistered) return
  if (typeof window === 'undefined') return
  const base = `${window.location.origin}/fonts/inter`
  Font.register({
    family: PDF_FONT_INTER,
    fonts: [
      {src: `${base}/inter-latin-400-normal.woff2`, fontWeight: 400},
      {src: `${base}/inter-latin-500-normal.woff2`, fontWeight: 500},
      {src: `${base}/inter-latin-600-normal.woff2`, fontWeight: 600},
    ],
  })
  interFontsRegistered = true
}
