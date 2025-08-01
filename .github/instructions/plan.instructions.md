# Project Plan

This plan is tailored to your specific requirements, focusing on a robust backend and a beautiful, mobile-first user experience.

**Phase 1: Foundation, Database, and Authentication**

1.  **Project Setup:** Initialize a Next.js project using the App Router, TypeScript, and Tailwind CSS.
2.  **Authentication:** Integrate **Next-Auth (Auth.js)** to handle Google OAuth. This will manage user sessions and protect your API routes.
3.  **Database Schema Design (with Drizzle):** This is the most critical step. We'll design a schema that supports your complex transaction models.
    - `users`: To store user profiles linked to their Google account.
    - `accounts`: For the different balances (e.g., "Bank of America Checking," "Wallet," "Wise Euro Account"). Each account will have a `name`, `currency` (USD, EUR, BDT), and a `balance`.
    - `transactions`: A central table to record the high-level details of each financial event (e.g., date, description, user).
    - `transaction_splits`: This is the key to handling your complex requirements. A single `transaction` will have multiple `splits`.
      - For a simple expense, there would be two splits: one debiting your account, one crediting the "expense" category.
      - For a transfer from Account A to B and C, there would be three splits: one debit from A, one credit to B, and one credit to C.
      - For a grocery purchase with 10 items, the transaction could have many splits representing each item, all debiting a single account.
    - `categories`: To classify transactions (e.g., "Groceries," "Salary," "Travel"). Each category can have a user-selectable `icon`.
    - `recurring_transactions`: A table to define recurring events, including the amount, frequency (e.g., monthly), and next occurrence date.
4.  **icon picker**: There should be a icon picker to to add icons to things like balance, transaction, category etc

**Phase 2: Core Backend API**

1.  **Drizzle ORM Setup:** Configure Drizzle with your database, define the schema in code, and set up migrations.
2.  **API for Transactions:** Create a powerful API endpoint in Next.js that can process complex transaction payloads. It will need to atomically update balances across multiple accounts based on the `transaction_splits`.
3.  **API for Accounts & Categories:** Standard endpoints to allow users to create, view, and manage their accounts and spending categories.
4.  **Currency Conversion Logic:** For transfers between different currencies, the API will need a way to handle exchange rates. Initially, you could require the user to input the rate manually.
5.  **Recurring Transaction Service:** Implement a scheduled job (e.g., using Vercel Cron Jobs) that runs daily to check the `recurring_transactions` table and automatically create new transactions when they are due.

**Phase 3: Mobile-First Frontend & UI**

1.  **UI/UX:** Design a clean, beautiful, and highly intuitive interface with a strong focus on mobile usability. The goal is to make adding even complex transactions feel effortless.
2.  **Component Development:** Build reusable React components for:
    - **Dashboard:** A visually appealing overview of all account balances.
    - **Dynamic Transaction Form:** A smart form that adapts whether you're adding an expense, an income, or a multi-leg transfer.
    - **Icon Picker:** A component that allows users to select an icon when creating or editing categories.
    - **Transaction History:** A clear and searchable list of all past transactions.

**Phase 4: Offline Mode and Advanced Features**

1.  **PWA Configuration:** Convert the app into a Progressive Web App (PWA) so it can be installed on a mobile device and work offline.
2.  **Client-Side Database:** Use IndexedDB to store any transactions, accounts, or categories created while the user is offline.
3.  **Synchronization Logic:** When the app reconnects to the internet, it will sync the offline data with your main database. This process should be seamless to the user.
4.  **Data Visualization:** Introduce charts and graphs to give users insights into their financial habits.
