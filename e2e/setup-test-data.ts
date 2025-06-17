import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzffzvqrmhdlpmyvxriy.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmZ6dnFybWhkbHBteXZ4cml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTg4ODY0OCwiZXhwIjoyMDY1NDY0NjQ4fQ.0APoQxJKCq1U5FmRxQj_tAaAHN-RTmbLqLAO61ofGLY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

export const testUserId = '3b5bbb6c-e875-4d67-8a67-3404ee1cbc88';

export const testProjects = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Test Project',
    color: '#3B82F6',
    user_id: testUserId,
    description: 'Test project for E2E testing'
  },
  {
    id: '0730508b-65fa-46f1-a934-eab61ab01231',
    name: 'dd',
    color: '#10B981',
    user_id: testUserId,
    description: 'DD project'
  },
  {
    id: '6ae69e08-22c6-442b-9dd9-b9af97b9d09c',
    name: 'ooi',
    color: '#F59E0B',
    user_id: testUserId,
    description: 'OOI project'
  },
  {
    id: '45f4c57c-064a-46ff-a3e1-89cd87d65547',
    name: 'claude code',
    color: '#8B5CF6',
    user_id: testUserId,
    description: 'Claude Code project'
  }
];

export async function setupTestData() {
  console.log('Setting up test data...');
  
  try {
    // Create test user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User'
      })
      .select();
    
    if (userError) {
      console.error('User creation error:', userError);
    } else {
      console.log('Test user created/updated:', userData);
    }
    
    // Create test projects
    for (const project of testProjects) {
      const { data, error } = await supabase
        .from('projects')
        .upsert(project)
        .select();
      
      if (error) {
        console.error(`Error creating project ${project.name}:`, error);
      } else {
        console.log(`Project created/updated: ${project.name}`, data);
      }
    }
    
    // Verify projects were created
    const { data: allProjects, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', testUserId);
    
    if (fetchError) {
      console.error('Error fetching projects:', fetchError);
    } else {
      console.log('All test projects in database:', allProjects);
    }
    
    return true;
  } catch (error) {
    console.error('Setup test data failed:', error);
    return false;
  }
}

export async function cleanupTestData() {
  console.log('Cleaning up test data...');
  
  try {
    // Delete test projects
    const { error: projectsError } = await supabase
      .from('projects')
      .delete()
      .eq('user_id', testUserId);
    
    if (projectsError) {
      console.error('Error deleting projects:', projectsError);
    }
    
    // Note: We don't delete the user as it might be referenced by auth.users
    
    console.log('Test data cleanup completed');
    return true;
  } catch (error) {
    console.error('Cleanup test data failed:', error);
    return false;
  }
}