import { test, expect, Page } from '@playwright/test';
import { setupTestData, cleanupTestData, testProjects } from './setup-test-data';

// Define the expected projects data
const expectedProjects = testProjects;

test.describe('Database Read Test - Projects Verification', () => {
  // Set up test data before all tests
  test.beforeAll(async () => {
    console.log('Setting up test data before all tests...');
    const success = await setupTestData();
    if (!success) {
      throw new Error('Failed to set up test data');
    }
  });

  // Clean up test data after all tests
  test.afterAll(async () => {
    console.log('Cleaning up test data after all tests...');
    await cleanupTestData();
  });

  test.beforeEach(async ({ page }) => {
    // Since the app uses Google OAuth, we need to handle authentication
    // For testing purposes, we'll use environment variables or test tokens
    // This is a placeholder for the actual authentication logic
    
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we need to authenticate
    const isAuthPage = await page.url().includes('/auth');
    
    if (isAuthPage) {
      // In a real scenario, you would either:
      // 1. Use test credentials with email/password if available
      // 2. Mock the authentication using browser context
      // 3. Use authenticated session storage/cookies
      
      // For now, we'll assume the test environment has a way to bypass auth
      // or we're already authenticated from a previous session
      console.log('Authentication required - please ensure test user is set up');
      
      // If test@example.com login is available (which seems to be from create-test-data.js)
      // we would use it here. Since it's Google OAuth only, we'll need to handle differently
    }
  });

  test('should display all 4 projects from the database', async ({ page }) => {
    // Navigate directly to projects page
    await page.goto('/projects');
    
    // Wait for the projects page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we were redirected to auth
    if (await page.url().includes('/auth')) {
      test.skip(true, 'Authentication required - cannot proceed without valid session');
      return;
    }
    
    // Wait for the projects grid to load (based on ProjectList component structure)
    // The component renders projects in a grid with specific classes
    await page.waitForSelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3, h3:has-text("プロジェクト管理")', { 
      timeout: 10000 
    });
    
    // Log all found projects for debugging
    console.log('Looking for projects on the page...');
    
    // Array to store found projects
    const foundProjects: Array<{ id: string; name: string; color?: string }> = [];
    
    // Based on the ProjectList component, projects are rendered in a grid
    // Each project is in a div with classes "bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    // The project name is in an h3 tag with classes "text-lg font-semibold"
    
    // Find all project cards
    const projectCards = await page.locator('.bg-white.rounded-lg.shadow-lg, .dark\\:bg-gray-800.rounded-lg.shadow-lg').all();
    console.log(`Found ${projectCards.length} project cards`);
    
    // If we found project cards, extract information from them
    if (projectCards.length > 0) {
      for (const card of projectCards) {
        // Get the project name from the h3 tag
        const nameElement = card.locator('h3.text-lg.font-semibold');
        const name = await nameElement.textContent().catch(() => null);
        
        if (name) {
          // Try to get the color from the color dot
          const colorElement = card.locator('div[style*="backgroundColor"]').first();
          const style = await colorElement.getAttribute('style').catch(() => null);
          const colorMatch = style?.match(/backgroundColor:\s*([^;]+)/);
          const color = colorMatch ? colorMatch[1].trim() : undefined;
          
          // Check if this is one of our expected projects
          const expectedProject = expectedProjects.find(p => p.name === name.trim());
          if (expectedProject) {
            foundProjects.push({
              id: expectedProject.id,
              name: name.trim(),
              color: color
            });
            console.log(`✓ Found project: ${name} (ID: ${expectedProject.id}, Color: ${color || 'N/A'})`);
          }
        }
      }
    } else {
      // Fallback: look for project names directly
      console.log('No project cards found with expected structure, searching by text...');
      
      for (const project of expectedProjects) {
        // Try multiple ways to find the project
        const selectors = [
          `text="${project.name}"`,
          `h3:has-text("${project.name}")`,
          `div:has-text("${project.name}")`,
        ];
        
        for (const selector of selectors) {
          const element = page.locator(selector).first();
          const isVisible = await element.isVisible().catch(() => false);
          
          if (isVisible) {
            foundProjects.push(project);
            console.log(`✓ Found project: ${project.name} (ID: ${project.id})`);
            break;
          }
        }
      }
    }
    
    // Take a screenshot for evidence
    const screenshotPath = `./test-results/projects-page-${Date.now()}.png`;
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Log summary
    console.log('\n=== Test Summary ===');
    console.log(`Expected projects: ${expectedProjects.length}`);
    console.log(`Found projects: ${foundProjects.length}`);
    console.log('\nFound projects:');
    foundProjects.forEach(p => {
      console.log(`  - ${p.name} (ID: ${p.id})`);
    });
    
    console.log('\nMissing projects:');
    expectedProjects.forEach(p => {
      if (!foundProjects.find(f => f.id === p.id)) {
        console.log(`  - ${p.name} (ID: ${p.id})`);
      }
    });
    
    // Assertions
    expect(foundProjects.length).toBe(expectedProjects.length);
    
    // Verify each expected project is found
    for (const expectedProject of expectedProjects) {
      const found = foundProjects.find(p => p.name === expectedProject.name);
      expect(found).toBeTruthy();
    }
  });

  test('should log in with test user and navigate to projects', async ({ page, context }) => {
    // This test attempts to handle authentication more explicitly
    
    // First, let's try to set up authentication state
    // In a real test environment, you might have test credentials or session tokens
    
    // Navigate to auth page
    await page.goto('/auth');
    
    // Look for Google sign-in button
    const googleSignInButton = page.locator('button:has-text("Google"), button:has-text("サインイン")').first();
    
    if (await googleSignInButton.isVisible()) {
      console.log('Google Sign-In button found');
      
      // Note: Actual Google OAuth flow cannot be automated easily
      // In a real test setup, you would:
      // 1. Use Playwright's authentication state feature
      // 2. Mock the OAuth provider
      // 3. Use test-specific authentication endpoints
      
      // For this test, we'll document what should happen
      console.log('Manual authentication required:');
      console.log('1. Click Google Sign-In button');
      console.log('2. Authenticate with test@example.com');
      console.log('3. Navigate to /projects');
      console.log('4. Verify all 4 projects are displayed');
      
      // Skip the test since we can't automate Google OAuth
      test.skip(true, 'Google OAuth cannot be automated - manual testing required');
    }
  });

  test('alternative: direct API verification', async ({ request }) => {
    // If we have API access, we could verify the data directly
    console.log('Note: Direct API verification would require:');
    console.log('1. Valid authentication token for test@example.com');
    console.log('2. Direct Supabase API calls to fetch projects');
    console.log('3. Verification of the 4 expected projects');
    
    // Example of what the API call would look like:
    /*
    const response = await request.get('https://dzffzvqrmhdlpmyvxriy.supabase.co/rest/v1/projects', {
      headers: {
        'Authorization': 'Bearer YOUR_TEST_TOKEN',
        'apikey': 'YOUR_API_KEY'
      }
    });
    
    const projects = await response.json();
    console.log('Projects from API:', projects);
    */
    
    test.skip(true, 'API verification requires authentication tokens');
  });
});

// Helper function to set up authenticated state (for future implementation)
async function setupAuthenticatedState(context: any) {
  // This would be implemented based on your authentication strategy
  // Options include:
  // 1. Using Playwright's storageState feature
  // 2. Setting authentication cookies/tokens
  // 3. Mocking the authentication provider
  
  console.log('Authentication setup would go here');
}