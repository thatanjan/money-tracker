'use server'

import { db } from '@/db/client'
import { accounts } from '@/db/schema'
import { auth } from '@/lib/auth'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createAccountSchema = z.object({
  name: z.string().min(2).max(50),
  currency: z.string().min(3),
  balance: z.number().min(0),
  icon: z.string().min(1),
  color: z.string().min(1),
})

export async function createAccount(formData: FormData) {
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
      name: formData.get('name') as string,
      currency: formData.get('currency') as string,
      balance: parseFloat(formData.get('balance') as string),
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
    }

    const validatedData = createAccountSchema.parse(rawData)

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

    // Revalidate the accounts page
    revalidatePath('/')
    
    return { success: true, data: newAccount }
  } catch (error) {
    console.error('Error creating account:', error)

    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid input', 
        details: error.issues 
      }
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }
  }
}

// Alternative version for programmatic usage (non-form)
export async function createAccountData(data: {
  name: string
  currency: string
  balance: number
  icon: string
  color: string
}) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      throw new Error('Unauthorized')
    }

    if (!db) {
      throw new Error('Database not available')
    }

    const validatedData = createAccountSchema.parse(data)

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

    // Revalidate the accounts page
    revalidatePath('/')
    
    return { success: true, data: newAccount }
  } catch (error) {
    console.error('Error creating account:', error)

    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid input', 
        details: error.issues 
      }
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }
  }
}

export async function getAccounts() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      throw new Error('Unauthorized')
    }

    if (!db) {
      throw new Error('Database not available')
    }

    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, session.user.id!))
      .orderBy(desc(accounts.createdAt))

    return { success: true, data: userAccounts }
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }
  }
}
