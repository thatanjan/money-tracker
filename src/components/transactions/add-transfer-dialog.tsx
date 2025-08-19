'use client'

import { createTransferData, getAccounts } from '@/actions'
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
import { ArrowRightLeft, CalendarDays, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const transferSchema = z
  .object({
    description: z
      .string()
      .min(2, {
        message: 'Description must be at least 2 characters.',
      })
      .max(100, {
        message: 'Description must not be longer than 100 characters.',
      }),
    amount: z
      .string()
      .min(1, { message: 'Amount is required.' })
      .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Amount must be a valid number greater than 0.',
      }),
    fromAccountId: z
      .string()
      .min(1, { message: 'Please select a source account.' }),
    toAccountId: z
      .string()
      .min(1, { message: 'Please select a destination account.' }),
    transferCost: z
      .string()
      .refine(
        val => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
        {
          message: 'Transfer cost must be a valid number (0 or greater).',
        }
      )
      .optional(),
    date: z.string().min(1, { message: 'Please select a date.' }),
    notes: z.string().optional(),
  })
  .refine(data => data.fromAccountId !== data.toAccountId, {
    message: 'Source and destination accounts must be different.',
    path: ['toAccountId'],
  })

type TransferFormValues = z.infer<typeof transferSchema>

interface AddTransferDialogProps {
  children: React.ReactNode
  onTransferAdded?: () => void
}

interface Account {
  id: string
  name: string
  currency: string
  balance: string
  icon?: string | null
  color?: string | null
}

export function AddTransferDialog({
  children,
  onTransferAdded,
}: AddTransferDialogProps) {
  const [open, setOpen] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      description: '',
      amount: '',
      fromAccountId: '',
      toAccountId: '',
      transferCost: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  })

  const selectedFromAccount = accounts.find(
    account => account.id === form.watch('fromAccountId')
  )
  const selectedToAccount = accounts.find(
    account => account.id === form.watch('toAccountId')
  )

  // Load accounts when dialog opens
  useEffect(() => {
    if (open) {
      loadAccounts()
    }
  }, [open])

  const loadAccounts = async () => {
    try {
      const accountsResult = await getAccounts()
      if (accountsResult.success && accountsResult.data) {
        setAccounts(accountsResult.data)
      }
    } catch (error) {
      console.error('Error loading accounts:', error)
    }
  }

  async function onSubmit(data: TransferFormValues) {
    setLoading(true)
    try {
      const result = await createTransferData({
        description: data.description,
        amount: parseFloat(data.amount),
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        transferCost: data.transferCost ? parseFloat(data.transferCost) : 0,
        date: data.date,
        notes: data.notes,
      })

      if (result.success) {
        form.reset()
        setOpen(false)
        onTransferAdded?.()
      } else {
        console.error('Error creating transfer:', result.error)
      }
    } catch (error) {
      console.error('Error creating transfer:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/20'>
              <ArrowRightLeft className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </div>
            Transfer Money
          </DialogTitle>
          <DialogDescription>
            Transfer money between your accounts. Transfer costs will be
            deducted from the source account.
          </DialogDescription>
        </DialogHeader>

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
                      placeholder='e.g., Transfer to savings account'
                      {...field}
                    />
                  </FormControl>
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
                    <FormLabel>
                      Amount
                      {selectedToAccount && (
                        <span className='text-sm text-muted-foreground ml-1'>
                          ({selectedToAccount.currency})
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <DollarSign className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
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
                    <FormDescription>
                      Amount to be received in destination account
                    </FormDescription>
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
                        <CalendarDays className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                        <Input type='date' className='pl-9' {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='fromAccountId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Account</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select source account' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            <div className='flex items-center gap-2'>
                              <div
                                className='h-3 w-3 rounded-full'
                                style={{
                                  backgroundColor: account.color || '#3B82F6',
                                }}
                              />
                              <span className='font-medium'>
                                {account.name}
                              </span>
                              <span className='text-sm text-muted-foreground'>
                                ({account.currency}{' '}
                                {parseFloat(account.balance).toFixed(2)})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Account to transfer money from
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='toAccountId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Account</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select destination account' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts
                          .filter(
                            account =>
                              account.id !== form.watch('fromAccountId')
                          )
                          .map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              <div className='flex items-center gap-2'>
                                <div
                                  className='h-3 w-3 rounded-full'
                                  style={{
                                    backgroundColor: account.color || '#3B82F6',
                                  }}
                                />
                                <span className='font-medium'>
                                  {account.name}
                                </span>
                                <span className='text-sm text-muted-foreground'>
                                  ({account.currency}{' '}
                                  {parseFloat(account.balance).toFixed(2)})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Account to transfer money to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedFromAccount &&
              selectedToAccount &&
              selectedFromAccount.currency !== selectedToAccount.currency && (
                <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800'>
                  <p className='text-sm text-blue-800 dark:text-blue-200'>
                    <strong>Currency Exchange:</strong> You&apos;re transferring
                    from {selectedFromAccount.currency} to{' '}
                    {selectedToAccount.currency}. The transfer cost will be in{' '}
                    {selectedFromAccount.currency}.
                  </p>
                </div>
              )}

            <FormField
              control={form.control}
              name='transferCost'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Transfer Cost (Optional)
                    {selectedFromAccount && (
                      <span className='text-sm text-muted-foreground ml-1'>
                        ({selectedFromAccount.currency})
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <DollarSign className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
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
                  <FormDescription>
                    Additional fees for this transfer (will be deducted from
                    source account)
                  </FormDescription>
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
                      placeholder='Additional details about this transfer...'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                className='flex-1'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='flex-1 bg-blue-600 hover:bg-blue-700'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ArrowRightLeft className='mr-2 h-4 w-4 animate-pulse' />
                    Transferring...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className='mr-2 h-4 w-4' />
                    Transfer Money
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
