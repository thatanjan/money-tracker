# Money Tracker

A modern, mobile-friendly financial tracking application built with Next.js, featuring multi-currency support, double-entry bookkeeping, and offline capabilities.

## Features

- 🔐 **Google OAuth Authentication** - Secure sign-in with Google
- 💰 **Multi-Currency Support** - Track finances in USD, EUR, BDT, and more
- 🏦 **Multiple Accounts** - Bank accounts, wallets, credit cards
- 📊 **Transaction Tracking** - Income, expenses, transfers with categorization
- 🔄 **Recurring Transactions** - Automate bills, salary, and regular payments
- 📱 **Mobile-First Design** - Beautiful, responsive UI built with shadcn/ui
- 💾 **Offline Support** - (Coming soon) Work even without internet
- 📈 **Double-Entry Bookkeeping** - Accurate financial tracking with transaction splits

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with Google OAuth
- **UI**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon, Vercel Postgres, or local)
- Google OAuth credentials

### Installation

1. **Clone and install dependencies**

   ```bash
   git clone <your-repo>
   cd money-tracker
   npm install
   ```

2. **Set up environment variables**

   Copy `.env` and fill in your credentials:

   ```bash
   DATABASE_URL="your_postgresql_connection_string"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   AUTH_SECRET="your_random_secret_key" # Generate with: openssl rand -base64 32
   ```

3. **Set up Google OAuth**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

4. **Database setup**

   Generate and run database migrations:

   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses a robust schema supporting:

- **Users & Authentication** - NextAuth.js integration
- **Financial Accounts** - Multi-currency account management
- **Transactions** - Main transaction records
- **Transaction Splits** - Double-entry bookkeeping support
- **Categories** - Customizable transaction categorization
- **Recurring Transactions** - Automated recurring payments

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Commands

- `npx drizzle-kit generate` - Generate migration files
- `npx drizzle-kit migrate` - Apply migrations
- `npx drizzle-kit studio` - Open Drizzle Studio (database GUI)

## Roadmap

- [ ] Add account management (create, edit, delete)
- [ ] Transaction form with multi-split support
- [ ] Category management with icons
- [ ] Recurring transaction setup
- [ ] Dashboard with charts and analytics
- [ ] Export/import functionality
- [ ] PWA and offline support
- [ ] Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
