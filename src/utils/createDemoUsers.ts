import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

// Demo users data
const demoUsers: Array<{
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: AppRole;
}> = [
  { 
    email: 'super@college.com', 
    password: '7588351751', 
    full_name: 'Super Admin',
    phone: '+91-7588351751',
    role: 'super_admin'
  },
  { 
    email: 'admin@demo.com', 
    password: 'demo123', 
    full_name: 'Admin Demo User',
    phone: '+91-9876543210',
    role: 'admin'
  },
  { 
    email: 'teacher@demo.com', 
    password: 'demo123', 
    full_name: 'Teacher Demo User',
    phone: '+91-9876543211',
    role: 'teacher'
  },
  { 
    email: 'clerk@demo.com', 
    password: 'demo123', 
    full_name: 'Clerk Demo User',
    phone: '+91-9876543212',
    role: 'clerk'
  },
  { 
    email: 'librarian@demo.com', 
    password: 'demo123', 
    full_name: 'Librarian Demo User',
    phone: '+91-9876543213',
    role: 'librarian'
  },
  { 
    email: 'accountant@demo.com', 
    password: 'demo123', 
    full_name: 'Accountant Demo User',
    phone: '+91-9876543214',
    role: 'accountant'
  },
  { 
    email: 'assistant@demo.com', 
    password: 'demo123', 
    full_name: 'Assistant Demo User',
    phone: '+91-9876543215',
    role: 'assistant'
  },
];

export const createDemoUsers = async () => {
  console.log('Creating demo users...');
  
  for (const user of demoUsers) {
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: user.full_name,
            phone: user.phone
          }
        }
      });

      if (error && error.message !== 'User already registered') {
        console.error(`Error creating user ${user.email}:`, error);
        continue;
      }

      if (data.user) {
        console.log(`User ${user.email} created successfully`);
        
        // Update user role (this will be done by the trigger, but we'll also do it manually to ensure)
        if (user.role !== 'assistant') {
          const { error: roleError } = await supabase
            .from('user_roles')
            .update({ role: user.role })
            .eq('user_id', data.user.id);
            
          if (roleError) {
            console.error(`Error updating role for ${user.email}:`, roleError);
          } else {
            console.log(`Role updated to ${user.role} for ${user.email}`);
          }
        }
      }
    } catch (error) {
      console.error(`Unexpected error creating user ${user.email}:`, error);
    }
  }
  
  console.log('Demo users creation completed');
};

// Call this function manually in the console to create demo users
// createDemoUsers();