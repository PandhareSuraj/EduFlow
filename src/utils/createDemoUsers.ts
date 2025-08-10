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
  console.log('Creating demo users and demo data...');
  
  // First, get or create the college
  let collegeId: string;
  const { data: existingCollege } = await supabase
    .from('colleges')
    .select('id')
    .eq('code', 'KKPPC')
    .single();

  if (existingCollege) {
    collegeId = existingCollege.id;
  } else {
    const { data: newCollege, error: collegeError } = await supabase
      .from('colleges')
      .insert({
        name: 'KK Patil Paramedical College',
        code: 'KKPPC',
        email: 'admin@kkpatilcollege.edu.in',
        phone: '+91-9876543210',
        address: 'Mumbai, Maharashtra, India',
        status: 'active'
      })
      .select('id')
      .single();

    if (collegeError || !newCollege) {
      console.error('Error creating college:', collegeError);
      return;
    }
    collegeId = newCollege.id;
  }

  // Create demo courses
  const coursesData = [
    { name: 'Diploma in Medical Laboratory Technology (DMLT)', code: 'DMLT', duration_months: 24, college_id: collegeId },
    { name: 'Diploma in Radiology Technology (DRT)', code: 'DRT', duration_months: 24, college_id: collegeId },
    { name: 'Diploma in Operation Theatre Technology (DOTT)', code: 'DOTT', duration_months: 18, college_id: collegeId }
  ];

  const { data: insertedCourses } = await supabase
    .from('courses')
    .upsert(coursesData, { onConflict: 'code' })
    .select('id, code');

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
        
        // Insert or update user role and add college_id
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({ 
            user_id: data.user.id,
            role: user.role,
            college_id: collegeId
          }, { onConflict: 'user_id' });
            
        if (roleError) {
          console.error(`Error updating role for ${user.email}:`, roleError);
        } else {
          console.log(`Role updated to ${user.role} for ${user.email}`);
        }

        // If this is a student, create a student record
        if (user.role === 'student' && insertedCourses && insertedCourses.length > 0) {
          const { error: studentError } = await supabase
            .from('students')
            .upsert({
              name: user.full_name,
              email: user.email,
              mobile_number: user.phone,
              course_id: insertedCourses[0].id, // Assign to first course
              admission_date: '2023-07-01',
              year: 1,
              semester: 2,
              college_id: collegeId,
              status: 'active'
            }, { onConflict: 'email' });

          if (studentError) {
            console.error(`Error creating student record for ${user.email}:`, studentError);
          } else {
            console.log(`Student record created for ${user.email}`);
          }
        }
      }
    } catch (error) {
      console.error(`Unexpected error creating user ${user.email}:`, error);
    }
  }
  
  console.log('Demo users and data creation completed');
};

// Call this function manually in the console to create demo users
// createDemoUsers();