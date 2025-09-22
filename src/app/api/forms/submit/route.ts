import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Submission from '@/lib/models/Submission'

export async function POST(req: NextRequest) {
  await dbConnect()
  const { formId, response } = await req.json()
  await Submission.create({ formId, response })
  return NextResponse.json({ success: true })
}
