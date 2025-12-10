# Psychiatry Directory & Appointment Request System

A complete Next.js web application for managing a psychiatrist directory and appointment requests. Built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Features

### Patient (Public)
- Browse a public list of psychiatrists
- View detailed psychiatrist profile pages
- Submit appointment request forms
- See on-screen confirmation messages after submission

### Psychiatrist (Authenticated)
- Login with Supabase authentication (email + password)
- Access dashboard showing their appointment requests
- View request details (name, email, preferred date/time, message)
- Update request status: Pending → Approved, Declined, or Completed

### Admin (Authenticated)
- Login using hardcoded admin credentials from .env
- Access dashboard to:
  - Add, edit, or delete psychiatrist profiles
  - View all appointment requests
  - See summary stats (total psychiatrists, total pending requests)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Supabase Auth (psychiatrists) + Environment variables (admin)
- **Database**: Supabase (PostgreSQL)
- **Forms**: React Hook Form
- **Theme**: Dark mode support with theme toggle

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account and project
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd psychiatry-booking
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   - Create a `.env.local` file in the root directory
   - Add the following environment variables:
     ```env
     # Supabase Configuration
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     
     # Admin Credentials (optional, for admin login)
     NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
     NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
     
     # Port Configuration (Next.js uses PORT env var automatically)
     # PORT=3000
     ```
   - **Note**: Never commit `.env.local` to version control. The app follows 12-Factor App principles and uses environment variables for all configuration.

4. **Configure Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from the Supabase dashboard
   - Update `.env.local` with your Supabase credentials

5. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the following SQL to create the required tables:

   ```sql
   -- Create psychiatrists table
   CREATE TABLE psychiatrists (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     specialty VARCHAR(255) NOT NULL,
     location VARCHAR(255) NOT NULL,
     bio TEXT NOT NULL,
     email VARCHAR(255) NOT NULL UNIQUE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
   );

   -- Create appointment_requests table
   CREATE TABLE appointment_requests (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     psychiatrist_id UUID NOT NULL REFERENCES psychiatrists(id) ON DELETE CASCADE,
     patient_name VARCHAR(255) NOT NULL,
     patient_email VARCHAR(255) NOT NULL,
     preferred_date DATE,
     preferred_time TIME,
     message TEXT,
     status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'completed')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
   );

   -- Enable Row Level Security (RLS)
   ALTER TABLE psychiatrists ENABLE ROW LEVEL SECURITY;
   ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;

   -- Create policies for public read access to psychiatrists
   CREATE POLICY "Psychiatrists are viewable by everyone" ON psychiatrists
     FOR SELECT USING (true);

   -- Create policies for inserting appointment requests (public)
   CREATE POLICY "Anyone can insert appointment requests" ON appointment_requests
     FOR INSERT WITH CHECK (true);

   -- Create policies for psychiatrists to view their own requests
   CREATE POLICY "Psychiatrists can view their own requests" ON appointment_requests
     FOR SELECT USING (
       psychiatrist_id IN (
         SELECT id FROM psychiatrists WHERE email = auth.jwt() ->> 'email'
       )
     );

   -- Create policies for psychiatrists to update their own requests
   CREATE POLICY "Psychiatrists can update their own requests" ON appointment_requests
     FOR UPDATE USING (
       psychiatrist_id IN (
         SELECT id FROM psychiatrists WHERE email = auth.jwt() ->> 'email'
       )
     );

   -- Create policies for authenticated users to view all requests (for admin)
   -- Note: Admin access is handled via application logic, not RLS
   CREATE POLICY "Authenticated users can view all requests" ON appointment_requests
     FOR SELECT USING (auth.role() = 'authenticated');

   -- Create index for faster queries
   CREATE INDEX idx_appointment_requests_psychiatrist_id ON appointment_requests(psychiatrist_id);
   CREATE INDEX idx_appointment_requests_status ON appointment_requests(status);
   CREATE INDEX idx_psychiatrists_email ON psychiatrists(email);
   ```

6. **Create a psychiatrist user in Supabase**
   - Go to Authentication > Users in your Supabase dashboard
   - Click "Add user" and create a user with email and password
   - Note: The email should match what you'll use in the psychiatrists table

7. **Add a test psychiatrist**
   - Option 1: Use the admin dashboard (after logging in as admin)
   - Option 2: Insert directly via Supabase SQL Editor:
     ```sql
     INSERT INTO psychiatrists (name, specialty, location, bio, email)
     VALUES (
       'Dr. Jane Smith',
       'General Psychiatry',
       'New York, NY',
       'Dr. Jane Smith is a board-certified psychiatrist with over 10 years of experience...',
       'jane.smith@example.com'
     );
     ```
   - Make sure the email matches a user in your Supabase Auth users table

8. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

9. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
psychiatry-booking/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   └── appointments/         # Appointment API endpoints
│   ├── dashboard/                # Dashboard page
│   ├── psychiatrist-login/       # Psychiatrist login page
│   ├── admin-login/              # Admin login page
│   ├── psychiatrist/[id]/        # Psychiatrist profile page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard components
│   ├── navbar.tsx                # Navigation component
│   ├── theme-provider.tsx        # Theme provider
│   ├── theme-toggle.tsx          # Theme toggle button
│   └── appointment-request-form.tsx  # Appointment form
├── lib/                          # Utility libraries
│   ├── supabase.ts               # Supabase client
│   ├── auth.ts                   # Admin auth utilities
│   └── utils.ts                  # General utilities
├── types/                        # TypeScript types
│   └── database.ts               # Database type definitions
└── public/                       # Static assets
```

## Routes

- `/` - Public psychiatrist directory
- `/psychiatrist/[id]` - Psychiatrist profile and appointment request form
- `/psychiatrist-login` - Psychiatrist login page
- `/admin-login` - Admin login page
- `/dashboard` - Shared dashboard (role-based rendering)

## Usage

### As a Patient
1. Browse psychiatrists on the home page
2. Click on a psychiatrist to view their profile
3. Fill out the appointment request form
4. Submit and see confirmation message

### As a Psychiatrist
1. Login at `/psychiatrist-login` with your Supabase credentials
2. Access your dashboard to view appointment requests
3. Update request statuses using the dropdown

### As an Admin
1. Login at `/admin-login` with admin credentials from `.env.local`
2. Access the admin dashboard
3. Manage psychiatrists (add, edit, delete)
4. View all appointment requests and stats

## Security Notes

- Admin credentials are stored in environment variables (not recommended for production)
- Supabase RLS (Row Level Security) is enabled for data protection
- Form validation is implemented on both client and server side
- Sensitive data should never be exposed to the client

## Development

### Code Quality

This project uses ESLint and Prettier for code quality and formatting:

```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without making changes
npm run format:check
```

### Testing

The project includes unit and integration tests using Jest and React Testing Library:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

#### Test Structure

- **Unit Tests**: Located in `__tests__/lib/` and `__tests__/components/`
  - Test utility functions and individual components
  - Cover edge cases and error handling

- **Integration Tests**: Located in `__tests__/integration/`
  - Test complete user flows (e.g., authentication, form submission)
  - Verify component interactions

#### Writing Tests

- Tests should cover both success and error paths
- Use descriptive test names that explain what is being tested
- Mock external dependencies (Supabase, Next.js router, etc.)
- Follow the Arrange-Act-Assert pattern

### Adding New Features

1. Create components in the `components/` directory
2. Add API routes in `app/api/` for server-side logic
3. Update types in `types/database.ts` as needed
4. Follow the existing code structure and patterns
5. Write tests for new functionality
6. Ensure code passes linting and formatting checks

### Styling

- Use Tailwind CSS utility classes
- Use shadcn/ui components for UI elements
- Follow the dark mode theme patterns
- Maintain responsive design

### Code Organization

The project follows Next.js App Router conventions and DRY principles:

- **Shared utilities**: `lib/formatters.ts`, `lib/utils.ts`
- **Reusable components**: `components/ui/` and `components/`
- **Type definitions**: `types/database.ts`
- **Environment configuration**: All config via `.env.local` (12-Factor App compliant)

## Troubleshooting

### Common Issues

1. **Supabase connection errors**
   - Verify your `.env.local` file has correct credentials
   - Check that your Supabase project is active
   - Ensure RLS policies are set up correctly

2. **Authentication not working**
   - Verify users exist in Supabase Auth
   - Check that psychiatrist emails match auth user emails
   - Verify RLS policies allow the necessary operations

3. **Appointment requests not showing**
   - Check that `psychiatrist_id` matches the psychiatrist's `id`
   - Verify RLS policies allow viewing requests
   - Check browser console for errors

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please open an issue on the repository.


