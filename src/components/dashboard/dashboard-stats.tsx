'use client'

import { getDashboardData } from '@/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

interface DashboardStats {
  totalBalance: number
  currentMonthIncome: number
  currentMonthExpenses: number
  incomeChange: number
  expenseChange: number
  accounts: Array<{
    balance: string
    currency: string
  }>
}

interface DashboardStatsProps {
  refreshKey?: number
}

export function DashboardStats({ refreshKey }: DashboardStatsProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    currentMonthIncome: 0,
    currentMonthExpenses: 0,
    incomeChange: 0,
    expenseChange: 0,
    accounts: [],
  })
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(() => {
      fetchStats()
    })
  }, [refreshKey])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const result = await getDashboardData()
      if (result.success && result.data) {
        setStats(result.data)
      } else {
        console.error('Error fetching dashboard stats:', result.error)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', // TODO: Handle multiple currencies
    }).format(amount)
  }

  const formatPercentage = (change: number) => {
    const isPositive = change >= 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const color = isPositive ? 'text-green-600' : 'text-red-600'

    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className='h-3 w-3' />
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader className='pb-3'>
              <div className='h-4 bg-gray-200 rounded w-24'></div>
            </CardHeader>
            <CardContent>
              <div className='h-8 bg-gray-200 rounded w-20 mb-2'></div>
              <div className='h-3 bg-gray-200 rounded w-32'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium text-gray-600'>
            Total Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-green-600'>
            {formatCurrency(stats.totalBalance)}
          </div>
          <p className='text-xs text-gray-500 mt-1'>
            Across {stats.accounts.length} account
            {stats.accounts.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium text-gray-600'>
            This Month Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-blue-600'>
            {formatCurrency(stats.currentMonthIncome)}
          </div>
          <div className='flex items-center gap-2 text-xs mt-1'>
            {formatPercentage(stats.incomeChange)}
            <span className='text-gray-500'>from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium text-gray-600'>
            This Month Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-red-600'>
            {formatCurrency(stats.currentMonthExpenses)}
          </div>
          <div className='flex items-center gap-2 text-xs mt-1'>
            {formatPercentage(stats.expenseChange)}
            <span className='text-gray-500'>from last month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
