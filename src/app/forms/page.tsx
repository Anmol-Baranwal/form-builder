'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type FormMeta = {
  id: string
  title: string
  description: string
  createdAt: string
}

export default function FormsListPage() {
  const [forms, setForms] = useState<FormMeta[]>([])

  useEffect(() => {
    fetch('/api/forms/list')
      .then((res) => res.json())
      .then((data) => {
        setForms(data.forms || [])
      })
      .catch(() => setForms([]))
  }, [])

  if (forms.length === 0) return <p>No forms yet.</p>

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
      {forms.map((form) => (
        <div
          key={form.id}
          className="rounded-md border p-4 shadow transition hover:shadow-lg"
        >
          <h3 className="mb-2 text-lg font-semibold">
            {form.title || 'Untitled Form'}
          </h3>
          {form.description && (
            <p className="mb-2 text-gray-600">{form.description}</p>
          )}
          <p className="text-sm text-gray-500">
            Created at: {new Date(form.createdAt).toLocaleString()}
          </p>
          <Link
            href={`/forms/${form.id}`}
            className="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            View Form
          </Link>
        </div>
      ))}
    </div>
  )
}
