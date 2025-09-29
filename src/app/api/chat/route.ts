/* eslint-disable @typescript-eslint/no-explicit-any */

export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { transformStream } from '@crayonai/stream'

const systemPrompt = `
You are a form-builder assistant.
Rules:
- If the user asks to create a form, respond with a UI JSON spec wrapped in <content>...</content>.
- Use components like "Form", "Field", "Input", "Select" etc.
- If the user says "save this form" or equivalent:
  - DO NOT generate any new form or UI elements.
  - Instead, acknowledge the save implicitly.
  - When asking the user for form title and description, generate a form with name="save-form" and two fields:
    - Input with name="formTitle"
    - TextArea with name="formDescription"
    - Do not change these property names.
  - Wait until the user provides both title and description.
  - Only after receiving title and description, confirm saving and drive the saving logic on the backend.
- Avoid plain text outside <content> for form outputs.
- For non-form queries reply normally.
<ui_rules>
- Wrap UI JSON in <content> tags so GenUI can render it.
</ui_rules>
`

// 🔑 Persist form spec across requests
const globalForFormCache = global as unknown as {
  lastFormSpec?: any
  saveFormSpec?: any
}

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

    function isMetaForm(schema: any) {
      // Detects a "save" metadata UI, eg. form with title/desc fields, not user form
      // This will depend on your actual LLM responses; for most, form name or root CardHeader can be detected
      const formName = schema?.component?.props?.children?.find?.(
        (c: { component: string }) => c.component === 'Form'
      )?.props?.name
      return formName === 'save-form'
    }

    function extractTitleDesc(messages: any[]) {
      let title = null,
        description = null

      console.log('Extracting title/desc from messages:', messages.length)

      for (const m of [...messages].reverse()) {
        console.log(`Message content:`, m.content)
        // 1. Try to parse context JSON
        if (m.content?.includes('<context>')) {
          try {
            const contextMatch = m.content.match(
              /<context>([\s\S]+)<\/context>/
            )
            if (contextMatch) {
              const parsed = JSON.parse(decodeHtmlEntities(contextMatch[1]))
              console.log(
                'Parsed context JSON for title/desc:',
                JSON.stringify(parsed).slice(0, 500)
              )
              if (Array.isArray(parsed) && parsed[1]?.[0]?.['save-form']) {
                const formData = parsed[1][0]['save-form']
                title = formData['formTitle']?.value ?? title
                description = formData['formDescription']?.value ?? description
                console.log('Extracted from save-form:', { title, description })
              }
            }
          } catch (err) {
            console.warn('⚠️ Failed to parse context JSON for title/desc:', err)
          }
        }

        // 2. Fallback: plain "title:" / "description:" message style
        const content = m.content?.toLowerCase()
        // if (content?.startsWith('title:')) title = m.content.slice(6).trim()
        // if (content?.startsWith('description:'))
        //   description = m.content.slice(12).trim()

        // if (title && description) break
        if (content?.startsWith('title:')) {
          title = m.content.slice(6).trim()
          console.log('Extracted from plain text title:', title)
        }
        if (content?.startsWith('description:')) {
          description = m.content.slice(12).trim()
          console.log('Extracted from plain text description:', description)
        }

        if (title && description) {
          console.log('Title and description found, stopping search')
          break
        }
      }

      return { title, description }
    }

    function isSaveIntent(messages: any[]) {
      const lastContent = messages[messages.length - 1]?.content || ''

      // case 1: user submitted the save-form
      if (
        lastContent.includes('<context>') &&
        lastContent.includes('save-form')
      ) {
        return true
      }

      // case 2: plain words like "save this form" (but NO context yet) → so not final
      return false
    }

    function decodeHtmlEntities(text: string): string {
      return text
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
    }

    function isConfirmationUI(schema: any) {
      // If the root Card contains a header with title "Form Saved Successfully" (pattern)
      const header = schema?.component?.props?.children?.find(
        (c: any) => c.component === 'CardHeader'
      )
      return header?.props?.title === 'Form Saved Successfully'
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

          console.log('📜 running onend callback')

          const match = rawSpec.match(/<content>([\s\S]+)<\/content>/)
          if (match) {
            const extractedContent = decodeHtmlEntities(match[1].trim())
            console.log('📜 UI Spec received from LLM:', extractedContent)

            try {
              const schema = JSON.parse(extractedContent)
              if (isMetaForm(schema)) {
                globalForFormCache.saveFormSpec = schema
                console.log('🔸 Cached save metadata form')
              } else if (!isConfirmationUI(schema)) {
                globalForFormCache.lastFormSpec = schema
                console.log('💾 Cached user form schema')
              } else {
                console.log('⛔️ Ignored confirmation UI schema')
              }
            } catch (err) {
              console.error('❌ Failed to parse schema JSON:', err)
            }
          }

          // ✅ On save intent, persist the *last remembered* schema
          if (isSaveIntent(incomingMessages)) {
            const { title, description } = extractTitleDesc(incomingMessages)
            console.log('On save intent, extracted title/description:', {
              title,
              description,
            })
            const cachedForm = globalForFormCache.lastFormSpec
            if (cachedForm) {
              const origin = req.nextUrl.origin
              await fetch(`${origin}/api/forms/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title,
                  description,
                  schema: cachedForm,
                }),
              })
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
