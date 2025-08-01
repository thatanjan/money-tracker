'use server'

import { db } from '@/db/client'
import {
  accounts,
  categories,
  transactions,
  transactionSplits,
} from '@/db/schema'
import { auth } from '@/lib/auth'
import { and, desc, eq, gte, lt } from 'drizzle-orm'

export async function getDashboardData() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      throw new Error('Unauthorized')
    }

    if (!db) {
      throw new Error('Database not available')
    }

    // Get total balance across all accounts
    const accountsData = await db
      .select({
        balance: accounts.balance,
        currency: accounts.currency,
      })
      .from(accounts)
      .where(
        and(eq(accounts.userId, session.user.id!), eq(accounts.isActive, true))
      )

    // Calculate total balance (assuming USD for now, currency conversion can be added later)
    const totalBalance = accountsData.reduce((sum, account) => {
      return sum + parseFloat(account.balance || '0')
    }, 0)

    // Get current month's start date
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // Get this month's income and expenses
    const currentMonthTransactions = await db
      .select({
        type: transactions.type,
        amount: transactionSplits.amount,
      })
      .from(transactions)
      .innerJoin(
        transactionSplits,
        eq(transactions.id, transactionSplits.transactionId)
      )
      .where(
        and(
          eq(transactions.userId, session.user.id!),
          gte(transactions.date, currentMonthStart),
          lt(transactions.date, nextMonthStart)
        )
      )

    // Get last month's income and expenses for comparison
    const lastMonthTransactions = await db
      .select({
        type: transactions.type,
        amount: transactionSplits.amount,
      })
      .from(transactions)
      .innerJoin(
        transactionSplits,
        eq(transactions.id, transactionSplits.transactionId)
      )
      .where(
        and(
          eq(transactions.userId, session.user.id!),
          gte(transactions.date, lastMonthStart),
          lt(transactions.date, currentMonthStart)
        )
      )

    // Calculate current month totals
    let currentMonthIncome = 0
    let currentMonthExpenses = 0

    currentMonthTransactions.forEach(transaction => {
      const amount = Math.abs(parseFloat(transaction.amount || '0'))
      if (transaction.type === 'income') {
        currentMonthIncome += amount
      } else if (transaction.type === 'expense') {
        currentMonthExpenses += amount
      }
    })

    // Calculate last month totals for percentage comparison
    let lastMonthIncome = 0
    let lastMonthExpenses = 0

    lastMonthTransactions.forEach(transaction => {
      const amount = Math.abs(parseFloat(transaction.amount || '0'))
      if (transaction.type === 'income') {
        lastMonthIncome += amount
      } else if (transaction.type === 'expense') {
        lastMonthExpenses += amount
      }
    })

    // Calculate percentage changes
    const incomeChange =
      lastMonthIncome > 0
        ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100
        : currentMonthIncome > 0
        ? 100
        : 0

    const expenseChange =
      lastMonthExpenses > 0
        ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
        : currentMonthExpenses > 0
        ? 100
        : 0

    return {
      success: true,
      data: {
        totalBalance,
        currentMonthIncome,
        currentMonthExpenses,
        incomeChange,
        expenseChange,
        accounts: accountsData,
      },
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }
  }
}

export async function getRecentTransactions(limit: number = 10) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      throw new Error('Unauthorized')
    }

    if (!db) {
      throw new Error('Database not available')
    }

    // Get recent transactions with category and account information
    const recentTransactions = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        date: transactions.date,
        type: transactions.type,
        createdAt: transactions.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          icon: categories.icon,
          color: categories.color,
        },
        split: {
          amount: transactionSplits.amount,
          currency: transactionSplits.currency,
          accountId: transactionSplits.accountId,
        },
        account: {
          id: accounts.id,
          name: accounts.name,
          icon: accounts.icon,
          color: accounts.color,
        },
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .innerJoin(
        transactionSplits,
        eq(transactions.id, transactionSplits.transactionId)
      )
      .innerJoin(accounts, eq(transactionSplits.accountId, accounts.id))
      .where(eq(transactions.userId, session.user.id!))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(limit)

    return {
      success: true,
      data: recentTransactions,
    }
  } catch (error) {
    console.error('Error fetching recent transactions:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }
  }
}
