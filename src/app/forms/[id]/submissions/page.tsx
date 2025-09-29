'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function SubmissionsPage() {
  const params = useParams()
  const formId = params?.id as string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!formId) return
    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`/api/forms/${formId}/submissions`)
        const data = await res.json()
        if (data.success) {
          setSubmissions(data.submissions)
        }
      } catch (err) {
        console.error('Error fetching submissions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [formId])

  if (loading) return <p>Loading submissions...</p>

  if (submissions.length === 0) return <p>No submissions yet for this form.</p>

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold">Submissions</h1>
      <div className="space-y-4">
        {submissions.map((sub, idx) => (
          <div key={sub._id} className="rounded-lg border p-4 shadow-sm">
            <h2 className="font-semibold">Submission #{idx + 1}</h2>
            <ul className="mt-2 space-y-1">
              {Object.entries(sub.response).map(([field, value]) => (
                <li key={field}>
                  <strong>{field}:</strong> {String(value)}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              {new Date(sub.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
