/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { saveForm } from '../../../lib/inMemoryStore'

// ---- SYSTEM PROMPT ----
const systemPrompt = `
You are a form-builder assistant.

Rules:
- When the user asks to "create a form", reply ONLY with a valid UI JSON spec wrapped in <content> tags.
- Use a "Form" component with children "Field" components.
- Each "Field" must have props: id, label, type (e.g. "text", "email", "number").
- Always close with <content> ... </content>.
- After form creation, you may also include a Link component pointing to "/forms/{formId}" where the saved form can be viewed.
- For non-form queries, respond conversationally (no UI JSON unless relevant).

<ui_rules>
- When the assistant replies with UI JSON wrapped in <content> tags, the frontend must render that JSON spec using C1Component.
</ui_rules>
`

export async function POST(request: Request) {
  try {
    const incoming = await request.json()
    if (!Array.isArray(incoming.messages)) {
      if (incoming.prompt && typeof incoming.prompt === 'object') {
        incoming.messages = [incoming.prompt]
      } else {
        console.error(
          'Invalid /api/chat payload, missing messages array:',
          incoming
        )
        return NextResponse.json(
          {
            error: 'Invalid chat request payload: `messages` must be an array',
          },
          { status: 400 }
        )
      }
    }

    const messagesToSend = [
      { role: 'system', content: systemPrompt },
      ...incoming.messages,
    ]

    // ---- CALL THESYS ----
    const requestBody = {
      model:
        process.env.THESYS_MODEL || 'c1/anthropic/claude-3.5-sonnet/v-20250709',
      threadId: incoming.threadId,
      responseId: incoming.responseId,
      messages: messagesToSend,
    }
    console.log(
      '[api/chat] Thesys request body:',
      JSON.stringify(requestBody, null, 2)
    )
    const thRes = await fetch(
      'https://api.thesys.dev/v1/embed/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.THESYS_API_KEY ?? ''}`,
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!thRes.ok) {
      const errText = await thRes.text()
      return NextResponse.json({ error: errText }, { status: thRes.status })
    }

    const thJson = await thRes.json()
    console.log('[api/chat] Thesys response:', JSON.stringify(thJson, null, 2))
    const choiceMsg = thJson?.choices?.[0]?.message
    console.log('[api/chat] choiceMsg:', JSON.stringify(choiceMsg, null, 2))
    const content = choiceMsg?.content
    console.log('[api/chat] content:', content)
    const role = choiceMsg?.role ?? 'assistant'

    if (!content) {
      return NextResponse.json(
        { error: 'No content from Thesys' },
        { status: 500 }
      )
    }

    // ---- DETECT FORM CREATION ----
    // Look for UI JSON spec wrapped in <content>...</content>
    const match = content.match(/<content>([\s\S]*?)<\/content>/)
    if (match) {
      const raw = match[1].trim()
      console.log('[api/chat] Detected form spec raw:', raw)
      // HTML-unescape common entities before JSON parse
      const decoded = raw
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
      console.log('[api/chat] Decoded form spec:', decoded)
      let spec: any = decoded
      try {
        spec = JSON.parse(decoded)
        console.log(
          '[api/chat] Parsed form spec:',
          JSON.stringify(spec, null, 2)
        )
      } catch (err) {
        console.log(
          '[api/chat] Error parsing JSON form spec, using decoded string:',
          err
        )
      }
      // unwrap nested component wrapper if needed (spec.component.component)
      if (
        spec &&
        typeof spec === 'object' &&
        spec.component &&
        typeof spec.component === 'object' &&
        typeof spec.component.component === 'string'
      ) {
        console.log('[api/chat] Unwrapping nested component:', spec.component)
        spec = spec.component
      }
      const lastUser = incoming.messages
        .slice()
        .reverse()
        .find((m: any) => m.role === 'user')
      const prompt = lastUser?.content ?? ''
      const rec = saveForm({
        prompt,
        spec,
        title: spec?.title,
        branding: spec?.branding,
      })
      const linkSpec = {
        component: 'Link',
        props: {
          href: `/forms/${rec.id}`,
          text: '✅ Form created! View it here',
        },
      }
      const linkMsg = `<content>${JSON.stringify(linkSpec)}</content>`
      return NextResponse.json({
        messages: [
          { role, content: `<content>${JSON.stringify(spec)}</content>` },
          { role, content: linkMsg },
        ],
      })
    }

    // ---- NORMAL PASS-THROUGH ----
    return NextResponse.json({ messages: [choiceMsg] })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? String(err) },
      { status: 500 }
    )
  }
}
