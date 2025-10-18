import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import connectDB from '@/lib/mongodb'
import Task from '@/models/Task'
import User from '@/models/User'

export async function GET() {
  try {
    await connectDB()
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const trashTasks = await Task.find({
      userId: user._id,
      isDeleted: true
    }).sort({ deletedAt: -1 })

    return NextResponse.json(trashTasks)
  } catch (error) {
    console.error('Error fetching trash tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await connectDB()
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Permanently delete all tasks in trash
    const result = await Task.deleteMany({
      userId: user._id,
      isDeleted: true
    })

    return NextResponse.json({ 
      message: 'Trash emptied successfully',
      deletedCount: result.deletedCount 
    })
  } catch (error) {
    console.error('Error emptying trash:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
