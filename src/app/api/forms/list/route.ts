// src/app/api/forms/list/route.ts
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { listFormsInMemory } from '@/lib/inMemoryStore'

export async function GET() {
  const items = listFormsInMemory().map((f) => ({
    id: f.id,
    title: f.title,
    prompt: f.prompt,
    createdAt: f.createdAt,
  }))
  return NextResponse.json({ forms: items })
}
