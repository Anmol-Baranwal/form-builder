export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

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
`

async function saveForm(formId: string, formSpec: string) {
  const dir = path.join(process.cwd(), 'forms')
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, `${formId}.json`), formSpec, 'utf-8')
}

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
          threadId: incoming.threadId,
          responseId: incoming.responseId,
          messages: messagesToSend,
        }),
      }
    )

    if (!thRes.ok) {
      const errText = await thRes.text()
      return NextResponse.json({ error: errText }, { status: thRes.status })
    }

    const thJson = await thRes.json()
    const choiceMsg = thJson?.choices?.[0]?.message
    const content = choiceMsg?.content
    const role = choiceMsg?.role ?? 'assistant'

    if (!content) {
      return NextResponse.json(
        { error: 'No content from Thesys' },
        { status: 500 }
      )
    }

    // ---- DETECT FORM CREATION ----
    if (content.includes('"component":"Form"')) {
      const formId = crypto.randomUUID()
      await saveForm(formId, content)

      // augment with a link
      const linkMsg = `<content>{
        "component": "Link",
        "props": {
          "href": "/forms/${formId}",
          "text": "✅ Form created! View it here"
        }
      }</content>`

      return NextResponse.json({
        messages: [
          { role, content }, // original form spec
          { role, content: linkMsg }, // link to saved form
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
