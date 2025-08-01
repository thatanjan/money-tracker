'use client'

import { createTransactionData, getAccounts, getCategories } from '@/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, DollarSign, PlusCircle, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const incomeSchema = z.object({
  description: z
    .string()
    .min(2, {
      message: 'Description must be at least 2 characters.',
    })
    .max(100, {
      message: 'Description must not be longer than 100 characters.',
    }),
  amount: z.string().refine(
    val => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    },
    {
      message: 'Amount must be a valid positive number.',
    }
  ),
  accountId: z.string().min(1, {
    message: 'Please select an account.',
  }),
  categoryId: z.string().min(1, {
    message: 'Please select a category.',
  }),
  date: z.string().min(1, {
    message: 'Please select a date.',
  }),
  notes: z.string().optional(),
})

type IncomeFormValues = z.infer<typeof incomeSchema>

interface Account {
  id: string
  name: string
  currency: string
  balance: string
  icon: string | null
  color: string | null
}

interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
  type: string
}

interface AddIncomeDialogProps {
  children: React.ReactNode
  onIncomeAdded?: () => void
}

export function AddIncomeDialog({
  children,
  onIncomeAdded,
}: AddIncomeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      description: '',
      amount: '',
      accountId: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0], // Today's date
      notes: '',
    },
  })

  // Load accounts and categories when dialog opens
  useEffect(() => {
    if (open) {
      loadRequiredData()
    }
  }, [open])

  const loadRequiredData = async () => {
    setLoadingData(true)
    try {
      const [accountsResult, categoriesResult] = await Promise.all([
        getAccounts(),
        getCategories('income'),
      ])

      if (accountsResult.success && accountsResult.data) {
        setAccounts(accountsResult.data)
      } else {
        console.error('Error loading accounts:', accountsResult.error)
      }

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data)
      } else {
        console.error('Error loading categories:', categoriesResult.error)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  async function onSubmit(data: IncomeFormValues) {
    setIsLoading(true)
    try {
      const result = await createTransactionData({
        ...data,
        amount: parseFloat(data.amount),
        type: 'income',
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to add income')
      }

      form.reset()
      setOpen(false)
      onIncomeAdded?.()
    } catch (error) {
      console.error('Error adding income:', error)
      // You can add toast notifications here
    } finally {
      setIsLoading(false)
    }
  }

  const selectedAccount = accounts.find(
    acc => acc.id === form.watch('accountId')
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5 text-green-600' />
            Add Income
          </DialogTitle>
          <DialogDescription>
            Record money coming into your accounts.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className='space-y-4'>
            <div className='h-4 bg-gray-200 rounded animate-pulse'></div>
            <div className='h-10 bg-gray-200 rounded animate-pulse'></div>
            <div className='h-10 bg-gray-200 rounded animate-pulse'></div>
            <div className='h-10 bg-gray-200 rounded animate-pulse'></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Salary, freelance work, etc.'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>What is this income for?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                          <Input
                            type='number'
                            step='0.01'
                            min='0'
                            placeholder='0.00'
                            className='pl-9'
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <CalendarDays className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                          <Input type='date' className='pl-9' {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='accountId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select account to receive money' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            <div className='flex items-center space-x-2'>
                              <div
                                className='w-3 h-3 rounded-full'
                                style={{
                                  backgroundColor: account.color || '#6B7280',
                                }}
                              ></div>
                              <span>{account.name}</span>
                              <span className='text-xs text-gray-500'>
                                ({account.currency})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedAccount && (
                      <FormDescription>
                        Current balance: {selectedAccount.currency}{' '}
                        {parseFloat(selectedAccount.balance).toLocaleString()}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='categoryId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select income category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className='flex items-center space-x-2'>
                              <div
                                className='w-3 h-3 rounded-full'
                                style={{
                                  backgroundColor: category.color || '#6B7280',
                                }}
                              ></div>
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Additional notes about this income...'
                        className='resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-end space-x-2 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={isLoading || accounts.length === 0}
                >
                  {isLoading ? (
                    <>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2' />
                      Adding...
                    </>
                  ) : (
                    <>
                      <PlusCircle className='h-4 w-4 mr-2' />
                      Add Income
                    </>
                  )}
                </Button>
              </div>

              {accounts.length === 0 && !loadingData && (
                <div className='text-center py-4'>
                  <p className='text-sm text-gray-500'>
                    You need to create an account first before adding income.
                  </p>
                </div>
              )}
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
