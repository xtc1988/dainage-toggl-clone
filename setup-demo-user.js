#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODg2NDgsImV4cCI6MjA2NTQ2NDY0OH0.TTQMimWRwFtWHSUTIOjnqMpOnEp-1SwL7ll3l8OnTVg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDemoUser() {
  try {
    console.log('🔧 Setting up demo user...');
    
    // Step 1: Try to sign up the user (if not already exists)
    console.log('📝 Creating demo user account...');
    const signUpResult = await supabase.auth.signUp({
      email: 'demo@dainage.app',
      password: 'DemoUser2024!',
    });
    
    if (signUpResult.error && !signUpResult.error.message.includes('already registered')) {
      console.error('❌ Failed to create user:', signUpResult.error.message);
      return false;
    }
    
    console.log('✅ Demo user account created or already exists');
    
    // Step 2: Check if user exists in database
    console.log('🔍 Checking user in database...');
    const { data: users, error: queryError } = await supabase
      .from('auth.users')
      .select('id, email, email_confirmed_at')
      .eq('email', 'demo@dainage.app');
    
    if (queryError) {
      console.log('ℹ️  Cannot query auth.users directly (expected in production)');
      console.log('📧 Please check your email for confirmation or manually confirm in Supabase dashboard');
      return false;
    }
    
    console.log('✅ Setup complete! Try logging in now.');
    return true;
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return false;
  }
}

async function testLogin() {
  try {
    console.log('🧪 Testing demo user login...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'demo@dainage.app',
      password: 'DemoUser2024!'
    });
    
    if (error) {
      console.error('❌ Login test failed:', error.message);
      console.log('');
      console.log('🛠️  Manual steps required:');
      console.log('1. Go to https://app.supabase.com/project/dzffzvqrmhdlpmyvxriy');
      console.log('2. Navigate to Authentication > Users');
      console.log('3. Find demo@dainage.app user');
      console.log('4. Click the user and confirm email manually');
      console.log('5. Or disable email confirmation in Auth settings');
      return false;
    } else {
      console.log('✅ Login test successful!');
      console.log('👤 User ID:', data.user?.id);
      await supabase.auth.signOut();
      return true;
    }
  } catch (error) {
    console.error('❌ Login test error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Demo User Setup Script');
  console.log('========================');
  
  const setupSuccess = await setupDemoUser();
  if (setupSuccess) {
    await testLogin();
  }
  
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Confirm the demo user email in Supabase dashboard');
  console.log('2. Run the SQL setup script in Supabase SQL editor');
  console.log('3. Test the demo login in your application');
}

if (require.main === module) {
  main();
}