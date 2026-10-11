# Windows password recovery — Glossix 0.2.54

The old email opens localhost, which refers to the recipient's own computer. Glossix 0.2.54 handles account links through a registered Windows protocol instead.

## Activate

1. Build and install Glossix 0.2.54 on Windows. Installing registers the `glossix` protocol. Source changes alone do not register it.
2. In Supabase → Authentication → URL Configuration, set **Site URL** to `glossix://auth/callback`.
3. Add these exact **Redirect URLs**:
   - `glossix://auth/recovery`
   - `glossix://auth/callback`
4. In Authentication → Email Templates → Reset password, use the supplied `RESET-PASSWORD-EMAIL.html`, or ensure the existing reset button links to `{{ .ConfirmationURL }}`. Do not link directly to SiteURL or localhost.
5. Open Glossix → Settings → Account → Reset password. Request a **new** email, open its link, accept the browser's Open Glossix prompt, and enter the new password in Glossix. Then sign in with it.

Old emails retain their old destination. Request a new one after configuration. The callback Site URL also supports email confirmations. If you use a separate public signup website, keep its existing Site URL and add the two app Redirect URLs instead; Windows reset requests explicitly select the recovery URL.

No SQL migration is needed. These dashboard settings have not been changed automatically. Live email delivery and the installed Windows launch still need an end-to-end check after deployment.

## Verification

Test a fresh link with Glossix closed and again with it already open. Confirm that the app identifies the correct email before accepting a password. Check that expired or reused links offer a new link. Cancelling should leave any currently signed-in account unchanged. Never share a complete recovery URL: its tokens can grant access to an account.

The local automated checks cover URL validation, cold and warm launch delivery, trusted IPC, server-side account verification, recovery-session isolation, password updates, cancellation and expired links. The local installer build was blocked by the NSIS compiler reporting Illegal System DLL Relocation; build on a compatible Windows environment before distribution.

References: [Supabase redirects](https://supabase.com/docs/guides/auth/redirect-urls), [password recovery](https://supabase.com/docs/guides/auth/passwords), [email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [Electron protocol handling](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app).
