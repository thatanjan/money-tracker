import { db } from '@/db/client'
import { accounts } from '@/db/schema'
import { auth } from '@/lib/auth'
import { desc, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createAccountSchema = z.object({
  name: z.string().min(2).max(50),
  currency: z.string().min(3),
  balance: z.number().min(0),
  icon: z.string().min(1),
  color: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const validatedData = createAccountSchema.parse(body)

    const [newAccount] = await db
      .insert(accounts)
      .values({
        userId: session.user.id!,
        name: validatedData.name,
        currency: validatedData.currency,
        balance: validatedData.balance.toString(),
        icon: validatedData.icon,
        color: validatedData.color,
      })
      .returning()

    return NextResponse.json(newAccount)
  } catch (error) {
    console.error('Error creating account:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, session.user.id!))
      .orderBy(desc(accounts.createdAt))

    return NextResponse.json(userAccounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
