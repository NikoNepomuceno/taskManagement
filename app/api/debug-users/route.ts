import { NextResponse } from 'next/server'
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

    // Get all users
    const users = await User.find({}).sort({ createdAt: -1 })
    
    // Check if current user exists
    const currentUser = await User.findOne({ email: session.user.email })
    
    return NextResponse.json({
      totalUsers: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      })),
      currentUser: currentUser ? {
        id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        createdAt: currentUser.createdAt
      } : null,
      session: {
        email: session.user.email,
        name: session.user.name
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

