# Code Quality & Standards

This document outlines the code quality standards and tools used in this project.

## Tools & Configuration

### ESLint

ESLint is configured to enforce code quality and catch common errors.

**Configuration**: `.eslintrc.json`

**Rules**:
- TypeScript recommended rules
- React and React Hooks recommended rules
- Custom rules for unused variables, console usage, and type safety

**Run linting**:
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### Prettier

Prettier ensures consistent code formatting across the project.

**Configuration**: `.prettierrc`

**Run formatting**:
```bash
npm run format        # Format all files
npm run format:check  # Check formatting without making changes
```

## Code Organization

### Project Structure

The project follows Next.js App Router conventions:

```
app/              # Next.js pages and API routes
components/       # Reusable React components
lib/              # Utility functions and shared logic
types/            # TypeScript type definitions
__tests__/        # Test files
```

### DRY Principle

Repeated logic has been extracted to shared utilities:

- **`lib/formatters.ts`** - Data formatting functions (`formatList`, `normalizeArray`)
- **`lib/utils.ts`** - General utilities (`cn` for class merging)
- **`lib/supabase.ts`** - Supabase client and auth helpers

### Component Organization

- **UI Components**: `components/ui/` - Reusable, stateless UI components
- **Feature Components**: `components/` - Feature-specific components
- **Dashboard Components**: `components/dashboard/` - Dashboard-specific components

## 12-Factor App Compliance

### I. Codebase
✅ Single codebase tracked in version control

### II. Dependencies
✅ Dependencies explicitly declared in `package.json`

### III. Config
✅ Configuration via environment variables (`.env.local`)
- All sensitive data (API keys, URLs) stored in environment variables
- No hardcoded credentials or configuration values
- Example: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### IV. Backing Services
✅ Database (Supabase) treated as attached resource
- Can be swapped via environment variables

### V. Build, Release, Run
✅ Strict separation:
- **Build**: `npm run build` - Creates production build
- **Release**: Deployment platform (Vercel/Railway) handles releases
- **Run**: `npm start` - Runs production server

### VI. Processes
✅ Stateless processes
- No shared state between requests
- Session data stored in Supabase

### VII. Port Binding
✅ Uses `PORT` environment variable (Next.js default: 3000)

### VIII. Concurrency
✅ Stateless design supports horizontal scaling

### IX. Disposability
✅ Fast startup and graceful shutdown
- No long-running processes
- Stateless design allows quick restarts

### X. Dev/Prod Parity
✅ Same codebase for development and production
- Environment variables handle differences
- Same dependencies and tools

### XI. Logs
✅ Logs treated as event streams
- Uses `console.log`, `console.warn`, `console.error`
- Can be captured by deployment platform

### XII. Admin Processes
✅ Admin tasks run as one-off processes
- Database migrations via Supabase SQL Editor
- Admin dashboard for management tasks

## Environment Variables

All configuration is done via environment variables. Create a `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Credentials (optional)
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password

# Port (optional, defaults to 3000)
PORT=3000
```

**Important**: Never commit `.env.local` to version control (it's in `.gitignore`)

## Type Safety

- TypeScript is used throughout the project
- Type definitions in `types/database.ts`
- Avoid `any` types where possible (ESLint warns on `any` usage)

## Best Practices

### 1. Error Handling

- Always handle errors in async operations
- Provide user-friendly error messages
- Log errors for debugging

```typescript
try {
  const result = await someAsyncOperation()
  // Handle success
} catch (error) {
  console.error("Operation failed:", error)
  setError("User-friendly error message")
}
```

### 2. Defensive Programming

- Check for null/undefined before accessing properties
- Validate user input
- Handle edge cases

```typescript
if (!data || !data.items) {
  return []
}
```

### 3. Component Design

- Keep components small and focused
- Prefer functional components with hooks
- Extract reusable logic to custom hooks or utilities

### 4. State Management

- Use React hooks (`useState`, `useEffect`, `useCallback`)
- Minimize state - derive values when possible
- Use proper dependency arrays in hooks

### 5. Performance

- Use `useCallback` and `useMemo` for expensive operations
- Lazy load components when appropriate
- Optimize images (consider Next.js `Image` component)

## Pre-commit Checklist

Before committing code:

- [ ] Run `npm run lint` and fix any errors
- [ ] Run `npm run format` to ensure consistent formatting
- [ ] Run `npm test` to ensure all tests pass
- [ ] Verify no hardcoded values (use environment variables)
- [ ] Check for console.log statements (remove or convert to appropriate log level)
- [ ] Ensure TypeScript compiles without errors

## CI/CD Integration

For continuous integration, ensure:

1. Linting passes: `npm run lint`
2. Tests pass: `npm test`
3. Build succeeds: `npm run build`
4. No TypeScript errors: `tsc --noEmit`

## Code Review Guidelines

When reviewing code:

1. Check for adherence to coding standards
2. Verify error handling is present
3. Ensure tests cover new functionality
4. Verify no hardcoded values
5. Check for security issues (XSS, SQL injection, etc.)
6. Verify accessibility considerations

