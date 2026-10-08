# Glossix spoken-language translations

Choose **Language I speak** in the sidebar, settings or your own profile. Choose **Your language** separately for the Russian or Italian course. The selected spoken-language pack supplies word meanings, dictionary definitions, scenario translations and lesson explanations. Target-language spelling, answer checks, speech playback and pronunciation guides are preserved. Switching spoken languages keeps your account and course progress.

English plus draft French, Spanish, German and Portuguese packs are included. These are generated locally using free Argos/OPUS models, with corrections to common greetings and protection of Russian examples. They are machine translations, not fully reviewed teaching content. Some dynamic interface messages may remain in English. Pronunciation guides keep the existing Latin sound notation. Future languages in settings are marked planned and cannot be selected until a pack exists; they are not supported translations yet.

## Account synchronization
Run **SUPABASE-SPOKEN-LANGUAGE.sql** once in Supabase SQL Editor. It adds a private preference table and authenticated getter/setter. It preserves accounts, points and course progress. The updated full SUPABASE-SOCIAL.sql also includes it for new setups.

The spoken-language preference is keyed separately for each online account or local learner. It is not added to public profiles or leaderboards. Without the SQL migration the preference still saves on this device; the app shows a message if cloud synchronization fails.

## Distribution
Copy the updated github-source contents into your GitHub Desktop repository, commit and push. Build and publish a new installer release after increasing the app version. Bundled translation packs work offline; no translation service subscription or extra application is required. Translation models and Python are build tools only and are not shipped to learners.

## Review and extension
The catalogue under translations/ records the English source content. Each selected-language pack has an English-source-to-translated-text map under app/data/translations/. Corrections belong in the corresponding pack and should be rebuilt into its JavaScript bundle. These packs include derivative translations of the dictionary data; retain the existing WikDict/OpenRussian attribution and CC BY-SA notices. Model provenance README files are included alongside the packs.
