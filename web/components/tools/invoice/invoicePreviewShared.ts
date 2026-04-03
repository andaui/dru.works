import type {InvoiceBankDetails} from '@/lib/invoiceBankDetails'
import type {InvoiceCurrency} from '@/lib/invoiceFormat'

export type PreviewLineItem = {
  description: string
  quantity: number
  unitPrice: number
}

/** Classic = current stacked layout; lightMode = Figma "Light Mode" (508:37). */
export type InvoicePreviewTemplate = 'classic' | 'lightMode'

export type InvoicePreviewProps = {
  template?: InvoicePreviewTemplate
  /** From — company name lines */
  fromLines: string[]
  /** Billed to — client lines */
  billedLines: string[]
  invoiceDateIso: string
  invoiceNo: string
  dueDateIso: string
  vatId: string
  lineItems: PreviewLineItem[]
  currency: InvoiceCurrency
  discountPercent: number
  taxPercent: number
  /** Final total after discount and tax */
  displayTotal: number
  bankDetails: InvoiceBankDetails
  noteLines: string[]
  /** Preview card + PDF page fill */
  paperBackground: string
}

/** Figma artboard size — used for PDF parity and responsive scale on screen. */
export const INVOICE_PREVIEW_WIDTH_PX = 641
export const INVOICE_PREVIEW_HEIGHT_PX = 905
