'use client'

import {buildPreviewBankRows} from '@/lib/invoiceBankDetails'
import {formatDateDots, formatMoney, formatMoneyCompact} from '@/lib/invoiceFormat'
import {
  INVOICE_PREVIEW_HEIGHT_PX,
  INVOICE_PREVIEW_WIDTH_PX,
  type InvoicePreviewProps,
} from '@/components/tools/invoice/invoicePreviewShared'

const INTER = 'var(--font-inter), ui-sans-serif, system-ui, sans-serif'

/**
 * Figma "Light Mode" template (node 508:37) — 641×905, pt 21 / pb 17.
 * Top hero (515:138): large "Invoice" + invoice no — px 6 (aligns with body), gap 24, min-h 199.
 * Then From row → items (gap 60) → due/bank/note (gap 24).
 */
export function InvoicePreviewLightMode({
  fromLines,
  billedLines,
  invoiceDateIso,
  invoiceNo,
  dueDateIso,
  lineItems,
  currency,
  discountPercent,
  taxPercent,
  displayTotal,
  bankDetails,
  noteLines,
  paperBackground,
}: InvoicePreviewProps) {
  const ink = '#000000'
  const bg = paperBackground

  const lineSubtotal = lineItems.reduce((s, r) => s + r.quantity * r.unitPrice, 0)
  const discountAmt = lineSubtotal * (discountPercent / 100)
  const afterDisc = lineSubtotal - discountAmt
  const taxAmt = afterDisc * (taxPercent / 100)
  const taxMuted = taxPercent === 0
  const discMuted = discountPercent === 0

  const bankRows = buildPreviewBankRows(currency, bankDetails)
  const hasBankDetails = bankRows.length > 0

  const showInvoiceDate = Boolean(invoiceDateIso?.trim())
  const showInvoiceNo = Boolean(invoiceNo?.trim())

  return (
    <div
      className="invoice-pdf-root shrink-0 overflow-x-hidden overflow-y-auto text-black"
      style={{
        width: `${INVOICE_PREVIEW_WIDTH_PX}px`,
        height: `${INVOICE_PREVIEW_HEIGHT_PX}px`,
        backgroundColor: bg,
        boxSizing: 'border-box',
        paddingTop: '21px',
        paddingBottom: '17px',
        color: ink,
        fontFamily: INTER,
      }}
    >
      <div
        className="flex h-full w-full min-h-0 flex-col gap-[60px]"
        style={{width: `${INVOICE_PREVIEW_WIDTH_PX}px`, height: `${INVOICE_PREVIEW_HEIGHT_PX - 21 - 17}px` }}
      >
        {/* Hero + From — inner gap 16 between hero and address row */}
        <div className="flex w-full shrink-0 flex-col gap-4 overflow-x-hidden overflow-y-visible">
          <div className="flex w-full items-start px-6">
            <div className="flex min-h-[199px] min-w-0 flex-1 items-center gap-6 font-medium leading-[1.15] not-italic text-black whitespace-nowrap">
              <span
                className="shrink-0"
                style={{
                  fontFamily: INTER,
                  fontSize: '91px',
                  letterSpacing: '-8.19px',
                }}
              >
                Invoice
              </span>
              {showInvoiceNo ? (
                <span
                  className="min-w-0 shrink"
                  style={{
                    fontFamily: INTER,
                    fontSize: '47px',
                    letterSpacing: '-4.23px',
                  }}
                >
                  {invoiceNo?.trim() ?? ''}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex w-full min-w-0 items-start justify-between gap-6 px-6 text-[11px] not-italic text-black">
            <div className="flex min-w-0 max-w-[203px] shrink-0 flex-col gap-[6px] items-start break-words [overflow-wrap:anywhere]">
              <p className="w-[100px] shrink-0 font-semibold leading-normal" style={{fontFamily: INTER}}>
                From
              </p>
              <AddressLines lines={fromLines} preWrap />
            </div>
            <div className="flex min-w-0 shrink items-start justify-end gap-6">
              {showInvoiceDate ? (
                <div className="flex w-[119px] min-w-0 shrink-0 flex-col gap-4">
                  <div className="flex flex-col gap-[6px]">
                    <p className="w-[100px] font-medium leading-normal" style={{fontFamily: INTER}}>
                      Invoice date
                    </p>
                    <p
                      className="w-[100px] min-w-0 max-w-full break-words font-normal leading-normal"
                      style={{fontFamily: INTER}}
                    >
                      {formatDateDots(invoiceDateIso)}
                    </p>
                  </div>
                </div>
              ) : null}
              <div className="w-[169px] min-w-0 max-w-[169px] shrink-0 break-words [overflow-wrap:anywhere]">
                <AddressLines lines={billedLines} preWrap />
              </div>
            </div>
          </div>
        </div>

        {/* Items + totals — flex-1 so space below totals stays above footer; px 24; gap 40 table↔totals */}
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-6">
          <div className="flex min-h-0 w-full min-w-0 flex-col gap-10">
            <div className="flex min-h-0 w-full flex-col gap-8 text-[11px] leading-normal not-italic">
              <div className="flex w-full min-w-0 shrink-0 items-start gap-[30px]">
                <p className="min-h-0 min-w-0 flex-1 font-medium text-black" style={{fontFamily: INTER}}>
                  Description
                </p>
                <p className="w-[60px] shrink-0 text-right font-medium text-black" style={{fontFamily: INTER}}>
                  Quantity
                </p>
                <p className="w-[120px] shrink-0 text-right font-medium text-black" style={{fontFamily: INTER}}>
                  Unit Price
                </p>
                <p className="w-[90px] shrink-0 text-right font-medium text-black opacity-0" aria-hidden>
                  —
                </p>
              </div>
              <div className="flex min-h-0 w-full min-w-0 flex-col gap-[6px] font-normal text-black" style={{fontFamily: INTER}}>
                {lineItems.map((row, i) => {
                  const lineTotal = row.quantity * row.unitPrice
                  return (
                    <div key={i} className="flex w-full min-w-0 items-start gap-[30px]">
                      <p className="min-h-0 min-w-0 flex-1 break-words [overflow-wrap:anywhere]">{row.description}</p>
                      <p className="w-[60px] shrink-0 text-right tabular-nums">{row.quantity}</p>
                      <p className="w-[120px] shrink-0 break-words text-right tabular-nums leading-snug">
                        {formatMoneyCompact(row.unitPrice, currency)}
                      </p>
                      <p className="w-[90px] shrink-0 break-words text-right tabular-nums leading-snug">
                        {formatMoney(lineTotal, currency)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Totals — same data as Classic: Subtotal, Tax (% + amt), Discount (% + amt), Total */}
            <div className="flex w-full min-w-0 shrink-0 flex-col gap-[6px] text-[11px] text-black" style={{fontFamily: INTER}}>
              <div className="flex w-full min-w-0 items-start justify-end gap-[30px] font-normal leading-normal">
                <span className="w-[120px] min-w-0 shrink-0 break-words text-right">Subtotal</span>
                <span className="w-[90px] min-w-0 shrink-0 break-words text-right tabular-nums leading-snug">
                  {formatMoneyCompact(lineSubtotal, currency)}
                </span>
              </div>
              <div className="flex w-full min-w-0 items-start justify-end gap-[30px] font-normal leading-normal">
                <span className="w-[120px] min-w-0 shrink-0 break-words text-right font-semibold">Tax</span>
                <div className="flex w-[90px] min-w-0 shrink-0 flex-col items-end gap-0.5 tabular-nums leading-snug">
                  <span style={{color: taxMuted ? 'rgba(0,0,0,0.25)' : ink}}>{taxPercent}%</span>
                  <span className="max-w-full break-words text-right">
                    {taxAmt > 0 ? formatMoneyCompact(taxAmt, currency) : ''}
                  </span>
                </div>
              </div>
              <div className="flex w-full min-w-0 items-start justify-end gap-[30px] font-normal leading-normal">
                <span className="w-[120px] min-w-0 shrink-0 break-words text-right">Discount</span>
                <div className="flex w-[90px] min-w-0 shrink-0 flex-col items-end gap-0.5 tabular-nums leading-snug">
                  <span style={{color: discMuted ? 'rgba(0,0,0,0.25)' : ink}}>{discountPercent}%</span>
                  <span
                    className="max-w-full break-words text-right"
                    style={{opacity: discountAmt > 0 ? 0.4 : undefined, color: ink}}
                  >
                    {discountAmt > 0 ? `-${formatMoneyCompact(discountAmt, currency)}` : ''}
                  </span>
                </div>
              </div>
              <div className="flex w-full min-w-0 items-start justify-end gap-[30px]">
                <p
                  className="w-[120px] min-w-0 shrink-0 break-words text-right font-semibold leading-[1.15] tracking-[-0.5674px] text-black"
                  style={{fontFamily: INTER, fontSize: '11.347px'}}
                >
                  Total {currency}
                </p>
                <p
                  className="w-[90px] min-w-0 shrink-0 break-words text-right font-semibold leading-snug tracking-[-0.5674px] text-black tabular-nums"
                  style={{fontFamily: INTER, fontSize: '11.347px'}}
                >
                  {formatMoneyCompact(displayTotal, currency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Due / bank / note — 60px gap from items block above; sits on card bottom */}
        <div className="flex w-full min-w-0 shrink-0 flex-col gap-6 text-[11px] text-black" style={{fontFamily: INTER}}>
          {dueDateIso.trim() ? (
            <div className="flex w-full flex-col items-start px-6">
              <div className="flex flex-col gap-[6px] leading-normal not-italic">
                <p className="w-[100px] shrink-0 font-semibold">Due Date</p>
                <p className="w-[100px] shrink-0 font-normal">{formatDateDots(dueDateIso)}</p>
              </div>
            </div>
          ) : null}
          {hasBankDetails ? (
            <div className="flex flex-col gap-0 px-6 leading-normal not-italic">
              <div className="flex items-start gap-[40px] font-normal">
                <div className="flex w-[158px] shrink-0 flex-col gap-0">
                  {bankRows.map((r) => (
                    <span key={r.key} className="break-words">
                      {r.label}
                    </span>
                  ))}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0 break-words">
                  {bankRows.map((r) => (
                    <span key={r.key}>{r.value}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          {noteLines.length > 0 ? (
            <div className="flex w-full min-w-0 items-start gap-[60px] pl-6 pr-3 not-italic">
              <p className="w-[100px] shrink-0 font-semibold leading-normal">Note</p>
              <div className="min-h-4 min-w-0 flex-1 font-normal leading-normal break-words [overflow-wrap:anywhere]">
                {noteLines.map((line, i) => (
                  <p key={i} className="mb-0 leading-[16px] last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function AddressLines({lines, preWrap}: {lines: string[]; preWrap?: boolean}) {
  if (lines.length === 0) return null
  return (
    <div
      className={`text-[11px] font-normal leading-none ${preWrap ? 'whitespace-pre-wrap break-words' : 'break-words [overflow-wrap:anywhere]'}`}
      style={{fontFamily: INTER}}
    >
      {lines.map((line, i) => (
        <p
          key={i}
          className={`mb-0 leading-[16px] last:mb-0 ${preWrap ? 'whitespace-pre-wrap' : 'break-words'}`}
        >
          {line}
        </p>
      ))}
    </div>
  )
}
