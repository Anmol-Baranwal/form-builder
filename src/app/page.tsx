'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const C1ChatWrapper = dynamic(() => import('../components/C1ChatWrapper'), {
  ssr: false,
})

type FormMeta = {
  id: string
  title?: string
  prompt?: string
  createdAt: string
}

export default function Home() {
  const [forms, setForms] = useState<FormMeta[]>([])

  useEffect(() => {
    fetch('/api/forms/list')
      .then((r) => r.json())
      .then((d) => setForms(d.forms || []))
      .catch(() => setForms([]))
  }, [])

  return (
    <div className="space-y-8">
      <section>
        <C1ChatWrapper />
      </section>

      {/* <section>
        <h2 className="mb-2 text-xl font-semibold">Saved forms</h2>
        <ul className="space-y-2">
          {forms.length === 0 && (
            <li className="text-gray-500">
              No forms yet -- chat to create one.
            </li>
          )}
          {forms.map((f) => (
            <li key={f.id}>
              <a
                href={`/forms/${f.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {f.title || f.prompt?.slice(0, 60) || 'Untitled form'}
              </a>
              <span className="ml-2 text-sm text-gray-500">
                • {new Date(f.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section> */}
    </div>
  )
}
