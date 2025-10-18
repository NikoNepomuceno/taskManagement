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

    // Ensure there is a corresponding User document for the authenticated account
    let user = await User.findOne({ email: session.user.email })
    if (!user) {
      user = await User.create({
        name: session.user.name || session.user.email.split('@')[0],
        email: session.user.email,
        image: session.user.image,
      })
    }

    const tasks = await Task.find({ userId: user._id }).sort({ createdAt: -1 })
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure there is a corresponding User document for the authenticated account
    let user = await User.findOne({ email: session.user.email })
    if (!user) {
      user = await User.create({
        name: session.user.name || session.user.email.split('@')[0],
        email: session.user.email,
        image: session.user.image,
      })
    }

    const body = await request.json()
    const { title, description, dueDate, priority = 'medium' } = body

    const task = new Task({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      userId: user._id,
    })

    await task.save()
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
