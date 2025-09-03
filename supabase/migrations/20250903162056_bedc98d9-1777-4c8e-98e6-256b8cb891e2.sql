-- Update user a61f615c-e3a3-4cfa-970e-0f324b9aecb4 to super_admin role
UPDATE user_roles 
SET role = 'super_admin', updated_at = now()
WHERE user_id = 'a61f615c-e3a3-4cfa-970e-0f324b9aecb4';

-- If the user doesn't have a role record, insert one
INSERT INTO user_roles (user_id, role, college_id)
SELECT 'a61f615c-e3a3-4cfa-970e-0f324b9aecb4', 'super_admin'::app_role, NULL
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = 'a61f615c-e3a3-4cfa-970e-0f324b9aecb4'
);