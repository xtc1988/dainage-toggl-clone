# E2E Tests for DAINAGE Toggl Clone

This directory contains end-to-end tests for verifying database connectivity and project display functionality.

## Test Overview

The main test file `test-db-read.spec.ts` verifies that:
1. The application can connect to the database
2. All 4 test projects are displayed correctly
3. Screenshots are captured as evidence

### Expected Projects

The test verifies these 4 projects are displayed:
- **Test Project** (ID: 550e8400-e29b-41d4-a716-446655440001)
- **dd** (ID: 0730508b-65fa-46f1-a934-eab61ab01231)
- **ooi** (ID: 6ae69e08-22c6-442b-9dd9-b9af97b9d09c)
- **claude code** (ID: 45f4c57c-064a-46ff-a3e1-89cd87d65547)

## Setup Instructions

### 1. Install Dependencies

Make sure Playwright is installed:
```bash
npm install @playwright/test @supabase/supabase-js
```

### 2. Set Up Test Data

Run the setup script to create test data in the database:
```bash
node e2e/run-setup.js
```

This will create:
- A test user: test@example.com
- All 4 required projects

### 3. Authentication Setup

Since the application uses Google OAuth, you have several options for testing:

#### Option A: Manual Authentication (Recommended for initial testing)
1. Start the application: `npm run dev`
2. Manually log in with a Google account
3. Run the tests while authenticated

#### Option B: Mock Authentication (For CI/CD)
Set up Playwright with authenticated state:
```javascript
// Save authenticated state after manual login
npx playwright codegen --save-storage=auth.json

// Use in tests
test.use({ storageState: 'auth.json' });
```

#### Option C: Test User with Direct Database Access
The test creates data for user ID `3b5bbb6c-e875-4d67-8a67-3404ee1cbc88`.
You would need to modify the application to allow test user authentication in development mode.

## Running the Tests

### Run all E2E tests:
```bash
npm run test:e2e
```

### Run specific test file:
```bash
npx playwright test e2e/test-db-read.spec.ts
```

### Run with UI mode (recommended for debugging):
```bash
npx playwright test --ui
```

### Run with headed browser (see the browser):
```bash
npx playwright test --headed
```

## Test Output

The tests will:
1. Log all found projects to the console
2. Save screenshots to `./test-results/` directory
3. Show a summary of found vs missing projects

## Troubleshooting

### Authentication Issues
- The test will skip if redirected to `/auth` page
- Ensure you're authenticated before running tests
- Consider using Playwright's authentication state feature

### Projects Not Found
- Check that test data was set up correctly: `node e2e/run-setup.js`
- Verify the user ID matches between test data and authenticated user
- Check browser console for any JavaScript errors

### Screenshot Location
Screenshots are saved with timestamp:
```
./test-results/projects-page-[timestamp].png
```

## CI/CD Integration

For CI/CD pipelines:
1. Set up test data as part of the pipeline
2. Use mocked authentication or test endpoints
3. Store screenshots as artifacts

## Notes

- The test uses multiple selectors to find projects for robustness
- Japanese text (プロジェクト管理) is included as the app uses Japanese UI
- The test handles both light and dark themes
- Color information is extracted when possible

## Future Improvements

1. Add email/password authentication for test users
2. Create API-level tests for direct database verification
3. Add visual regression testing for screenshots
4. Implement proper test user authentication flow