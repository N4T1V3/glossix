# Glossix

A Windows language-learning app with Russian and Italian courses, dictionaries, listening practice, profiles, friends and leaderboards.

## Windows build

Use Node.js 22 or newer. Run `npm ci`, then `npm run dist:win`. The installer is written to the neighbouring `installer` folder.

## GitHub builds and updates

The updater is configured for https://github.com/N4T1V3/glossix. The included workflow builds the Windows installer and update files on a standard Windows runner. In GitHub, open **Actions → Build Glossix Windows installer → Run workflow**. Download its **Glossix-Windows-release** artifact when it succeeds.

Extract the artifact and create a normal release tagged **v0.2.11**. Attach the setup EXE, its blockmap and latest.yml from that same build. Publish the release. Distribute that installer to users; portable copies do not install updates.

For subsequent releases, raise the version in package.json, rebuild and publish the matching files in a new release. The app checks at launch and while open, downloads updates and offers a restart to install.

## Account service

Profiles and online learning use the configured Supabase service. Database migrations are applied separately by the project owner, not by the app updater. No passwords, sessions, publishing tokens or local user progress are included in this source tree.

## Attribution

Dictionary source and licence notices are included in data/. Bundled eSpeak NG includes its notices under third-party/.

## Spoken-language translations

English plus draft French, Spanish, German and Portuguese translations are included for the Russian/Italian learning content. Choose Language I speak separately from the learning language. Apply setup/SUPABASE-SPOKEN-LANGUAGE.sql once for private account synchronization; see setup/SPOKEN-LANGUAGES.md for limitations and review guidance.
