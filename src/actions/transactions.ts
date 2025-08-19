'use server'

import { db } from '@/db/client'
import { accounts, transactions, transactionSplits } from '@/db/schema'
import { auth } from '@/lib/auth'
import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
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

export async function createTransaction(formData: FormData) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      throw new Error('Unauthorized')
    }

    if (!db) {
      throw new Error('Database not available')
    }

    // Extract data from FormData
    const rawData = {
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      accountId: formData.get('accountId') as string,
      categoryId: formData.get('categoryId') as string,
      date: formData.get('date') as string,
      type: formData.get('type') as 'income' | 'expense' | 'transfer',
      notes: (formData.get('notes') as string) || undefined,
    }

    const validatedData = createTransactionSchema.parse(rawData)

    // Get the account to determine currency
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, validatedData.accountId))
      .limit(1)

    if (!account) {
      return { success: false, error: 'Account not found' }
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

    // Revalidate pages that might show transactions and accounts
    revalidatePath('/')

    return { success: true, data: result }
  } catch (error) {
    console.error('Error creating transaction:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input',
        details: error.issues,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }
  }
}

// Alternative version for programmatic usage (non-form)
export async function createTransactionData(data: {
  description: string
  amount: number
  accountId: string
  categoryId: string
  date: string
  type: 'income' | 'expense' | 'transfer'
  notes?: string
}) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      throw new Error('Unauthorized')
    }

    if (!db) {
      throw new Error('Database not available')
    }

    const validatedData = createTransactionSchema.parse(data)

    // Get the account to determine currency
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, validatedData.accountId))
      .limit(1)

    if (!account) {
      return { success: false, error: 'Account not found' }
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

    // Revalidate pages that might show transactions and accounts
    revalidatePath('/')

    return { success: true, data: result }
  } catch (error) {
    console.error('Error creating transaction:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input',
        details: error.issues,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }
  }
}

export async function getTransactions(
  limit: number = 50,
  type?: 'income' | 'expense' | 'transfer'
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      throw new Error('Unauthorized')
    }

    if (!db) {
      throw new Error('Database not available')
    }

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

    return { success: true, data: userTransactions }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }
  }
}

const createTransferSchema = z.object({
  description: z.string().min(2).max(100),
  fromAmount: z.number().positive(),
  toAmount: z.number().positive(),
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  transferCost: z.number().min(0).default(0),
  date: z.string().min(1),
  notes: z.string().optional(),
})

export async function createTransferData(data: {
  description: string
  fromAmount: number
  toAmount: number
  fromAccountId: string
  toAccountId: string
  transferCost: number
  date: string
  notes?: string
}) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      throw new Error('Unauthorized')
    }

    if (!db) {
      throw new Error('Database not available')
    }

    const validatedData = createTransferSchema.parse(data)

    // Get both accounts to determine currencies and validate balances
    const [fromAccount] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, validatedData.fromAccountId))
      .limit(1)

    const [toAccount] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, validatedData.toAccountId))
      .limit(1)

    if (!fromAccount) {
      return { success: false, error: 'Source account not found' }
    }

    if (!toAccount) {
      return { success: false, error: 'Destination account not found' }
    }

    // Check if source account has sufficient balance (fromAmount + transfer cost)
    const totalDeduction = validatedData.fromAmount + validatedData.transferCost
    const currentBalance = parseFloat(fromAccount.balance)

    if (currentBalance < totalDeduction) {
      return {
        success: false,
        error: `Insufficient balance. Available: ${
          fromAccount.currency
        } ${currentBalance.toFixed(2)}, Required: ${
          fromAccount.currency
        } ${totalDeduction.toFixed(2)}`,
      }
    }

    // Create transfer transactions in a single database transaction
    const result = await db.transaction(async tx => {
      // Create the main transfer transaction record
      const [newTransaction] = await tx
        .insert(transactions)
        .values({
          userId: session.user.id!,
          description: validatedData.description,
          date: new Date(validatedData.date),
          type: 'transfer',
          categoryId: null, // Transfers don't need categories
        })
        .returning()

      // Create transaction split for source account (negative - money going out)
      const sourceAmount = -(
        validatedData.fromAmount + validatedData.transferCost
      )
      await tx.insert(transactionSplits).values({
        transactionId: newTransaction.id,
        accountId: validatedData.fromAccountId,
        amount: sourceAmount.toString(),
        currency: fromAccount.currency,
        description: `Transfer to ${toAccount.name}${
          validatedData.transferCost > 0
            ? ` (includes ${
                fromAccount.currency
              } ${validatedData.transferCost.toFixed(2)} transfer cost)`
            : ''
        }`,
      })

      // Create transaction split for destination account (positive - money coming in)
      await tx.insert(transactionSplits).values({
        transactionId: newTransaction.id,
        accountId: validatedData.toAccountId,
        amount: validatedData.toAmount.toString(),
        currency: toAccount.currency,
        description: `Transfer from ${fromAccount.name}`,
      })

      // Update source account balance (subtract amount + transfer cost)
      const newFromBalance = currentBalance - totalDeduction
      await tx
        .update(accounts)
        .set({
          balance: newFromBalance.toString(),
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, validatedData.fromAccountId))

      // Update destination account balance (add amount)
      const currentToBalance = parseFloat(toAccount.balance)
      const newToBalance = currentToBalance + validatedData.toAmount
      await tx
        .update(accounts)
        .set({
          balance: newToBalance.toString(),
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, validatedData.toAccountId))

      return newTransaction
    })

    // Revalidate pages that might show transactions and accounts
    revalidatePath('/')
    revalidatePath('/dashboard')

    return { success: true, data: result }
  } catch (error) {
    console.error('Error creating transfer:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input',
        details: error.issues,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }
  }
}
