import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Form from '@/lib/models/Form'

export async function POST(req: NextRequest) {
  await dbConnect()
  const { title, description, schema } = await req.json()
  const form = await Form.create({ title, description, schema })
  return NextResponse.json({ id: form._id, success: true })
}
