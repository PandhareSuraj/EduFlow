-- Insert demo users for each role
-- Note: These will be created when users actually sign up, this is just for reference
-- We'll create them through the auth.users table indirectly by using the signup process

-- First, let's create a function to handle demo user creation
CREATE OR REPLACE FUNCTION create_demo_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
  teacher_user_id uuid;
  clerk_user_id uuid;
  librarian_user_id uuid;
  accountant_user_id uuid;
  assistant_user_id uuid;
BEGIN
  -- Create demo profiles (assuming these users will be created through signup)
  -- Admin demo user
  INSERT INTO public.profiles (id, full_name, phone, department, employee_id)
  VALUES (
    'aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid,
    'Admin Demo User',
    '+91-9876543210',
    'Administration',
    'ADM001'
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Teacher demo user  
  INSERT INTO public.profiles (id, full_name, phone, department, employee_id)
  VALUES (
    'aaaaaaaa-bbbb-cccc-dddd-222222222222'::uuid,
    'Teacher Demo User',
    '+91-9876543211',
    'Academic',
    'TCH001'
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Clerk demo user
  INSERT INTO public.profiles (id, full_name, phone, department, employee_id)
  VALUES (
    'aaaaaaaa-bbbb-cccc-dddd-333333333333'::uuid,
    'Clerk Demo User',
    '+91-9876543212',
    'Administration',
    'CLK001'
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Librarian demo user
  INSERT INTO public.profiles (id, full_name, phone, department, employee_id)
  VALUES (
    'aaaaaaaa-bbbb-cccc-dddd-444444444444'::uuid,
    'Librarian Demo User',
    '+91-9876543213',
    'Library',
    'LIB001'
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Accountant demo user
  INSERT INTO public.profiles (id, full_name, phone, department, employee_id)
  VALUES (
    'aaaaaaaa-bbbb-cccc-dddd-555555555555'::uuid,
    'Accountant Demo User',
    '+91-9876543214',
    'Finance',
    'ACC001'
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Assistant demo user
  INSERT INTO public.profiles (id, full_name, phone, department, employee_id)
  VALUES (
    'aaaaaaaa-bbbb-cccc-dddd-666666666666'::uuid,
    'Assistant Demo User',
    '+91-9876543215',
    'Support',
    'AST001'
  ) ON CONFLICT (id) DO NOTHING;

  -- Create user roles for demo users
  INSERT INTO public.user_roles (user_id, role)
  VALUES 
    ('aaaaaaaa-bbbb-cccc-dddd-111111111111'::uuid, 'admin'),
    ('aaaaaaaa-bbbb-cccc-dddd-222222222222'::uuid, 'teacher'),
    ('aaaaaaaa-bbbb-cccc-dddd-333333333333'::uuid, 'clerk'),
    ('aaaaaaaa-bbbb-cccc-dddd-444444444444'::uuid, 'librarian'),
    ('aaaaaaaa-bbbb-cccc-dddd-555555555555'::uuid, 'accountant'),
    ('aaaaaaaa-bbbb-cccc-dddd-666666666666'::uuid, 'assistant')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Execute the function
SELECT create_demo_users();