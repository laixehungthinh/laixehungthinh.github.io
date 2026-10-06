-- LAIXEHUNGTHICH - Supabase schema
create table if not exists public.exam_sets (
  id integer primary key,
  name text not null,
  duration_minutes integer not null default 19,
  questions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.exam_sets enable row level security;
create policy "Public can read exam sets" on public.exam_sets for select using (true);
create policy "Authenticated admins can insert exam sets" on public.exam_sets for insert to authenticated with check (true);
create policy "Authenticated admins can update exam sets" on public.exam_sets for update to authenticated using (true) with check (true);
create policy "Authenticated admins can delete exam sets" on public.exam_sets for delete to authenticated using (true);
