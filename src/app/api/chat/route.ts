/* eslint-disable @typescript-eslint/no-explicit-any */

export const runtime = 'nodejs'
import { dbConnect } from '@/lib/dbConnect'
import Form from '@/lib/models/Form'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { transformStream } from '@crayonai/stream'

const systemPrompt = `
You are a form-builder assistant.
Rules:
- If the user asks to create a form, respond with a UI JSON spec wrapped in <content>...</content>.
- Use components like "Form", "Field", "Input", "Select" etc.
- If the user says "save this form" or equivalent, DO NOT generate any new form or UI elements. Instead, acknowledge the save and drive the saving logic on the backend.
- Avoid plain text outside <content> for form outputs.
- For non-form queries reply normally.
<ui_rules>
- Wrap UI JSON in <content> tags so GenUI can render it.
</ui_rules>
`

// 🔑 Persist form spec across requests
const globalForFormCache = global as unknown as { lastFormSpec?: any }

export async function POST(req: NextRequest) {
  try {
    const incoming = await req.json()
    console.log(
      '[api/chat] raw incoming:',
      JSON.stringify(incoming).slice(0, 1000)
    )

    // Normalize client structure
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
      return new NextResponse(
        JSON.stringify({
          error: 'Invalid chat payload: missing messages/prompt',
        }),
        { status: 400 }
      )
    }

    const messagesToSend = [
      { role: 'system', content: systemPrompt },
      ...incomingMessages,
    ]

    // Prepare Thesys API call (OpenAI-compatible)
    const client = new OpenAI({
      baseURL: 'https://api.thesys.dev/v1/embed',
      apiKey: process.env.THESYS_API_KEY,
    })

    function isSaveIntent(messages: string | any[]) {
      const saveWords = ['save this form', 'finalize', 'store form', 'done']
      const lastMessage =
        messages[messages.length - 1]?.content?.toLowerCase() || ''
      return saveWords.some((w) => lastMessage.includes(w))
    }

    function decodeHtmlEntities(text: string): string {
      return text
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
    }

    const llmStream = await client.chat.completions.create({
      model:
        process.env.THESYS_MODEL || 'c1/anthropic/claude-3.5-sonnet/v-20250709',
      messages: messagesToSend,
      stream: true,
    })

    // Use transformStream to pipe streaming data to C1Chat
    const responseStream = transformStream(
      llmStream,
      (chunk) => chunk?.choices?.[0]?.delta?.content ?? '',
      {
        onEnd: async ({ accumulated }) => {
          const rawSpec = Array.isArray(accumulated)
            ? accumulated.join('')
            : accumulated

          const match = rawSpec.match(/<content>([\s\S]+)<\/content>/)
          if (match) {
            const extractedContent = decodeHtmlEntities(match[1].trim())
            console.log('📜 UI Spec received from LLM:', extractedContent)

            try {
              const schema = JSON.parse(extractedContent)
              const hasForm =
                JSON.stringify(schema).includes('"component":"Form"')

              if (hasForm) {
                globalForFormCache.lastFormSpec = schema
                console.log('💾 Stored last form schema globally')
              }
            } catch (err) {
              console.error('❌ Failed to parse schema JSON:', err)
            }
          }

          // ✅ On save intent, persist the *last remembered* schema
          if (isSaveIntent(incomingMessages)) {
            const cachedForm = globalForFormCache.lastFormSpec
            if (cachedForm) {
              await dbConnect()
              const doc = await Form.create({
                title: 'Untitled Form',
                description: 'Generated via chat',
                schema: cachedForm,
              })
              console.log(
                '✅ Saved last form schema to Mongo with ID:',
                doc._id.toString()
              )
            } else {
              console.warn('⚠️ Save intent but no cached form schema found')
            }
          }
        },
      }
    ) as ReadableStream<string>

    return new NextResponse(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (err: any) {
    console.error('[api/chat] handler error:', err)
    return new NextResponse(
      JSON.stringify({ error: err?.message ?? String(err) }),
      { status: 500 }
    )
  }
}
