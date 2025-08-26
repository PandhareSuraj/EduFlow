
-- Ensure the correct roles exist for the demo users.
-- This only INSERTS missing role rows; it does not delete or overwrite anything.
-- It also assigns college_id for college-scoped roles and leaves it NULL for super_admin.

insert into public.user_roles (user_id, role, college_id)
select
  u.id,
  rm.role,
  case
    when rm.role = 'super_admin'::app_role then null
    else c.id
  end as college_id
from auth.users u
join (
  values
    ('super@college.com'::text,     'super_admin'::app_role),
    ('admin@college.com'::text,     'admin'::app_role),
    ('teacher@college.com'::text,   'teacher'::app_role),
    ('accountant@college.com'::text,'accountant'::app_role),
    ('librarian@college.com'::text, 'librarian'::app_role),
    ('clerk@college.com'::text,     'clerk'::app_role),
    ('assistant@college.com'::text, 'assistant'::app_role),
    ('student@college.com'::text,   'student'::app_role)
) as rm(email, role) on u.email = rm.email
left join public.colleges c on c.code = 'KKPPC'
left join public.user_roles ur
  on ur.user_id = u.id and ur.role = rm.role
where ur.user_id is null;
