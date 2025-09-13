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

type ResponseRec = {
  id: string
  formId: string
  data: any
  submittedAt: string
}

const forms = new Map<string, FormRec>()
const responses: ResponseRec[] = []

export function saveForm({
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
  const r: FormRec = {
    id,
    prompt,
    title,
    spec,
    branding: branding ?? {},
    createdAt: new Date().toISOString(),
  }
  forms.set(id, r)
  return r
}

export function getForm(id: string) {
  return forms.get(id) ?? null
}

export function listForms() {
  return Array.from(forms.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  )
}

export function saveResponse(formId: string, data: any) {
  const rec: ResponseRec = {
    id: randomUUID(),
    formId,
    data,
    submittedAt: new Date().toISOString(),
  }
  responses.push(rec)
  return rec
}

export function listResponses(formId?: string) {
  return formId ? responses.filter((r) => r.formId === formId) : responses
}
