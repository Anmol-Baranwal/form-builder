/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/generateForm/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { saveForm } from '../../../lib/inMemoryStore'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prompt, title, branding } = body ?? {}
    if (!prompt)
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })

    const thRes = await fetch(
      'https://api.thesys.dev/v1/embed/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.THESYS_API_KEY ?? ''}`,
        },
        body: JSON.stringify({
          model:
            process.env.THESYS_MODEL ||
            'c1/anthropic/claude-3.5-sonnet/v-20250709',
          messages: [{ role: 'user', content: prompt }],
        }),
      }
    )

    if (!thRes.ok) {
      const errText = await thRes.text()
      console.error(
        'Thesys generateForm non-ok:',
        thRes.status,
        errText.slice ? errText.slice(0, 2000) : errText
      )
      return NextResponse.json(
        { error: 'Thesys error' },
        { status: thRes.status }
      )
    }

    const thJson = await thRes.json()

    // Extract the assistant's message content. Could be:
    // - a JS object (already parsed)
    // - a JSON string (the C1 UI spec string)
    const rawContent = thJson?.choices?.[0]?.message?.content ?? thJson
    let formSpec: any = rawContent

    // If Thesys returned a JSON string, try to parse it.
    if (typeof rawContent === 'string') {
      const trimmed = rawContent.trim()
      if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ) {
        try {
          formSpec = JSON.parse(trimmed)
        } catch (e) {
          // not JSON — keep as string
          formSpec = rawContent
        }
      }
    }

    const saved = saveForm({
      prompt,
      title,
      spec: formSpec,
      branding: branding ?? {},
    })
    return NextResponse.json({ formId: saved.id, formSpec: saved.spec })
  } catch (err: any) {
    console.error('generateForm error', err)
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    )
  }
}
