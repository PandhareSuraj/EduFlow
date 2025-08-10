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
    password: 'demo123', 
    full_name: 'Super Admin',
    phone: '+91-7588351751',
    role: 'super_admin'
  },
  { 
    email: 'admin@college.com', 
    password: 'demo123', 
    full_name: 'College Admin',
    phone: '+91-9876543210',
    role: 'admin'
  },
  { 
    email: 'teacher@college.com', 
    password: 'demo123', 
    full_name: 'Demo Teacher',
    phone: '+91-9876543211',
    role: 'teacher'
  },
  { 
    email: 'student@college.com', 
    password: 'demo123', 
    full_name: 'Demo Student',
    phone: '+91-9876543214',
    role: 'student'
  },
  { 
    email: 'clerk@college.com', 
    password: 'demo123', 
    full_name: 'Demo Clerk',
    phone: '+91-9876543212',
    role: 'clerk'
  },
  { 
    email: 'librarian@college.com', 
    password: 'demo123', 
    full_name: 'Demo Librarian',
    phone: '+91-9876543213',
    role: 'librarian'
  },
  { 
    email: 'accountant@college.com', 
    password: 'demo123', 
    full_name: 'Demo Accountant',
    phone: '+91-9876543214',
    role: 'accountant'
  },
  { 
    email: 'assistant@college.com', 
    password: 'demo123', 
    full_name: 'Demo Assistant',
    phone: '+91-9876543215',
    role: 'assistant'
  },
];

export const createDemoUsers = async () => {
  console.log('Creating demo users...');

  // 1) Sign up all demo users (ignore "already registered" errors)
  for (const user of demoUsers) {
    try {
      const { error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: user.full_name,
            phone: user.phone,
          },
        },
      });

      if (error && error.message !== 'User already registered') {
        console.error(`Error creating user ${user.email}:`, error);
      }
    } catch (err) {
      console.error(`Unexpected error creating user ${user.email}:`, err);
    }
  }

  // 2) Finalize setup server-side via security definer RPC
  //    - Ensures college & courses exist
  //    - Assigns roles and college_id
  //    - Creates student row for the student account
  const demoPayload = demoUsers.map((u) => ({
    email: u.email,
    role: u.role,
    full_name: u.full_name,
    phone: u.phone,
  }));

  const { error: finalizeError } = await (supabase as any).rpc('finalize_demo_setup', {
    demo: demoPayload as unknown as any, // jsonb param
  });

  if (finalizeError) {
    console.error('Error finalizing demo setup:', finalizeError);
    throw finalizeError; // Let caller show a proper error toast
  }

  console.log('Demo users and data creation completed');
};

// Call this function manually in the console to create demo users
// createDemoUsers();