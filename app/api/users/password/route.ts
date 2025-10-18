import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For OAuth users (Google), we don't have a password to verify
    // In a real application, you might want to implement a different flow
    // For now, we'll just update the theme preference
    if (!user.password) {
      return NextResponse.json({ 
        error: 'Password change not available for OAuth accounts. Please use your Google account to manage your password.' 
      }, { status: 400 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await User.findOneAndUpdate(
      { email: session.user.email },
      { password: hashedNewPassword }
    )

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
