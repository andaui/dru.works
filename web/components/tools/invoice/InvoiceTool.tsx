'use client'

import {useCallback, useLayoutEffect, useMemo, useRef, useState} from 'react'
import {InvoiceEditor, type EditorLineItem} from '@/components/tools/invoice/InvoiceEditor'
import {InvoicePreview, type PreviewLineItem} from '@/components/tools/invoice/InvoicePreview'
import type {ContactForm} from '@/lib/invoiceContact'
import {contactToPreviewLines} from '@/lib/invoiceContact'
import {
  emptyInvoiceBankDetails,
  type InvoiceBankDetails,
} from '@/lib/invoiceBankDetails'
import {isoDateLocal, type InvoiceCurrency} from '@/lib/invoiceFormat'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Must match fixed height in `InvoicePreview` root. */
const INVOICE_PREVIEW_HEIGHT_PX = 905

export function InvoiceTool() {
  const previewRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  /** Only use a scroll container when the preview is taller than the viewport (avoids empty scrollbars). */
  const [clipPreview, setClipPreview] = useState(false)

  const [fromAExpanded, setFromAExpanded] = useState(false)
  const [billedExpanded, setBilledExpanded] = useState(false)

  const emptyContact = (): ContactForm => ({
    name: '',
    email: '',
    address: '',
    phone: '',
    city: '',
    zip: '',
    state: '',
    country: '',
  })

  const [fromA, setFromAState] = useState<ContactForm>(emptyContact)
  const [billed, setBilledState] = useState<ContactForm>(emptyContact)

  const [invoiceNo, setInvoiceNo] = useState('')
  const [issueDate, setIssueDate] = useState(() => isoDateLocal())
  const [dueDate, setDueDate] = useState('')
  const [vatId, setVatId] = useState('')
  const [bankDetails, setBankDetailsState] = useState<InvoiceBankDetails>(emptyInvoiceBankDetails)

  const [currency, setCurrency] = useState<InvoiceCurrency>('GBP')
  const [lineItems, setLineItems] = useState<EditorLineItem[]>([
    {id: uid(), description: '', price: 0, quantity: 1},
  ])

  const [discountPercent, setDiscountPercent] = useState(0)
  const [taxPercent, setTaxPercent] = useState(0)
  const [note, setNote] = useState('')

  const setFromA = useCallback((p: Partial<ContactForm>) => {
    setFromAState((s) => ({...s, ...p}))
  }, [])
  const setBilled = useCallback((p: Partial<ContactForm>) => {
    setBilledState((s) => ({...s, ...p}))
  }, [])

  const setBankDetails = useCallback((p: Partial<InvoiceBankDetails>) => {
    setBankDetailsState((s) => ({...s, ...p}))
  }, [])

  useLayoutEffect(() => {
    const topOffsetPx = 24 // matches sticky `top-6`
    const bottomBreathingPx = 12
    const update = () => {
      const available = window.innerHeight - topOffsetPx - bottomBreathingPx
      setClipPreview(INVOICE_PREVIEW_HEIGHT_PX > available)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const subtotal = useMemo(
    () => lineItems.reduce((s, r) => s + r.price * Math.max(1, r.quantity), 0),
    [lineItems],
  )

  const discountAmount = useMemo(
    () => subtotal * (discountPercent / 100),
    [subtotal, discountPercent],
  )

  const computedFinal = useMemo(() => {
    const afterDisc = subtotal - discountAmount
    const taxAmt = afterDisc * (taxPercent / 100)
    return afterDisc + taxAmt
  }, [subtotal, discountAmount, taxPercent])

  const previewLinesFrom = useMemo(() => contactToPreviewLines(fromA), [fromA])
  const previewLinesBilled = useMemo(() => contactToPreviewLines(billed), [billed])

  const previewLineItems: PreviewLineItem[] = useMemo(
    () =>
      lineItems
        .filter((r) => r.description.trim().length > 0 || r.price > 0)
        .map((r) => ({
          description: r.description,
          quantity: Math.max(1, r.quantity),
          unitPrice: r.price,
        })),
    [lineItems],
  )

  const noteLines = useMemo(() => {
    const raw = note.trim()
    if (!raw) return []
    return raw.split('\n').filter(Boolean)
  }, [note])

  function updateLine(id: string, p: Partial<EditorLineItem>) {
    setLineItems((rows) =>
      rows.map((r) => {
        if (r.id !== id) return r
        const next = {...r, ...p}
        if ('price' in p) {
          next.price = Number.parseFloat(String(p.price)) || 0
        }
        if ('quantity' in p) {
          const q = Number.parseInt(String(next.quantity), 10)
          next.quantity = Number.isFinite(q) && q >= 1 ? q : 1
        }
        if (next.price > 0 && next.quantity < 1) {
          next.quantity = 1
        }
        next.quantity = Math.max(1, next.quantity)
        return next
      }),
    )
  }

  function addLine() {
    setLineItems((rows) => [...rows, {id: uid(), description: '', price: 0, quantity: 1}])
  }

  function removeLastLine() {
    setLineItems((rows) => (rows.length <= 1 ? rows : rows.slice(0, -1)))
  }

  const exportPdf = useCallback(async () => {
    const el = previewRef.current
    if (!el) return
    setExporting(true)
    try {
      const [{default: html2canvas}, {default: jsPDF}] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8f8f8',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png', 1)
      const pdf = new jsPDF({orientation: 'portrait', unit: 'mm', format: 'a4'})
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgW = pageW
      const imgH = (canvas.height * imgW) / canvas.width
      let heightLeft = imgH
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH)
      heightLeft -= pageH
      while (heightLeft > 0) {
        position -= pageH
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH)
        heightLeft -= pageH
      }
      const safe = (invoiceNo.trim() ? invoiceNo : 'invoice').replace(/[^\w.-]+/g, '_') || 'invoice'
      pdf.save(`${safe}.pdf`)
    } finally {
      setExporting(false)
    }
  }, [invoiceNo])

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto flex max-w-[1710px] flex-col items-stretch justify-between gap-10 px-6 py-5 lg:flex-row lg:items-start lg:gap-6">
        <div
          className={
            clipPreview
              ? 'sticky top-6 z-10 max-h-[calc(100vh-3rem)] w-full max-w-[641px] shrink-0 self-start overflow-x-hidden overflow-y-auto'
              : 'sticky top-6 z-10 w-full max-w-[641px] shrink-0 self-start overflow-visible'
          }
        >
          <InvoicePreview
            ref={previewRef}
            fromLines={previewLinesFrom}
            billedLines={previewLinesBilled}
            invoiceDateIso={issueDate}
            invoiceNo={invoiceNo}
            dueDateIso={dueDate}
            vatId={vatId}
            lineItems={previewLineItems}
            currency={currency}
            discountPercent={discountPercent}
            taxPercent={taxPercent}
            displayTotal={computedFinal}
            bankDetails={bankDetails}
            noteLines={noteLines}
          />
        </div>

        <InvoiceEditor
          fromA={fromA}
          setFromA={setFromA}
          fromAExpanded={fromAExpanded}
          setFromAExpanded={setFromAExpanded}
          billed={billed}
          setBilled={setBilled}
          billedExpanded={billedExpanded}
          setBilledExpanded={setBilledExpanded}
          invoiceNo={invoiceNo}
          setInvoiceNo={setInvoiceNo}
          issueDate={issueDate}
          setIssueDate={setIssueDate}
          dueDate={dueDate}
          setDueDate={setDueDate}
          currency={currency}
          setCurrency={setCurrency}
          lineItems={lineItems}
          updateLine={updateLine}
          addLine={addLine}
          removeLastLine={removeLastLine}
          discountPercent={discountPercent}
          setDiscountPercent={setDiscountPercent}
          taxPercent={taxPercent}
          setTaxPercent={setTaxPercent}
          subtotal={subtotal}
          discountAmount={discountAmount}
          vatId={vatId}
          setVatId={setVatId}
          bankDetails={bankDetails}
          setBankDetails={setBankDetails}
          note={note}
          setNote={setNote}
          computedFinal={computedFinal}
          exporting={exporting}
          onDownloadPdf={() => void exportPdf()}
        />
      </div>
    </div>
  )
}
