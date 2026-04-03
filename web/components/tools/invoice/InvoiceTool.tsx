'use client'

import {useCallback, useLayoutEffect, useMemo, useRef, useState} from 'react'
import {InvoiceEditor, type EditorLineItem} from '@/components/tools/invoice/InvoiceEditor'
import {
  InvoicePreview,
  INVOICE_PREVIEW_HEIGHT_PX,
  INVOICE_PREVIEW_WIDTH_PX,
  type PreviewLineItem,
} from '@/components/tools/invoice/InvoicePreview'
import type {ContactForm} from '@/lib/invoiceContact'
import {contactToPreviewLines} from '@/lib/invoiceContact'
import {
  emptyInvoiceBankDetails,
  type InvoiceBankDetails,
} from '@/lib/invoiceBankDetails'
import {isoDateLocal, type InvoiceCurrency} from '@/lib/invoiceFormat'
import {DEFAULT_INVOICE_PAPER_HEX} from '@/lib/invoicePaperSwatches'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function InvoiceTool() {
  const [exporting, setExporting] = useState(false)
  /** Only use a scroll container when scaled preview still exceeds viewport (e.g. rounding). */
  const [clipPreview, setClipPreview] = useState(false)
  /** Uniform scale so 641×905 fits both column width and available viewport height. */
  const [previewScale, setPreviewScale] = useState(1)
  const previewMeasureRef = useRef<HTMLDivElement>(null)

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
  const [paperBackground, setPaperBackground] = useState(DEFAULT_INVOICE_PAPER_HEX)

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
    const el = previewMeasureRef.current
    if (!el) return

    const update = () => {
      const w = el.getBoundingClientRect().width
      const available = window.innerHeight - topOffsetPx - bottomBreathingPx
      const sW = w > 0 ? Math.min(1, w / INVOICE_PREVIEW_WIDTH_PX) : 1
      const sH =
        available > 0 ? Math.min(1, available / INVOICE_PREVIEW_HEIGHT_PX) : 1
      const s = Math.min(sW, sH)
      setPreviewScale(s)
      const scaledH = INVOICE_PREVIEW_HEIGHT_PX * s
      setClipPreview(scaledH > available + 1)
    }

    update()
    const ro = new ResizeObserver(() => update())
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
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
    setExporting(true)
    try {
      const [{pdf}, {InvoicePdfDocument}] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/tools/invoice/InvoicePdfDocument'),
      ])
      const blob = await pdf(
        <InvoicePdfDocument
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
          paperBackground={paperBackground}
        />,
      ).toBlob()
      const safe = (invoiceNo.trim() ? invoiceNo : 'invoice').replace(/[^\w.-]+/g, '_') || 'invoice'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${safe}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }, [
    bankDetails,
    computedFinal,
    currency,
    discountPercent,
    dueDate,
    invoiceNo,
    issueDate,
    noteLines,
    paperBackground,
    previewLineItems,
    previewLinesBilled,
    previewLinesFrom,
    taxPercent,
    vatId,
  ])

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto flex min-w-0 w-full flex-col items-stretch justify-between gap-10 px-6 py-5 lg:flex-row lg:items-start lg:gap-6">
        <div
          className={
            clipPreview
              ? 'sticky top-6 z-10 max-h-[calc(100vh-3rem)] w-full max-w-[641px] shrink-0 self-start overflow-x-hidden overflow-y-auto'
              : 'sticky top-6 z-10 w-full max-w-[641px] shrink-0 self-start overflow-visible'
          }
        >
          <div
            ref={previewMeasureRef}
            className="flex w-full max-w-[641px] shrink-0 justify-start"
          >
            <div
              className="relative shrink-0 overflow-hidden"
              style={{
                width: INVOICE_PREVIEW_WIDTH_PX * previewScale,
                height: INVOICE_PREVIEW_HEIGHT_PX * previewScale,
              }}
            >
              <div
                className="pointer-events-auto absolute left-0 top-0 origin-top-left will-change-transform"
                style={{
                  width: INVOICE_PREVIEW_WIDTH_PX,
                  height: INVOICE_PREVIEW_HEIGHT_PX,
                  transform: `scale(${previewScale})`,
                }}
              >
              <InvoicePreview
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
                paperBackground={paperBackground}
              />
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 w-full flex-1 lg:min-w-0">
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
          paperBackground={paperBackground}
          setPaperBackground={setPaperBackground}
        />
        </div>
      </div>
    </div>
  )
}
