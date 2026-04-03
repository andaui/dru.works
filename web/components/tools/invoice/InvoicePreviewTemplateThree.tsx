'use client'

import {buildPreviewBankRows} from '@/lib/invoiceBankDetails'
import {formatDateDots, formatMoney, formatMoneyCompact} from '@/lib/invoiceFormat'
import {
  INVOICE_PREVIEW_HEIGHT_PX,
  INVOICE_PREVIEW_WIDTH_PX,
  type InvoicePreviewProps,
} from '@/components/tools/invoice/invoicePreviewShared'
import {invoiceTemplateThreeAccent, invoiceTemplateThreePillBackground} from '@/lib/invoicePaperSwatches'

const INTER = 'var(--font-inter), ui-sans-serif, system-ui, sans-serif'
const SOEHNE = 'var(--font-soehne), ui-sans-serif, system-ui, sans-serif'

/** Line-item grid: Item | Price | extra gap | Quantity | Amount — aligns headers, figures, and tax % with Price column. */
const ROW_GRID =
  'grid w-full grid-cols-[minmax(0,153px)_81px_32px_56px_minmax(0,1fr)] items-start gap-x-[8.666px] text-[10.832px] leading-[15.7px] tracking-[-0.1354px]'
const HDR_GRID =
  'grid w-full grid-cols-[minmax(0,153px)_81px_32px_56px_minmax(0,1fr)] items-center gap-x-[8.666px] text-[13px] leading-[20px] tracking-[-0.1354px]'
/** Same vertical padding as line-item rows (`py-[5px]` + hairline). */
const TOT_ROW = `${ROW_GRID} items-center py-[5px]`

/**
 * Figma "Light Mode" 563:103 — template Three: gray field, From row → pill hero →
 * Item / Price / Quantity table (Söhne), totals with strikethrough + accent total,
 * Due / Bank account / Note footer.
 */
export function InvoicePreviewTemplateThree({
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
  const pillBg = invoiceTemplateThreePillBackground(paperBackground)
  const accent = invoiceTemplateThreeAccent(paperBackground)

  const lineSubtotal = lineItems.reduce((s, r) => s + r.quantity * r.unitPrice, 0)
  const discountAmt = lineSubtotal * (discountPercent / 100)
  const afterDisc = lineSubtotal - discountAmt
  const taxAmt = afterDisc * (taxPercent / 100)
  const taxMuted = taxPercent === 0
  const discMuted = discountPercent === 0
  /** Matches {@link InvoiceEditor} strikethrough total when discount applies. */
  const totalBeforeDiscount = lineSubtotal + lineSubtotal * (taxPercent / 100)
  const showPreDiscountTotal = discountAmt > 0

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
        paddingTop: '17px',
        paddingBottom: '17px',
        color: ink,
        fontFamily: INTER,
      }}
    >
      <div
        className="flex h-full min-h-0 w-full flex-col gap-[23px]"
        style={{width: `${INVOICE_PREVIEW_WIDTH_PX}px`, height: `${INVOICE_PREVIEW_HEIGHT_PX - 34}px`}}
      >
        {/* From row + pill — gap 29px */}
        <div className="flex w-full shrink-0 flex-col gap-[29px] overflow-x-hidden">
          <div className="flex w-full items-start justify-between gap-6 px-6 text-[11px] not-italic">
            <div className="flex min-w-0 max-w-[203px] shrink-0 flex-col gap-[6px] break-words [overflow-wrap:anywhere]">
              <p className="w-[100px] shrink-0 font-semibold leading-normal" style={{fontFamily: INTER}}>
                From
              </p>
              <AddressLines lines={fromLines} />
            </div>
            <div className="flex min-w-0 shrink items-start justify-end gap-6">
              <div className="flex w-[119px] min-w-0 shrink-0 flex-col gap-4">
                {showInvoiceDate ? (
                  <div className="flex flex-col gap-[6px]">
                    <p className="w-[100px] font-medium leading-normal" style={{fontFamily: INTER}}>
                      Invoice date
                    </p>
                    <p className="w-[100px] min-w-0 max-w-full break-words font-normal leading-normal">
                      {formatDateDots(invoiceDateIso)}
                    </p>
                  </div>
                ) : null}
                {showInvoiceNo ? (
                  <div className="flex flex-col gap-[6px]">
                    <p className="w-[100px] font-medium leading-normal" style={{fontFamily: INTER}}>
                      Invoice Number
                    </p>
                    <p className="w-[100px] min-w-0 max-w-full break-words font-normal leading-normal">
                      {invoiceNo?.trim() ?? ''}
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="w-[169px] min-w-0 max-w-[169px] shrink-0 break-words [overflow-wrap:anywhere]">
                <AddressLines lines={billedLines} />
              </div>
            </div>
          </div>

          <div className="flex w-full items-start px-[10px]">
            <div
              className="flex min-h-0 min-w-0 flex-1 items-center gap-[9px] rounded-[88px] px-[50px] py-[28px] font-medium leading-[1.15] not-italic text-black whitespace-nowrap"
              style={{backgroundColor: pillBg, fontFamily: INTER}}
            >
              <span className="shrink-0 text-[91px] tracking-[-8.19px]">Invoice</span>
              {showInvoiceNo ? (
                <span className="min-w-0 shrink text-[47px] tracking-[-4.23px]">{invoiceNo?.trim() ?? ''}</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Items + totals */}
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-6">
          <div className="flex w-full min-w-0 flex-col">
            {/* Header — Price column right-aligned; extra 32px column before Quantity */}
            <div className={HDR_GRID}>
              <p className="min-w-0 opacity-30" style={{fontFamily: SOEHNE}}>
                Item
              </p>
              <p className="text-right opacity-30" style={{fontFamily: SOEHNE}}>
                Price
              </p>
              <span aria-hidden className="block min-h-[1em]" />
              <p className="whitespace-nowrap opacity-30" style={{fontFamily: SOEHNE}}>
                Quantity
              </p>
              <span aria-hidden className="block" />
            </div>
            <div className="mt-[2px] h-px w-full bg-black/10" />

            {lineItems.map((row, i) => {
              const lineTotal = row.quantity * row.unitPrice
              return (
                <div key={i} className="flex w-full flex-col">
                  <div className={`${ROW_GRID} py-[5px]`} style={{fontFamily: SOEHNE}}>
                    <p className="min-w-0 break-words">{row.description}</p>
                    <p className="text-right tabular-nums">{formatMoneyCompact(row.unitPrice, currency)}</p>
                    <span aria-hidden />
                    <p className="tabular-nums">{row.quantity}</p>
                    <p className="min-w-0 text-right tabular-nums">{formatMoney(lineTotal, currency)}</p>
                  </div>
                  <div className="h-px w-full bg-black/10" />
                </div>
              )
            })}

            {/* Totals — same row padding + dividers as line items */}
            <div className="flex w-full flex-col pt-6">
              <div className={TOT_ROW} style={{fontFamily: SOEHNE}}>
                <p className="min-w-0">Subtotal</p>
                <span aria-hidden />
                <span aria-hidden />
                <span aria-hidden />
                <p className="text-right tabular-nums">{formatMoneyCompact(lineSubtotal, currency)}</p>
              </div>
              <div className="h-px w-full bg-black/10" />

              <div className={TOT_ROW} style={{fontFamily: SOEHNE}}>
                <p className="min-w-0">Tax</p>
                <p
                  className="text-right tabular-nums"
                  style={{color: taxMuted ? 'rgba(0,0,0,0.3)' : ink}}
                >
                  {taxPercent}
                  <span>%</span>
                </p>
                <span aria-hidden />
                <span aria-hidden />
                <p className="text-right tabular-nums">{taxAmt > 0 ? formatMoneyCompact(taxAmt, currency) : ''}</p>
              </div>
              <div className="h-px w-full bg-black/10" />

              <div className={TOT_ROW} style={{fontFamily: SOEHNE}}>
                <p className="min-w-0">Discount</p>
                <p
                  className="text-right tabular-nums"
                  style={{color: discMuted ? 'rgba(0,0,0,0.3)' : ink}}
                >
                  {discountPercent}
                  <span>%</span>
                </p>
                <span aria-hidden />
                <span aria-hidden />
                <p className="text-right tabular-nums" style={{opacity: discountAmt > 0 ? 0.3 : undefined}}>
                  {discountAmt > 0 ? `-${formatMoneyCompact(discountAmt, currency)}` : ''}
                </p>
              </div>
              <div className="h-px w-full bg-black/10" />

              <div
                className={`${ROW_GRID} items-end py-[5px] text-[13px] leading-[20px] tracking-[-0.1354px]`}
                style={{fontFamily: SOEHNE}}
              >
                <p className="min-w-0 whitespace-nowrap">
                  Total {currency}
                </p>
                <span aria-hidden />
                <span aria-hidden />
                <span aria-hidden />
                <div className="flex min-w-0 justify-end gap-[13px] whitespace-nowrap">
                  {showPreDiscountTotal ? (
                    <span className="line-through opacity-50 [text-decoration-skip-ink:none]">{formatMoney(totalBeforeDiscount, currency)}</span>
                  ) : null}
                  <span style={{color: accent}}>{formatMoney(displayTotal, currency)}</span>
                </div>
              </div>
              <div className="h-px w-full bg-black/10" />
            </div>
          </div>
        </div>

        {/* Due / bank / note — same spacing as template Two (lightMode) */}
        <div
          className="mt-auto flex w-full min-w-0 shrink-0 flex-col gap-6 text-[11px] text-black"
          style={{fontFamily: INTER}}
        >
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
            <div className="flex flex-col gap-0 px-6 not-italic">
              <div className="flex w-full min-w-0 items-start gap-[40px] font-normal">
                <p className="w-[158px] shrink-0 font-semibold leading-normal">Note</p>
                <div className="min-h-4 min-w-0 flex-1 font-normal leading-normal break-words [overflow-wrap:anywhere]">
                  {noteLines.map((line, i) => (
                    <p key={i} className="mb-0 leading-[16px] last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function AddressLines({lines}: {lines: string[]}) {
  if (lines.length === 0) return null
  return (
    <div className="text-[11px] font-normal leading-none break-words [overflow-wrap:anywhere]">
      {lines.map((line, i) => (
        <p key={i} className="mb-0 leading-[16px] last:mb-0">
          {line}
        </p>
      ))}
    </div>
  )
}
