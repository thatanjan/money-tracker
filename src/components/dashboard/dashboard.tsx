'use client'

import { AccountsList } from '@/components/accounts/accounts-list'
import { AddAccountDialog } from '@/components/accounts/add-account-dialog'
import { AddIncomeDialog } from '@/components/transactions/add-income-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ArrowUpDown,
  CreditCard,
  DollarSign,
  LogOut,
  PlusCircle,
  TrendingDown,
} from 'lucide-react'
import { User } from 'next-auth'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAccountCreated = () => {
    // Refresh the dashboard data
    setRefreshKey(prev => prev + 1)
  }

  const handleIncomeAdded = () => {
    // Refresh the dashboard data
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200 p-4'>
        <div className='max-w-6xl mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl font-bold text-gray-900'>Money Tracker</h1>
          </div>

          <div className='flex items-center gap-3'>
            <Avatar>
              <AvatarImage src={user.image || ''} alt={user.name || ''} />
              <AvatarFallback>
                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='hidden sm:block'>
              <p className='text-sm font-medium text-gray-900'>{user.name}</p>
              <p className='text-xs text-gray-500'>{user.email}</p>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => signOut()}
              className='text-gray-500 hover:text-gray-700'
            >
              <LogOut className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto p-4 space-y-6'>
        {/* Quick Actions */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
          <AddIncomeDialog onIncomeAdded={handleIncomeAdded}>
            <Button className='h-20 flex-col gap-2' variant='outline'>
              <PlusCircle className='h-6 w-6' />
              <span className='text-sm'>Add Income</span>
            </Button>
          </AddIncomeDialog>
          <Button className='h-20 flex-col gap-2' variant='outline'>
            <TrendingDown className='h-6 w-6' />
            <span className='text-sm'>Add Expense</span>
          </Button>
          <Button className='h-20 flex-col gap-2' variant='outline'>
            <ArrowUpDown className='h-6 w-6' />
            <span className='text-sm'>Transfer</span>
          </Button>
          <AddAccountDialog onAccountCreated={handleAccountCreated}>
            <Button className='h-20 flex-col gap-2' variant='outline'>
              <CreditCard className='h-6 w-6' />
              <span className='text-sm'>Add Account</span>
            </Button>
          </AddAccountDialog>
        </div>

        {/* Balance Overview */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>$0.00</div>
              <p className='text-xs text-gray-500 mt-1'>Across all accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                This Month Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>$0.00</div>
              <p className='text-xs text-gray-500 mt-1'>+0% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                This Month Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>$0.00</div>
              <p className='text-xs text-gray-500 mt-1'>+0% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Accounts */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Accounts</CardTitle>
              <AddAccountDialog onAccountCreated={handleAccountCreated}>
                <Button size='sm' variant='outline'>
                  <PlusCircle className='h-4 w-4 mr-2' />
                  Add Account
                </Button>
              </AddAccountDialog>
            </div>
            <CardDescription>
              Manage your bank accounts, wallets, and other financial accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountsList refreshKey={refreshKey} />
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8 text-gray-500'>
              <DollarSign className='h-12 w-12 mx-auto mb-4 text-gray-300' />
              <p className='text-sm'>No transactions yet</p>
              <p className='text-xs'>Start by adding an income or expense</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
