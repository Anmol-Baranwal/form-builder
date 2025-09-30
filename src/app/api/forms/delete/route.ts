import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Form from '@/lib/models/Form'

export async function DELETE(req: NextRequest) {
  await dbConnect()

  try {
    const { id } = await req.json()
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Form ID is required' },
        { status: 400 }
      )
    }

    await Form.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting form:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to delete form' },
      { status: 500 }
    )
  }
}
