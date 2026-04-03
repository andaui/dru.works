'use client'

import {
  cloneElement,
  isValidElement,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type {InvoiceCurrency} from '@/lib/invoiceFormat'
import {
  dueDatePlaceholderDisplay,
  formatDateSlashes,
  formatMoney,
  formatMoneyCompact,
} from '@/lib/invoiceFormat'
import type {InvoiceBankDetails} from '@/lib/invoiceBankDetails'
import {domesticBankInputForCurrency} from '@/lib/invoiceBankDetails'
import {
  type ContactForm,
  CONTACT_PLACEHOLDERS,
  contactHasAnyValue,
  contactToPreviewLines,
} from '@/lib/invoiceContact'
import Image from 'next/image'
import type {InvoicePreviewTemplate} from '@/components/tools/invoice/invoicePreviewShared'
import {
  INVOICE_PAPER_SWATCHES,
  INVOICE_PAPER_SWATCH_GAP_PX,
  INVOICE_PAPER_SWATCH_SIZE_PX,
} from '@/lib/invoicePaperSwatches'

export type {ContactForm} from '@/lib/invoiceContact'

export type EditorLineItem = {
  id: string
  description: string
  price: number
  quantity: number
}

export type InvoiceEditorProps = {
  fromA: ContactForm
  setFromA: (p: Partial<ContactForm>) => void
  fromAExpanded: boolean
  setFromAExpanded: (v: boolean) => void
  billed: ContactForm
  setBilled: (p: Partial<ContactForm>) => void
  billedExpanded: boolean
  setBilledExpanded: (v: boolean) => void
  invoiceNo: string
  setInvoiceNo: (v: string) => void
  issueDate: string
  setIssueDate: (v: string) => void
  dueDate: string
  setDueDate: (v: string) => void
  currency: InvoiceCurrency
  setCurrency: (c: InvoiceCurrency) => void
  lineItems: EditorLineItem[]
  updateLine: (id: string, p: Partial<EditorLineItem>) => void
  addLine: () => void
  removeLastLine: () => void
  discountPercent: number
  setDiscountPercent: (n: number) => void
  taxPercent: number
  setTaxPercent: (n: number) => void
  /** Sum of line totals (before discount / tax). */
  subtotal: number
  /** Discount amount in currency (positive number; shown with a leading minus). */
  discountAmount: number
  vatId: string
  setVatId: (v: string) => void
  bankDetails: InvoiceBankDetails
  setBankDetails: (p: Partial<InvoiceBankDetails>) => void
  bankDetailsExpanded: boolean
  setBankDetailsExpanded: (v: boolean) => void
  note: string
  setNote: (v: string) => void
  computedFinal: number
  exporting: boolean
  onDownloadPdf: () => void
  paperBackground: string
  setPaperBackground: (hex: string) => void
  previewTemplate: InvoicePreviewTemplate
  setPreviewTemplate: (t: InvoicePreviewTemplate) => void
  /** True while example data is shown (second click on Example restores prior form state). */
  exampleModeActive: boolean
  /**
   * Example column only: fill with shared example, or restore snapshot when clicking Example again on the selected template; switching template + example preserves snapshot.
   */
  onExampleClick: (template: InvoicePreviewTemplate) => void
}

const SOEHNE = "font-[family-name:var(--font-soehne)] tracking-[-0.25px] text-black"

/** Form row label — matches inactive currency when field empty and not focused. */
const ROW_LABEL_CLASS =
  'font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] not-italic tracking-[-0.25px]'

/**
 * Shared 5-column grid used by ALL rows (form rows + items table).
 * Col 1 (label/Item) shrinks together across every section.
 * Cols 3-5 are fixed so form values and Price/Qty/Total always share the same x-positions.
 * Narrow container (532px): collapses to single column.
 */
const editorGridClass =
  'grid w-full min-w-0 grid-cols-[minmax(0,283px)_24px_120px_72px_minmax(160px,1fr)] items-center gap-x-0 @max-[532px]:grid-cols-1 @max-[532px]:items-start @max-[532px]:gap-y-2'
/** Same template as editorGridClass — items rows use it directly with 5 explicit cells. */
const ITEMS_GRID =
  'grid w-full min-w-0 grid-cols-[minmax(0,283px)_24px_120px_72px_minmax(160px,1fr)] gap-x-0 @max-[532px]:grid-cols-1 @max-[532px]:gap-y-2'

/** Item grid + summary lines — 37px line box matches Invoice no. / date rows. */
const ITEM_LINE_TYPO =
  'font-[family-name:var(--font-soehne)] text-[20px] leading-[37px] tracking-[-0.25px] not-italic'

/** Column titles — explicit per cell so Item / Price / Quantity share one size. */
const ITEM_COL_HEADER_TYPO =
  'shrink-0 font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] tracking-[-0.25px] not-italic text-[rgba(0,0,0,0.2)]'

const CURRENCY_PRIMARY: readonly InvoiceCurrency[] = ['GBP', 'USD', 'EUR']
const CURRENCY_EXTRA: readonly InvoiceCurrency[] = ['CHF', 'KRW', 'RUB', 'AUD']

const INVOICE_TEMPLATE_ROWS: readonly {
  id: InvoicePreviewTemplate
  label: string
}[] = [
  {id: 'classic', label: 'One'},
  {id: 'lightMode', label: 'Two'},
]

function currencySymbol(code: InvoiceCurrency) {
  switch (code) {
    case 'GBP':
      return '£'
    case 'USD':
      return '$'
    case 'EUR':
      return '€'
    case 'CHF':
      return '₣'
    case 'KRW':
      return '₩'
    case 'RUB':
      return '₽'
    case 'JPY':
    case 'CNY':
      return '¥'
    case 'INR':
      return '₹'
    case 'AUD':
      return 'A$'
  }
}

function cycleYenPair(current: InvoiceCurrency): InvoiceCurrency {
  if (current === 'JPY') return 'CNY'
  if (current === 'CNY') return 'JPY'
  return 'JPY'
}

export function InvoiceEditor(p: InvoiceEditorProps) {
  const totalBeforeDiscount = p.subtotal + p.subtotal * (p.taxPercent / 100)
  const showPreDiscountTotal = p.discountAmount > 0
  const hasPricedLine = p.lineItems.some((r) => r.price > 0)
  const domesticBank = domesticBankInputForCurrency(p.currency, p.bankDetails, p.setBankDetails)

  return (
    <div className="@container ms-auto flex w-[min(100%,781px)] min-w-0 flex-col gap-[74px]">
      <p className="self-end font-inter whitespace-nowrap text-[13px] font-normal leading-[19px] text-[#989898]">
        Dark
      </p>

      <div className="flex w-full min-w-0 flex-col items-stretch gap-[40px]">
        <div className="flex w-full min-w-0 flex-col items-start gap-[52px]">
          <div className="flex w-full flex-col items-start">
            <h2 className="m-0 p-0 font-[family-name:var(--font-soehne)] text-[77px] font-normal leading-[1.23] tracking-[-0.22px] text-black">
              Invoice
            </h2>
            <div
              className="mt-[74px] flex flex-row flex-wrap items-center"
              style={{gap: `${INVOICE_PAPER_SWATCH_GAP_PX}px`}}
            >
              {INVOICE_PAPER_SWATCHES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={s.label}
                  onClick={() => p.setPaperBackground(s.hex)}
                  className={`shrink-0 cursor-pointer rounded-full p-0 outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2 ${
                    s.id === 'white' ? 'border border-black/[0.08]' : 'border-0'
                  }`}
                  style={{
                    width: `${INVOICE_PAPER_SWATCH_SIZE_PX}px`,
                    height: `${INVOICE_PAPER_SWATCH_SIZE_PX}px`,
                    backgroundColor: s.hex,
                  }}
                />
              ))}
            </div>

            <div className="mt-[60px] flex w-full min-w-0 flex-col gap-2">
              <p className="m-0 font-[family-name:var(--font-soehne)] text-[24px] leading-tight tracking-[-0.25px] not-italic text-black/20">
                Templates
              </p>
              <div className="w-full border-t border-black/[0.08]" role="radiogroup" aria-label="Invoice template">
                {INVOICE_TEMPLATE_ROWS.map((row) => {
                  const selected = p.previewTemplate === row.id
                  return (
                    <div key={row.id} className={`${editorGridClass} min-h-[37px] border-b border-black/[0.08] py-0`}>
                      <div className="min-w-0 break-words">
                        <button
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => p.setPreviewTemplate(row.id)}
                          className={`cursor-pointer border-0 bg-transparent p-0 text-left outline-none focus-visible:bg-black/[0.03] ${SOEHNE} text-[24px] leading-[37px] not-italic`}
                        >
                          {row.label}
                        </button>
                      </div>
                      <div className="min-w-[24px] max-w-[24px] @max-[532px]:hidden" aria-hidden />
                      <div className="col-span-3 flex min-w-0 w-full items-center justify-between gap-3 @max-[532px]:col-span-1">
                        <button
                          type="button"
                          aria-label={`Example data for template ${row.label}`}
                          onClick={() => p.onExampleClick(row.id)}
                          className={`min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] tracking-[-0.25px] outline-none focus-visible:bg-black/[0.03] ${
                            selected && p.exampleModeActive ? 'text-black/50' : 'text-[rgba(0,0,0,0.2)]'
                          }`}
                        >
                          Example
                        </button>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                          {selected ? (
                            <Image
                              src="/select.svg"
                              alt=""
                              width={24}
                              height={24}
                              className="h-6 w-6"
                              aria-hidden
                            />
                          ) : null}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <ContactStack
            title="From"
            emptyHint="Add your details"
            contact={p.fromA}
            setContact={p.setFromA}
            expanded={p.fromAExpanded}
            onToggle={() => p.setFromAExpanded(!p.fromAExpanded)}
            ariaLabelToggle="Toggle From details"
          />
          <ContactStack
            title="Billed to"
            emptyHint="Add client details"
            contact={p.billed}
            setContact={p.setBilled}
            expanded={p.billedExpanded}
            onToggle={() => p.setBilledExpanded(!p.billedExpanded)}
            ariaLabelToggle="Toggle Billed to details"
          />

          <div className="flex w-full flex-col items-stretch">
            <LabeledInputRow label="Invoice no.">
              <input
                className="min-w-0 w-full border-0 bg-transparent p-0 font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] tracking-[-0.25px] text-black outline-none placeholder:text-[rgba(0,0,0,0.1)]"
                value={p.invoiceNo}
                onChange={(e) => p.setInvoiceNo(e.target.value)}
                placeholder="001"
                aria-label="Invoice number"
              />
            </LabeledInputRow>
            <LabeledDateRow
              label="Issue date"
              iso={p.issueDate}
              onChange={p.setIssueDate}
            />
            <LabeledDateRow
              label="Due date"
              iso={p.dueDate}
              onChange={p.setDueDate}
              emptyDisplay={dueDatePlaceholderDisplay()}
            />
            <LabeledInputRow label="VAT ID">
              <input
                className="min-w-0 w-full border-0 bg-transparent p-0 font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] tracking-[-0.25px] text-black outline-none placeholder:text-[rgba(0,0,0,0.1)]"
                value={p.vatId}
                onChange={(e) => p.setVatId(e.target.value)}
                placeholder="VAT ID"
                aria-label="VAT ID"
              />
            </LabeledInputRow>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch py-[60px]">
          {/* Items title */}
          <FormRow
            primary={<span className={`${SOEHNE} text-[24px] leading-[37px] not-italic`}>Items</span>}
            secondary={<span className="min-w-0" aria-hidden />}
          />

          {/* Currency swatches — 24px below the Items divider */}
          <div className="mt-[24px] flex flex-wrap gap-[16px]">
            {([...CURRENCY_PRIMARY, ...CURRENCY_EXTRA] as InvoiceCurrency[]).map((code) => {
              const selected = p.currency === code
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => p.setCurrency(code)}
                  aria-pressed={selected}
                  aria-label={code}
                  className="flex shrink-0 cursor-pointer items-center justify-center rounded-full border-0 p-0 outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-1"
                  style={{
                    width: 37,
                    height: 37,
                    backgroundColor: 'rgba(0,0,0,0.07)',
                  }}
                >
                  <span
                    className={`font-[family-name:var(--font-soehne)] text-[20px] leading-none ${
                      selected ? 'text-black' : 'text-black/20'
                    }`}
                  >
                    {currencySymbol(code)}
                  </span>
                </button>
              )
            })}
            {/* JPY/CNY toggle */}
            <button
              type="button"
              onClick={() => p.setCurrency(cycleYenPair(p.currency))}
              aria-pressed={p.currency === 'JPY' || p.currency === 'CNY'}
              title={
                p.currency === 'JPY'
                  ? 'Japanese yen — click for Chinese yuan'
                  : p.currency === 'CNY'
                    ? 'Chinese yuan — click for Japanese yen'
                    : 'Japanese yen — click again for Chinese yuan'
              }
              aria-label={
                p.currency === 'JPY'
                  ? 'CNY (switch from JPY)'
                  : p.currency === 'CNY'
                    ? 'JPY (switch from CNY)'
                    : 'JPY or CNY'
              }
              className="flex shrink-0 cursor-pointer items-center justify-center rounded-full border-0 p-0 outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-1"
              style={{
                width: 37,
                height: 37,
                backgroundColor: 'rgba(0,0,0,0.07)',
              }}
            >
              <span
                className={`font-[family-name:var(--font-soehne)] text-[20px] leading-none ${
                  p.currency === 'JPY' || p.currency === 'CNY' ? 'text-black' : 'text-black/20'
                }`}
              >
                ¥
              </span>
            </button>
            {/* INR */}
            <button
              type="button"
              onClick={() => p.setCurrency('INR')}
              aria-pressed={p.currency === 'INR'}
              aria-label="INR"
              className="flex shrink-0 cursor-pointer items-center justify-center rounded-full border-0 p-0 outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-1"
              style={{
                width: 37,
                height: 37,
                backgroundColor: 'rgba(0,0,0,0.07)',
              }}
            >
              <span
                className={`font-[family-name:var(--font-soehne)] text-[20px] leading-none ${
                  p.currency === 'INR' ? 'text-black' : 'text-black/20'
                }`}
              >
                ₹
              </span>
            </button>
          </div>

          {/* 82px gap then big number + items */}
          <div className="mt-[82px] flex w-full flex-col gap-[52px]">
            <FormRowMainOnly divider={false}>
              <div className="flex w-full min-w-0 items-center justify-between gap-4">
                <span
                  className={`min-h-0 min-w-0 font-[family-name:var(--font-soehne)] text-[clamp(3rem,14vw,7.8125rem)] leading-[0.82] tracking-[-0.25px] text-black not-italic`}
                >
                  {p.lineItems.length}
                </span>
                <div className="flex w-[118.625px] max-w-[40%] shrink-0 items-center justify-between">
                  <button
                    type="button"
                    onClick={p.removeLastLine}
                    disabled={p.lineItems.length <= 1}
                    className="flex items-center justify-center p-0 border-0 bg-transparent cursor-pointer text-black disabled:opacity-25 disabled:pointer-events-none hover:opacity-70 transition-opacity"
                    aria-label="Remove line"
                  >
                    <MinusIcon />
                  </button>
                  <button
                    type="button"
                    onClick={p.addLine}
                    className="flex items-center justify-center p-0 border-0 bg-transparent cursor-pointer text-black hover:opacity-70 transition-opacity"
                    aria-label="Add line"
                  >
                    <PlusSquareIcon />
                  </button>
                </div>
              </div>
            </FormRowMainOnly>

            <div className="flex w-full flex-col items-stretch">
              <div className="@max-[532px]:hidden">
                <FormRowMainOnly>
                  <div className={`${ITEMS_GRID} items-center`}>
                    <span className={ITEM_COL_HEADER_TYPO}>Item</span>
                    <span aria-hidden />
                    <span className={ITEM_COL_HEADER_TYPO}>Price</span>
                    <span className={`${ITEM_COL_HEADER_TYPO} pl-4 whitespace-nowrap`}>Qty</span>
                    <span aria-hidden />
                  </div>
                </FormRowMainOnly>
              </div>

              {p.lineItems.map((row) => {
                const priceInputValue = row.price === 0 ? '' : String(row.price)
                const descClass = row.description
                  ? 'text-black placeholder:text-[rgba(0,0,0,0.3)]'
                  : 'text-[rgba(0,0,0,0.3)] placeholder:text-[rgba(0,0,0,0.3)]'
                const qtyInputValue = row.quantity === 1 ? '' : String(row.quantity)
                return (
                  <FormRowMainOnly key={row.id}>
                    <div className={`${ITEMS_GRID} items-start`}>
                      <div className="min-w-0 overflow-hidden">
                        <ItemDescriptionTextarea
                          value={row.description}
                          onChange={(v) => p.updateLine(row.id, {description: v})}
                          className={`w-full resize-none border-0 bg-transparent p-0 align-top break-words ${ITEM_LINE_TYPO} ${SOEHNE} not-italic outline-none ${descClass}`}
                          placeholder="Item"
                          aria-label="Item description"
                        />
                      </div>
                      <span aria-hidden />
                      <div className="min-w-0 w-full">
                        {/* Wide: no arrows, "0" placeholder */}
                        <input
                          type="text"
                          inputMode="decimal"
                          className={`min-w-0 w-full border-0 bg-transparent p-0 @max-[532px]:hidden ${ITEM_LINE_TYPO} ${SOEHNE} not-italic tabular-nums text-black outline-none placeholder:text-black`}
                          value={priceInputValue}
                          onChange={(e) =>
                            p.updateLine(row.id, {price: Number.parseFloat(e.target.value) || 0})
                          }
                          placeholder="0"
                        />
                        {/* Narrow: no arrows, "Price" placeholder */}
                        <input
                          type="text"
                          inputMode="decimal"
                          className={`hidden min-w-0 w-full border-0 bg-transparent p-0 @max-[532px]:block ${ITEM_LINE_TYPO} ${SOEHNE} not-italic tabular-nums text-black outline-none placeholder:text-[rgba(0,0,0,0.3)]`}
                          value={priceInputValue}
                          onChange={(e) =>
                            p.updateLine(row.id, {price: Number.parseFloat(e.target.value) || 0})
                          }
                          placeholder="Price"
                        />
                      </div>
                      <div className="min-w-0 w-full pl-4 @max-[532px]:pl-0">
                        {/* Wide: arrows work because value is always the real number */}
                        <input
                          type="number"
                          min={1}
                          className={`min-w-0 w-full border-0 bg-transparent p-0 @max-[532px]:hidden ${ITEM_LINE_TYPO} ${SOEHNE} not-italic tabular-nums text-black outline-none placeholder:text-black`}
                          value={row.quantity}
                          onChange={(e) =>
                            p.updateLine(row.id, {
                              quantity: Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                            })
                          }
                        />
                        {/* Narrow: "Quantity" placeholder when default */}
                        <input
                          type="number"
                          min={1}
                          className={`hidden min-w-0 w-full border-0 bg-transparent p-0 @max-[532px]:block ${ITEM_LINE_TYPO} ${SOEHNE} not-italic tabular-nums text-black outline-none placeholder:text-[rgba(0,0,0,0.3)]`}
                          value={qtyInputValue}
                          onChange={(e) =>
                            p.updateLine(row.id, {
                              quantity: Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                            })
                          }
                          placeholder="Quantity"
                        />
                      </div>
                      <span className={`w-full pl-4 @max-[532px]:pl-0 whitespace-nowrap text-right ${ITEM_LINE_TYPO} ${SOEHNE} not-italic tabular-nums text-black`}>
                        {formatMoney(row.price * row.quantity, p.currency)}
                      </span>
                    </div>
                  </FormRowMainOnly>
                )
              })}

              {hasPricedLine ? (
                <div className="flex w-full flex-col">
                  <div className="flex w-full flex-col gap-[6px] pt-[44px]">
                    <FormRowMainOnly>
                      <div className={`${ITEMS_GRID} items-center`}>
                        <span className={`${ITEM_LINE_TYPO} text-black`}>Subtotal</span>
                        <span aria-hidden />
                        <span aria-hidden />
                        <span aria-hidden />
                        <span className={`w-full pl-4 @max-[532px]:pl-0 whitespace-nowrap text-right ${ITEM_LINE_TYPO} text-black tabular-nums`}>
                          {formatMoney(p.subtotal, p.currency)}
                        </span>
                      </div>
                    </FormRowMainOnly>
                    <FormRowMainOnly>
                      <div className={`${ITEMS_GRID} items-center`}>
                        <span className={`${ITEM_LINE_TYPO} text-black`}>Tax</span>
                        <span aria-hidden />
                        <div className={`flex items-center gap-2 ${ITEM_LINE_TYPO}`}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            className={`w-12 border-0 bg-transparent p-0 font-[family-name:var(--font-soehne)] text-[20px] leading-[37px] outline-none ${
                              p.taxPercent === 0 ? 'text-[rgba(0,0,0,0.1)]' : 'text-black'
                            }`}
                            value={p.taxPercent}
                            onChange={(e) => p.setTaxPercent(Number(e.target.value) || 0)}
                            aria-label="Tax percent"
                          />
                          <span
                            className={`font-[family-name:var(--font-soehne)] ${
                              p.taxPercent === 0 ? 'text-[rgba(0,0,0,0.1)]' : 'text-black'
                            }`}
                          >
                            %
                          </span>
                        </div>
                        <span aria-hidden />
                        <span aria-hidden />
                      </div>
                    </FormRowMainOnly>
                  </div>
                  <div className="pt-[44px]">
                    <FormRowMainOnly>
                      <div className={`${ITEMS_GRID} items-center`}>
                        <span className={`${ITEM_LINE_TYPO} text-black`}>Discount</span>
                        <span aria-hidden />
                        <div className={`flex items-center gap-2 ${ITEM_LINE_TYPO} text-black`}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            className="w-12 border-0 bg-transparent p-0 font-[family-name:var(--font-soehne)] text-[20px] leading-[37px] outline-none"
                            value={p.discountPercent}
                            onChange={(e) => p.setDiscountPercent(Number(e.target.value) || 0)}
                            aria-label="Discount percent"
                          />
                          <span className="font-[family-name:var(--font-soehne)]">%</span>
                        </div>
                        <span aria-hidden />
                        <span className={`w-full pl-4 @max-[532px]:pl-0 whitespace-nowrap text-right text-[rgba(0,0,0,0.1)] tabular-nums ${ITEM_LINE_TYPO}`}>
                          {p.discountPercent > 0 && p.discountAmount > 0
                            ? `- ${formatMoneyCompact(p.discountAmount, p.currency)}`
                            : null}
                        </span>
                      </div>
                    </FormRowMainOnly>
                  </div>

                  <FormRowMainOnly>
                    <div className="flex w-full flex-col gap-1 pt-[20px]">
                      <div className="flex w-full items-end justify-between gap-4">
                        <span className={`${SOEHNE} whitespace-nowrap text-[24px] leading-[37px] not-italic`}>
                          Total {p.currency}
                        </span>
                        <div className="flex items-center gap-6 whitespace-nowrap text-[24px] leading-[37px] tracking-[-0.25px]">
                          {showPreDiscountTotal ? (
                            <span
                              className="font-[family-name:var(--font-soehne)] line-through decoration-solid text-[rgba(0,0,0,0.1)] not-italic"
                              style={{textDecorationSkipInk: 'none'}}
                            >
                              {formatMoney(totalBeforeDiscount, p.currency)}
                            </span>
                          ) : null}
                          <span
                            className="font-[family-name:var(--font-soehne)] not-italic"
                            style={{color: '#de2475'}}
                          >
                            {formatMoney(p.computedFinal, p.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </FormRowMainOnly>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <BankDetailsStack
          bankDetails={p.bankDetails}
          setBankDetails={p.setBankDetails}
          expanded={p.bankDetailsExpanded}
          onToggle={() => p.setBankDetailsExpanded(!p.bankDetailsExpanded)}
          domesticBank={domesticBank}
        />

        <NoteFieldSection note={p.note} setNote={p.setNote} />

        <div className="flex w-full flex-col items-stretch pt-[89px]">
          <FormRowMainOnly>
            <button
              type="button"
              disabled={p.exporting}
              onClick={p.onDownloadPdf}
              className="flex w-full items-center justify-between border-0 bg-transparent p-0 text-left disabled:opacity-50"
            >
              <span
                className="font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] tracking-[-0.25px] not-italic whitespace-nowrap"
                style={{color: '#de2475'}}
              >
                {p.exporting ? 'Saving PDF…' : 'Download PDF'}
              </span>
              <ArrowRightIcon className="shrink-0" />
            </button>
          </FormRowMainOnly>
        </div>
      </div>
    </div>
  )
}

function NoteFieldSection({
  note,
  setNote,
}: {
  note: string
  setNote: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const labelInactive = !note.trim() && !focused
  return (
    <div className="flex w-full flex-col items-stretch">
      <FormRow
        hideLabelOnNarrow
        primary={
          <span className={`${ROW_LABEL_CLASS} ${labelInactive ? 'text-black/30' : 'text-black'}`}>
            Note
          </span>
        }
        secondary={<span className="min-w-0" aria-hidden />}
      />
      <FormRowMainOnly>
        <div className="flex w-full min-w-0 flex-wrap items-start gap-x-2 gap-y-1 sm:flex-nowrap sm:items-center">
          <textarea
            className="min-h-[37px] min-w-0 flex-1 basis-[min(100%,20rem)] resize-none border-0 bg-transparent p-0 font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] tracking-[-0.25px] text-black outline-none not-italic placeholder:text-[rgba(0,0,0,0.1)] sm:basis-auto"
            placeholder="Add note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={2}
            aria-label="Note"
          />
          <p className="max-w-full shrink-0 text-right text-xs opacity-20 sm:whitespace-nowrap">
            <span className="font-inter text-[16px] font-bold leading-[37px]">⇧</span>
            <span className="font-inter text-[16px] font-normal leading-[37px]">
              {' '}
              + ↵ for fresh line
            </span>
          </p>
        </div>
      </FormRowMainOnly>
    </div>
  )
}

function ContactStack({
  title,
  emptyHint,
  contact,
  setContact,
  expanded,
  onToggle,
  ariaLabelToggle,
}: {
  title: string
  emptyHint: string
  contact: ContactForm
  setContact: (p: Partial<ContactForm>) => void
  expanded: boolean
  onToggle: () => void
  ariaLabelToggle: string
}) {
  const filled = contactHasAnyValue(contact)
  const summaryLine = contactToPreviewLines(contact)[0] ?? ''

  return (
    <div className="flex w-full flex-col items-stretch">
      <FormRow
        primary={<span className={`${SOEHNE} text-[24px] leading-[37px] not-italic`}>{title}</span>}
        secondary={
          !expanded ? (
            filled ? (
              <span className="truncate whitespace-nowrap font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] not-italic">
                {summaryLine}
              </span>
            ) : (
              <span className="whitespace-nowrap font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] not-italic text-[rgba(0,0,0,0.1)]">
                {emptyHint}
              </span>
            )
          ) : (
            <span className="min-w-0" />
          )
        }
        trailing={
          <button
            type="button"
            className="size-6 shrink-0 text-black opacity-20 hover:opacity-50 transition-opacity"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={ariaLabelToggle}
          >
            {expanded ? <MinusIcon /> : <PlusIcon />}
          </button>
        }
      />
      {expanded ? <ContactFields contact={contact} setContact={setContact} /> : null}
    </div>
  )
}

type DomesticBankInput = ReturnType<typeof domesticBankInputForCurrency>

function BankDetailsStack({
  bankDetails,
  setBankDetails,
  expanded,
  onToggle,
  domesticBank,
}: {
  bankDetails: InvoiceBankDetails
  setBankDetails: (p: Partial<InvoiceBankDetails>) => void
  expanded: boolean
  onToggle: () => void
  domesticBank: DomesticBankInput
}) {
  const hasAny =
    bankDetails.bankName.trim() ||
    bankDetails.accountHolderName.trim() ||
    bankDetails.accountNumber.trim() ||
    bankDetails.iban.trim() ||
    bankDetails.bic.trim() ||
    bankDetails.bankAddress.trim()

  const inputClass =
    'min-w-0 w-full border-0 bg-transparent p-0 font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] tracking-[-0.25px] text-black outline-none placeholder:text-[rgba(0,0,0,0.1)]'

  return (
    <div className="flex w-full flex-col items-stretch">
      <FormRow
        primary={
          <span className={`${SOEHNE} text-[24px] leading-[37px] not-italic`}>Bank details</span>
        }
        secondary={
          !expanded ? (
            hasAny ? (
              <span className="truncate whitespace-nowrap font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] not-italic">
                {bankDetails.bankName.trim() || bankDetails.accountHolderName.trim()}
              </span>
            ) : (
              <span className="whitespace-nowrap font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] not-italic text-[rgba(0,0,0,0.1)]">
                Add bank details
              </span>
            )
          ) : (
            <span className="min-w-0" />
          )
        }
        trailing={
          <button
            type="button"
            className="size-6 shrink-0 text-black opacity-20 hover:opacity-50 transition-opacity"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label="Toggle bank details"
          >
            {expanded ? <MinusIcon /> : <PlusIcon />}
          </button>
        }
      />
      {expanded ? (
        <div className="w-full">
          <LabeledInputRow label="Acc holder name">
            <input
              className={inputClass}
              value={bankDetails.accountHolderName}
              onChange={(e) => setBankDetails({accountHolderName: e.target.value})}
              placeholder="Legal name"
              aria-label="Account holder name"
            />
          </LabeledInputRow>
          <LabeledInputRow label="Bank name">
            <input
              className={inputClass}
              value={bankDetails.bankName}
              onChange={(e) => setBankDetails({bankName: e.target.value})}
              placeholder="Bank name"
              aria-label="Bank name"
            />
          </LabeledInputRow>
          <LabeledInputRow label="Bank address">
            <input
              className={inputClass}
              value={bankDetails.bankAddress}
              onChange={(e) => setBankDetails({bankAddress: e.target.value})}
              placeholder="Full address"
              aria-label="Bank address"
            />
          </LabeledInputRow>
          <LabeledInputRow label="Account number">
            <input
              className={inputClass}
              value={bankDetails.accountNumber}
              onChange={(e) => setBankDetails({accountNumber: e.target.value})}
              placeholder="Account number"
              aria-label="Account number"
            />
          </LabeledInputRow>
          {domesticBank ? (
            <LabeledInputRow label={domesticBank.label}>
              <input
                className={inputClass}
                value={domesticBank.value}
                onChange={(e) => domesticBank.onChange(e.target.value)}
                placeholder={domesticBank.label}
                aria-label={domesticBank.label}
              />
            </LabeledInputRow>
          ) : null}
          <LabeledInputRow label="IBAN">
            <input
              className={inputClass}
              value={bankDetails.iban}
              onChange={(e) => setBankDetails({iban: e.target.value})}
              placeholder="IBAN (international)"
              aria-label="IBAN"
            />
          </LabeledInputRow>
          <LabeledInputRow label="SWIFT / BIC">
            <input
              className={inputClass}
              value={bankDetails.bic}
              onChange={(e) => setBankDetails({bic: e.target.value})}
              placeholder="SWIFT / BIC"
              aria-label="SWIFT or BIC"
            />
          </LabeledInputRow>
        </div>
      ) : null}
    </div>
  )
}

function ContactFields({
  contact,
  setContact,
}: {
  contact: ContactForm
  setContact: (p: Partial<ContactForm>) => void
}) {
  const fields: {key: keyof ContactForm; label: string}[] = [
    {key: 'name', label: 'Name'},
    {key: 'email', label: 'Email'},
    {key: 'address', label: 'Address'},
    {key: 'phone', label: 'Phone'},
    {key: 'city', label: 'City'},
    {key: 'zip', label: 'ZIP'},
    {key: 'state', label: 'State'},
    {key: 'country', label: 'Country'},
  ]
  const ph = 'placeholder:text-[rgba(0,0,0,0.1)]'
  const inputClass = `min-w-0 w-full border-0 bg-transparent p-0 font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] tracking-[-0.25px] text-black outline-none ${ph}`
  return (
    <div className="w-full">
      {fields.map(({key, label}) => (
        <LabeledInputRow key={key} label={label}>
          <input
            className={inputClass}
            value={contact[key]}
            onChange={(e) => setContact({[key]: e.target.value} as Partial<ContactForm>)}
            placeholder={CONTACT_PLACEHOLDERS[key]}
            aria-label={label}
          />
        </LabeledInputRow>
      ))}
    </div>
  )
}

function LabeledDateRow({
  label,
  iso,
  onChange,
  emptyDisplay,
}: {
  label: string
  iso: string
  onChange: (v: string) => void
  /** When `iso` is empty, show this instead of an em dash (e.g. due date hint). */
  emptyDisplay?: string
}) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const visible =
    iso ? formatDateSlashes(iso) : (emptyDisplay ?? formatDateSlashes(iso))
  const muted = !iso
  const labelInactive = !iso && !focused
  return (
    <FormRow
      hideLabelOnNarrow
      primary={
        <span className={`${ROW_LABEL_CLASS} ${labelInactive ? 'text-black/30' : 'text-black'}`}>
          {label}
        </span>
      }
      secondary={
        <div
          className="relative min-h-[37px] w-full min-w-0 cursor-pointer"
          onClick={() => inputRef.current?.showPicker()}
        >
          <span
            className={`pointer-events-none font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] tracking-[-0.25px] whitespace-nowrap tabular-nums ${
              muted ? 'text-[rgba(0,0,0,0.1)]' : 'text-black'
            }`}
          >
            {visible}
          </span>
          <input
            ref={inputRef}
            type="date"
            className="sr-only"
            value={iso}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label={label}
          />
        </div>
      }
    />
  )
}

function FormRow({
  primary,
  secondary,
  trailing,
  hideLabelOnNarrow = false,
}: {
  primary: ReactNode
  secondary: ReactNode
  trailing?: ReactNode
  /** When true, the label col is hidden on narrow (≤532px) screens — input placeholder acts as label. */
  hideLabelOnNarrow?: boolean
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1 pt-1">
      <div className={editorGridClass}>
        <div className={`min-w-0 break-words ${hideLabelOnNarrow ? '@max-[532px]:hidden' : ''}`}>{primary}</div>
        <div className="min-w-[24px] max-w-[24px] @max-[532px]:hidden" aria-hidden />
        {/* col-span-3 spans the Price+Qty+Total columns so form values align with Price start */}
        <div className="col-span-3 flex min-w-0 w-full items-center justify-between gap-3 @max-[532px]:col-span-1">
          <div className="min-w-0 flex-1">{secondary}</div>
          {trailing ?? null}
        </div>
      </div>
      <RowDivider />
    </div>
  )
}

/** One row, content aligned to main column (col 3) — item grid, summaries, etc. */
function FormRowMainOnly({
  children,
  divider = true,
}: {
  children: ReactNode
  /** When false, no rule under the row (e.g. line count). */
  divider?: boolean
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1 pt-1">
      <div className={editorGridClass}>
        <div className="col-span-full min-w-0">{children}</div>
      </div>
      {divider ? <RowDivider /> : null}
    </div>
  )
}

type LabeledInputChildProps = {
  value?: string | number
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void
}

function LabeledInputRow({label, children}: {label: string; children: ReactNode}) {
  const [focused, setFocused] = useState(false)

  if (!isValidElement(children)) {
    return (
      <FormRow
        hideLabelOnNarrow
        primary={<span className={`${ROW_LABEL_CLASS} text-black`}>{label}</span>}
        secondary={<div className="flex min-w-0 w-full items-center">{children}</div>}
      />
    )
  }

  const child = children as ReactElement<LabeledInputChildProps>
  const raw = child.props.value
  const valueStr = raw === undefined || raw === null ? '' : String(raw)
  const empty = !valueStr.trim()
  const labelInactive = empty && !focused

  const input = cloneElement(child, {
    onFocus: (e: FocusEvent<HTMLInputElement>) => {
      child.props.onFocus?.(e)
      setFocused(true)
    },
    onBlur: (e: FocusEvent<HTMLInputElement>) => {
      child.props.onBlur?.(e)
      setFocused(false)
    },
  })

  return (
    <FormRow
      hideLabelOnNarrow
      primary={
        <span className={`${ROW_LABEL_CLASS} ${labelInactive ? 'text-black/30' : 'text-black'}`}>
          {label}
        </span>
      }
      secondary={<div className="flex min-w-0 w-full items-center">{input}</div>}
    />
  )
}

/** One line of item description — matches invoice date row band (37px). */
const ITEM_DESC_LINE_PX = 37

function ItemDescriptionTextarea({
  value,
  onChange,
  className,
  placeholder,
  'aria-label': ariaLabel,
}: {
  value: string
  onChange: (next: string) => void
  className?: string
  placeholder?: string
  'aria-label'?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${Math.max(ITEM_DESC_LINE_PX, el.scrollHeight)}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      rows={1}
      className={className}
      style={{minHeight: ITEM_DESC_LINE_PX, overflow: 'hidden'}}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function RowDivider() {
  return <div className="h-px w-full shrink-0" style={{backgroundColor: 'rgba(0,0,0,0.06)'}} />
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14.0927 9.95253H22.7777V14.1375H14.0927V22.9125H9.86266V14.1375H1.22266V9.95253H9.86266V1.08752H14.0927V9.95253Z"
        fill="currentColor"
      />
    </svg>
  )
}

function PlusSquareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14.0927 9.95253H22.7777V14.1375H14.0927V22.9125H9.86266V14.1375H1.22266V9.95253H9.86266V1.08752H14.0927V9.95253Z"
        fill="currentColor"
      />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14.0927 9.90747H22.7777V14.0925H14.0927H9.86266H1.22266V9.90747H9.86266H14.0927Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ArrowRightIcon({className}: {className?: string}) {
  return (
    <svg
      className={className}
      width="22"
      height="19"
      viewBox="0 0 24 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 10h14m0 0-4-4m4 4-4 4"
        stroke="#de2475"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
