'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { C1Component, ThemeProvider } from '@thesysai/genui-sdk'

export default function FormPage() {
  const { id } = useParams()
  const [schema, setSchema] = useState(null)
  const [formTitle, setFormTitle] = useState('')

  useEffect(() => {
    fetch(`/api/forms/get?id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        setSchema(d.schema)
        setFormTitle(d.title)
      })
  }, [id])

  if (!schema) return <p>Loading form...</p>

  return (
    <ThemeProvider>
      <h1>{formTitle}</h1>
      <C1Component
        c1Response={schema}
        isStreaming={true}
        onAction={async (action) => {
          await fetch('/api/forms/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              formId: id,
              response: action.llmFriendlyMessage,
            }),
          })
          alert('Thanks! Your response has been received.')
        }}
      />
    </ThemeProvider>
  )
}

// import { useEffect, useState } from 'react'
// import { C1Component, ThemeProvider } from '@thesysai/genui-sdk'

// interface FormPageProps {
//   params: { id: string }
// }

// export default function FormPage({ params }: FormPageProps) {
//   const [schema, setSchema] = useState(null)
//   useEffect(() => {
//     fetch(`/api/getForm?id=${params.id}`)
//       .then((r) => r.json())
//       .then((d) => setSchema(d.schema))
//   }, [params.id])

//   if (!schema) return <p>Loading form...</p>

//   return (
//     <ThemeProvider>
//       <C1Component c1Response={schema} isStreaming={true} />
//     </ThemeProvider>
//   )
// }
