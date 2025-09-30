'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function SubmissionsPage() {
  const params = useParams()
  const formId = params?.id as string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubmissions = async () => {
    if (!formId) return
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

  useEffect(() => {
    fetchSubmissions()
  }, [formId])

  const handleDelete = async (submissionId: string) => {
    try {
      await fetch(`/api/forms/${formId}/submissions/${submissionId}`, {
        method: 'DELETE',
      })
      // re-fetch after delete
      fetchSubmissions()
    } catch (err) {
      console.error('Error deleting submission:', err)
    }
  }

  if (loading) {
    return (
      <div className="mt-20 flex justify-center text-xl text-gray-500">
        Loading submissions...
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="mt-20 flex justify-center text-lg text-gray-400">
        No submissions yet for this form.
      </div>
    )
  }

  // Take schema from first submission (assuming consistent fields per form)
  const fields = Object.keys(submissions[0].response || {})

  return (
    <div className="p-6">
      <h2 className="font-unlock mt-6 mb-8 flex justify-center text-4xl font-semibold text-purple-700">
        Submissions
      </h2>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead className="bg-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-black">#</th>
              {fields.map((field) => (
                <th
                  key={field}
                  className="px-4 py-3 text-left font-medium text-black capitalize"
                >
                  {field}
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium text-black">
                Submitted At
              </th>
              <th className="px-4 py-3 text-left font-medium text-black">
                Delete
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-gray-200">
            {submissions.map((sub, idx) => (
              <tr key={sub._id} className="">
                <td className="px-3 py-3 text-gray-800">{idx + 1}</td>
                {fields.map((field) => (
                  <td key={field} className="px-3 py-3 text-gray-800">
                    {String(sub.response[field] ?? '')}
                  </td>
                ))}
                <td className="px-4 py-3 text-xs text-gray-800">
                  {new Date(sub.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs text-gray-800">
                  <button
                    onClick={() => handleDelete(sub._id)}
                    className="cursor-pointer text-red-400"
                  >
                    <Trash2 className={'h-4 w-4'} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
