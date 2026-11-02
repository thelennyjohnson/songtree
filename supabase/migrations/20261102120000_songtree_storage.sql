-- Private MP3 storage for public playback through short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('song-mp3s', 'song-mp3s', false)
on conflict (id) do update set public = false;

drop policy if exists "Creators upload their MP3s" on storage.objects;
create policy "Creators upload their MP3s" on storage.objects
for insert to authenticated
with check (bucket_id = 'song-mp3s' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Creators read their MP3s" on storage.objects;
create policy "Creators read their MP3s" on storage.objects
for select to authenticated
using (bucket_id = 'song-mp3s' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Creators delete their MP3s" on storage.objects;
create policy "Creators delete their MP3s" on storage.objects
for delete to authenticated
using (bucket_id = 'song-mp3s' and (storage.foldername(name))[1] = auth.uid()::text);
