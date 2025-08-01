# 🧪 Testing Guide

## Overview

This project includes comprehensive tests covering authentication, API endpoints, and integration scenarios. The testing suite is designed to ensure reliability, security, and proper functionality of the hotel management system.

## Test Structure

```
src/__tests__/
├── auth.test.ts          # Authentication API tests
└── integration.test.ts   # Integration and flow tests
```

## Test Categories

### 1. Authentication Tests (`auth.test.ts`)

#### User Registration Tests
- ✅ **Valid Registration**: Tests successful user registration with valid data
- ✅ **Duplicate Email**: Tests rejection of registration with existing email
- ✅ **Invalid Email**: Tests validation of email format
- ✅ **Short Password**: Tests minimum password length validation
- ✅ **Short Name**: Tests minimum name length validation
- ✅ **Database Errors**: Tests graceful handling of database failures

#### User Login Tests
- ✅ **Valid Credentials**: Tests successful login with correct credentials
- ✅ **Non-existent Email**: Tests login rejection for unknown users
- ✅ **Incorrect Password**: Tests login rejection with wrong password
- ✅ **Invalid Email Format**: Tests email validation during login
- ✅ **Empty Password**: Tests password requirement validation
- ✅ **Database Errors**: Tests error handling during login

#### Authentication Check Tests
- ✅ **Valid Token**: Tests successful user data retrieval with valid token
- ✅ **Missing Token**: Tests rejection of requests without authentication
- ✅ **Invalid Token**: Tests rejection of requests with invalid tokens
- ✅ **Database Errors**: Tests error handling during auth checks

#### Logout Tests
- ✅ **Successful Logout**: Tests proper logout and cookie clearing

#### Security Tests
- ✅ **Malformed JSON**: Tests handling of invalid request bodies
- ✅ **Missing Fields**: Tests validation of required fields
- ✅ **Long Input Values**: Tests handling of extremely long inputs
- ✅ **SQL Injection**: Tests protection against SQL injection attempts
- ✅ **XSS Protection**: Tests handling of XSS attempts in input fields

#### Performance Tests
- ✅ **Concurrent Registration**: Tests handling of multiple simultaneous registrations
- ✅ **Rapid Login**: Tests handling of multiple rapid login attempts

### 2. Integration Tests (`integration.test.ts`)

#### Complete User Journey
- ✅ **Register → Login → Me → Logout**: Tests complete authentication flow
- ✅ **Failed Login After Registration**: Tests error handling in complete flow
- ✅ **Duplicate Registration**: Tests multiple registration attempts

#### Session Management
- ✅ **Session Persistence**: Tests session maintenance across requests
- ✅ **Expired Tokens**: Tests handling of expired authentication tokens

#### Error Recovery
- ✅ **Database Failures**: Tests recovery from database connection issues
- ✅ **Malformed Requests**: Tests graceful handling of various malformed requests

#### Security Scenarios
- ✅ **Brute Force Protection**: Tests protection against rapid failed login attempts
- ✅ **SQL Injection Prevention**: Tests protection against SQL injection attacks
- ✅ **XSS Prevention**: Tests protection against XSS attacks

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD pipeline
npm run test:ci
```

### Specific Test Categories

```bash
# Run only authentication tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests matching a specific pattern
npm test -- --testNamePattern="login"
```

### Coverage Reports

```bash
# Generate detailed coverage report
npm run test:coverage

# Coverage will be available in:
# - Console output
# - coverage/lcov-report/index.html (HTML report)
# - coverage/coverage-final.json (JSON report)
```

## Test Coverage Goals

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Test Scenarios Covered

### Authentication Scenarios

1. **Registration Scenarios**
   - Valid user registration
   - Duplicate email handling
   - Invalid input validation
   - Database error handling

2. **Login Scenarios**
   - Valid credentials
   - Invalid credentials
   - Non-existent users
   - Password validation

3. **Session Management**
   - Token validation
   - Session persistence
   - Logout functionality

### Security Scenarios

1. **Input Validation**
   - Email format validation
   - Password strength requirements
   - Name length validation

2. **Attack Prevention**
   - SQL injection attempts
   - XSS attack attempts
   - Brute force protection

3. **Error Handling**
   - Database connection failures
   - Malformed requests
   - Invalid tokens

### Performance Scenarios

1. **Load Testing**
   - Concurrent registrations
   - Rapid login attempts
   - Multiple authenticated requests

2. **Error Recovery**
   - Database failure recovery
   - Service restoration

## Mocking Strategy

### Database Mocking
- Uses Jest mocks for `getBuildSafeDatabase`
- Simulates database responses
- Tests error conditions

### External Dependencies
- Mocks `bcryptjs` for password hashing
- Mocks `jsonwebtoken` for JWT operations
- Isolates tests from external dependencies

### Request/Response Mocking
- Uses Next.js `NextRequest` for realistic API testing
- Simulates HTTP requests and responses
- Tests cookie handling and headers

## Best Practices

### Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Mock Management
- Reset mocks between tests
- Use `beforeEach` and `afterEach` hooks
- Keep mocks simple and focused

### Error Testing
- Test both success and failure scenarios
- Verify error messages and status codes
- Test edge cases and boundary conditions

### Security Testing
- Test input validation thoroughly
- Verify protection against common attacks
- Test authentication and authorization

## Continuous Integration

Tests are automatically run in the CI/CD pipeline:

1. **Lint and Type Check**: Code quality and type safety
2. **Unit Tests**: Fast feedback on core functionality
3. **Integration Tests**: End-to-end functionality verification
4. **Coverage Report**: Ensure adequate test coverage

## Debugging Tests

### Common Issues

1. **Mock Not Working**
   ```bash
   # Check if mocks are properly reset
   jest.clearAllMocks();
   ```

2. **Async Test Failures**
   ```bash
   # Ensure proper async/await usage
   it('should handle async', async () => {
     const result = await someAsyncFunction();
     expect(result).toBeDefined();
   });
   ```

3. **Database Connection Issues**
   ```bash
   # Verify database is running
   npm run db:studio
   ```

### Debug Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test auth.test.ts

# Run tests with debug output
DEBUG=* npm test
```

## Adding New Tests

### For New API Endpoints

1. Create test file in `src/__tests__/`
2. Import the API route handler
3. Mock dependencies
4. Test success and failure scenarios
5. Add to appropriate test category

### For New Features

1. Add unit tests for individual functions
2. Add integration tests for complete flows
3. Add security tests for new inputs
4. Update coverage goals if needed

## Test Data Management

- Use realistic test data
- Avoid hardcoded values
- Clean up test data after tests
- Use factories for complex objects

## Performance Considerations

- Keep tests fast and focused
- Use appropriate timeouts
- Mock expensive operations
- Avoid unnecessary database calls 