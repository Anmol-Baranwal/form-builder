/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/getForm/route.ts
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { getFormInMemory, listFormsInMemory } from '@/lib/inMemoryStore'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const formId = url.searchParams.get('formId')
    if (!formId)
      return NextResponse.json({ error: 'formId required' }, { status: 400 })
    const f = getFormInMemory(formId)
    if (!f) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({
      formSpec: f.spec,
      meta: { title: f.title, branding: f.branding, prompt: f.prompt },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    )
  }
}
