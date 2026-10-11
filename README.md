# Glossix

A Windows language-learning app with Russian and Italian courses plus a Spanish course preview, dictionaries, listening practice, profiles, friends and leaderboards.

## Windows build

Use Node.js 22 or newer. Run `npm ci`, then `npm run dist:win`. The installer is written to the neighbouring `installer` folder.

## GitHub builds and updates

The updater is configured for https://github.com/N4T1V3/glossix. The included workflow builds the Windows installer and update files on a standard Windows runner. In GitHub, open **Actions → Build Glossix Windows installer → Run workflow**. Download its **Glossix-Windows-release** artifact when it succeeds.

Extract the artifact and create a normal release tagged **v0.2.53**. Attach the setup EXE, its blockmap and latest.yml from that same build. Publish the release. Distribute that installer to users; portable copies do not install updates.

For subsequent releases, raise the version in package.json, rebuild and publish the matching files in a new release. The app checks at launch and while open, downloads updates and offers a restart to install.

## Account service

Profiles and online learning use the configured Supabase service. Database migrations are applied separately by the project owner, not by the app updater. No passwords, sessions, publishing tokens or local user progress are included in this source tree.

## Attribution

Dictionary source and licence notices are included in data/. Bundled eSpeak NG includes its notices under third-party/.

## Translations

Translations and explanations are available in English only. Russian and Italian learning courses remain available. No SQL migration is required for this change.















## Expanded language previews

Seven courses are available: Russian, Italian, Spanish, French, German, Brazilian Portuguese and European Portuguese. Each has 272 lessons and 1,632 targets except German (297 lessons, 1,782 targets). Each has 50 scenes and 62 conversations. Portuguese varieties have separate progress, regional vocabulary and speech, plus 24 grammar workshops; their 12,745-entry general reference dictionary is shared. Language-quality review remains pending.

After existing course/account and wallet setup, apply the numbered SQL files in setup/language-updates separately, in order. Existing language progress is preserved. For the full Portuguese expansion, run the current 06-BRAZILIAN-PORTUGUESE.sql then 07-EUROPEAN-PORTUGUESE.sql, even if the earlier 30-lesson update succeeded. Hosted deployment is pending. Do not run an older language migration afterward without rerunning the two Portuguese updates.

Mandarin and Korean are unavailable in the main app. Historical assets may remain in this source package. Japanese, Hindi and Arabic varieties are no longer planned. No installer was built. See LANGUAGE-EXPANSION.md and language-stats.html for details.

## Windows password recovery

Version 0.2.54 adds secure Windows account links and an in-app reset-password screen. See setup/PASSWORD-RESET-SETUP.md for required Supabase dashboard settings and the email template. No SQL is required for recovery. The installer build is blocked locally by an NSIS compiler DLL compatibility error; build and install on a compatible Windows environment before testing live emails.
