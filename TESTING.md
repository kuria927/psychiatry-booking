# Testing Guide

This document provides information about testing in the Psychiatry Booking application.

## Test Setup

The project uses:
- **Jest** - Test runner
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM elements

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Structure

### Unit Tests

Located in `__tests__/lib/` and `__tests__/components/`:

- **`__tests__/lib/utils.test.ts`** - Tests for utility functions (class name merging)
- **`__tests__/lib/formatters.test.ts`** - Tests for data formatting functions
  - `normalizeArray()` - Handles various array formats from Supabase
  - `formatList()` - Formats arrays as comma-separated strings
- **`__tests__/components/ui/button.test.tsx`** - Tests for Button component
  - Rendering
  - Variants and sizes
  - Event handling
  - Disabled state

### Integration Tests

Located in `__tests__/integration/`:

- **`__tests__/integration/auth.test.tsx`** - Authentication flow tests
  - Login success scenarios
  - Error handling
  - Sign out flow

## Writing Tests

### Test File Naming

- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.test.ts` or `*.test.tsx`
- Place in `__tests__/` directory or co-located with source files

### Test Structure

Follow the Arrange-Act-Assert pattern:

```typescript
describe("ComponentName", () => {
  it("should do something specific", () => {
    // Arrange - Set up test data and mocks
    const mockData = { ... }
    
    // Act - Execute the code being tested
    render(<Component data={mockData} />)
    
    // Assert - Verify the expected outcome
    expect(screen.getByText("Expected Text")).toBeInTheDocument()
  })
})
```

### Mocking

#### Next.js Router

```typescript
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    // ... other router methods
  }),
}))
```

#### Supabase

```typescript
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      // ... other auth methods
    },
  },
}))
```

### Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the component does, not how it does it
   - Test user interactions and outcomes

2. **Use Descriptive Test Names**
   - Test names should clearly describe what is being tested
   - Example: `"should display error message when login fails"`

3. **Test Edge Cases**
   - Empty states
   - Error conditions
   - Boundary values

4. **Keep Tests Isolated**
   - Each test should be independent
   - Use `beforeEach` and `afterEach` for setup/cleanup

5. **Mock External Dependencies**
   - Mock API calls, router, and other external services
   - Use `jest.fn()` for function mocks

## Coverage Goals

- Aim for >80% code coverage
- Focus on critical paths and business logic
- Don't aim for 100% coverage (some code may not need testing)

## Continuous Integration

Tests should be run:
- Before committing code (pre-commit hook recommended)
- In CI/CD pipeline
- Before merging pull requests

## Troubleshooting

### Tests Not Running

1. Ensure dependencies are installed: `npm install`
2. Check Jest configuration in `jest.config.js`
3. Verify test file naming matches patterns in `jest.config.js`

### Mock Issues

1. Ensure mocks are set up in `jest.setup.js` or test files
2. Clear mocks between tests using `jest.clearAllMocks()`
3. Verify mock implementations match actual API

### TypeScript Errors

1. Ensure `@types/jest` is installed
2. Check `tsconfig.json` includes test files
3. Verify Jest types are properly configured

