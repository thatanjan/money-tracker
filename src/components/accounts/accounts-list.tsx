'use client'

import { getAccounts } from '@/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Banknote,
  CreditCard,
  Landmark,
  MoreHorizontal,
  PiggyBank,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'

interface Account {
  id: string
  name: string
  currency: string
  balance: string
  icon: string | null
  color: string | null
  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

const ICON_MAP = {
  wallet: Wallet,
  'credit-card': CreditCard,
  banknote: Banknote,
  'piggy-bank': PiggyBank,
  landmark: Landmark,
  smartphone: Smartphone,
}

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  BDT: '৳',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
}

interface AccountsListProps {
  refreshKey?: number
}

export function AccountsList({ refreshKey }: AccountsListProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [, startTransition] = useTransition()

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const result = await getAccounts()
      if (result.success && result.data) {
        setAccounts(result.data)
      } else {
        console.error('Error fetching accounts:', result.error)
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    startTransition(() => {
      fetchAccounts()
    })
  }, [refreshKey])

  if (loading) {
    return (
      <div className='space-y-3'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='h-20 bg-gray-100 rounded-lg animate-pulse' />
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500'>
        <CreditCard className='h-12 w-12 mx-auto mb-4 text-gray-300' />
        <p className='text-sm'>No accounts yet</p>
        <p className='text-xs'>Add your first account to get started</p>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {accounts.map(account => {
        const IconComponent =
          ICON_MAP[(account.icon || 'wallet') as keyof typeof ICON_MAP] ||
          Wallet
        const currencySymbol =
          CURRENCY_SYMBOLS[account.currency as keyof typeof CURRENCY_SYMBOLS] ||
          account.currency
        const balance = parseFloat(account.balance)
        const accountColor = account.color || '#3B82F6'

        return (
          <Card key={account.id} className='hover:shadow-md transition-shadow'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div
                    className='p-2 rounded-lg'
                    style={{ backgroundColor: accountColor + '20' }}
                  >
                    <IconComponent
                      className='h-5 w-5'
                      style={{ color: accountColor }}
                    />
                  </div>
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      {account.name}
                    </h3>
                    <p className='text-sm text-gray-500'>{account.currency}</p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <div className='text-right'>
                    <p
                      className={`font-semibold ${
                        balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {currencySymbol}
                      {Math.abs(balance).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className='text-xs text-gray-500'>
                      {balance >= 0 ? 'Available' : 'Overdrawn'}
                    </p>
                  </div>

                  <Button variant='ghost' size='sm'>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
