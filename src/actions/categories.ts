'use server'

import { db } from '@/db/client'
import { categories } from '@/db/schema'
import { auth } from '@/lib/auth'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  icon: z.string().min(1),
  color: z.string().min(1),
  type: z.enum(['income', 'expense', 'transfer']),
})

export async function createCategory(formData: FormData) {
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
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
      type: formData.get('type') as 'income' | 'expense' | 'transfer',
    }

    const validatedData = createCategorySchema.parse(rawData)

    const [newCategory] = await db
      .insert(categories)
      .values({
        userId: session.user.id!,
        name: validatedData.name,
        icon: validatedData.icon,
        color: validatedData.color,
        type: validatedData.type,
      })
      .returning()

    // Revalidate pages that might show categories
    revalidatePath('/')

    return { success: true, data: newCategory }
  } catch (error) {
    console.error('Error creating category:', error)

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
export async function createCategoryData(data: {
  name: string
  icon: string
  color: string
  type: 'income' | 'expense' | 'transfer'
}) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      throw new Error('Unauthorized')
    }

    if (!db) {
      throw new Error('Database not available')
    }

    const validatedData = createCategorySchema.parse(data)

    const [newCategory] = await db
      .insert(categories)
      .values({
        userId: session.user.id!,
        name: validatedData.name,
        icon: validatedData.icon,
        color: validatedData.color,
        type: validatedData.type,
      })
      .returning()

    // Revalidate pages that might show categories
    revalidatePath('/')

    return { success: true, data: newCategory }
  } catch (error) {
    console.error('Error creating category:', error)

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

export async function getCategories(type?: 'income' | 'expense' | 'transfer') {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      throw new Error('Unauthorized')
    }

    if (!db) {
      throw new Error('Database not available')
    }

    const whereConditions = [
      eq(categories.userId, session.user.id!),
      eq(categories.isActive, true),
    ]

    if (type) {
      whereConditions.push(eq(categories.type, type))
    }

    const userCategories = await db
      .select()
      .from(categories)
      .where(and(...whereConditions))

    // If no categories exist, create default ones
    if (userCategories.length === 0) {
      const defaultCategories = await createDefaultCategories(session.user.id!)
      return {
        success: true,
        data: type
          ? defaultCategories.filter(cat => cat.type === type)
          : defaultCategories,
      }
    }

    return { success: true, data: userCategories }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }
  }
}

async function createDefaultCategories(userId: string) {
  if (!db) {
    throw new Error('Database not available')
  }

  const defaultCategoriesData = [
    // Income categories
    { name: 'Salary', icon: 'briefcase', color: '#10B981', type: 'income' },
    { name: 'Freelance', icon: 'laptop', color: '#3B82F6', type: 'income' },
    {
      name: 'Investment',
      icon: 'trending-up',
      color: '#8B5CF6',
      type: 'income',
    },
    { name: 'Gift', icon: 'gift', color: '#F59E0B', type: 'income' },
    {
      name: 'Other Income',
      icon: 'plus-circle',
      color: '#6B7280',
      type: 'income',
    },

    // Expense categories
    {
      name: 'Food & Dining',
      icon: 'utensils',
      color: '#EF4444',
      type: 'expense',
    },
    { name: 'Transportation', icon: 'car', color: '#F97316', type: 'expense' },
    {
      name: 'Shopping',
      icon: 'shopping-bag',
      color: '#EC4899',
      type: 'expense',
    },
    { name: 'Entertainment', icon: 'film', color: '#A855F7', type: 'expense' },
    {
      name: 'Bills & Utilities',
      icon: 'receipt',
      color: '#059669',
      type: 'expense',
    },
    { name: 'Healthcare', icon: 'heart', color: '#DC2626', type: 'expense' },
    { name: 'Education', icon: 'book', color: '#2563EB', type: 'expense' },
    {
      name: 'Other Expense',
      icon: 'minus-circle',
      color: '#6B7280',
      type: 'expense',
    },
  ]

  const createdCategories = await db
    .insert(categories)
    .values(
      defaultCategoriesData.map(cat => ({
        userId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
      }))
    )
    .returning()

  return createdCategories
}
