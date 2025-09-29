import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Submission from '@/lib/models/Submission'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect()

  const { id } = await context.params
  try {
    const submissions = await Submission.find({ formId: id }).sort({
      createdAt: -1,
    })
    return NextResponse.json({ success: true, submissions })
  } catch (err) {
    console.error('Error fetching submissions:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
