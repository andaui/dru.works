import type {Metadata} from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tools | dru.works',
  robots: {index: false, follow: false},
}

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-soehne)] mb-4 text-4xl tracking-tight">Tools</h1>
      <p className="mb-10 text-muted">
        Small utilities built for the portfolio. More may appear here over time.
      </p>
      <ul className="space-y-4">
        <li>
          <Link
            href="/tools/invoice"
            className="text-lg underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            Invoice builder
          </Link>
          <p className="mt-1 text-sm text-muted">Figma-accurate layout, PDF export.</p>
        </li>
      </ul>
      <p className="mt-12">
        <Link
          href="/"
          className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
        >
          ← Home
        </Link>
      </p>
    </main>
  )
}
