/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/forms/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import '@crayonai/react-ui/styles/index.css'
import { ThemeProvider, C1Component } from '@thesysai/genui-sdk'
import Image from 'next/image'

export default function FormPage() {
  const params = useParams()
  const id = params?.id
  const [spec, setSpec] = useState<any>(null)
  const [meta, setMeta] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const res = await fetch(`/api/getForm?formId=${id}`)
        if (!res.ok) {
          const txt = await res.text()
          setError(`Failed to load form: ${txt}`)
          return
        }
        const d = await res.json()
        // If server returned spec as string, try parse; otherwise use it.
        let loadedSpec = d.formSpec
        if (typeof loadedSpec === 'string') {
          try {
            loadedSpec = JSON.parse(loadedSpec)
          } catch {
            // leave as string for C1Component to attempt rendering
          }
        }
        setSpec(loadedSpec)
        setMeta(d.meta ?? null)
      } catch (err: any) {
        setError(err?.message ?? String(err))
      }
    })()
  }, [id])

  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!spec) return <div>Loading form...</div>

  // If logoUrl is external (https://...), Next/Image needs domains configured.
  // To keep dev simple, use <img> when external.
  const logoUrl = meta?.branding?.logoUrl
  const logoIsExternal =
    typeof logoUrl === 'string' &&
    (logoUrl.startsWith('http://') || logoUrl.startsWith('https://'))

  return (
    <div>
      {logoUrl &&
        (logoIsExternal ? (
          // easier for dev: avoid next/image domain setup
          <Image src={logoUrl} alt="logo" width={120} height={120} />
        ) : (
          <Image
            src={logoUrl || '/logo.png'}
            alt="logo"
            width={120}
            height={120}
          />
        ))}
      <h1 style={{ marginTop: 8 }}>{meta?.title || 'Form'}</h1>

      <ThemeProvider mode="dark">
        <div style={{ marginTop: 12 }}>
          <C1Component
            // key ensures the component re-renders when spec changes
            key={JSON.stringify(spec).slice(0, 200)}
            isStreaming={false}
            c1Response={spec}
            onAction={async (action: any) => {
              const raw =
                action?.llmFriendlyMessage ??
                action?.humanFriendlyMessage ??
                action
              let answers: any = raw
              if (typeof raw === 'string') {
                try {
                  answers = JSON.parse(raw)
                } catch {
                  answers = raw
                }
              }
              const payload = { formId: id, answers }
              await fetch('/api/submitResponse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              })
              alert('Thanks — response saved (in memory).')
            }}
          />
        </div>
      </ThemeProvider>
    </div>
  )
}
