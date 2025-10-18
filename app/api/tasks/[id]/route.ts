import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import connectDB from '@/lib/mongodb'
import Task from '@/models/Task'
import User from '@/models/User'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { title, description, dueDate, priority, completed } = body
    const { id } = await params

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: user._id },
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(priority && { priority }),
        ...(completed !== undefined && { completed }),
      },
      { new: true }
    )

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params
    const task = await Task.findOneAndDelete({ _id: id, userId: user._id })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
