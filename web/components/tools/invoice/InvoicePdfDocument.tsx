import {Document, Page, StyleSheet, Text, View} from '@react-pdf/renderer'
import {buildPreviewBankRows} from '@/lib/invoiceBankDetails'
import {formatDateDots, formatMoney, formatMoneyCompact} from '@/lib/invoiceFormat'
import type {InvoicePreviewProps} from '@/components/tools/invoice/InvoicePreview'
import {DEFAULT_INVOICE_PAPER_HEX} from '@/lib/invoicePaperSwatches'

/** CSS px → PDF pt (96dpi). */
const pt = (px: number) => px * 0.75

/** A4 width in pt — use almost full width like the 641px preview card (no huge side gutters). */
const A4_W_PT = 595.28
const PAGE_SIDE_PAD_PT = 18
const CONTENT_W_PT = A4_W_PT - 2 * PAGE_SIDE_PAD_PT
/** Scale horizontal spacing from 641px design width to usable PDF width. */
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
    fontFamily: 'Helvetica',
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
    fontFamily: 'Helvetica-Bold',
    fontSize: f(11),
    lineHeight: 1.35,
  },
  previewLinesCol: {
    flex: 1,
    flexDirection: 'column',
    minWidth: 0,
  },
  previewLine: {
    fontSize: f(11),
    lineHeight: f(16) / f(11),
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
    fontSize: f(11),
    lineHeight: 1.35,
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
    fontFamily: 'Helvetica',
    fontSize: f(24.035),
    lineHeight: 1.15,
    letterSpacing: h(-1.2018),
  },
  colHdr: {
    fontFamily: 'Helvetica-Bold',
    fontSize: f(11),
    textAlign: 'right',
    lineHeight: 1.35,
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
    fontSize: f(11),
    lineHeight: 1.35,
  },
  colQty: {
    width: W.qty,
    marginRight: W.gapCol,
    fontSize: f(11),
    textAlign: 'right',
    lineHeight: 1.35,
  },
  colMoney: {
    width: W.money,
    marginRight: W.gapCol,
    fontSize: f(11),
    textAlign: 'right',
    lineHeight: 1.35,
  },
  colMoneyLast: {
    width: W.money,
    fontSize: f(11),
    textAlign: 'right',
    lineHeight: 1.35,
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
    fontSize: f(11.347),
    lineHeight: 1.15,
    letterSpacing: h(-0.5674),
  },
  totalLabelBold: {
    flex: 1,
    minWidth: 0,
    marginRight: W.gapCol,
    fontFamily: 'Helvetica-Bold',
    fontSize: f(11.347),
    lineHeight: 1.15,
    letterSpacing: h(-0.5674),
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
    fontSize: f(11.347),
    textAlign: 'right',
    lineHeight: 1.15,
    letterSpacing: h(-0.5674),
  },
  totalValueBold: {
    width: W.money,
    fontFamily: 'Helvetica-Bold',
    fontSize: f(11.347),
    textAlign: 'right',
    lineHeight: 1.15,
    letterSpacing: h(-0.5674),
  },
  taxPct: {
    width: W.qty,
    marginRight: W.gapCol,
    fontFamily: 'Helvetica-Bold',
    fontSize: f(11.347),
    textAlign: 'right',
    lineHeight: 1.15,
    letterSpacing: h(-0.5674),
  },
  discPct: {
    width: W.qty,
    marginRight: W.gapCol,
    fontSize: f(11.347),
    textAlign: 'right',
    lineHeight: 1.15,
    letterSpacing: h(-0.5674),
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
    fontSize: f(11.347),
    textDecoration: 'line-through',
    opacity: 0.45,
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
    fontSize: f(11),
    lineHeight: 1.35,
  },
  bankValues: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: h(12),
    paddingRight: h(12),
  },
  noteLabel: {
    width: W.label,
    marginRight: W.gapLabel,
    fontFamily: 'Helvetica-Bold',
    fontSize: f(11),
    lineHeight: 1.35,
  },
  noteLinesCol: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
  },
  noteLine: {
    fontSize: f(11),
    lineHeight: f(16) / f(11),
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
  const {
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
  } = props

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
