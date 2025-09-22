// src/app/api/forms/list/route.ts
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Form from '@/lib/models/Form'
export async function GET() {
  await dbConnect()
  const forms = await Form.find({}, '_id title description createdAt')
    .sort({ createdAt: -1 })
    .lean()

  const formattedForms = forms.map((f) => ({
    id: String(f._id),
    title: f.title,
    description: f.description,
    createdAt: f.createdAt,
  }))
  return NextResponse.json({ forms: formattedForms })
}
