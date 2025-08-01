# Project Overview

This project is a web application for a personal finance tracker app.

## Folder Structure

- `/src`: Contains the source code for the frontend.

### Globals

- `/src/actions`: Contains the server actions
- `/src/utils`: Contains the global utilities
- `/src/components`: Contains the shared components
- `/src/types`: Contains the global types

### Features

- `/features`: Contains the source code for the application's features.
  - `/features/${featureName}`: Contains the source code for applicationfeatures
  - `/features/${featureName}/components`: Components for the specific feature
  - `/features/${featureName}/actions`: Server actions for the specific feature
  - `/features/${featureName}/utils`: Utils for the specific feature
  - `/features/${featureName}/types`: Types for the specific feature

## Libraries and Frameworks

This stack is modern, highly performant, and tailored to your specific requests.

- Framework: Next.js (with App Router)
- Authentication: Next-Auth.js (Auth.js)
- Database ORM: Drizzle ORM
- Database: Vercel Postgres or Neon (Serverless PostgreSQL providers that have excellent integration with Drizzle and Next.js).
- Styling & UI:
- Tailwind CSS for styling.
- Shadcn/UI to provide beautiful, accessible, and customizable components that are mobile-friendly out of the box.
- Icons: Lucide Icons (integrates perfectly with Shadcn/UI).
- Offline & PWA:
- next-pwa library.
- IndexedDB for local storage (you can use a library like dexie.js to simplify this).
- Data Fetching & Sync: TanStack Query is still the best-in-class tool for managing data fetching, caching, and handling the complexities of data synchronization for the offline feature.-

## Coding Standards

- Use single quotes for strings.
- Use function based components in React.
- Use arrow functions for callbacks.
- Always use nextjs server actions instead of creating API routes or route handlers.
- Always try to use nextjs server components.

## UI guidelines

- A toggle is provided to switch between light and dark mode.
- Application should have a modern and clean design.
- Very mobile friendly

# Others

- Don't change the changes I have added manually.
- Don't use inline styles.
- Always use semantic HTML elements.
- Use meaningful alt attributes for images.

## Basic Guidelines

- Use descriptive names for variables, functions, and classes.
- Never changes the original code or the changes I have made.
- Only suggest changes that are necessary to improve the code.
- Only change the code if it is necessary to improve the code.
- Remember the changes I have made to the code and do not change them.
- Do not change the code if it is already correct.
- Do not change the code if it is already optimized.
- Do not change the code if it is already well-structured.
- Do not change the code if it is already well-documented.
- Do not change the code if it is already well-tested.

# React Guidelines

- Always use functional components.
- Use Arrow Functions for defining components.
- While defining components, use PascalCase for the component name and use default export.
- Use React.FC type for components with children
- Keep components small and focused
- Use Shadcn components for UI elements where applicable or can be used instead of custom components. Install the components if necessary or not already installed.

## Commit Messages Guidelines

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Change" not "Changed")
- Limit the first line to 72 characters or less
- List the changes in the body of the commit message
- Use feature, fix, or chore as the prefix for the commit message

## Git branch guidelines

- Use descriptive names for branches (e.g., `feature/xyz`, `bugfix/abc`, `hotfix/123`, `refactor/456`).
