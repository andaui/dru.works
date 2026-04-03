import type {InvoiceBankDetails} from '@/lib/invoiceBankDetails'
import type {InvoiceCurrency} from '@/lib/invoiceFormat'
import {isoDateLocal} from '@/lib/invoiceFormat'
import type {ContactForm} from '@/lib/invoiceContact'

function addDaysLocalIso(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1)
  dt.setDate(dt.getDate() + days)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

/** Shared demo copy — applied when choosing either template row. */
export const EXAMPLE_INVOICE_FROM: ContactForm = {
  name: 'Acme Studio Ltd',
  email: 'hello@acmestudio.example',
  address: '12 River Road',
  phone: '+44 20 7946 0123',
  city: 'London',
  zip: 'E1 6AN',
  state: '',
  country: 'United Kingdom',
}

export const EXAMPLE_INVOICE_BILLED: ContactForm = {
  name: 'Northwind Trading Co.',
  email: 'accounts@northwind.example',
  address: 'Suite 400',
  phone: '+1 415 555 0199',
  city: 'San Francisco',
  zip: '94103',
  state: 'CA',
  country: 'United States',
}

export const EXAMPLE_LINE_ITEMS_SEED: readonly {description: string; price: number; quantity: number}[] =
  [
    {description: 'Brand identity — phase 1', price: 4800, quantity: 1},
    {description: 'Website design & build', price: 12000, quantity: 1},
  ]

export function getExampleInvoicePayload(): {
  fromA: ContactForm
  billed: ContactForm
  invoiceNo: string
  issueDate: string
  dueDate: string
  vatId: string
  currency: InvoiceCurrency
  discountPercent: number
  taxPercent: number
  note: string
  bankDetails: InvoiceBankDetails
  lineItemsSeed: readonly {description: string; price: number; quantity: number}[]
} {
  const issueDate = isoDateLocal()
  const bankDetails: InvoiceBankDetails = {
    accountHolderName: 'Acme Studio Ltd',
    bankName: 'Example Bank',
    bankAddress: '1 Bank Street, London EC1M 5AA',
    accountNumber: '12345678',
    sortCode: '12-34-56',
    routingNumber: '',
    ifscCode: '',
    bsb: '',
    iban: 'GB29 NWBK 6016 1331 9268 19',
    bic: 'NWBKGB2L',
  }

  return {
    fromA: EXAMPLE_INVOICE_FROM,
    billed: EXAMPLE_INVOICE_BILLED,
    invoiceNo: '018',
    issueDate,
    dueDate: addDaysLocalIso(issueDate, 30),
    vatId: 'GB 123 4567 89',
    currency: 'GBP',
    discountPercent: 0,
    taxPercent: 20,
    note: 'Payment due within 30 days of invoice date.\nThank you for your business.',
    bankDetails,
    lineItemsSeed: EXAMPLE_LINE_ITEMS_SEED,
  }
}
