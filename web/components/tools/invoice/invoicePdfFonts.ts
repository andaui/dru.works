import {Font} from '@react-pdf/renderer'

/**
 * WOFF v1 files in `public/fonts/inter/` (copied from `@fontsource/inter`).
 * react-pdf/fontkit does not support WOFF2 — using WOFF2 caused RangeError (DataView) at parse time.
 * Bundling `.woff` from node_modules fails under Turbopack ("Unknown module type"), so we load by URL.
 */
export const PDF_FONT_INTER = 'Inter'

const INTER_WEIGHTS = [400, 500, 600, 700] as const

let interFontsRegistered = false

/** Call before rendering invoice PDFs (client-side export only — needs absolute font URLs). */
export function registerInvoicePdfInterFonts(): void {
  if (interFontsRegistered) return
  if (typeof window === 'undefined') return

  const origin = window.location.origin
  Font.register({
    family: PDF_FONT_INTER,
    fonts: INTER_WEIGHTS.map((fontWeight) => ({
      src: `${origin}/fonts/inter/inter-latin-${fontWeight}-normal.woff`,
      fontWeight,
    })),
  })
  interFontsRegistered = true
}
