import { db } from '@/db/client'
import { authAccounts, authenticators, sessions, users } from '@/db/schema'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: db
    ? DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: authAccounts,
        sessionsTable: sessions,
        authenticatorsTable: authenticators,
      })
    : undefined,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
})
