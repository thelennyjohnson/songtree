# Songtree live cutover

The app is wired to the new Supabase project through `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Supabase dashboard

1. Open the new project and run every SQL file in `supabase/migrations/` in filename order. The final migration creates the private `song-mp3s` bucket and creator-folder storage policies.
2. Under **Authentication → Providers → Google**, enable Google and enter the Google OAuth client ID and client secret.
3. In Google Cloud Console, add this callback URL exactly:

   `https://fvvetvgsrnpykabeiamg.supabase.co/auth/v1/callback`

4. Under **Authentication → URL Configuration**, set the production Site URL to the final Vercel URL and add that URL (and its local development URL) to Redirect URLs. The app sends `window.location.origin` as the OAuth redirect target.
5. After the first Google login, insert that user’s UUID into `public.songtree_admins` from the SQL editor if admin review is needed:

   `insert into public.songtree_admins (user_id) values ('GOOGLE_USER_UUID');`

## Vercel

Set these production environment variables on the linked Vercel project:

- `VITE_SUPABASE_URL=https://fvvetvgsrnpykabeiamg.supabase.co`
- `VITE_SUPABASE_ANON_KEY=<the new project anon key>`

Then deploy the project root (`project-bolt-sb1-wulyxecx/project`). The production build command is already configured as `npm run build` and uses Vite’s runner loader for this Windows workspace.

## Verified locally

- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run build` passes and emits `dist/`.
- Google sign-in, onboarding profile creation, MP3 upload, license request, report submission, and profile edits now use Supabase rather than demo-only local state.
