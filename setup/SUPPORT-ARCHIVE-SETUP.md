# Support log archives — 0.2.26

Messages now show your profile username (n4tive) and the other person's username.
Close & save log closes the chat and downloads its COMPLETE text transcript, including messages older than the last 100. Supabase keeps the original messages. Reopening is still possible.
Archive log to Discord is a separate owner-only action after closing. It sends the transcript to your configured channel. Repeated clicks create additional copies; it does not delete or move the original.
Users are informed that support messages can be archived privately for review.

## Activate
1. Run SUPABASE-OWNER-SUPPORT.sql if not already applied, then SUPABASE-SUPPORT-ARCHIVE.sql in Supabase SQL Editor.
2. Create a PRIVATE Discord text channel for support logs. In its settings, Integrations → Webhooks → New Webhook → Copy Webhook URL.
3. In Supabase → Edge Functions → Secrets, add DISCORD_SUPPORT_WEBHOOK with that URL. Keep it out of GitHub and the app.
4. Create an Edge Function named support-archive using supabase/functions/support-archive/index.ts from this source. Deploy it with JWT verification enabled. SUPABASE_URL and SUPABASE_ANON_KEY are built-in function secrets.
5. Install the new app build, sign in as the assigned owner, close a test conversation and download its log. Click Archive log to Discord and verify the attachment in your private channel.

No webhook has been configured and no real conversations have been exported yet. Live SQL/function testing remains necessary.

Reference: https://supabase.com/docs/guides/functions/secrets and https://docs.discord.com/developers/resources/webhook
