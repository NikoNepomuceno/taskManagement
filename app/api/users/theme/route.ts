import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import connectDB from '@/lib/mongodb'
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

    return NextResponse.json({ theme: user.theme || 'system' })
  } catch (error) {
    console.error('Error fetching user theme:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { theme } = await request.json()
    
    if (!theme || !['light', 'dark', 'system'].includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme value' }, { status: 400 })
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { theme },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ theme: user.theme })
  } catch (error) {
    console.error('Error updating user theme:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
