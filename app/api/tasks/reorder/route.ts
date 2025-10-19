import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import connectDB from '@/lib/mongodb'
import Task from '@/models/Task'
import User from '@/models/User'

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure there is a corresponding User document for the authenticated account
    let user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { taskIds } = body

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: 'Invalid task IDs provided' }, { status: 400 })
    }

    // Update the order for each task
    const updatePromises = taskIds.map((taskId: string, index: number) => 
      Task.findOneAndUpdate(
        { _id: taskId, userId: user._id, isDeleted: { $ne: true } },
        { order: index },
        { new: true }
      )
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
