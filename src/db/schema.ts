import {
  boolean,
  decimal,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import type { AdapterAccount } from 'next-auth/adapters'

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
})

export const authAccounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  account => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

// Financial accounts (bank accounts, wallets, etc.)
export const accounts = pgTable('accounts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  currency: text('currency').notNull().default('USD'), // USD, EUR, BDT, etc.
  balance: decimal('balance', { precision: 15, scale: 2 })
    .notNull()
    .default('0'),
  icon: text('icon'), // Lucide icon name
  color: text('color').default('#3B82F6'), // Hex color for UI
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
})

// Categories for transactions
export const categories = pgTable('categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon'), // Lucide icon name
  color: text('color').default('#6B7280'), // Hex color for UI
  type: text('type').notNull(), // "income", "expense", "transfer"
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
})

// Main transactions table
export const transactions = pgTable('transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  type: text('type').notNull(), // "income", "expense", "transfer"
  categoryId: text('categoryId').references(() => categories.id),
  recurringTransactionId: text('recurringTransactionId').references(
    () => recurringTransactions.id
  ),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
})

// Transaction splits for double-entry bookkeeping
export const transactionSplits = pgTable('transaction_splits', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  transactionId: text('transactionId')
    .notNull()
    .references(() => transactions.id, { onDelete: 'cascade' }),
  accountId: text('accountId')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(), // Positive for credit, negative for debit
  currency: text('currency').notNull(),
  exchangeRate: decimal('exchangeRate', { precision: 10, scale: 6 }).default(
    '1'
  ), // For currency conversion
  description: text('description'), // Optional description for this split
})

// Recurring transactions
export const recurringTransactions = pgTable('recurring_transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('USD'),
  type: text('type').notNull(), // "income", "expense", "transfer"
  categoryId: text('categoryId').references(() => categories.id),
  fromAccountId: text('fromAccountId').references(() => accounts.id),
  toAccountId: text('toAccountId').references(() => accounts.id),
  frequency: text('frequency').notNull(), // "daily", "weekly", "monthly", "yearly"
  interval: integer('interval').notNull().default(1), // Every X frequency (e.g., every 2 weeks)
  nextDate: timestamp('nextDate', { mode: 'date' }).notNull(),
  endDate: timestamp('endDate', { mode: 'date' }), // Optional end date
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
})

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  authenticator => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
)
