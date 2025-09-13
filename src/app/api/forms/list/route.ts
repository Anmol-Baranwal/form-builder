import { NextResponse } from 'next/server'
import { listForms } from '../../../../lib/inMemoryStore'

export async function GET() {
  const forms = listForms().map((f) => ({
    id: f.id,
    title: f.title,
    prompt: f.prompt,
    createdAt: f.createdAt,
  }))
  return NextResponse.json({ forms })
}
