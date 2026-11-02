-- Songtree web-launch data model. MP3s belong in the private `song-mp3s` bucket;
-- WAV/FLAC/stems remain in a creator-controlled Google Drive, Dropbox, or MEGA folder.

create table if not exists public.songtree_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique check (handle ~ '^@[A-Za-z0-9._]{3,20}$'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  birth_date date not null,
  bio text not null default '' check (char_length(bio) <= 280),
  instagram_url text,
  x_url text,
  tiktok_url text,
  youtube_url text,
  plan text not null default 'free' check (plan in ('free', 'premium_monthly', 'premium_annual')),
  created_at timestamptz not null default now(),
  constraint instagram_domain check (instagram_url is null or instagram_url ~* '^https?://(www\.)?instagram\.com/[A-Za-z0-9._-]+/?$'),
  constraint x_domain check (x_url is null or x_url ~* '^https?://(www\.)?(x\.com|twitter\.com)/[A-Za-z0-9_]+/?$'),
  constraint tiktok_domain check (tiktok_url is null or tiktok_url ~* '^https?://(www\.)?tiktok\.com/@[A-Za-z0-9._-]+/?$'),
  constraint youtube_domain check (youtube_url is null or youtube_url ~* '^https?://((www\.)?youtube\.com/(channel|@)[A-Za-z0-9._-]+|youtu\.be/[A-Za-z0-9_-]+)/?$')
);

create table if not exists public.songtree_songs (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.songtree_profiles(id) on delete restrict,
  parent_song_id uuid references public.songtree_songs(id) on delete restrict,
  root_song_id uuid references public.songtree_songs(id) on delete restrict,
  title text not null check (char_length(title) between 1 and 160),
  kind text not null check (kind in ('beat', 'vocals', 'beat_vocals')),
  mp3_path text not null,
  duration_seconds integer not null check (duration_seconds > 0),
  source_folder_url text not null check (source_folder_url ~* '^https?://((drive\.google\.com)|(www\.)?dropbox\.com|(www\.)?mega\.nz)/.+'),
  bpm numeric(6,2),
  daw text,
  plugins_instruments text,
  external_license text not null default 'split' check (external_license in ('split', 'exclusive', 'dm')),
  exclusive_price_usd numeric(10,2),
  original_work_confirmed boolean not null default false check (original_work_confirmed),
  sources_synced_confirmed boolean not null default false check (sources_synced_confirmed),
  published_at timestamptz not null default now(),
  constraint finished_song_dm_only check (kind <> 'beat_vocals' or external_license = 'dm'),
  constraint exclusive_price_required check (external_license <> 'exclusive' or exclusive_price_usd is not null and exclusive_price_usd > 0)
);

create index if not exists songtree_songs_creator_idx on public.songtree_songs(creator_id);
create index if not exists songtree_songs_parent_idx on public.songtree_songs(parent_song_id);
create index if not exists songtree_songs_root_idx on public.songtree_songs(root_song_id);

-- A remix can be published on Songtree, but it never issues a new external license.
create or replace function public.songtree_enforce_song_rules()
returns trigger language plpgsql security invoker set search_path = public as $$
declare
  profile_age integer;
begin
  select extract(year from age(current_date, birth_date)) into profile_age
  from public.songtree_profiles where id = new.creator_id;
  if profile_age is null or profile_age < 13 then
    raise exception 'Listener-only accounts cannot upload songs';
  end if;
  if new.parent_song_id is null then
    new.root_song_id := new.id;
  else
    select root_song_id into new.root_song_id from public.songtree_songs where id = new.parent_song_id;
    if new.root_song_id is null then raise exception 'Remix parent was not found'; end if;
    new.external_license := 'dm';
    new.exclusive_price_usd := null;
  end if;
  return new;
end $$;

drop trigger if exists songtree_enforce_song_rules on public.songtree_songs;
create trigger songtree_enforce_song_rules before insert or update on public.songtree_songs
for each row execute function public.songtree_enforce_song_rules();

-- Total active MP3 duration is 60 minutes on the free tier. Deleting a track restores capacity.
create or replace function public.songtree_assert_free_upload_quota()
returns trigger language plpgsql security invoker set search_path = public as $$
declare
  current_seconds integer;
begin
  select coalesce(sum(duration_seconds), 0) into current_seconds
  from public.songtree_songs where creator_id = new.creator_id and id <> coalesce(new.id, gen_random_uuid());
  if current_seconds + new.duration_seconds > (case when (select plan from public.songtree_profiles where id = new.creator_id) = 'free' then 3600 else 216000 end) then
    raise exception 'Free upload limit reached: delete songs or upgrade to Premium';
  end if;
  return new;
end $$;

drop trigger if exists songtree_assert_free_upload_quota on public.songtree_songs;
create trigger songtree_assert_free_upload_quota before insert on public.songtree_songs
for each row execute function public.songtree_assert_free_upload_quota();

create table if not exists public.songtree_license_requests (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references public.songtree_songs(id) on delete restrict,
  buyer_id uuid not null references auth.users(id) on delete restrict default auth.uid(),
  buyer_email text not null check (buyer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  license_type text not null check (license_type in ('split', 'exclusive', 'commercial_media', 'radio')),
  payment_asset text check (payment_asset in ('ETH', 'USDC')),
  payment_network text check (payment_network is null or payment_network = 'Base'),
  sender_wallet text,
  transaction_hash text,
  status text not null default 'pending_verification' check (status in ('pending_verification', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.songtree_profiles enable row level security;
alter table public.songtree_songs enable row level security;
alter table public.songtree_license_requests enable row level security;

drop policy if exists "Public profiles are readable" on public.songtree_profiles;
drop policy if exists "Users manage only their profile" on public.songtree_profiles;
drop policy if exists "Published songs are readable" on public.songtree_songs;
drop policy if exists "Creators manage their songs" on public.songtree_songs;
drop policy if exists "Buyers submit their own request" on public.songtree_license_requests;
drop policy if exists "Buyers read their own requests" on public.songtree_license_requests;

create policy "Public profiles are readable" on public.songtree_profiles for select using (true);
create policy "Users manage only their profile" on public.songtree_profiles for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Published songs are readable" on public.songtree_songs for select using (true);
create policy "Creators manage their songs" on public.songtree_songs for all to authenticated using (auth.uid() = creator_id) with check (auth.uid() = creator_id);
create policy "Buyers submit their own request" on public.songtree_license_requests for insert to authenticated with check (buyer_id = auth.uid());
create policy "Buyers read their own requests" on public.songtree_license_requests for select to authenticated using (buyer_id = auth.uid());

-- Create this bucket in the Supabase dashboard or CLI, then keep it private and
-- issue signed URLs only after the user is authorized to stream the MP3.
