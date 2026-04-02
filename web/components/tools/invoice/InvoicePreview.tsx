'use client'

import {forwardRef} from 'react'
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
  compareTotal: number
  /** Final total after discount (Figma shows explicit total) */
  displayTotal: number
  bankIban: string
  bankBic: string
  noteLines: string[]
}

/**
 * Figma "Light Mode" invoice — #f8f8f8, 641×905, auto-layout as flex.
 * All colors inline rgba/hex for html2canvas (no oklab from Tailwind).
 */
export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  function InvoicePreview(
    {
      fromLines,
      billedLines,
      invoiceDateIso,
      invoiceNo,
      dueDateIso,
      vatId,
      lineItems,
      currency,
      discountPercent,
      compareTotal,
      displayTotal,
      bankIban,
      bankBic,
      noteLines,
    },
    ref,
  ) {
    const c = {
      ink: '#000000',
      bg: '#f8f8f8',
    }

    return (
      <div
        ref={ref}
        className="invoice-pdf-root shrink-0 overflow-hidden"
        style={{
          width: '641px',
          height: '905px',
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
          style={{width: '641px'}}
        >
          <div className="flex w-full flex-col items-start gap-[29px]">
            <PreviewRow label="From" lines={fromLines} />
            <PreviewRow label="Billed to" lines={billedLines} />
            <div
              className="flex w-full items-center justify-between pl-[12px] pr-[24px]"
              style={{color: c.ink}}
            >
              <div className="flex items-center gap-[60px] text-[11px] leading-normal">
                <div className="flex w-[100px] flex-col gap-[6px] font-normal">
                  <span>Invoice date</span>
                  <span>Invoice no.</span>
                  <span>Due date</span>
                  <span>Vat ID</span>
                </div>
                <div className="flex flex-col gap-[6px] whitespace-nowrap font-normal">
                  <span>{formatDateDots(invoiceDateIso)}</span>
                  <span>{invoiceNo}</span>
                  <span>{formatDateDots(dueDateIso)}</span>
                  <span>{vatId}</span>
                </div>
              </div>
            </div>
            <div className="flex w-full items-center justify-center px-[24px]">
              <p
                className="min-h-0 min-w-0 flex-1 text-right"
                style={{
                  fontFamily: 'var(--font-inter), sans-serif',
                  fontSize: '88px',
                  lineHeight: '100px',
                  fontWeight: 400,
                  letterSpacing: '-0.2235px',
                  color: c.ink,
                }}
              >
                Invoice
              </p>
            </div>
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
                      <div key={i} className="flex w-full items-center gap-[30px]">
                        <p className="min-h-0 min-w-0 flex-1" style={{color: c.ink}}>
                          {row.description || 'Item Name'}
                        </p>
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
                className="flex w-full flex-col gap-[16px] text-right text-[11.347px] font-semibold leading-[1.15] tracking-[-0.5674px]"
                style={{color: c.ink, fontFamily: 'var(--font-inter), sans-serif'}}
              >
                <div className="flex w-full items-center justify-end gap-[30px]">
                  <span className="w-[120px]">Discount</span>
                  <span className="w-[120px]">{discountPercent}%</span>
                </div>
                <div className="flex w-full items-end justify-end gap-[30px]">
                  <span className="w-[120px]">Total</span>
                  <div className="flex flex-col items-start justify-end gap-[10px]">
                    <span
                      className="w-[120px] line-through decoration-solid"
                      style={{opacity: 0.4, color: c.ink, textDecorationSkipInk: 'none'}}
                    >
                      {formatMoneyCompact(compareTotal, currency)}
                    </span>
                    <span className="w-[120px]" style={{color: c.ink}}>
                      {formatMoneyCompact(displayTotal, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-[24px] text-[11px]" style={{color: c.ink}}>
            <div className="flex flex-col gap-[16px] whitespace-nowrap pl-[12px] pr-[24px] leading-normal">
              <p className="font-semibold" style={{fontFamily: 'var(--font-inter), sans-serif'}}>
                Bank account
              </p>
              <div className="flex items-center gap-[62px] font-normal">
                <div className="flex w-[100px] flex-col gap-[6px]">
                  <span>IBAN</span>
                  <span>SWIFT / BIC</span>
                </div>
                <div className="flex flex-col gap-[6px]">
                  <span>{bankIban}</span>
                  <span>{bankBic}</span>
                </div>
              </div>
            </div>
            <div className="flex w-full items-start gap-[60px] px-[12px]">
              <p
                className="w-[100px] shrink-0 font-semibold leading-normal"
                style={{fontFamily: 'var(--font-inter), sans-serif'}}
              >
                Note
              </p>
              <div className="font-normal leading-[0] whitespace-nowrap">
                {noteLines.map((line, i) => (
                  <p key={i} className="mb-0 leading-[16px] last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

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
      <div className="font-normal leading-[0] whitespace-nowrap" style={{fontFamily: 'var(--font-inter), sans-serif'}}>
        {lines.map((line, i) => (
          <p key={i} className="mb-0 leading-[16px] last:mb-0">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
