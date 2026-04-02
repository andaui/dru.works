'use client'

import {useCallback, useMemo, useRef, useState} from 'react'
import {
  InvoiceEditor,
  type ContactForm,
  type EditorLineItem,
} from '@/components/tools/invoice/InvoiceEditor'
import {InvoicePreview, type PreviewLineItem} from '@/components/tools/invoice/InvoicePreview'
import type {InvoiceCurrency} from '@/lib/invoiceFormat'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

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

export function InvoiceTool() {
  const previewRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const [fromAExpanded, setFromAExpanded] = useState(true)
  const [fromBExpanded, setFromBExpanded] = useState(false)
  const [billedExpanded, setBilledExpanded] = useState(false)

  const [fromA, setFromAState] = useState<ContactForm>({
    name: 'Dru',
    email: 'dru@email.com',
    address: '12 Aurora St.',
    phone: '+44 12342 2232',
    city: 'London',
    zip: 'NW10 5W3',
    state: 'TX',
    country: 'US',
  })

  const [fromB, setFromBState] = useState<ContactForm>(() => emptyContact())

  const [billed, setBilledState] = useState<ContactForm>({
    name: 'Ontlea Ltd',
    email: '',
    address: 'Address line 1',
    phone: '',
    city: '',
    zip: '',
    state: '',
    country: '',
  })

  const [invoiceNo, setInvoiceNo] = useState('0')
  const [issueDate, setIssueDate] = useState('2026-11-22')
  const [dueDate, setDueDate] = useState('2026-12-22')
  const [vatId, setVatId] = useState('FI12341234')
  const [bankIban, setBankIban] = useState('FI00 0000 0000 0000 00')
  const [bankBic, setBankBic] = useState('NDEAFIHH')

  const [currency, setCurrency] = useState<InvoiceCurrency>('GBP')
  const [lineItems, setLineItems] = useState<EditorLineItem[]>([
    {
      id: uid(),
      description: 'Desktop / network support via phone and email',
      price: 200,
      quantity: 2,
    },
    {id: uid(), description: 'On-call service 800/day', price: 800, quantity: 2},
    {id: uid(), description: '', price: 0, quantity: 0},
  ])

  const [discountPercent, setDiscountPercent] = useState(10)
  const [taxPercent, setTaxPercent] = useState(0)
  const [goodsAndServices, setGoodsAndServices] = useState(200)
  const [compareTotal, setCompareTotal] = useState(33000)
  const [note, setNote] = useState('')

  const setFromA = useCallback((p: Partial<ContactForm>) => {
    setFromAState((s) => ({...s, ...p}))
  }, [])
  const setFromB = useCallback((p: Partial<ContactForm>) => {
    setFromBState((s) => ({...s, ...p}))
  }, [])
  const setBilled = useCallback((p: Partial<ContactForm>) => {
    setBilledState((s) => ({...s, ...p}))
  }, [])

  const subtotal = useMemo(
    () => lineItems.reduce((s, r) => s + r.price * r.quantity, 0),
    [lineItems],
  )

  const computedFinal = useMemo(() => {
    const afterDisc = subtotal * (1 - discountPercent / 100)
    const taxAmt = afterDisc * (taxPercent / 100)
    return afterDisc + taxAmt + goodsAndServices
  }, [subtotal, discountPercent, taxPercent, goodsAndServices])

  const previewLinesFrom = useMemo(() => {
    const lines = [
      fromA.name || 'Your Company Inc.',
      fromA.address || 'USA, New Your 39th Street',
      [fromA.city, fromA.zip].filter(Boolean).join(' ') || 'Second Avenue',
    ].filter((l) => l.length > 0)
    return lines.length ? lines : ['Your Company Inc.', 'Address line 1', 'Address line 2']
  }, [fromA])

  const previewLinesBilled = useMemo(() => {
    const lines = [
      billed.name || 'Your Client’s Company Inc.',
      billed.address || 'Address line 1',
      [billed.city, billed.zip].filter(Boolean).join(' ') || 'Address line 2',
    ].filter((l) => l.length > 0)
    return lines.length ? lines : ['Your Client’s Company Inc.', 'Address line 1', 'Address line 2']
  }, [billed])

  const previewLineItems: PreviewLineItem[] = useMemo(
    () =>
      lineItems
        .filter((r) => r.description || r.price > 0 || r.quantity > 0)
        .map((r) => ({
          description: r.description,
          quantity: Math.max(0, r.quantity),
          unitPrice: r.price,
        })),
    [lineItems],
  )

  const noteLines = useMemo(() => {
    const raw = note.trim()
    if (raw) return raw.split('\n').filter(Boolean)
    return previewLinesBilled
  }, [note, previewLinesBilled])

  function updateLine(id: string, p: Partial<EditorLineItem>) {
    setLineItems((rows) => rows.map((r) => (r.id === id ? {...r, ...p} : r)))
  }

  function addLine() {
    setLineItems((rows) => [...rows, {id: uid(), description: '', price: 0, quantity: 0}])
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
      const safe = invoiceNo.replace(/[^\w.-]+/g, '_') || 'invoice'
      pdf.save(`${safe}.pdf`)
    } finally {
      setExporting(false)
    }
  }, [invoiceNo])

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto flex max-w-[1710px] flex-col items-stretch justify-between gap-10 px-6 py-5 lg:flex-row lg:items-start lg:gap-6">
        <div className="sticky top-6 z-10 flex w-full max-w-[641px] flex-col gap-4 self-start overflow-y-auto max-h-[calc(100vh-3rem)]">
          <InvoicePreview
            ref={previewRef}
            fromLines={previewLinesFrom}
            billedLines={previewLinesBilled}
            invoiceDateIso={issueDate}
            invoiceNo={invoiceNo}
            dueDateIso={dueDate}
            vatId={vatId}
            lineItems={
              previewLineItems.length
                ? previewLineItems
                : [{description: 'Item Name', quantity: 1, unitPrice: 0}]
            }
            currency={currency}
            discountPercent={discountPercent}
            compareTotal={compareTotal}
            displayTotal={computedFinal}
            bankIban={bankIban}
            bankBic={bankBic}
            noteLines={noteLines}
          />
          <details className="font-inter w-full text-sm text-[#636363]">
            <summary className="cursor-pointer text-black">Bank &amp; VAT (preview)</summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                VAT ID
                <input
                  className="rounded border border-[rgba(0,0,0,0.15)] px-2 py-1 text-black"
                  value={vatId}
                  onChange={(e) => setVatId(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                IBAN
                <input
                  className="rounded border border-[rgba(0,0,0,0.15)] px-2 py-1 text-black"
                  value={bankIban}
                  onChange={(e) => setBankIban(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-2">
                SWIFT / BIC
                <input
                  className="rounded border border-[rgba(0,0,0,0.15)] px-2 py-1 text-black"
                  value={bankBic}
                  onChange={(e) => setBankBic(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-2">
                Compare total (strikethrough)
                <input
                  type="number"
                  className="rounded border border-[rgba(0,0,0,0.15)] px-2 py-1 text-black"
                  value={compareTotal}
                  onChange={(e) => setCompareTotal(Number.parseFloat(e.target.value) || 0)}
                />
              </label>
            </div>
          </details>
        </div>

        <InvoiceEditor
          fromA={fromA}
          setFromA={setFromA}
          fromB={fromB}
          setFromB={setFromB}
          fromAExpanded={fromAExpanded}
          setFromAExpanded={setFromAExpanded}
          fromBExpanded={fromBExpanded}
          setFromBExpanded={setFromBExpanded}
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
          goodsAndServices={goodsAndServices}
          setGoodsAndServices={setGoodsAndServices}
          compareTotal={compareTotal}
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
