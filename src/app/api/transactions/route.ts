import { db } from '@/db/client'
import { accounts, transactions, transactionSplits } from '@/db/schema'
import { auth } from '@/lib/auth'
import { and, desc, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createTransactionSchema = z.object({
  description: z.string().min(2).max(100),
  amount: z.number().positive(),
  accountId: z.string().min(1),
  categoryId: z.string().min(1),
  date: z.string().min(1),
  type: z.enum(['income', 'expense', 'transfer']),
  notes: z.string().optional(),
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
    const validatedData = createTransactionSchema.parse(body)

    // Get the account to determine currency
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, validatedData.accountId))
      .limit(1)

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // Create transaction and split in a single transaction
    const result = await db.transaction(async tx => {
      // Create the main transaction record
      const [newTransaction] = await tx
        .insert(transactions)
        .values({
          userId: session.user.id!,
          description: validatedData.description,
          date: new Date(validatedData.date),
          type: validatedData.type,
          categoryId: validatedData.categoryId,
        })
        .returning()

      // Create the transaction split (double-entry bookkeeping)
      // For income: positive amount (credit to account)
      // For expense: negative amount (debit from account)
      const splitAmount =
        validatedData.type === 'income'
          ? validatedData.amount
          : -validatedData.amount

      await tx.insert(transactionSplits).values({
        transactionId: newTransaction.id,
        accountId: validatedData.accountId,
        amount: splitAmount.toString(),
        currency: account.currency,
        description: validatedData.notes || validatedData.description,
      })

      // Update account balance
      const newBalance = parseFloat(account.balance) + splitAmount
      await tx
        .update(accounts)
        .set({
          balance: newBalance.toString(),
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, validatedData.accountId))

      return newTransaction
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating transaction:', error)

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

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type')

    const whereConditions = [eq(transactions.userId, session.user.id!)]

    if (type) {
      whereConditions.push(eq(transactions.type, type))
    }

    const userTransactions = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        date: transactions.date,
        type: transactions.type,
        categoryId: transactions.categoryId,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .where(
        whereConditions.length > 1
          ? and(...whereConditions)
          : whereConditions[0]
      )
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(limit)

    return NextResponse.json(userTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
