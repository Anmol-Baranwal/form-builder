import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Submission from '@/lib/models/Submission'
import mongoose from 'mongoose'

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; submissionId: string }> }
) {
  await dbConnect()

  const { id, submissionId } = await context.params

  if (!mongoose.Types.ObjectId.isValid(submissionId)) {
    return NextResponse.json(
      { success: false, error: 'Invalid submission ID' },
      { status: 400 }
    )
  }

  try {
    const deleted = await Submission.findOneAndDelete({
      _id: submissionId,
      formId: id,
    })

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting submission:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to delete submission' },
      { status: 500 }
    )
  }
}
