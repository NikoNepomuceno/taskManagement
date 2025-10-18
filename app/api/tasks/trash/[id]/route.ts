import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import connectDB from '@/lib/mongodb'
import Task from '@/models/Task'
import User from '@/models/User'
import mongoose from 'mongoose'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { action } = await request.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const task = await Task.findOne({
      _id: id,
      userId: user._id,
      isDeleted: true
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found in trash' }, { status: 404 })
    }

    if (action === 'restore') {
      // Restore task from trash
      task.isDeleted = false
      task.deletedAt = undefined
      await task.save()
      
      return NextResponse.json({ message: 'Task restored successfully' })
    } else if (action === 'permanent') {
      // Permanently delete task
      await Task.findByIdAndDelete(id)
      
      return NextResponse.json({ message: 'Task permanently deleted' })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error managing trash task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
