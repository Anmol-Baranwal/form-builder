// src/lib/inMemoryStore.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'crypto'

type FormRec = {
  id: string
  prompt: string
  title?: string
  branding?: any
  spec: any
  createdAt: string
}

const forms = new Map<string, FormRec>()

export function saveFormInMemory({
  prompt,
  title,
  spec,
  branding,
}: {
  prompt: string
  title?: string
  spec: any
  branding?: any
}) {
  const id = randomUUID()
  const rec: FormRec = {
    id,
    prompt,
    title,
    branding: branding ?? {},
    spec,
    createdAt: new Date().toISOString(),
  }
  forms.set(id, rec)
  return rec
}

export function getFormInMemory(id: string) {
  return forms.get(id) ?? null
}

export function listFormsInMemory() {
  return Array.from(forms.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  )
}
