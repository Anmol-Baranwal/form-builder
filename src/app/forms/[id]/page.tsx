'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { C1Component } from '@thesysai/genui-sdk'

export default function FormPage() {
  const params = useParams()
  const { id } = params
  const [c1Response, setC1Response] = useState<string | null>(null)

  useEffect(() => {
    async function fetchForm() {
      const res = await fetch(`/api/forms/get?id=${id}`)
      const data = await res.json()

      // The schema we stored in Mongo is JSON
      // Wrap it back into <content>...</content> string
      const wrappedSpec = `<content>${JSON.stringify(data.schema)}</content>`

      console.log('wrappedSpec', wrappedSpec)
      setC1Response(wrappedSpec)
    }
    if (id) fetchForm()
  }, [id])

  if (!c1Response) return <div>Loading...</div>

  return (
    <div className="p-4">
      <C1Component
        c1Response={c1Response}
        isStreaming={false} // since this is static schema
        onAction={async (action) => {
          console.log('🔹 Action fired:', action)

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
              console.log('✅ Form submitted successfully')
            }
          } catch (err) {
            console.error('Error submitting form:', err)
          }
        }}
      />
    </div>
  )
}
