#!/usr/bin/env node

/**
 * Script to set up test data for E2E tests
 * Run this before running the E2E tests if you need to ensure test data exists
 * 
 * Usage: node e2e/run-setup.js
 */

import { setupTestData, testProjects } from './setup-test-data.js';

async function main() {
  console.log('🚀 Setting up test data for E2E tests\n');
  
  console.log('Will create the following test data:');
  console.log('- Test User: test@example.com (ID: 3b5bbb6c-e875-4d67-8a67-3404ee1cbc88)');
  console.log('- Projects:');
  testProjects.forEach(project => {
    console.log(`  - ${project.name} (ID: ${project.id}, Color: ${project.color})`);
  });
  
  console.log('\n📝 Executing setup...\n');
  
  const success = await setupTestData();
  
  if (success) {
    console.log('\n✅ Test data setup completed successfully!');
    console.log('\nYou can now run the E2E tests with:');
    console.log('  npm run test:e2e');
    console.log('  or');
    console.log('  npx playwright test e2e/test-db-read.spec.ts');
    process.exit(0);
  } else {
    console.error('\n❌ Test data setup failed!');
    console.error('Please check the error messages above and ensure:');
    console.error('1. The Supabase service role key is valid');
    console.error('2. The database tables exist');
    console.error('3. Network connection to Supabase is working');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});