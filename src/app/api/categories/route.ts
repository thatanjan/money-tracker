import { db } from '@/db/client'
import { categories } from '@/db/schema'
import { auth } from '@/lib/auth'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  icon: z.string().min(1),
  color: z.string().min(1),
  type: z.enum(['income', 'expense', 'transfer']),
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
    const validatedData = createCategorySchema.parse(body)

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

    return NextResponse.json(newCategory)
  } catch (error) {
    console.error('Error creating category:', error)

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
    const type = searchParams.get('type')

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
      return NextResponse.json(
        type
          ? defaultCategories.filter(cat => cat.type === type)
          : defaultCategories
      )
    }

    return NextResponse.json(userCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
