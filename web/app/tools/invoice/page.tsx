import type {Metadata} from 'next'
import {InvoiceTool} from '@/components/tools/invoice/InvoiceTool'

export const metadata: Metadata = {
  title: 'Invoice tool | dru.works',
  description: 'Invoice builder with PDF export',
  robots: {index: false, follow: false},
}

export default function InvoiceToolPage() {
  return <InvoiceTool />
}
