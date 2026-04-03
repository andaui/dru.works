import {Document, Page, StyleSheet, Text, View} from '@react-pdf/renderer'
import {buildPreviewBankRows} from '@/lib/invoiceBankDetails'
import {formatDateDots, formatMoney, formatMoneyCompact} from '@/lib/invoiceFormat'
import type {InvoicePreviewProps} from '@/components/tools/invoice/invoicePreviewShared'
import {DEFAULT_INVOICE_PAPER_HEX} from '@/lib/invoicePaperSwatches'
import {PDF_FONT_INTER, registerInvoicePdfInterFonts} from '@/components/tools/invoice/invoicePdfFonts'

registerInvoicePdfInterFonts()

/** CSS px → PDF pt (96dpi). */
const pt = (px: number) => px * 0.75

/** A4 width in pt — scale horizontal spacing from 641px design width to usable PDF width. */
const A4_W_PT = 595.28
/**
 * Both templates use a 641px-wide preview card with no extra horizontal page gutter.
 * Classic: inner px-12 / px-14. Light (2): inner px-6 (24px) via LM.padH.
 */
const PAGE_SIDE_PAD_PT = 0
const CONTENT_W_PT = A4_W_PT - 2 * PAGE_SIDE_PAD_PT
const H_SCALE = CONTENT_W_PT / pt(641)
const h = (px: number) => pt(px) * H_SCALE
/** Vertical spacing — keep preview proportions on the tall axis. */
const v = (px: number) => pt(px)
/** Slightly larger type than raw px→pt. */
const f = (px: number) => pt(px) * 1.065

const C = {
  ink: '#000000',
  /** Tailwind `rgba(0,0,0,0.25)` */
  muted: 'rgba(0,0,0,0.25)',
}

/* Column widths scale with H_SCALE so alignment matches preview at wider measure. */
const W = {
  label: h(100),
  gapLabel: h(60),
  qty: h(60),
  gapCol: h(30),
  money: h(120),
}

const styles = StyleSheet.create({
  page: {
    paddingTop: v(17),
    paddingBottom: v(17),
    paddingLeft: PAGE_SIDE_PAD_PT,
    paddingRight: PAGE_SIDE_PAD_PT,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    lineHeight: 1.35,
    color: C.ink,
    flexDirection: 'column',
  },
  /** Same vertical rhythm as preview `justify-between` + `h-full` inner column. */
  pageFill: {
    width: CONTENT_W_PT,
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: v(871),
  },
  topStack: {
    flexDirection: 'column',
  },
  topGap: {
    marginBottom: v(29),
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: h(12),
    paddingRight: h(12),
  },
  previewLabel: {
    width: W.label,
    marginRight: W.gapLabel,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 700,
    fontSize: f(11),
    lineHeight: 1.35,
    color: C.ink,
  },
  previewLinesCol: {
    flex: 1,
    flexDirection: 'column',
    minWidth: 0,
  },
  previewLine: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    lineHeight: f(16) / f(11),
    color: C.ink,
  },
  metaOuter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: h(12),
    paddingRight: h(24),
  },
  metaLabels: {
    width: W.label,
    marginRight: W.gapLabel,
    flexDirection: 'column',
  },
  metaValues: {
    flexDirection: 'column',
  },
  metaText: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    lineHeight: 1.35,
    color: C.ink,
  },
  /** `px-[14px]` on items shell — width matches full content strip. */
  itemsShell: {
    width: CONTENT_W_PT,
    paddingLeft: h(14),
    paddingRight: h(14),
  },
  itemsAndTotals: {
    flexDirection: 'column',
  },
  gapItemsToTotals: {
    marginBottom: v(40),
  },
  itemsTable: {
    flexDirection: 'column',
  },
  gapHeaderToLines: {
    marginBottom: v(32),
  },
  itemsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  itemsTitle: {
    flex: 1,
    minWidth: 0,
    marginRight: W.gapCol,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(24.035),
    lineHeight: 1.15,
    letterSpacing: h(-1.2018),
    color: C.ink,
  },
  colHdr: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 700,
    fontSize: f(11),
    textAlign: 'right',
    lineHeight: 1.35,
    color: C.ink,
  },
  colHdrQty: {
    width: W.qty,
    marginRight: W.gapCol,
  },
  colHdrMoney: {
    width: W.money,
    marginRight: W.gapCol,
  },
  colHdrMoneyLast: {
    width: W.money,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: v(6),
  },
  lineRowLast: {
    marginBottom: 0,
  },
  lineDesc: {
    flex: 1,
    minWidth: 0,
    marginRight: W.gapCol,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    lineHeight: 1.35,
    color: C.ink,
  },
  colQty: {
    width: W.qty,
    marginRight: W.gapCol,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    textAlign: 'right',
    lineHeight: 1.35,
    color: C.ink,
  },
  colMoney: {
    width: W.money,
    marginRight: W.gapCol,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    textAlign: 'right',
    lineHeight: 1.35,
    color: C.ink,
  },
  colMoneyLast: {
    width: W.money,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    textAlign: 'right',
    lineHeight: 1.35,
    color: C.ink,
  },
  totalsBlock: {
    flexDirection: 'column',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: v(3),
    minHeight: v(18),
  },
  totalRowLast: {
    marginBottom: 0,
  },
  totalLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: W.gapCol,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11.347),
    lineHeight: 1.15,
    letterSpacing: h(-0.5674),
    color: C.ink,
  },
  totalLabelBold: {
    flex: 1,
    minWidth: 0,
    marginRight: W.gapCol,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 700,
    fontSize: f(11.347),
    lineHeight: 1.15,
    letterSpacing: h(-0.5674),
    color: C.ink,
  },
  totalSpacerQty: {
    width: W.qty,
    marginRight: W.gapCol,
  },
  totalSpacerMoney: {
    width: W.money,
    marginRight: W.gapCol,
  },
  totalValue: {
    width: W.money,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11.347),
    textAlign: 'right',
    lineHeight: 1.15,
    letterSpacing: h(-0.5674),
    color: C.ink,
  },
  totalValueBold: {
    width: W.money,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 700,
    fontSize: f(11.347),
    textAlign: 'right',
    lineHeight: 1.15,
    letterSpacing: h(-0.5674),
    color: C.ink,
  },
  taxPct: {
    width: W.qty,
    marginRight: W.gapCol,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 700,
    fontSize: f(11.347),
    textAlign: 'right',
    lineHeight: 1.15,
    letterSpacing: h(-0.5674),
    color: C.ink,
  },
  discPct: {
    width: W.qty,
    marginRight: W.gapCol,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11.347),
    textAlign: 'right',
    lineHeight: 1.15,
    letterSpacing: h(-0.5674),
    color: C.ink,
  },
  totalRightCluster: {
    width: W.money,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  strikeSpacing: {
    marginRight: h(6),
  },
  strikeText: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11.347),
    textDecoration: 'line-through',
    opacity: 0.45,
    color: C.ink,
  },
  bottomStack: {
    flexDirection: 'column',
  },
  bankGap: {
    marginBottom: v(24),
  },
  bankOuter: {
    paddingLeft: h(12),
    paddingRight: h(24),
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bankLabels: {
    width: h(158),
    marginRight: h(40),
    flexDirection: 'column',
  },
  bankLine: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    lineHeight: 1.35,
    color: C.ink,
  },
  bankValues: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
  },
  /** Same horizontal grid as `bankOuter` + `bankRow` so note body aligns with bank value column. */
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: h(12),
    paddingRight: h(24),
  },
  noteLabel: {
    width: h(158),
    marginRight: h(40),
    fontFamily: PDF_FONT_INTER,
    fontWeight: 700,
    fontSize: f(11),
    lineHeight: 1.35,
    color: C.ink,
  },
  noteLinesCol: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
  },
  noteLine: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    lineHeight: f(16) / f(11),
    color: C.ink,
  },
})

/** Light Mode template — Figma 508:37 (641×905, pt 21 / pb 17). */
const LM = {
  padH: h(24),
  fromW: h(203),
  metaW: h(119),
  addrW: h(169),
  gapMetaAddr: h(24),
  gap30: h(30),
  w60: h(60),
  w120: h(120),
  w90: h(90),
  w100: h(100),
}

const lightStyles = StyleSheet.create({
  page: {
    paddingTop: v(21),
    paddingBottom: v(17),
    paddingLeft: PAGE_SIDE_PAD_PT,
    paddingRight: PAGE_SIDE_PAD_PT,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    lineHeight: 1.35,
    color: C.ink,
    flexDirection: 'column',
  },
  outer: {
    width: CONTENT_W_PT,
    flexDirection: 'column',
    gap: v(60),
    flexGrow: 1,
    minHeight: '100%',
  },
  /** Hero → header → items (items grows so footer sits at page bottom). */
  mainColumn: {
    flexDirection: 'column',
    gap: v(60),
    flexGrow: 1,
    minHeight: 0,
  },
  /** Hero — same horizontal inset as header/items (LM.padH); wider gap between word and number */
  heroRow: {
    width: '100%',
    paddingLeft: LM.padH,
    paddingRight: LM.padH,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: v(199),
  },
  heroInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: h(24),
  },
  heroInvoice: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(91),
    lineHeight: 1.15,
    letterSpacing: pt(-8.19),
    color: C.ink,
  },
  heroNumber: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(47),
    lineHeight: 1.15,
    letterSpacing: pt(-4.23),
    color: C.ink,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: LM.padH,
    paddingRight: LM.padH,
  },
  fromCol: {
    width: LM.fromW,
    flexDirection: 'column',
    gap: v(6),
  },
  fromLabel: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 700,
    fontSize: f(11),
    width: LM.w100,
    color: C.ink,
  },
  rightCluster: {
    flexDirection: 'row',
    gap: LM.gapMetaAddr,
  },
  metaCol: {
    width: LM.metaW,
    flexDirection: 'column',
    gap: v(16),
  },
  metaPair: {
    flexDirection: 'column',
    gap: v(6),
  },
  metaLabel: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    width: LM.w100,
    color: C.ink,
  },
  metaVal: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    width: LM.w100,
    color: C.ink,
  },
  addrCol: {
    width: LM.addrW,
  },
  itemsBlock: {
    paddingLeft: LM.padH,
    paddingRight: LM.padH,
    flexDirection: 'column',
    gap: v(40),
    flexGrow: 1,
  },
  itemsInner: {
    flexDirection: 'column',
    gap: v(32),
    flexShrink: 0,
  },
  hdrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LM.gap30,
  },
  hdrDesc: {
    flex: 1,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    color: C.ink,
  },
  hdr60: {
    width: LM.w60,
    textAlign: 'right',
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    color: C.ink,
  },
  hdr120: {
    width: LM.w120,
    textAlign: 'right',
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    color: C.ink,
  },
  hdr90: {width: LM.w90, opacity: 0},
  lineRows: {
    flexDirection: 'column',
    gap: v(6),
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: LM.gap30,
  },
  lineDesc: {
    flex: 1,
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    minWidth: 0,
    color: C.ink,
  },
  totals: {
    flexDirection: 'column',
    gap: v(6),
    flexShrink: 0,
  },
  totRowEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    gap: LM.gap30,
  },
  totLbl120: {
    width: LM.w120,
    textAlign: 'right',
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    color: C.ink,
  },
  totVal90: {
    width: LM.w90,
    textAlign: 'right',
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    color: C.ink,
  },
  totValCol: {
    width: LM.w90,
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: v(2),
  },
  totBold: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 700,
    fontSize: f(11.347),
    lineHeight: 1.15,
    letterSpacing: h(-0.5674),
    color: C.ink,
  },
  footer: {
    flexDirection: 'column',
    gap: v(24),
  },
  dueBlock: {
    paddingLeft: LM.padH,
    paddingRight: LM.padH,
    flexDirection: 'column',
    gap: v(6),
  },
  dueLbl: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 700,
    fontSize: f(11),
    width: LM.w100,
    color: C.ink,
  },
  /** Same inset + label/value columns as bank block in footer. */
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: LM.padH,
    paddingRight: LM.padH,
  },
  /** 11px body copy — matches preview `font-normal` */
  bodyLine: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    lineHeight: f(16) / f(11),
    color: C.ink,
  },
  lineQty: {
    width: LM.w60,
    textAlign: 'right',
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    color: C.ink,
  },
  lineUnit: {
    width: LM.w120,
    textAlign: 'right',
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    color: C.ink,
  },
  lineTotal: {
    width: LM.w90,
    textAlign: 'right',
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    color: C.ink,
  },
  totValText: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    color: C.ink,
  },
  dueVal: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 400,
    fontSize: f(11),
    width: LM.w100,
    color: C.ink,
  },
  noteLabel: {
    fontFamily: PDF_FONT_INTER,
    fontWeight: 700,
    fontSize: f(11),
    lineHeight: 1.35,
    width: h(158),
    marginRight: h(40),
    color: C.ink,
  },
})

function PreviewBlock({label, lines}: {label: string; lines: string[]}) {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}</Text>
      <View style={styles.previewLinesCol}>
        {lines.length === 0
          ? null
          : lines.map((line, i) => (
              <Text key={i} style={styles.previewLine}>
                {line}
              </Text>
            ))}
      </View>
    </View>
  )
}

/** Vector PDF — dimensions mirror {@link InvoicePreview} (641×905 canvas, same gaps/columns). */
export function InvoicePdfDocument(props: InvoicePreviewProps) {
  const {template: _template, ...rest} = props
  void _template
  if (props.template === 'lightMode') {
    return <InvoicePdfDocumentLight {...rest} />
  }
  return <InvoicePdfDocumentClassic {...rest} />
}

function InvoicePdfDocumentClassic({
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
  paperBackground = DEFAULT_INVOICE_PAPER_HEX,
}: Omit<InvoicePreviewProps, 'template'>) {
  const lineSubtotal = lineItems.reduce((s, r) => s + r.quantity * r.unitPrice, 0)
  const discountAmt = lineSubtotal * (discountPercent / 100)
  const taxAmt = (lineSubtotal - discountAmt) * (taxPercent / 100)
  const totalBeforeDiscount = lineSubtotal + lineSubtotal * (taxPercent / 100)
  const showPreDiscountTotal = discountAmt > 0

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
  const taxMuted = taxPercent === 0
  const discMuted = discountPercent === 0
  const nLines = lineItems.length

  return (
    <Document>
      <Page size="A4" style={[styles.page, {backgroundColor: paperBackground}]} wrap>
        <View style={styles.pageFill}>
          <View style={styles.topStack}>
            <View style={styles.topGap}>
              <PreviewBlock label="From" lines={fromLines} />
            </View>
            <View style={metaRows.length > 0 ? styles.topGap : {}}>
              <PreviewBlock label="Billed to" lines={billedLines} />
            </View>
            {metaRows.length > 0 ? (
              <View style={styles.metaOuter}>
                <View style={styles.metaLabels}>
                  {metaRows.map((r) => (
                    <Text key={r.key} style={styles.metaText}>
                      {r.label}
                    </Text>
                  ))}
                </View>
                <View style={styles.metaValues}>
                  {metaRows.map((r) => (
                    <Text key={r.key} style={styles.metaText}>
                      {r.value}
                    </Text>
                  ))}
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.itemsShell}>
            <View style={styles.itemsAndTotals}>
              <View style={styles.gapItemsToTotals}>
                <View style={styles.itemsTable}>
                  <View style={styles.gapHeaderToLines}>
                    <View style={styles.itemsHeaderRow}>
                      <Text style={styles.itemsTitle}>Items</Text>
                      <Text style={[styles.colHdr, styles.colHdrQty]}>Qty</Text>
                      <Text style={[styles.colHdr, styles.colHdrMoney]}>Price</Text>
                      <Text style={[styles.colHdr, styles.colHdrMoneyLast]}>Total</Text>
                    </View>
                  </View>
                  {lineItems.map((row, i) => {
                    const lineTotal = row.quantity * row.unitPrice
                    const last = i === nLines - 1
                    return (
                      <View key={i} style={last ? [styles.lineRow, styles.lineRowLast] : styles.lineRow}>
                        <Text style={styles.lineDesc}>{row.description}</Text>
                        <Text style={styles.colQty}>{row.quantity}</Text>
                        <Text style={styles.colMoney}>{formatMoneyCompact(row.unitPrice, currency)}</Text>
                        <Text style={styles.colMoneyLast}>{formatMoney(lineTotal, currency)}</Text>
                      </View>
                    )
                  })}
                </View>
              </View>

              <View style={styles.totalsBlock}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <View style={styles.totalSpacerQty} />
                  <View style={styles.totalSpacerMoney} />
                  <Text style={styles.totalValue}>{formatMoneyCompact(lineSubtotal, currency)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabelBold}>Tax</Text>
                  <Text style={taxMuted ? [styles.taxPct, {color: C.muted}] : styles.taxPct}>
                    {taxPercent}%
                  </Text>
                  <View style={styles.totalSpacerMoney} />
                  <Text style={styles.totalValue}>
                    {taxAmt > 0 ? formatMoneyCompact(taxAmt, currency) : ''}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Discount</Text>
                  <Text style={discMuted ? [styles.discPct, {color: C.muted}] : styles.discPct}>
                    {discountPercent}%
                  </Text>
                  <View style={styles.totalSpacerMoney} />
                  <Text style={discountAmt > 0 ? [styles.totalValue, {opacity: 0.4}] : styles.totalValue}>
                    {discountAmt > 0 ? `-${formatMoneyCompact(discountAmt, currency)}` : ''}
                  </Text>
                </View>
                <View style={[styles.totalRow, styles.totalRowLast]}>
                  <Text style={styles.totalLabelBold}>Total {currency}</Text>
                  <View style={styles.totalSpacerQty} />
                  <View style={styles.totalSpacerMoney} />
                  <View style={styles.totalRightCluster}>
                    {showPreDiscountTotal ? (
                      <Text style={[styles.strikeText, styles.strikeSpacing]}>
                        {formatMoneyCompact(totalBeforeDiscount, currency)}
                      </Text>
                    ) : null}
                    <Text style={styles.totalValueBold}>
                      {formatMoneyCompact(displayTotal, currency)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.bottomStack}>
            {bankRows.length > 0 ? (
              <View style={styles.bankGap}>
                <View style={styles.bankOuter}>
                  <View style={styles.bankRow}>
                    <View style={styles.bankLabels}>
                      {bankRows.map((r) => (
                        <Text key={r.key} style={styles.bankLine}>
                          {r.label}
                        </Text>
                      ))}
                    </View>
                    <View style={styles.bankValues}>
                      {bankRows.map((r) => (
                        <Text key={r.key} style={styles.bankLine}>
                          {r.value}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ) : null}
            <View style={styles.noteRow}>
              <Text style={styles.noteLabel}>Note</Text>
              <View style={styles.noteLinesCol}>
                {noteLines.length === 0
                  ? null
                  : noteLines.map((line, i) => (
                      <Text key={i} style={styles.noteLine}>
                        {line}
                      </Text>
                    ))}
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

function InvoicePdfDocumentLight({
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
  paperBackground = DEFAULT_INVOICE_PAPER_HEX,
}: Omit<InvoicePreviewProps, 'template'>) {
  const lineSubtotal = lineItems.reduce((s, r) => s + r.quantity * r.unitPrice, 0)
  const discountAmt = lineSubtotal * (discountPercent / 100)
  const afterDisc = lineSubtotal - discountAmt
  const taxAmt = afterDisc * (taxPercent / 100)
  const taxMuted = taxPercent === 0
  const discMuted = discountPercent === 0
  const bankRows = buildPreviewBankRows(currency, bankDetails)
  const showInvoiceDate = Boolean(invoiceDateIso?.trim())
  const showInvoiceNo = Boolean(invoiceNo.trim())

  return (
    <Document>
      <Page size="A4" style={[lightStyles.page, {backgroundColor: paperBackground}]} wrap>
        <View style={lightStyles.outer}>
          <View style={lightStyles.mainColumn}>
            <View style={lightStyles.heroRow}>
              <View style={lightStyles.heroInner}>
                <Text style={lightStyles.heroInvoice}>Invoice</Text>
                {showInvoiceNo ? <Text style={lightStyles.heroNumber}>{invoiceNo.trim()}</Text> : null}
              </View>
            </View>
            <View style={lightStyles.headerRow}>
              <View style={lightStyles.fromCol}>
                <Text style={lightStyles.fromLabel}>From</Text>
                {fromLines.map((line, i) => (
                  <Text key={i} style={lightStyles.bodyLine}>
                    {line}
                  </Text>
                ))}
              </View>
              <View style={lightStyles.rightCluster}>
                {showInvoiceDate ? (
                  <View style={lightStyles.metaCol}>
                    <View style={lightStyles.metaPair}>
                      <Text style={lightStyles.metaLabel}>Invoice date</Text>
                      <Text style={lightStyles.metaVal}>{formatDateDots(invoiceDateIso)}</Text>
                    </View>
                  </View>
                ) : null}
                <View style={lightStyles.addrCol}>
                  {billedLines.map((line, i) => (
                    <Text key={i} style={lightStyles.bodyLine}>
                      {line}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <View style={lightStyles.itemsBlock}>
              <View style={lightStyles.itemsInner}>
                <View style={lightStyles.hdrRow}>
                  <Text style={lightStyles.hdrDesc}>Description</Text>
                  <Text style={lightStyles.hdr60}>Quantity</Text>
                  <Text style={lightStyles.hdr120}>Unit Price</Text>
                  <Text style={lightStyles.hdr90}> </Text>
                </View>
                <View style={lightStyles.lineRows}>
                  {lineItems.map((row, i) => {
                    const lineTotal = row.quantity * row.unitPrice
                    return (
                      <View key={i} style={lightStyles.lineRow}>
                        <Text style={lightStyles.lineDesc}>{row.description}</Text>
                        <Text style={lightStyles.lineQty}>{row.quantity}</Text>
                        <Text style={lightStyles.lineUnit}>{formatMoneyCompact(row.unitPrice, currency)}</Text>
                        <Text style={lightStyles.lineTotal}>{formatMoney(lineTotal, currency)}</Text>
                      </View>
                    )
                  })}
                </View>
              </View>
              <View style={lightStyles.totals}>
                <View style={lightStyles.totRowEnd}>
                  <Text style={lightStyles.totLbl120}>Subtotal</Text>
                  <Text style={lightStyles.totVal90}>{formatMoneyCompact(lineSubtotal, currency)}</Text>
                </View>
                <View style={lightStyles.totRowEnd}>
                  <Text style={[lightStyles.totLbl120, {fontFamily: PDF_FONT_INTER, fontWeight: 600}]}>Tax</Text>
                  <View style={lightStyles.totValCol}>
                    <Text style={taxMuted ? [lightStyles.totValText, {color: C.muted}] : lightStyles.totValText}>
                      {taxPercent}%
                    </Text>
                    <Text style={lightStyles.totValText}>
                      {taxAmt > 0 ? formatMoneyCompact(taxAmt, currency) : ''}
                    </Text>
                  </View>
                </View>
                <View style={lightStyles.totRowEnd}>
                  <Text style={lightStyles.totLbl120}>Discount</Text>
                  <View style={lightStyles.totValCol}>
                    <Text style={discMuted ? [lightStyles.totValText, {color: C.muted}] : lightStyles.totValText}>
                      {discountPercent}%
                    </Text>
                    <Text style={discountAmt > 0 ? [lightStyles.totValText, {opacity: 0.4}] : lightStyles.totValText}>
                      {discountAmt > 0 ? `-${formatMoneyCompact(discountAmt, currency)}` : ''}
                    </Text>
                  </View>
                </View>
                <View style={lightStyles.totRowEnd}>
                  <Text style={[lightStyles.totLbl120, lightStyles.totBold]}>Total {currency}</Text>
                  <Text style={[lightStyles.totVal90, lightStyles.totBold]}>
                    {formatMoneyCompact(displayTotal, currency)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={lightStyles.footer}>
            {dueDateIso.trim() ? (
              <View style={lightStyles.dueBlock}>
                <Text style={lightStyles.dueLbl}>Due Date</Text>
                <Text style={lightStyles.dueVal}>{formatDateDots(dueDateIso)}</Text>
              </View>
            ) : null}
            {bankRows.length > 0 ? (
              <View style={styles.bankGap}>
                <View style={{paddingLeft: LM.padH, paddingRight: LM.padH}}>
                  <View style={styles.bankRow}>
                    <View style={styles.bankLabels}>
                      {bankRows.map((r) => (
                        <Text key={r.key} style={styles.bankLine}>
                          {r.label}
                        </Text>
                      ))}
                    </View>
                    <View style={styles.bankValues}>
                      {bankRows.map((r) => (
                        <Text key={r.key} style={styles.bankLine}>
                          {r.value}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ) : null}
            {noteLines.length > 0 ? (
              <View style={lightStyles.noteRow}>
                <Text style={lightStyles.noteLabel}>Note</Text>
                <View style={{flex: 1, flexDirection: 'column'}}>
                  {noteLines.map((line, i) => (
                    <Text key={i} style={lightStyles.bodyLine}>
                      {line}
                    </Text>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  )
}
