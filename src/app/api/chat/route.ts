/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/chat/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { saveFormInMemory } from '@/lib/inMemoryStore' // optional; only if SAVE_FORMS=true

const systemPrompt = `
You are a form-builder assistant.
Rules:
- If the user asks to create a form, respond with a UI JSON spec wrapped in <content>...</content>.
- Use components like "Form", "Field", "Input", "Select" etc.
- Avoid plain text outside <content> for form outputs.
- For non-form queries reply normally.
<ui_rules>
- Wrap UI JSON in <content> tags so GenUI can render it.
</ui_rules>
`

function decodeHtmlEntities(s: string) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

export async function POST(request: Request) {
  try {
    const incoming = await request.json()
    console.log(
      '[api/chat] raw incoming:',
      JSON.stringify(incoming).slice(0, 1000)
    )

    // Normalize client shapes -> messages array
    let incomingMessages: any[] = []
    if (Array.isArray(incoming.messages)) incomingMessages = incoming.messages
    else if (incoming.message && typeof incoming.message === 'object')
      incomingMessages = [incoming.message]
    else if (incoming.prompt) {
      if (typeof incoming.prompt === 'string')
        incomingMessages = [{ role: 'user', content: incoming.prompt }]
      else if (typeof incoming.prompt === 'object') {
        const p = incoming.prompt
        incomingMessages = [
          { role: p.role ?? 'user', content: p.content ?? JSON.stringify(p) },
        ]
      }
    }

    if (incomingMessages.length === 0) {
      console.error(
        '[api/chat] missing messages after normalize:',
        JSON.stringify(incoming).slice(0, 1000)
      )
      return NextResponse.json(
        { error: 'Invalid chat payload: missing messages/prompt' },
        { status: 400 }
      )
    }

    const messagesToSend = [
      { role: 'system', content: systemPrompt },
      ...incomingMessages,
    ]

    // 🔥 Add rules here
    const requestBody = {
      model: process.env.THESYS_MODEL || 'c1-nightly',
      threadId: incoming.threadId,
      responseId: incoming.responseId,
      messages: messagesToSend,
      rules: {
        systemui: [
          {
            id: 'form-builder-ui',
            description:
              'Generate dynamic form UI components based on user request',
            components: [
              'Form',
              'Input',
              'Button',
              'Card',
              'CardHeader',
              'TextContent',
            ],
          },
        ],
        prompt: [
          {
            id: 'form-builder-prompt',
            description:
              'User is asking for forms. Generate structured component JSON with appropriate fields.',
            examples: [
              {
                input: 'create a form for me with name and email',
                output: {
                  component: 'Form',
                  props: {
                    children: [
                      {
                        component: 'Input',
                        props: { label: 'Name', type: 'text' },
                      },
                      {
                        component: 'Input',
                        props: { label: 'Email', type: 'email' },
                      },
                      { component: 'Button', props: { text: 'Submit' } },
                    ],
                  },
                },
              },
            ],
          },
        ],
      },
    }

    console.log('[api/chat] calling Thesys (messages omitted)')
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
      const txt = await thRes.text()
      console.error(
        '[api/chat] Thesys error:',
        thRes.status,
        txt.slice(0, 2000)
      )
      return NextResponse.json({ error: txt }, { status: thRes.status })
    }

    const thJson = await thRes.json()
    console.log(
      '[api/chat] Thesys raw response (truncated):',
      JSON.stringify(thJson).slice(0, 2000)
    )

    const choice = thJson?.choices?.[0]?.message ?? null
    if (!choice && Array.isArray(thJson?.messages)) {
      return NextResponse.json(thJson)
    }
    if (!choice) return NextResponse.json(thJson)

    // 🔑 FIX: Strip <content> wrapper and parse
    const rawContent = choice.content ?? ''
    const cleaned = rawContent
      .replace(/^<content>/, '')
      .replace(/<\/content>$/, '')
      .trim()

    let parsedContent: any = cleaned
    try {
      parsedContent = JSON.parse(decodeHtmlEntities(cleaned))
      console.log('[api/chat] parsed content:', parsedContent)
    } catch (err) {
      console.warn('[api/chat] Could not parse JSON, sending raw string:', err)
    }

    let finalContent = parsedContent
    if (typeof parsedContent === 'object') {
      finalContent = `<content>${JSON.stringify(parsedContent)}</content>`
      console.log('[api/chat] final content:', finalContent)
    }

    return NextResponse.json({
      id: incoming.responseId,
      type: 'message',
      role: 'assistant',
      content: finalContent,
    })
  } catch (err: any) {
    console.error('[api/chat] handler error:', err)
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    )
  }
}
