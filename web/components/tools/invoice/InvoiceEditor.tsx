'use client'

import type {ButtonHTMLAttributes, ReactNode} from 'react'
import type {InvoiceCurrency} from '@/lib/invoiceFormat'
import {formatDateSlashes, formatMoney} from '@/lib/invoiceFormat'

export type ContactForm = {
  name: string
  email: string
  address: string
  phone: string
  city: string
  zip: string
  state: string
  country: string
}

export type EditorLineItem = {
  id: string
  description: string
  price: number
  quantity: number
}

export type InvoiceEditorProps = {
  fromA: ContactForm
  setFromA: (p: Partial<ContactForm>) => void
  fromB: ContactForm
  setFromB: (p: Partial<ContactForm>) => void
  fromAExpanded: boolean
  setFromAExpanded: (v: boolean) => void
  fromBExpanded: boolean
  setFromBExpanded: (v: boolean) => void
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
  goodsAndServices: number
  setGoodsAndServices: (n: number) => void
  compareTotal: number
  note: string
  setNote: (v: string) => void
  computedFinal: number
  exporting: boolean
  onDownloadPdf: () => void
}

const SOEHNE = "font-[family-name:var(--font-soehne)] tracking-[-0.25px] text-black"
const ROW = `flex items-center gap-[122px] text-[24px] leading-[37px] ${SOEHNE}`
const LABEL_W = 'w-[186px] shrink-0'

export function InvoiceEditor(p: InvoiceEditorProps) {
  return (
    <div className="flex w-full max-w-[781px] shrink-0 flex-col items-end gap-[61px]">
      <p className="font-inter whitespace-nowrap text-[13px] font-normal leading-[19px] text-[#989898]">
        Dark
      </p>

      <div className="flex w-full flex-col items-start gap-[40px]">
        <div className="flex w-full flex-col items-start gap-[52px]">
          <ContactStack
            title="From"
            summary={p.fromA.name || 'None'}
            expanded={p.fromAExpanded}
            onToggle={() => p.setFromAExpanded(!p.fromAExpanded)}
            collapseIcon="minus"
            contact={p.fromA}
            setContact={p.setFromA}
            showFields={p.fromAExpanded}
            mutedSecondaryFields
          />
          <ContactStack
            title="From"
            summary={p.fromB.name || 'None'}
            expanded={p.fromBExpanded}
            onToggle={() => p.setFromBExpanded(!p.fromBExpanded)}
            collapseIcon="minus"
            contact={p.fromB}
            setContact={p.setFromB}
            showFields={p.fromBExpanded}
            mutedSecondaryFields
          />
          <div className="flex w-full flex-col items-start">
            <FormRow
              trailing={
                <button
                  type="button"
                  aria-label="Expand billed to"
                  className="size-6 shrink-0 text-black"
                  onClick={() => p.setBilledExpanded(!p.billedExpanded)}
                >
                  <PlusIcon />
                </button>
              }
            >
              <div className={`${ROW} w-[453.5px]`}>
                <span className={LABEL_W}>Billed to</span>
                <span className="whitespace-nowrap">{p.billed.name || 'Ontlea Ltd'}</span>
              </div>
            </FormRow>
            {p.billedExpanded ? (
              <div className="mt-0 w-full pl-0">
                <ContactFields contact={p.billed} setContact={p.setBilled} muted={false} />
              </div>
            ) : null}
          </div>

          <div className="flex w-full flex-col items-start">
            <LabeledInputRow label="Invoice no." widthClass="w-[453.5px]">
              <input
                className="min-w-0 flex-1 border-0 bg-transparent p-0 opacity-20 outline-none"
                value={p.invoiceNo}
                onChange={(e) => p.setInvoiceNo(e.target.value)}
                aria-label="Invoice number"
              />
            </LabeledInputRow>
            <LabeledDateRow
              label="Issue date"
              iso={p.issueDate}
              onChange={p.setIssueDate}
            />
            <LabeledDateRow label="Due date" iso={p.dueDate} onChange={p.setDueDate} />
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-[52px] py-[60px]">
          <div className="flex w-full flex-col items-start">
            <FormRow>
              <div className="flex min-h-0 min-w-0 flex-1 items-center gap-[122px] text-[24px] leading-[37px] tracking-[-0.25px]">
                <span className={`${SOEHNE} min-h-0 min-w-0 flex-1 not-italic`}>Items</span>
                <div className="flex shrink-0 items-center gap-4 text-right">
                  {(['GBP', 'USD', 'EUR'] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => p.setCurrency(code)}
                      className={`font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] ${
                        p.currency === code ? 'text-black' : 'text-black/20'
                      }`}
                      aria-pressed={p.currency === code}
                    >
                      {code === 'GBP' ? '£' : code === 'USD' ? '$' : '€'}
                    </button>
                  ))}
                  <span className="font-[family-name:var(--font-soehne)] text-[24px] text-black/20">
                    ¥
                  </span>
                  <span className="font-[family-name:var(--font-soehne)] text-[24px] text-black/20">
                    ₹
                  </span>
                </div>
              </div>
            </FormRow>
          </div>

          <div className="flex w-full flex-col gap-[52px]">
            <div className="flex w-full items-center gap-[164px]">
              <span
                className={`min-h-0 min-w-0 flex-1 font-[family-name:var(--font-soehne)] text-[125px] leading-[100px] tracking-[-0.25px] text-black not-italic`}
              >
                {p.lineItems.length}
              </span>
              <div className="flex w-[118.625px] shrink-0 items-center justify-between">
                <button type="button" className="size-6 text-black" onClick={p.removeLastLine} aria-label="Remove line">
                  <MinusIcon />
                </button>
                <button type="button" className="size-6 text-black" onClick={p.addLine} aria-label="Add line">
                  <PlusSquareIcon />
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col items-start">
              <FormRow>
                <div className={`flex w-full gap-4 ${SOEHNE} not-italic`}>
                  <span className="w-[283px] shrink-0 opacity-40">Item</span>
                  <span className="w-[150px] shrink-0 opacity-40">Price</span>
                  <span className="whitespace-nowrap opacity-40">Quantity</span>
                </div>
              </FormRow>

              {p.lineItems.map((row, idx) => {
                const isPlaceholder = idx === p.lineItems.length - 1 && !row.description && row.price === 0
                const op = isPlaceholder ? 'opacity-20' : ''
                const rowTypography = isPlaceholder
                  ? `home-hero-list-col ${SOEHNE} not-italic`
                  : `${SOEHNE} not-italic`
                return (
                  <FormRow key={row.id}>
                    <div
                      className={`flex w-full items-start gap-4 py-[10px] text-[20px] leading-[29px] tracking-[-0.25px] text-black ${rowTypography}`}
                    >
                      <input
                        className={`w-[283px] shrink-0 border-0 bg-transparent p-0 outline-none ${op}`}
                        value={row.description}
                        onChange={(e) => p.updateLine(row.id, {description: e.target.value})}
                        placeholder="Item"
                      />
                      <input
                        type="number"
                        className={`w-[150px] shrink-0 border-0 bg-transparent p-0 tabular-nums outline-none ${op}`}
                        value={row.price || ''}
                        onChange={(e) =>
                          p.updateLine(row.id, {price: Number.parseFloat(e.target.value) || 0})
                        }
                      />
                      <input
                        type="number"
                        min={1}
                        className={`w-[90px] shrink-0 border-0 bg-transparent p-0 tabular-nums outline-none ${op}`}
                        value={row.quantity}
                        onChange={(e) =>
                          p.updateLine(row.id, {
                            quantity: Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                          })
                        }
                      />
                      <span className={`min-w-0 flex-1 text-right tabular-nums ${op}`}>
                        {formatMoney(row.price * row.quantity, p.currency)}
                      </span>
                    </div>
                  </FormRow>
                )
              })}

              <div className="flex w-full flex-col gap-[6px] pt-[44px]">
                <FormRow>
                  <div className="flex w-full items-center gap-4">
                    <span className={`w-[283px] shrink-0 ${SOEHNE} text-[24px] leading-[37px] not-italic`}>
                      Discount
                    </span>
                    <div className="flex min-w-0 flex-1 items-center gap-2 text-[20px] leading-[29px] tracking-[-0.25px]">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="w-12 border-0 bg-transparent p-0 font-[family-name:var(--font-soehne)] outline-none"
                        value={p.discountPercent}
                        onChange={(e) => p.setDiscountPercent(Number(e.target.value) || 0)}
                      />
                      <span className="font-[family-name:var(--font-soehne)]">%</span>
                    </div>
                    <div className="flex w-[118.625px] shrink-0 items-center justify-end gap-6">
                      <StepButton
                        aria-label="Decrease discount"
                        onClick={() => p.setDiscountPercent(Math.max(0, p.discountPercent - 1))}
                      >
                        <MinusSmIcon />
                      </StepButton>
                      <StepButton
                        aria-label="Increase discount"
                        onClick={() => p.setDiscountPercent(Math.min(100, p.discountPercent + 1))}
                      >
                        <PlusSmIcon />
                      </StepButton>
                    </div>
                  </div>
                </FormRow>

                <div className="flex w-full flex-col gap-1 pt-[20px]">
                  <div className="flex w-full items-end justify-between">
                    <span className={`${SOEHNE} whitespace-nowrap text-[24px] leading-[37px] not-italic`}>
                      Total
                    </span>
                    <div className="flex items-center gap-6 whitespace-nowrap text-[24px] leading-[37px] tracking-[-0.25px]">
                      <span
                        className="font-[family-name:var(--font-soehne)] line-through decoration-solid opacity-50 not-italic"
                        style={{textDecorationSkipInk: 'none'}}
                      >
                        {formatMoney(p.compareTotal, p.currency)}
                      </span>
                      <span
                        className="font-[family-name:var(--font-soehne)] not-italic"
                        style={{color: '#de2475'}}
                      >
                        {formatMoney(p.computedFinal, p.currency)}
                      </span>
                    </div>
                  </div>
                  <RowDivider />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start">
          <FormRow>
            <div className="flex w-full items-center gap-4">
              <span className={`w-[291px] shrink-0 ${SOEHNE} text-[24px] leading-[37px] not-italic`}>Tax</span>
              <div className="flex min-w-0 flex-1 items-center gap-2 text-[24px] leading-[37px] tracking-[-0.25px]">
                <input
                  type="number"
                  min={0}
                  className="w-12 border-0 bg-transparent p-0 font-[family-name:var(--font-soehne)] opacity-20 outline-none"
                  value={p.taxPercent}
                  onChange={(e) => p.setTaxPercent(Number(e.target.value) || 0)}
                />
                <span className="font-[family-name:var(--font-soehne)] opacity-20">%</span>
              </div>
              <div className="flex w-[118.625px] shrink-0 items-center justify-end gap-6">
                <StepButton
                  aria-label="Decrease tax"
                  onClick={() => p.setTaxPercent(Math.max(0, p.taxPercent - 1))}
                >
                  <MinusSmIcon />
                </StepButton>
                <StepButton
                  aria-label="Increase tax"
                  onClick={() => p.setTaxPercent(Math.min(100, p.taxPercent + 1))}
                >
                  <PlusSmIcon />
                </StepButton>
              </div>
            </div>
          </FormRow>
          <FormRow>
            <div className="flex w-full items-center gap-4">
              <span className={`w-[291px] shrink-0 ${SOEHNE} text-[24px] leading-[37px] not-italic`}>
                Goods and Services
              </span>
              <div className="flex min-w-0 flex-1 justify-end">
                <input
                  type="number"
                  className="w-full max-w-[200px] border-0 bg-transparent p-0 text-right font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] outline-none not-italic"
                  value={p.goodsAndServices || ''}
                  onChange={(e) => p.setGoodsAndServices(Number.parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </FormRow>
        </div>

        <div className="flex w-full flex-col items-start">
          <FormRow>
            <span className={`w-full ${SOEHNE} text-[24px] leading-[37px] not-italic`}>Note</span>
          </FormRow>
          <FormRow>
            <div className="flex w-full items-center">
              <textarea
                className="min-h-[37px] min-w-0 flex-1 resize-none border-0 bg-transparent p-0 font-[family-name:var(--font-soehne)] text-[24px] leading-[37px] tracking-[-0.25px] opacity-20 outline-none not-italic placeholder:text-black"
                placeholder="Add note"
                value={p.note}
                onChange={(e) => p.setNote(e.target.value)}
                rows={2}
              />
              <p className="shrink-0 whitespace-nowrap text-right opacity-20">
                <span className="font-inter text-[16px] font-bold leading-[37px]">⇧</span>
                <span className="font-inter text-[16px] font-normal leading-[37px]">
                  {' '}
                  + ↵ for fresh line
                </span>
              </p>
            </div>
          </FormRow>
        </div>

        <div className="flex w-full flex-col items-start pt-[89px]">
          <FormRow>
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
          </FormRow>
        </div>
      </div>
    </div>
  )
}

function ContactStack({
  title,
  summary,
  expanded,
  onToggle,
  collapseIcon,
  contact,
  setContact,
  showFields,
  mutedSecondaryFields,
}: {
  title: string
  summary: string
  expanded: boolean
  onToggle: () => void
  collapseIcon: 'minus' | 'plus'
  contact: ContactForm
  setContact: (p: Partial<ContactForm>) => void
  showFields: boolean
  mutedSecondaryFields?: boolean
}) {
  return (
    <div className="flex w-full flex-col items-start">
      <FormRow
        trailing={
          <button type="button" className="size-6 shrink-0 text-black" onClick={onToggle} aria-expanded={expanded}>
            {collapseIcon === 'minus' ? <MinusCollapseIcon /> : <PlusIcon />}
          </button>
        }
      >
        <div className={`${ROW} w-[453.5px]`}>
          <span className={LABEL_W}>{title}</span>
          {!expanded ? <span className="whitespace-nowrap">{summary}</span> : <span className="min-w-0 flex-1" />}
        </div>
      </FormRow>
      {showFields ? (
        <ContactFields contact={contact} setContact={setContact} muted={!!mutedSecondaryFields} />
      ) : null}
    </div>
  )
}

function ContactFields({
  contact,
  setContact,
  muted,
}: {
  contact: ContactForm
  setContact: (p: Partial<ContactForm>) => void
  muted?: boolean
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
  return (
    <div className="w-full">
      {fields.map(({key, label}, i) => {
        const m = muted && i > 1 ? 'opacity-20' : ''
        const v = muted && i > 1 ? 'opacity-10' : ''
        return (
          <FormRow key={key}>
            <div className={`${ROW} w-[453.5px] ${m}`}>
              <span className={LABEL_W}>{label}</span>
              <input
                className={`min-w-0 flex-1 border-0 bg-transparent p-0 outline-none ${v}`}
                value={contact[key]}
                onChange={(e) => setContact({[key]: e.target.value} as Partial<ContactForm>)}
                aria-label={label}
              />
            </div>
          </FormRow>
        )
      })}
    </div>
  )
}

function LabeledDateRow({
  label,
  iso,
  onChange,
}: {
  label: string
  iso: string
  onChange: (v: string) => void
}) {
  return (
    <FormRow>
      <div className="flex w-full max-w-[453.5px] items-center justify-between gap-[122px] text-[24px] leading-[37px] tracking-[-0.25px]">
        <span className={`font-[family-name:var(--font-soehne)] not-italic ${LABEL_W}`}>{label}</span>
        <div className="relative min-h-[37px] min-w-0 flex-1">
          <span className="pointer-events-none absolute right-0 top-0 font-[family-name:var(--font-soehne)] whitespace-nowrap">
            {formatDateSlashes(iso)}
          </span>
          <input
            type="date"
            className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0 opacity-0 outline-none"
            value={iso}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
          />
        </div>
      </div>
    </FormRow>
  )
}

function FormRow({
  children,
  trailing,
}: {
  children: ReactNode
  trailing?: ReactNode
}) {
  return (
    <div className="flex w-full flex-col gap-1 pt-1">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="min-w-0 flex-1">{children}</div>
        {trailing}
      </div>
      <RowDivider />
    </div>
  )
}

function LabeledInputRow({
  label,
  children,
  widthClass,
}: {
  label: string
  children: React.ReactNode
  widthClass?: string
}) {
  return (
    <FormRow>
      <div className={`flex items-center justify-between gap-[122px] text-[24px] leading-[37px] tracking-[-0.25px] ${widthClass ?? 'w-full'}`}>
        <span className={`font-[family-name:var(--font-soehne)] not-italic ${LABEL_W}`}>{label}</span>
        <div className="flex min-w-0 flex-1 items-center">{children}</div>
      </div>
    </FormRow>
  )
}

function RowDivider() {
  return <div className="h-px w-full shrink-0" style={{backgroundColor: 'rgba(0,0,0,0.12)'}} />
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function PlusSquareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 12h12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function MinusCollapseIcon() {
  return <MinusIcon />
}

function MinusSmIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 12h12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function PlusSmIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" />
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

function StepButton({children, ...props}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="flex size-[17px] items-center justify-center text-black"
      {...props}
    >
      {children}
    </button>
  )
}
