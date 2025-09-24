import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Submission from '@/lib/models/Submission'

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function extractFormData(llmMessage?: string) {
  if (!llmMessage || typeof llmMessage !== 'string') {
    console.error('extractFormData called with invalid input:', llmMessage)
    return null
  }
  const contextMatch = llmMessage.match(/<context>([\s\S]+)<\/context>/)
  if (!contextMatch) return null

  try {
    const jsonData = contextMatch[1]
    // Decode HTML entities if necessary
    const decoded = jsonData.replace(/&quot;/g, '"')
    const parsed = JSON.parse(decoded)

    if (Array.isArray(parsed) && parsed.length > 0) {
      const formsData = parsed[0][1]
      if (formsData && formsData.contact_form) {
        return formsData.contact_form
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

  console.log('response', response)

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
