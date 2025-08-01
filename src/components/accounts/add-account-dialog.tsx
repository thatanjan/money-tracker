'use client'

import { createAccountData } from '@/actions'
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
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Banknote,
  CreditCard,
  Landmark,
  PiggyBank,
  Plus,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const accountSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Account name must be at least 2 characters.',
    })
    .max(50, {
      message: 'Account name must not be longer than 50 characters.',
    }),
  currency: z.string().min(3, {
    message: 'Please select a currency.',
  }),
  balance: z.string().refine(
    val => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0
    },
    {
      message: 'Balance must be a valid positive number.',
    }
  ),
  icon: z.string().min(1, {
    message: 'Please select an icon.',
  }),
  color: z.string().min(1, {
    message: 'Please select a color.',
  }),
})

type AccountFormValues = z.infer<typeof accountSchema>

const CURRENCIES = [
  { value: 'USD', label: '🇺🇸 USD - US Dollar' },
  { value: 'EUR', label: '🇪🇺 EUR - Euro' },
  { value: 'GBP', label: '🇬🇧 GBP - British Pound' },
  { value: 'BDT', label: '🇧🇩 BDT - Bangladeshi Taka' },
  { value: 'INR', label: '🇮🇳 INR - Indian Rupee' },
  { value: 'CAD', label: '🇨🇦 CAD - Canadian Dollar' },
  { value: 'AUD', label: '🇦🇺 AUD - Australian Dollar' },
  { value: 'JPY', label: '🇯🇵 JPY - Japanese Yen' },
]

const ACCOUNT_ICONS = [
  { value: 'wallet', label: 'Wallet', icon: Wallet },
  { value: 'credit-card', label: 'Credit Card', icon: CreditCard },
  { value: 'banknote', label: 'Cash', icon: Banknote },
  { value: 'piggy-bank', label: 'Savings', icon: PiggyBank },
  { value: 'landmark', label: 'Bank', icon: Landmark },
  { value: 'smartphone', label: 'Digital Wallet', icon: Smartphone },
]

const ACCOUNT_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Yellow' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#F97316', label: 'Orange' },
  { value: '#84CC16', label: 'Lime' },
]

interface AddAccountDialogProps {
  children: React.ReactNode
  onAccountCreated?: () => void
}

export function AddAccountDialog({
  children,
  onAccountCreated,
}: AddAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      currency: 'USD',
      balance: '0',
      icon: 'wallet',
      color: '#3B82F6',
    },
  })

  async function onSubmit(data: AccountFormValues) {
    setIsLoading(true)
    try {
      const result = await createAccountData({
        ...data,
        balance: parseFloat(data.balance),
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to create account')
      }

      form.reset()
      setOpen(false)
      onAccountCreated?.()
    } catch (error) {
      console.error('Error creating account:', error)
      // You can add toast notifications here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>
            Create a new financial account to track your money.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder='My Checking Account' {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your account a descriptive name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='currency'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select currency' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map(currency => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
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
                name='balance'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Balance</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        min='0'
                        placeholder='0.00'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='icon'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Icon</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select an icon' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACCOUNT_ICONS.map(icon => {
                        const IconComponent = icon.icon
                        return (
                          <SelectItem key={icon.value} value={icon.value}>
                            <div className='flex items-center space-x-2'>
                              <IconComponent className='h-4 w-4' />
                              <span>{icon.label}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='color'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Color</FormLabel>
                  <div className='grid grid-cols-4 gap-2'>
                    {ACCOUNT_COLORS.map(color => (
                      <button
                        key={color.value}
                        type='button'
                        className={`h-10 rounded-md border-2 transition-all ${
                          field.value === color.value
                            ? 'border-gray-900 scale-110'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => field.onChange(color.value)}
                      />
                    ))}
                  </div>
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
              <Button type='submit' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2' />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className='h-4 w-4 mr-2' />
                    Create Account
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
