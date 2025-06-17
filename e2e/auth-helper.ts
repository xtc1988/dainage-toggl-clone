import { Page } from '@playwright/test';

/**
 * Helper functions for handling authentication in E2E tests
 */

export const testUserId = '3b5bbb6c-e875-4d67-8a67-3404ee1cbc88';
export const testUserEmail = 'test@example.com';

/**
 * Check if the current page requires authentication
 */
export async function isAuthRequired(page: Page): Promise<boolean> {
  const url = page.url();
  return url.includes('/auth') || url.includes('/login');
}

/**
 * Mock authentication by setting localStorage/cookies
 * NOTE: This is a simplified example and would need to match your actual auth implementation
 */
export async function mockAuthentication(page: Page) {
  // Example: Set Supabase auth token in localStorage
  await page.evaluate((userId) => {
    // This is a mock - in reality you'd need a valid JWT token
    const mockSession = {
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: userId,
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: { name: 'Test User' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      }
    };
    
    // Supabase stores auth in localStorage
    localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession));
  }, testUserId);
  
  // Reload the page to apply the mocked auth
  await page.reload();
}

/**
 * Save authentication state after manual login
 */
export async function saveAuthState(page: Page, path: string = 'auth.json') {
  await page.context().storageState({ path });
  console.log(`Authentication state saved to ${path}`);
}

/**
 * Instructions for manual authentication setup
 */
export function getManualAuthInstructions(): string {
  return `
Manual Authentication Setup:
1. Start the application: npm run dev
2. Open browser and navigate to http://localhost:3000
3. Log in with your Google account
4. Open browser DevTools and run in Console:
   copy(JSON.stringify(localStorage))
5. Save the output for use in tests

Alternative - Use Playwright codegen:
npx playwright codegen http://localhost:3000 --save-storage=auth.json
Then use in tests: test.use({ storageState: 'auth.json' });
`;
}

/**
 * Wait for authentication to complete
 */
export async function waitForAuth(page: Page, timeout: number = 10000) {
  try {
    // Wait for redirect away from auth page
    await page.waitForFunction(
      () => !window.location.pathname.includes('/auth'),
      { timeout }
    );
    return true;
  } catch {
    return false;
  }
}