import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authConfig from '@/auth.config'
import connectDB from '@/lib/mongodb'

export async function GET() {
  try {
    // Test environment variables
    const envCheck = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
    }

    // Test session
    const session = await getServerSession(authConfig)
    
    // Test MongoDB connection
    let mongoStatus = 'NOT TESTED'
    try {
      await connectDB()
      mongoStatus = 'CONNECTED'
    } catch (error) {
      mongoStatus = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    return NextResponse.json({
      status: 'OK',
      environment: envCheck,
      session: session ? {
        user: session.user?.email,
        expires: session.expires
      } : 'NO SESSION',
      mongodb: mongoStatus,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}