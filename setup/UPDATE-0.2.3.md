# Glossix 0.2.3 — profile banners

Run SUPABASE-BANNERS.sql once in your project's Supabase SQL Editor. This adds banner storage and validates unlocks using account points. Existing account progress is retained. Do not rerun the entire social setup just for this feature.

In Glossix, open Profile > Edit profile > Profile banner. Clicking an available gradient saves it immediately. Locked themes show their required level. All are free; none are purchased. Your choice is displayed on your own and visited profiles.

Available at level 1: Classic teal, black, red, yellow, green, purple, brown, blue, pink, orange, midnight navy, coral, mint and plum.

Milestones: Bronze 5; Silver 10; Gold 20; Aurora 35; Sapphire 50; Rose gold 75; Obsidian 100; Opal 150; Solar crown 250; Cosmos 500; Legend 1000. The existing level system continues without a fixed cap.

Test: open test-build/win-unpacked/Glossix.exe; keep its entire folder together. Apply the SQL first to save banners online.

Publish: copy the contents of github-source into your GitHub repository, commit and push. Run the Windows build in Actions. Publish v0.2.3 with Glossix-Setup-0.2.3.exe, its matching .blockmap and latest.yml from the same artifact. Source changes alone do not release an update.

Release notes: Personalise your profile with gradient colours. Earn special bronze, silver, gold and other banner finishes as you level up. Banner choices appear on profiles and are saved to your account.
