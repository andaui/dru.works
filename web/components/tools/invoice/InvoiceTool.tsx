'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type TransitionEvent,
} from 'react'
import {InvoiceEditor, type EditorLineItem} from '@/components/tools/invoice/InvoiceEditor'
import {
  InvoicePreview,
  INVOICE_PREVIEW_HEIGHT_PX,
  INVOICE_PREVIEW_WIDTH_PX,
  type PreviewLineItem,
} from '@/components/tools/invoice/InvoicePreview'
import type {InvoicePreviewTemplate} from '@/components/tools/invoice/invoicePreviewShared'
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

const PREVIEW_FLIP_MS = 380
const PREVIEW_FLIP_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

type PreviewFsPhase =
  | 'inline'
  | 'expandSnap'
  | 'expandRun'
  | 'expanded'
  | 'collapseSnap'
  | 'collapseRun'

export function InvoiceTool() {
  const [exporting, setExporting] = useState(false)
  /** Only use a scroll container when scaled preview still exceeds viewport (e.g. rounding). */
  const [clipPreview, setClipPreview] = useState(false)
  /** Uniform scale so 641×905 fits both column width and available viewport height. */
  const [previewScale, setPreviewScale] = useState(1)
  const previewMeasureRef = useRef<HTMLDivElement>(null)

  const [fromAExpanded, setFromAExpanded] = useState(true)
  const [billedExpanded, setBilledExpanded] = useState(true)
  const [bankDetailsExpanded, setBankDetailsExpanded] = useState(false)

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
  const [previewTemplate, setPreviewTemplate] = useState<InvoicePreviewTemplate>('classic')
  const [previewFsPhase, setPreviewFsPhase] = useState<PreviewFsPhase>('inline')
  const [fullVw, setFullVw] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth : INVOICE_PREVIEW_WIDTH_PX),
  )
  const openRectRef = useRef<DOMRect | null>(null)
  const closeRectRef = useRef<DOMRect | null>(null)
  const previewClipRef = useRef<HTMLDivElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)

  const previewFsOpen = previewFsPhase !== 'inline'

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

  const invoicePreviewProps = useMemo(
    () => ({
      template: previewTemplate,
      fromLines: previewLinesFrom,
      billedLines: previewLinesBilled,
      invoiceDateIso: issueDate,
      invoiceNo,
      dueDateIso: dueDate,
      vatId,
      lineItems: previewLineItems,
      currency,
      discountPercent,
      taxPercent,
      displayTotal: computedFinal,
      bankDetails,
      noteLines,
      paperBackground,
    }),
    [
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
      previewTemplate,
      taxPercent,
      vatId,
    ],
  )

  useEffect(() => {
    if (!previewFsOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [previewFsOpen])

  useLayoutEffect(() => {
    if (previewFsPhase !== 'expandSnap') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPreviewFsPhase('expandRun'))
    })
    return () => cancelAnimationFrame(id)
  }, [previewFsPhase])

  useLayoutEffect(() => {
    if (previewFsPhase !== 'collapseSnap') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPreviewFsPhase('collapseRun'))
    })
    return () => cancelAnimationFrame(id)
  }, [previewFsPhase])

  useEffect(() => {
    if (previewFsPhase !== 'expanded' && previewFsPhase !== 'expandRun') return
    const onResize = () => setFullVw(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [previewFsPhase])

  const openPreviewFs = useCallback(() => {
    const el = previewClipRef.current
    if (!el) return
    openRectRef.current = el.getBoundingClientRect()
    setFullVw(window.innerWidth)
    closeRectRef.current = null
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPreviewFsPhase('expanded')
      return
    }
    setPreviewFsPhase('expandSnap')
  }, [])

  const closePreviewFs = useCallback(() => {
    if (previewFsPhase !== 'expanded') return
    const ph = placeholderRef.current?.getBoundingClientRect()
    closeRectRef.current = ph ?? openRectRef.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPreviewFsPhase('inline')
      return
    }
    setPreviewFsPhase('collapseSnap')
  }, [previewFsPhase])

  const onPreviewFsTransitionEnd = useCallback((e: TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'transform' || e.target !== e.currentTarget) return
    setPreviewFsPhase((p) => {
      if (p === 'expandRun') return 'expanded'
      if (p === 'collapseRun') return 'inline'
      return p
    })
  }, [])

  useEffect(() => {
    if (!previewFsOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewFsPhase === 'expanded') {
        e.preventDefault()
        closePreviewFs()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewFsOpen, previewFsPhase, closePreviewFs])

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
          template={previewTemplate}
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
    previewTemplate,
    taxPercent,
    vatId,
  ])

  const clipW = INVOICE_PREVIEW_WIDTH_PX * previewScale
  const clipH = INVOICE_PREVIEW_HEIGHT_PX * previewScale

  const previewMotion = useMemo(() => {
    const openR = openRectRef.current
    const closeR = closeRectRef.current
    const sFull = fullVw / INVOICE_PREVIEW_WIDTH_PX

    if (previewFsPhase === 'inline') {
      return {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: INVOICE_PREVIEW_WIDTH_PX,
        height: INVOICE_PREVIEW_HEIGHT_PX,
        transform: `scale(${previewScale})`,
        transformOrigin: 'top left' as const,
        transition: undefined as string | undefined,
        zIndex: undefined as number | undefined,
      }
    }

    const sOpen = openR ? openR.width / INVOICE_PREVIEW_WIDTH_PX : previewScale

    if (previewFsPhase === 'expandSnap') {
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: INVOICE_PREVIEW_WIDTH_PX,
        height: INVOICE_PREVIEW_HEIGHT_PX,
        transform: `translate(${openR?.left ?? 0}px, ${openR?.top ?? 0}px) scale(${sOpen})`,
        transformOrigin: 'top left' as const,
        transition: undefined as string | undefined,
        zIndex: 200,
      }
    }

    if (previewFsPhase === 'expandRun') {
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: INVOICE_PREVIEW_WIDTH_PX,
        height: INVOICE_PREVIEW_HEIGHT_PX,
        transform: `translate(0px, 0px) scale(${sFull})`,
        transformOrigin: 'top left' as const,
        transition: `transform ${PREVIEW_FLIP_MS}ms ${PREVIEW_FLIP_EASE}`,
        zIndex: 200,
      }
    }

    // collapseSnap: appear at fullscreen position instantly (no transition), then collapseRun animates it away
    if (previewFsPhase === 'collapseSnap') {
      return {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: INVOICE_PREVIEW_WIDTH_PX,
        height: INVOICE_PREVIEW_HEIGHT_PX,
        transform: `translate(0px, 0px) scale(${sFull})`,
        transformOrigin: 'top left' as const,
        transition: undefined as string | undefined,
        zIndex: 200,
      }
    }

    const sClose = closeR ? closeR.width / INVOICE_PREVIEW_WIDTH_PX : previewScale
    return {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: INVOICE_PREVIEW_WIDTH_PX,
      height: INVOICE_PREVIEW_HEIGHT_PX,
      transform: `translate(${closeR?.left ?? 0}px, ${closeR?.top ?? 0}px) scale(${sClose})`,
      transformOrigin: 'top left' as const,
      transition: `transform ${PREVIEW_FLIP_MS}ms ${PREVIEW_FLIP_EASE}`,
      zIndex: 200,
    }
  }, [previewFsPhase, fullVw, previewScale])

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
            role="button"
            tabIndex={0}
            aria-label={
              previewFsPhase === 'expanded'
                ? 'Close full screen invoice preview'
                : 'View invoice full screen'
            }
            aria-expanded={previewFsOpen}
            onClick={() => {
              if (previewFsPhase === 'inline') openPreviewFs()
            }}
            onKeyDown={(e) => {
              if (previewFsPhase === 'inline' && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                openPreviewFs()
              }
            }}
            className={`rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2 ${
              previewFsPhase === 'inline' ? 'cursor-zoom-in' : 'cursor-default'
            }`}
          >
            <div
              ref={previewMeasureRef}
              className="flex w-full max-w-[641px] shrink-0 flex-col justify-start"
            >
              {/* Placeholder holds the space while preview is out-of-flow */}
              {previewFsOpen ? (
                <div
                  ref={placeholderRef}
                  className="shrink-0"
                  style={{width: clipW, height: clipH}}
                  aria-hidden
                />
              ) : null}

              {/* ── Scroll overlay: only during 'expanded' phase ── */}
              {previewFsPhase === 'expanded' ? (
                <div
                  className="fixed inset-0 z-[200] cursor-zoom-out overflow-y-auto text-black"
                  style={{backgroundColor: paperBackground}}
                  onClick={closePreviewFs}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Invoice full screen — click to close"
                >
                  {/* Sized to scaled height so the fixed container actually scrolls */}
                  <div
                    className="shrink-0"
                    style={{
                      width: fullVw,
                      height: INVOICE_PREVIEW_HEIGHT_PX * (fullVw / INVOICE_PREVIEW_WIDTH_PX),
                    }}
                  >
                    <div
                      className="origin-top-left"
                      style={{
                        width: INVOICE_PREVIEW_WIDTH_PX,
                        height: INVOICE_PREVIEW_HEIGHT_PX,
                        transform: `scale(${fullVw / INVOICE_PREVIEW_WIDTH_PX})`,
                      }}
                    >
                      <InvoicePreview {...invoicePreviewProps} />
                    </div>
                  </div>
                </div>
              ) : null}

              {/* ── FLIP element: used for all animation phases + inline ── */}
              <div
                ref={previewClipRef}
                className={
                  previewFsOpen
                    ? 'pointer-events-none size-0 shrink-0 overflow-visible'
                    : 'relative shrink-0 overflow-hidden'
                }
                style={previewFsOpen ? {width: 0, height: 0} : {width: clipW, height: clipH}}
              >
                {previewFsPhase !== 'expanded' ? (
                  <div
                    className={`pointer-events-auto origin-top-left will-change-transform ${
                      previewFsPhase === 'inline' ? 'cursor-zoom-in' : 'cursor-default'
                    }`}
                    style={previewMotion}
                    onTransitionEnd={onPreviewFsTransitionEnd}
                  >
                    <InvoicePreview {...invoicePreviewProps} />
                  </div>
                ) : null}
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
          bankDetailsExpanded={bankDetailsExpanded}
          setBankDetailsExpanded={setBankDetailsExpanded}
          note={note}
          setNote={setNote}
          computedFinal={computedFinal}
          exporting={exporting}
          onDownloadPdf={() => void exportPdf()}
          paperBackground={paperBackground}
          setPaperBackground={setPaperBackground}
          previewTemplate={previewTemplate}
          setPreviewTemplate={setPreviewTemplate}
        />
        </div>
      </div>
    </div>
  )
}
