'use client'
import { useSearchParams } from 'next/navigation'
import { C1Component, ThemeProvider } from '@thesysai/genui-sdk'

export default function FormPage() {
  const searchParams = useSearchParams()
  const formSpec = searchParams.get('spec')

  if (!formSpec) return <p>No form found. Go back and generate one.</p>

  return (
    <main className="p-8">
      <h2 className="mb-4 text-lg font-semibold">Generated Form</h2>
      <ThemeProvider>
        <C1Component
          c1Response={formSpec}
          onAction={(action) => {
            console.log('Form submitted:', action.llmFriendlyMessage)
            alert('Form submitted! (check console)')
          }}
        />
      </ThemeProvider>
    </main>
  )
}
