import type {InvoiceCurrency} from '@/lib/invoiceFormat'

/** All bank fields collected in the invoice tool / preview. */
export type InvoiceBankDetails = {
  accountHolderName: string
  bankName: string
  bankAddress: string
  accountNumber: string
  sortCode: string
  routingNumber: string
  ifscCode: string
  bsb: string
  iban: string
  bic: string
}

export function emptyInvoiceBankDetails(): InvoiceBankDetails {
  return {
    accountHolderName: '',
    bankName: '',
    bankAddress: '',
    accountNumber: '',
    sortCode: '',
    routingNumber: '',
    ifscCode: '',
    bsb: '',
    iban: '',
    bic: '',
  }
}

export type PreviewBankRow = {key: string; label: string; value: string}

/** Rows for the PDF preview: only non-empty values, stable order. */
export function buildPreviewBankRows(
  currency: InvoiceCurrency,
  bank: InvoiceBankDetails,
): PreviewBankRow[] {
  const rows: PreviewBankRow[] = []
  const t = (s: string) => s.trim()

  if (t(bank.accountHolderName)) {
    rows.push({
      key: 'holder',
      label: 'Account holder name',
      value: t(bank.accountHolderName),
    })
  }
  if (t(bank.bankName)) {
    rows.push({key: 'bank', label: 'Bank name', value: t(bank.bankName)})
  }
  if (t(bank.bankAddress)) {
    rows.push({key: 'addr', label: 'Bank address', value: t(bank.bankAddress)})
  }
  if (t(bank.accountNumber)) {
    rows.push({key: 'acct', label: 'Account number', value: t(bank.accountNumber)})
  }

  if (currency === 'GBP' && t(bank.sortCode)) {
    rows.push({key: 'sort', label: 'Sort code', value: t(bank.sortCode)})
  }
  if (currency === 'USD' && t(bank.routingNumber)) {
    rows.push({key: 'aba', label: 'Routing number (ABA)', value: t(bank.routingNumber)})
  }
  if (currency === 'INR' && t(bank.ifscCode)) {
    rows.push({key: 'ifsc', label: 'IFSC code', value: t(bank.ifscCode)})
  }
  if (currency === 'AUD' && t(bank.bsb)) {
    rows.push({key: 'bsb', label: 'BSB number', value: t(bank.bsb)})
  }

  if (t(bank.iban)) {
    rows.push({key: 'iban', label: 'IBAN', value: t(bank.iban)})
  }
  if (t(bank.bic)) {
    rows.push({key: 'bic', label: 'SWIFT / BIC', value: t(bank.bic)})
  }

  return rows
}

export type DomesticBankInput =
  | {kind: 'sortCode'; label: string; value: string; onChange: (v: string) => void}
  | {kind: 'routing'; label: string; value: string; onChange: (v: string) => void}
  | {kind: 'ifsc'; label: string; value: string; onChange: (v: string) => void}
  | {kind: 'bsb'; label: string; value: string; onChange: (v: string) => void}
  | null

export function domesticBankInputForCurrency(
  currency: InvoiceCurrency,
  bank: InvoiceBankDetails,
  patch: (p: Partial<InvoiceBankDetails>) => void,
): DomesticBankInput {
  switch (currency) {
    case 'GBP':
      return {
        kind: 'sortCode',
        label: 'Sort code',
        value: bank.sortCode,
        onChange: (sortCode) => patch({sortCode}),
      }
    case 'USD':
      return {
        kind: 'routing',
        label: 'Routing number (ABA)',
        value: bank.routingNumber,
        onChange: (routingNumber) => patch({routingNumber}),
      }
    case 'INR':
      return {
        kind: 'ifsc',
        label: 'IFSC code',
        value: bank.ifscCode,
        onChange: (ifscCode) => patch({ifscCode}),
      }
    case 'AUD':
      return {
        kind: 'bsb',
        label: 'BSB number',
        value: bank.bsb,
        onChange: (bsb) => patch({bsb}),
      }
    default:
      return null
  }
}
