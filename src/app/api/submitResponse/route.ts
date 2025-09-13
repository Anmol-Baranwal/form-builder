import { NextResponse } from 'next/server'
import { saveResponse } from '../../../lib/inMemoryStore'

export async function POST(request: Request) {
  const { formId, answers } = await request.json()
  if (!formId || !answers)
    return NextResponse.json({ error: 'Missing' }, { status: 400 })

  const rec = saveResponse(formId, answers)
  return NextResponse.json({ success: true, id: rec.id })
}
