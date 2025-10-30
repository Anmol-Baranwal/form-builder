'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { C1Component } from '@thesysai/genui-sdk'

export default function FormPage() {
  const params = useParams()
  const { id } = params
  const [c1Response, setC1Response] = useState<string | null>(null)
  const [resetKey, setResetKey] = useState<number>(0)

  useEffect(() => {
    async function fetchForm() {
      const res = await fetch(`/api/forms/get?id=${id}`)
      const data = await res.json()
      const wrappedSpec = `<content>${JSON.stringify(data.schema)}</content>`
      setC1Response(wrappedSpec)
    }
    if (id) fetchForm()
  }, [id])

  if (!c1Response) return <div>Loading...</div>

  return (
    <div className="mx-8 p-12" id="form-page">
      <C1Component
        key={resetKey}
        c1Response={c1Response}
        isStreaming={false}
        onAction={async (action) => {
          try {
            const res = await fetch(`/api/forms/submit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                formId: id,
                response: action.llmFriendlyMessage,
              }),
            })
            if (!res.ok) {
              console.error('Failed to submit form:', await res.text())
            } else {
              setResetKey((k) => k + 1)
            }
          } catch (err) {
            console.error('Error submitting form:', err)
          }
        }}
      />
    </div>
  )
}
