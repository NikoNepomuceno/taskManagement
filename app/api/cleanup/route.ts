import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Task from '@/models/Task'

export async function POST() {
  try {
    await connectDB()
    
    // Delete tasks that have been in trash for more than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const result = await Task.deleteMany({
      isDeleted: true,
      deletedAt: { $lt: thirtyDaysAgo }
    })
    
    return NextResponse.json({ 
      message: 'Cleanup completed successfully',
      deletedCount: result.deletedCount 
    })
  } catch (error) {
    console.error('Error during cleanup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
