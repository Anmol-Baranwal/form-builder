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

  if (forms.length === 0) {
    return (
      <div className="mt-20 flex items-center justify-center text-xl text-gray-400 lg:text-3xl">
        No forms yet.{' '}
        <Link href={`/`} className="mx-2 underline">
          Create one
        </Link>{' '}
        to get started ✨
      </div>
    )
  }

  return (
    <div className="">
      <h2 className="font-unlock mt-10 flex justify-center text-4xl font-semibold">
        Forms List
      </h2>
      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <div
            key={form.id}
            className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-xl"
          >
            <div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                {form.title || 'Untitled Form'}
              </h3>
              {form.description && (
                <p className="mb-2 text-sm text-gray-600">{form.description}</p>
              )}
              <p className="text-xs text-gray-400">
                {new Date(form.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <Link
                href={`/forms/${form.id}`}
                className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-purple-700"
              >
                View Form
              </Link>
              <Link
                href={`/forms/${form.id}/submissions`}
                className="flex-1 rounded-lg border-2 border-purple-600 px-4 py-2 text-center text-sm font-medium text-purple-600 transition hover:bg-blue-50"
              >
                Submissions
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
