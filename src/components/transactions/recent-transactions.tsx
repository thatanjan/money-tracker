'use client'

import { getRecentTransactions } from '@/actions'
import { Badge } from '@/components/ui/badge'
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  DollarSign,
} from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

interface RecentTransaction {
  id: string
  description: string
  date: Date
  type: string
  createdAt: Date
  category: {
    id: string
    name: string
    icon: string | null
    color: string | null
  }
  split: {
    amount: string
    currency: string
    accountId: string
  }
  account: {
    id: string
    name: string
    icon: string | null
    color: string | null
  }
}

interface RecentTransactionsProps {
  refreshKey?: number
}

export function RecentTransactions({ refreshKey }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(() => {
      fetchTransactions()
    })
  }, [refreshKey])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const result = await getRecentTransactions(10)
      if (result.success && result.data) {
        setTransactions(result.data)
      } else {
        console.error('Error fetching transactions:', result.error)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowUpRight className='h-4 w-4 text-green-600' />
      case 'expense':
        return <ArrowDownLeft className='h-4 w-4 text-red-600' />
      case 'transfer':
        return <ArrowRightLeft className='h-4 w-4 text-blue-600' />
      default:
        return <DollarSign className='h-4 w-4 text-gray-600' />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600'
      case 'expense':
        return 'text-red-600'
      case 'transfer':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatAmount = (amount: string, currency: string, type: string) => {
    const value = Math.abs(parseFloat(amount))
    const sign = type === 'income' ? '+' : type === 'expense' ? '-' : ''
    return `${sign}${currency} ${value.toLocaleString()}`
  }

  const formatDate = (date: Date) => {
    const transactionDate = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (transactionDate.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (transactionDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return transactionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  if (loading) {
    return (
      <div className='space-y-3'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center space-x-3 animate-pulse'>
            <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
            <div className='flex-1 space-y-2'>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
              <div className='h-3 bg-gray-200 rounded w-1/2'></div>
            </div>
            <div className='h-4 bg-gray-200 rounded w-20'></div>
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500'>
        <DollarSign className='h-12 w-12 mx-auto mb-4 text-gray-300' />
        <p className='text-sm'>No transactions yet</p>
        <p className='text-xs'>Start by adding an income or expense</p>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {transactions.map(transaction => (
        <div
          key={transaction.id}
          className='flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors'
        >
          <div
            className='w-10 h-10 rounded-full flex items-center justify-center'
            style={{
              backgroundColor: (transaction.category.color || '#6B7280') + '20',
            }}
          >
            {getTransactionIcon(transaction.type)}
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {transaction.description}
              </p>
              <Badge
                variant='secondary'
                className='text-xs'
                style={{
                  backgroundColor:
                    (transaction.category.color || '#6B7280') + '20',
                  color: transaction.category.color || '#6B7280',
                }}
              >
                {transaction.category.name}
              </Badge>
            </div>
            <div className='flex items-center gap-2 text-xs text-gray-500'>
              <span>{transaction.account.name}</span>
              <span>•</span>
              <span>{formatDate(transaction.date)}</span>
            </div>
          </div>

          <div className='text-right'>
            <p
              className={`text-sm font-medium ${getTransactionColor(
                transaction.type
              )}`}
            >
              {formatAmount(
                transaction.split.amount,
                transaction.split.currency,
                transaction.type
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
