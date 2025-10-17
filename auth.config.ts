import Google from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import { NextAuthOptions } from 'next-auth'

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development, use a global variable so the value is preserved across module reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI!)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production, create a new MongoClient
  client = new MongoClient(process.env.MONGODB_URI!)
  clientPromise = client.connect()
}

export default {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 2 * 60 * 60, // 2 hours
  },
  pages: {
    signIn: '/auth/login',
  },
  trustHost: true,
} satisfies NextAuthOptions

declare global {
  var _mongoClientPromise: Promise<MongoClient>
}


