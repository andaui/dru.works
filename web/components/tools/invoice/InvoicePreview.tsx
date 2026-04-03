'use client'
import type {InvoiceBankDetails} from '@/lib/invoiceBankDetails'
import {buildPreviewBankRows} from '@/lib/invoiceBankDetails'
import type {InvoiceCurrency} from '@/lib/invoiceFormat'
import {formatDateDots, formatMoney, formatMoneyCompact} from '@/lib/invoiceFormat'

export type PreviewLineItem = {
  description: string
  quantity: number
  unitPrice: number
}

export type InvoicePreviewProps = {
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

/**
 * Figma invoice — 641×905, auto-layout as flex; page fill from `paperBackground`.
 * Inline hex/rgba avoids Tailwind `oklab()` in computed styles (stable in browsers).
 */
export function InvoicePreview({
  fromLines,
  billedLines,
  invoiceDateIso,
  invoiceNo,
  dueDateIso,
  vatId,
  lineItems,
  currency,
  discountPercent,
  taxPercent,
  displayTotal,
  bankDetails,
  noteLines,
  paperBackground,
}: InvoicePreviewProps) {
    const c = {
      ink: '#000000',
      bg: paperBackground,
    }

    const lineSubtotal = lineItems.reduce((s, r) => s + r.quantity * r.unitPrice, 0)
    const discountAmt = lineSubtotal * (discountPercent / 100)
    const afterDisc = lineSubtotal - discountAmt
    const taxAmt = afterDisc * (taxPercent / 100)


    const metaRows: {key: string; label: string; value: string}[] = []
    if (invoiceDateIso?.trim()) {
      metaRows.push({
        key: 'date',
        label: 'Invoice date',
        value: formatDateDots(invoiceDateIso),
      })
    }
    if (invoiceNo.trim()) {
      metaRows.push({key: 'no', label: 'Invoice no.', value: invoiceNo.trim()})
    }
    if (dueDateIso.trim()) {
      metaRows.push({
        key: 'due',
        label: 'Due date',
        value: formatDateDots(dueDateIso),
      })
    }
    if (vatId.trim()) {
      metaRows.push({key: 'vat', label: 'Vat ID', value: vatId.trim()})
    }

    const bankRows = buildPreviewBankRows(currency, bankDetails)
    const hasBankDetails = bankRows.length > 0

  return (
      <div
        className="invoice-pdf-root shrink-0 overflow-hidden"
        style={{
          width: `${INVOICE_PREVIEW_WIDTH_PX}px`,
          height: `${INVOICE_PREVIEW_HEIGHT_PX}px`,
          backgroundColor: c.bg,
          boxSizing: 'border-box',
          paddingTop: '17px',
          paddingBottom: '17px',
          color: c.ink,
          fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div
          className="flex h-full w-full flex-col justify-between"
          style={{width: `${INVOICE_PREVIEW_WIDTH_PX}px`}}
        >
          <div className="flex w-full flex-col items-start gap-[29px]">
            <PreviewRow label="From" lines={fromLines} />
            <PreviewRow label="Billed to" lines={billedLines} />
            {metaRows.length > 0 ? (
              <div
                className="flex w-full items-center justify-between pl-[12px] pr-[24px]"
                style={{color: c.ink}}
              >
                <div className="flex items-center gap-[60px] text-[11px] leading-normal">
                  <div className="flex w-[100px] flex-col gap-0 font-normal">
                    {metaRows.map((r) => (
                      <span key={r.key}>{r.label}</span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-0 whitespace-nowrap font-normal">
                    {metaRows.map((r) => (
                      <span key={r.key}>{r.value}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex w-[641px] flex-col items-start px-[14px]">
            <div className="flex w-full flex-col items-start gap-[40px]">
              <div className="flex w-full flex-col gap-[32px]">
                <div className="flex w-full items-center gap-[30px]">
                  <p
                    className="min-h-0 min-w-0 flex-1"
                    style={{
                      fontFamily: 'var(--font-inter), sans-serif',
                      fontSize: '24.035px',
                      fontWeight: 500,
                      lineHeight: 1.15,
                      letterSpacing: '-1.2018px',
                      color: c.ink,
                    }}
                  >
                    Items
                  </p>
                  <span
                    className="w-[60px] shrink-0 text-right text-[11px]"
                    style={{
                      fontFamily: 'var(--font-soehne), sans-serif',
                      fontWeight: 600,
                      color: c.ink,
                    }}
                  >
                    Qty
                  </span>
                  <span
                    className="w-[120px] shrink-0 text-right text-[11px]"
                    style={{
                      fontFamily: 'var(--font-soehne), sans-serif',
                      fontWeight: 600,
                      color: c.ink,
                    }}
                  >
                    Price
                  </span>
                  <span
                    className="w-[120px] shrink-0 text-right text-[11px]"
                    style={{
                      fontFamily: 'var(--font-soehne), sans-serif',
                      fontWeight: 600,
                      color: c.ink,
                    }}
                  >
                    Total
                  </span>
                </div>
                <div className="flex w-full flex-col gap-[6px] text-[11px] font-normal leading-normal">
                  {lineItems.map((row, i) => {
                    const lineTotal = row.quantity * row.unitPrice
                    return (
                      <div key={i} className="flex w-full items-start gap-[30px]">
                        {/* Block wrapper: overflow on flex children can clip ascenders wrongly in some raster paths */}
                        <div
                          className="min-w-0 flex-1 self-start"
                          style={{
                            fontSize: 11,
                            lineHeight: 1.35,
                            maxHeight: 32,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              color: c.ink,
                              wordBreak: 'break-word',
                              whiteSpace: 'pre-wrap',
                              margin: 0,
                              padding: 0,
                            }}
                          >
                            {row.description}
                          </div>
                        </div>
                        <p className="w-[60px] shrink-0 text-right tabular-nums" style={{color: c.ink}}>
                          {row.quantity}
                        </p>
                        <p className="w-[120px] shrink-0 text-right tabular-nums" style={{color: c.ink}}>
                          {formatMoneyCompact(row.unitPrice, currency)}
                        </p>
                        <p className="w-[120px] shrink-0 text-right tabular-nums" style={{color: c.ink}}>
                          {formatMoney(lineTotal, currency)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div
                className="flex w-full flex-col gap-[3px] text-[11.347px] font-normal leading-[1.15] tracking-[-0.5674px]"
                style={{color: c.ink, fontFamily: 'var(--font-inter), sans-serif'}}
              >
                <div className="flex h-[18px] w-full shrink-0 items-center gap-[30px]">
                  <span className="min-w-0 flex-1">Subtotal</span>
                  <span className="w-[60px] shrink-0" aria-hidden />
                  <span className="w-[120px] shrink-0" aria-hidden />
                  <span className="w-[120px] shrink-0 text-right tabular-nums">
                    {formatMoneyCompact(lineSubtotal, currency)}
                  </span>
                </div>
                <div className="flex h-[18px] w-full shrink-0 items-center gap-[30px] font-semibold">
                  <span className="min-w-0 flex-1">Tax</span>
                  <span
                    className="w-[60px] shrink-0 text-right tabular-nums"
                    style={{color: taxPercent === 0 ? 'rgba(0,0,0,0.25)' : c.ink}}
                  >
                    {taxPercent}%
                  </span>
                  <span className="w-[120px] shrink-0" aria-hidden />
                  <span className="w-[120px] shrink-0 text-right font-normal tabular-nums">
                    {taxAmt > 0 ? formatMoneyCompact(taxAmt, currency) : null}
                  </span>
                </div>
                <div className="flex h-[18px] w-full shrink-0 items-center gap-[30px]">
                  <span className="min-w-0 flex-1">Discount</span>
                  <span
                    className="w-[60px] shrink-0 text-right tabular-nums"
                    style={{color: discountPercent === 0 ? 'rgba(0,0,0,0.25)' : c.ink}}
                  >
                    {discountPercent}%
                  </span>
                  <span className="w-[120px] shrink-0" aria-hidden />
                  <span
                    className="w-[120px] shrink-0 text-right tabular-nums"
                    style={{opacity: discountAmt > 0 ? 0.4 : undefined, color: c.ink}}
                  >
                    {discountAmt > 0 ? `-${formatMoneyCompact(discountAmt, currency)}` : null}
                  </span>
                </div>
                <div className="flex h-[18px] w-full shrink-0 items-center gap-[30px] font-semibold">
                  <span className="min-w-0 flex-1">Total {currency}</span>
                  <span className="w-[60px] shrink-0" aria-hidden />
                  <span className="w-[120px] shrink-0" aria-hidden />
                  <div className="flex w-[120px] min-w-0 shrink-0 flex-row items-center justify-end gap-[6px] tabular-nums">
                    <span className="shrink-0" style={{color: c.ink}}>
                      {formatMoneyCompact(displayTotal, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-[24px] text-[11px]" style={{color: c.ink}}>
            {hasBankDetails ? (
              <div className="flex flex-col gap-0 pl-[12px] pr-[24px] leading-normal">
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
            <div className="flex w-full items-start gap-[60px] px-[12px]">
              <p
                className="w-[100px] shrink-0 font-semibold leading-normal"
                style={{fontFamily: 'var(--font-inter), sans-serif'}}
              >
                Note
              </p>
              <div className="min-h-[16px] font-normal leading-[0] whitespace-nowrap">
                {noteLines.length === 0 ? null : (
                  noteLines.map((line, i) => (
                    <p key={i} className="mb-0 leading-[16px] last:mb-0">
                      {line}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}


function PreviewRow({label, lines}: {label: string; lines: string[]}) {
  return (
    <div
      className="flex w-full items-start gap-[60px] px-[12px] text-[11px] not-italic"
      style={{color: '#000000'}}
    >
      <p
        className="w-[100px] shrink-0 font-semibold leading-normal"
        style={{fontFamily: 'var(--font-inter), sans-serif'}}
      >
        {label}
      </p>
      <div
        className="min-h-[16px] min-w-0 flex-1 font-normal leading-[0] whitespace-pre-wrap"
        style={{fontFamily: 'var(--font-inter), sans-serif'}}
      >
        {lines.length === 0 ? null : (
          lines.map((line, i) => (
            <p key={i} className="mb-0 leading-[16px] last:mb-0">
              {line}
            </p>
          ))
        )}
      </div>
    </div>
  )
}
