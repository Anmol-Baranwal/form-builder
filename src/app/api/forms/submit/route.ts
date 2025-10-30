/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Submission from '@/lib/models/Submission'

function extractFormData(llmMessage?: string) {
  if (!llmMessage || typeof llmMessage !== 'string') {
    console.error('extractFormData called with invalid input:', llmMessage)
    return null
  }

  const contextMatch = llmMessage.match(/<context>([\s\S]+)<\/context>/)
  if (!contextMatch) return null

  try {
    const jsonData = contextMatch[1]
    const decoded = jsonData.replace(/&quot;/g, '"')
    const parsed = JSON.parse(decoded)

    // parsed = ["User clicked on Button: submit_button", [{contact_form: {...}}]]
    if (
      Array.isArray(parsed) &&
      parsed.length >= 2 &&
      Array.isArray(parsed[1]) &&
      parsed[1].length > 0 &&
      typeof parsed[1][0] === 'object'
    ) {
      // Usually the first object in parsed[1] has the form data
      const formObj = parsed[1][0]
      // formObj is something like {contact_form: { ...fields... }}

      const formKey = Object.keys(formObj)[0]
      const fieldsObj = formObj[formKey]

      // shallow object mapping field name to value
      if (fieldsObj && typeof fieldsObj === 'object') {
        const fieldValues: Record<string, any> = {}
        for (const [field, data] of Object.entries(
          fieldsObj as Record<string, { value: any }>
        )) {
          fieldValues[field] = data.value
        }
        return fieldValues
      }
    }
    return null
  } catch (e) {
    console.error('Failed to parse llmFriendlyMessage context JSON:', e)
    return null
  }
}

export async function POST(req: NextRequest) {
  await dbConnect()
  const { formId, response } = await req.json()

  if (!response) {
    return NextResponse.json(
      { success: false, error: 'Missing response data' },
      { status: 400 }
    )
  }

  const formData = extractFormData(response)
  if (!formData) {
    return NextResponse.json(
      { success: false, error: 'Failed to parse form data' },
      { status: 400 }
    )
  }

  await Submission.create({ formId, response: formData })
  return NextResponse.json({ success: true })
}
