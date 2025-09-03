-- 1) Create report_history table to log generated reports
create table if not exists public.report_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  college_id uuid null,
  name text not null,
  report_type text not null,
  export_format text not null,
  size_bytes integer null,
  generated_at timestamptz not null default now(),
  filters jsonb null,
  file_url text null
);

-- Enable Row Level Security
alter table public.report_history enable row level security;

-- 2) Auto-fill college_id on insert using existing helper
drop trigger if exists report_history_auto_college on public.report_history;
create trigger report_history_auto_college
before insert on public.report_history
for each row
execute function public.auto_fill_college_id();

-- 3) RLS policies
-- Users can insert own report history
create policy "Users can insert own report history"
  on public.report_history
  for insert
  with check (
    auth.uid() = user_id
    and (
      college_id is null
      or college_id = public.get_user_college()
    )
  );

-- Users can view report history in their college or own
create policy "Users can view report history in their college or own"
  on public.report_history
  for select
  using (
    public.has_role(auth.uid(), 'super_admin'::app_role)
    or (college_id = public.get_user_college())
    or (user_id = auth.uid())
  );

-- Allow users to delete their own records (optional housekeeping)
create policy "Users can delete own report history"
  on public.report_history
  for delete
  using (auth.uid() = user_id);

-- 4) Helpful indexes
create index if not exists idx_report_history_generated_at on public.report_history (generated_at desc);
create index if not exists idx_report_history_user_id on public.report_history (user_id);
create index if not exists idx_report_history_college_id on public.report_history (college_id);

-- (Optional) Realtime support if you'd like live updates in the UI
alter table public.report_history replica identity full;
-- Add to publication only if not already present; if it errors because already added, it's safe to ignore
do $$
begin
  perform 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'report_history';
  if not found then
    execute 'alter publication supabase_realtime add table public.report_history';
  end if;
end $$;