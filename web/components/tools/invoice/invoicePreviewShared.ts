import type {InvoiceBankDetails} from '@/lib/invoiceBankDetails'
import type {InvoiceCurrency} from '@/lib/invoiceFormat'

export type PreviewLineItem = {
  description: string
  quantity: number
  unitPrice: number
}

/** Classic = stacked layout; lightMode = Figma 508:37; templateThree = Figma 563:103 (pill hero + Item/Price/Qty). */
export type InvoicePreviewTemplate = 'classic' | 'lightMode' | 'templateThree'

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
