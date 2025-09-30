'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Trash2, Download } from 'lucide-react'

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
      fetchSubmissions()
    } catch (err) {
      console.error('Error deleting submission:', err)
    }
  }

  const handleDownload = () => {
    if (submissions.length === 0) return

    let mdContent = `# Submissions for Form ${formId}\n\n`

    submissions.forEach((sub, idx) => {
      mdContent += `## Submission ${idx + 1}\n`
      Object.entries(sub.response).forEach(([key, value]) => {
        mdContent += `- **${key}**: ${String(value)}\n`
      })
      mdContent += `- **Submitted At**: ${new Date(
        sub.createdAt
      ).toLocaleString()}\n\n`
    })

    const blob = new Blob([mdContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `form-${formId}-submissions.md`
    a.click()
    URL.revokeObjectURL(url)
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

  const fields = Object.keys(submissions[0].response || {})

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-unlock text-4xl font-semibold text-purple-700">
          Submissions
        </h2>
        <button
          onClick={handleDownload}
          className="flex cursor-pointer items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700"
        >
          <Download className="h-4 w-4" /> Download All
        </button>
      </div>

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
              <tr key={sub._id}>
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
                    <Trash2 className="h-4 w-4" />
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
