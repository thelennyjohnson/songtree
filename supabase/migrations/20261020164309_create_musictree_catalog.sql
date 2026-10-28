/*
# Create MusicTree public catalog

1. New Tables
- `music_artists`: public artist profiles shown throughout discovery and remix pages.
- `music_songs`: songs, singles, and albums that appear in rankings and listening views.
- `music_remixes`: the branching creative versions attached to a source song.
- `music_contributors`: the artists and producers credited on a song or remix.

2. Security
- Row level security is enabled for every table.
- The catalog is intentionally shared demo content, so anonymous and signed-in visitors can read it.
- Anonymous and signed-in visitors can create, update, and remove demo remix contributions so the interactive remix flow can be exercised without sign-in.

3. Important Notes
- This schema does not add accounts or ownership columns because MusicTree currently demonstrates a shared public catalog.
- Foreign keys keep artist, song, remix, and contributor relationships consistent.
*/

CREATE TABLE IF NOT EXISTS public.music_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL UNIQUE,
  display_name text NOT NULL,
  avatar_url text NOT NULL,
  bio text NOT NULL DEFAULT '',
  genre text NOT NULL DEFAULT 'Electronic',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.music_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist_id uuid NOT NULL REFERENCES public.music_artists(id) ON DELETE CASCADE,
  cover_url text NOT NULL,
  genre text NOT NULL DEFAULT 'Electronic',
  duration_seconds integer NOT NULL DEFAULT 180,
  plays integer NOT NULL DEFAULT 0,
  week_rank integer,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.music_remixes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid NOT NULL REFERENCES public.music_songs(id) ON DELETE CASCADE,
  parent_remix_id uuid REFERENCES public.music_remixes(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES public.music_artists(id) ON DELETE CASCADE,
  title text NOT NULL,
  remix_type text NOT NULL DEFAULT 'Rework',
  cover_url text NOT NULL,
  duration_seconds integer NOT NULL DEFAULT 180,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.music_contributors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid NOT NULL REFERENCES public.music_songs(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES public.music_artists(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'Contributor',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(song_id, artist_id, role)
);

ALTER TABLE public.music_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_remixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_contributors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read music artists" ON public.music_artists;
CREATE POLICY "Public can read music artists" ON public.music_artists FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can create music artists" ON public.music_artists;
CREATE POLICY "Public can create music artists" ON public.music_artists FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update music artists" ON public.music_artists;
CREATE POLICY "Public can update music artists" ON public.music_artists FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can delete music artists" ON public.music_artists;
CREATE POLICY "Public can delete music artists" ON public.music_artists FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can read music songs" ON public.music_songs;
CREATE POLICY "Public can read music songs" ON public.music_songs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can create music songs" ON public.music_songs;
CREATE POLICY "Public can create music songs" ON public.music_songs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update music songs" ON public.music_songs;
CREATE POLICY "Public can update music songs" ON public.music_songs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can delete music songs" ON public.music_songs;
CREATE POLICY "Public can delete music songs" ON public.music_songs FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can read music remixes" ON public.music_remixes;
CREATE POLICY "Public can read music remixes" ON public.music_remixes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can create music remixes" ON public.music_remixes;
CREATE POLICY "Public can create music remixes" ON public.music_remixes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update music remixes" ON public.music_remixes;
CREATE POLICY "Public can update music remixes" ON public.music_remixes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can delete music remixes" ON public.music_remixes;
CREATE POLICY "Public can delete music remixes" ON public.music_remixes FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can read music contributors" ON public.music_contributors;
CREATE POLICY "Public can read music contributors" ON public.music_contributors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Public can create music contributors" ON public.music_contributors;
CREATE POLICY "Public can create music contributors" ON public.music_contributors FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Public can update music contributors" ON public.music_contributors;
CREATE POLICY "Public can update music contributors" ON public.music_contributors FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public can delete music contributors" ON public.music_contributors;
CREATE POLICY "Public can delete music contributors" ON public.music_contributors FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS music_songs_week_rank_idx ON public.music_songs(week_rank);
CREATE INDEX IF NOT EXISTS music_remixes_song_id_idx ON public.music_remixes(song_id);
CREATE INDEX IF NOT EXISTS music_remixes_parent_remix_id_idx ON public.music_remixes(parent_remix_id);
CREATE INDEX IF NOT EXISTS music_contributors_song_id_idx ON public.music_contributors(song_id);