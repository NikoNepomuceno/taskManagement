import { NextResponse } from 'next/server'

export async function GET() {
  const envCheck = {
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    MONGODB_URI: !!process.env.MONGODB_URI,
  }

  return NextResponse.json({
    message: 'Environment variables check',
    env: envCheck,
    missing: Object.entries(envCheck)
      .filter(([_, exists]) => !exists)
      .map(([key]) => key)
  })
}
