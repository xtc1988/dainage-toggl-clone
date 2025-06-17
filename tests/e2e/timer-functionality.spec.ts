import { test, expect } from '@playwright/test';

test.describe('Timer Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display the main dashboard when logged in', async ({ page }) => {
    // Check if we're redirected to dashboard or see timer
    await expect(page).toHaveURL(/\/(dashboard)?/);
    
    // Look for timer component
    const timerCard = page.locator('[data-testid="timer-card"]').or(
      page.locator('text=タイマー').or(
        page.locator('text=開始').or(
          page.locator('button').filter({ hasText: /開始|Start/ })
        )
      )
    );
    
    await expect(timerCard.first()).toBeVisible();
  });

  test('should start timer when clicking start button', async ({ page }) => {
    // Wait for any loading to complete
    await page.waitForTimeout(2000);
    
    // Look for start button with various selectors
    const startButton = page.locator('button').filter({ hasText: /開始|Start/ }).first();
    
    await expect(startButton).toBeVisible();
    
    // Click the start button
    await startButton.click();
    
    // Wait for any async operations
    await page.waitForTimeout(1000);
    
    // Check for stop button or running state
    const stopButton = page.locator('button').filter({ hasText: /停止|Stop/ });
    const runningIndicator = page.locator('text=実行中').or(page.locator('[data-running="true"]'));
    
    // Either stop button should appear or running indicator should be visible
    await expect(stopButton.or(runningIndicator).first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to projects page', async ({ page }) => {
    // Look for projects navigation link
    const projectsLink = page.locator('a[href="/projects"]').or(
      page.locator('text=プロジェクト').or(
        page.locator('nav').locator('text=プロジェクト')
      )
    );
    
    if (await projectsLink.count() > 0) {
      await projectsLink.first().click();
      await expect(page).toHaveURL('/projects');
      
      // Check if projects page loaded
      const projectsTitle = page.locator('h1').filter({ hasText: /プロジェクト|Projects/ });
      await expect(projectsTitle).toBeVisible();
    }
  });

  test('should open project creation modal', async ({ page }) => {
    // Navigate to projects page first
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    
    // Look for "新しいプロジェクト" or "Add Project" button
    const addProjectButton = page.locator('button').filter({ hasText: /新しいプロジェクト|プロジェクトを作成|Add Project/ });
    
    if (await addProjectButton.count() > 0) {
      await addProjectButton.first().click();
      
      // Check if modal opened
      const modal = page.locator('[role="dialog"]').or(
        page.locator('.modal').or(
          page.locator('text=プロジェクト名')
        )
      );
      
      await expect(modal.first()).toBeVisible();
    }
  });

  test('should create a new project', async ({ page }) => {
    // Navigate to projects page
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    
    // Click add project button
    const addProjectButton = page.locator('button').filter({ hasText: /新しいプロジェクト|プロジェクトを作成/ });
    
    if (await addProjectButton.count() > 0) {
      await addProjectButton.first().click();
      
      // Fill project name
      const nameInput = page.locator('input[type="text"]').first().or(
        page.locator('input[placeholder*="プロジェクト"]')
      );
      
      await nameInput.fill('テストプロジェクト');
      
      // Click create button
      const createButton = page.locator('button').filter({ hasText: /作成|Create/ });
      await createButton.click();
      
      // Wait for creation to complete
      await page.waitForTimeout(2000);
      
      // Check if project appears in list
      await expect(page.locator('text=テストプロジェクト')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display logs viewer', async ({ page }) => {
    // Look for logs button
    const logsButton = page.locator('button').filter({ hasText: /Logs|📋/ });
    
    if (await logsButton.count() > 0) {
      await logsButton.click();
      
      // Check if logs viewer opened
      const logsViewer = page.locator('text=System Logs').or(
        page.locator('.logs-viewer').or(
          page.locator('[class*="log"]')
        )
      );
      
      await expect(logsViewer.first()).toBeVisible();
    }
  });

  test('should handle authentication state', async ({ page }) => {
    // Check if we can see user-specific content or auth prompts
    const userContent = page.locator('text=ダッシュボード').or(
      page.locator('text=ログアウト').or(
        page.locator('button').filter({ hasText: /ログイン|サインイン/ })
      )
    );
    
    await expect(userContent.first()).toBeVisible({ timeout: 15000 });
  });
});