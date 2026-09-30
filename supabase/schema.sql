-- Architect 2.0 prototype: the one table it needs.
-- Run this once in Supabase → SQL Editor.
-- Each person can only see and change their own projects.

create table if not exists public.projects (
  id text primary key,
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

drop policy if exists "Own projects" on public.projects;
create policy "Own projects" on public.projects
  for all
  using (owner = auth.uid())
  with check (owner = auth.uid());
