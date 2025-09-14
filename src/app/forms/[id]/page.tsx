/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/forms/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import '@crayonai/react-ui/styles/index.css'
import { ThemeProvider, C1Component } from '@thesysai/genui-sdk'
import Image from 'next/image'

export default function FormViewer() {
  const { id } = useParams()
  const [spec, setSpec] = useState<any | null>(null)
  const [meta, setMeta] = useState<any | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/getForm?formId=${id}`)
      .then((r) => r.json())
      .then((d) => {
        setSpec(d?.formSpec ?? null)
        setMeta(d?.meta ?? null)
      })
      .catch((err) => {
        console.error('getForm error', err)
      })
  }, [id])

  if (!spec)
    return <div style={{ padding: 20 }}>Loading or form not found.</div>

  return (
    <main style={{ padding: 16 }}>
      {meta?.branding?.logoUrl && (
        <Image src={meta.branding.logoUrl} alt="logo" width={120} />
      )}
      <h1 style={{ marginTop: 8 }}>{meta?.title || 'Form'}</h1>
      <ThemeProvider>
        <C1Component
          c1Response={spec}
          isStreaming={true}
          onAction={(action: any) => {
            console.log('form action', action)
          }}
        />
      </ThemeProvider>
    </main>
  )
}
