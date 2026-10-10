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

Spanish and French each include 272 lessons and 1,632 targets; German includes 297 lessons and 1,782 targets; Mandarin Chinese includes 280 lessons and 1,680 targets plus 192 reading characters. Korean includes 288 lessons, 1,728 targets, 40 Hangul letters and a composing on-screen keyboard. Each has 50 visual scenes and 62 conversations. All five are integrated locally with screened dictionaries, pronunciation, account routes and practice. Eight requested courses remain unbuilt. See LANGUAGE-EXPANSION.md for counts and limitations.

After the existing course/account and wallet setup, run the five numbered files in setup/language-updates separately, in order, in the hosted Supabase SQL Editor. See setup/language-updates/README.md. The combined file exceeds the SQL Editor size limit. These rerunnable updates enable progress and rewards for all five new courses and preserve Russian/Italian data. Hosted deployment is pending; do not subsequently rerun the older individual language migrations. Friends and leaderboard rendering tolerates pending language synchronization. No new installer was built.
