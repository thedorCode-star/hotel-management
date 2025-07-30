# Contributing to Hotel Management System

Thank you for your interest in contributing to our Hotel Management System! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Database Changes](#database-changes)

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/hotel-management.git
   cd hotel-management
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your database credentials.

3. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Code Style

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary

### React Components
- Use functional components with hooks
- Follow the naming convention: `PascalCase` for components
- Use proper prop types and interfaces

### File Structure
```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

### Naming Conventions
- **Files**: `kebab-case` (e.g., `user-profile.tsx`)
- **Components**: `PascalCase` (e.g., `UserProfile`)
- **Functions**: `camelCase` (e.g., `getUserData`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write tests for all new features
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

### Test Structure
```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interaction', () => {
    // Test implementation
  });
});
```

## Pull Request Process

1. **Ensure your code follows the style guidelines**
2. **Write or update tests as needed**
3. **Update documentation if necessary**
4. **Run the test suite**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```
5. **Commit your changes with a descriptive message**
   ```bash
   git commit -m "feat: add user authentication system"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Commit Message Format
We follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Issue Reporting

### Before Creating an Issue
1. Check if the issue has already been reported
2. Search the existing issues and pull requests
3. Try to reproduce the issue with the latest version

### Issue Template
Use the provided issue templates:
- [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)

## Database Changes

### Schema Changes
1. **Update the Prisma schema** in `prisma/schema.prisma`
2. **Generate the Prisma client**
   ```bash
   npm run db:generate
   ```
3. **Create a migration** (if using migrations)
   ```bash
   npm run db:migrate
   ```
4. **Update tests** that depend on the schema
5. **Update documentation** if necessary

### Migration Guidelines
- Always backup the database before running migrations
- Test migrations on a copy of production data
- Include rollback instructions in your PR
- Document breaking changes

## Code Review Process

1. **Automated Checks**: All PRs must pass CI/CD checks
2. **Code Review**: At least one maintainer must approve
3. **Testing**: Ensure all tests pass
4. **Documentation**: Update docs for new features

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Documentation**: Check the README and inline code comments

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to the Hotel Management System! 🏨 