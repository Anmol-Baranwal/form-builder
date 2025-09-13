/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/getForm/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getForm } from '../../../lib/inMemoryStore'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const formId = url.searchParams.get('formId')
    if (!formId)
      return NextResponse.json({ error: 'formId required' }, { status: 400 })

    const form = getForm(formId)
    if (!form) return NextResponse.json({ error: 'not found' }, { status: 404 })

    // form.spec will already be parsed (object) if generateForm saved it as such.
    return NextResponse.json({
      formSpec: form.spec,
      meta: { title: form.title, branding: form.branding, prompt: form.prompt },
    })
  } catch (err: any) {
    console.error('getForm error', err)
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    )
  }
}
