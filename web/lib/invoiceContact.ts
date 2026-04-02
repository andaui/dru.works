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

export function contactHasAnyValue(c: ContactForm): boolean {
  return Object.values(c).some((v) => String(v).trim().length > 0)
}

/** Non-empty lines only — for invoice preview / PDF (no placeholders). */
export function contactToPreviewLines(c: ContactForm): string[] {
  const lines: string[] = []
  const t = (s: string) => s.trim()
  if (t(c.name)) lines.push(t(c.name))
  if (t(c.address)) lines.push(t(c.address))
  const cityPart = [c.city, c.state, c.zip].map(t).filter(Boolean).join(', ')
  if (cityPart) lines.push(cityPart)
  if (t(c.country)) lines.push(t(c.country))
  if (t(c.phone)) lines.push(t(c.phone))
  if (t(c.email)) lines.push(t(c.email))
  return lines
}

export const CONTACT_PLACEHOLDERS: Record<keyof ContactForm, string> = {
  name: 'Your name',
  email: 'email@example.com',
  address: 'Street address',
  phone: '+44 0000 000000',
  city: 'City',
  zip: 'Postal code',
  state: 'State or region',
  country: 'Country',
}
