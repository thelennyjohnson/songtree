-- Admin identities are inserted manually in the Supabase SQL editor after the
-- corresponding Google user has signed in. Never grant this role from the client.
create table if not exists public.songtree_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.songtree_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.songtree_admins where user_id = auth.uid());
$$;

alter table public.songtree_songs add column if not exists moderation_status text not null default 'published'
  check (moderation_status in ('published', 'restricted_pending_review', 'removed'));
alter table public.songtree_songs add column if not exists chart_rank_override integer;

create table if not exists public.songtree_reports (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songtree_songs(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete restrict default auth.uid(),
  reason text not null check (reason in ('copyright', 'unauthorized_sources', 'illegal_or_harmful', 'other_policy')),
  details text not null check (char_length(details) between 10 and 4000),
  status text not null default 'open' check (status in ('open', 'restricted_pending_review', 'closed')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists songtree_reports_status_idx on public.songtree_reports(status, created_at desc);

alter table public.songtree_admins enable row level security;
alter table public.songtree_reports enable row level security;

create policy "No client access to admin roster" on public.songtree_admins for select to authenticated using (false);
create policy "Signed-in users submit good-faith reports" on public.songtree_reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "Reporters see their own reports" on public.songtree_reports for select to authenticated using (reporter_id = auth.uid() or public.songtree_is_admin());
create policy "Admins review reports" on public.songtree_reports for update to authenticated using (public.songtree_is_admin()) with check (public.songtree_is_admin());
create policy "Admins moderate songs" on public.songtree_songs for update to authenticated using (public.songtree_is_admin()) with check (public.songtree_is_admin());

-- Public feeds must omit restricted/removed tracks. This replaces the broad public read policy.
drop policy if exists "Published songs are readable" on public.songtree_songs;
create policy "Public songs are readable" on public.songtree_songs for select using (moderation_status = 'published' or creator_id = auth.uid() or public.songtree_is_admin());

-- Activity score powers the default Top 50. An admin-set chart_rank_override wins;
-- otherwise scores can be recalculated by a scheduled server function.
create table if not exists public.songtree_song_activity (
  song_id uuid primary key references public.songtree_songs(id) on delete cascade,
  play_count bigint not null default 0,
  page_visit_count bigint not null default 0,
  remix_count bigint not null default 0,
  activity_score numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- After first Google login, make yourself an administrator in SQL:
-- insert into public.songtree_admins (user_id) values ('YOUR_AUTH_USER_UUID');
