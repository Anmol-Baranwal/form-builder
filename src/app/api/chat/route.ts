/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/chat/route.ts

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
      // threadId: incoming.threadId,
      // responseId: incoming.responseId,
      messages: messagesToSend,
      stream: true,
    })

    // Use transformStream to pipe streaming data to C1Chat
    const responseStream = transformStream(
      llmStream,
      (chunk) => {
        // Each streamed chunk has .choices[0].delta.content (NOT .choices.delta.content!)
        // Make sure it's the right path
        return chunk?.choices?.[0]?.delta?.content ?? ''
      },
      {
        onEnd: async ({ accumulated }) => {
          if (isSaveIntent(incomingMessages)) {
            // Extract schema from the accumulated string
            // Example: <content>{ ... UI JSON ... }</content>
            const rawSpec = Array.isArray(accumulated)
              ? accumulated.join('')
              : accumulated
            const match = rawSpec.match(/<content>([\s\S]+)<\/content>/)

            if (match) {
              let schema
              let extractedContent = match[1].trim()
              extractedContent = decodeHtmlEntities(extractedContent)
              try {
                schema = JSON.parse(extractedContent)
              } catch {
                console.warn(
                  'Content inside <content> tags is not JSON, treating as plain string:',
                  extractedContent
                )
                // If it's a plain string indicating a save command, handle accordingly or skip save.
                return
              }
              if (schema) {
                await dbConnect()
                await Form.create({
                  title: 'Untitled Form',
                  description: 'Generated via chat',
                  schema,
                })
                console.log('Form schema auto-saved from chat!')
                // Optionally respond with form ID or shareable link for confirmation
              }
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
