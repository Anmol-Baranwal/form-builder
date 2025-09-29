import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Form from '@/lib/models/Form'

export async function GET(req: NextRequest) {
  await dbConnect()
  const id = req.nextUrl.searchParams.get('id')
  const form = await Form.findById(id)
  if (!form)
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  return NextResponse.json({ schema: form.schema, title: form.title })
}
