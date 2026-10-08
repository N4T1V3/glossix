# Profile rewards and owner grants — Glossix 0.2.6

## Enable the feature
Run SUPABASE-PROFILE-DESIGNS.sql once in Supabase SQL Editor. It includes the banner setup, so it also works if the earlier banner update was not applied. Existing profiles and progress are retained.

## Use the app
Profile > Edit profile > Profile design. Classic stays available to everyone. Choose from 50 designs including Classic, with 49 earned designs distributed from level 5 through level 1000. Regular colour designs unlock at levels 1–45; 37 individually composed decorative designs follow from level 50. Golden Atlas unlocks at 900; Supreme Gilded Crest at 1000. Patterns use a single continuous canvas without repeating tile joins. Gold banners now unlock at 750. Banners are chosen separately. Clicking an available design saves it immediately. Visitors see the selected design. All rewards are free.

## Grant a reward as the owner
Use Supabase SQL Editor (not the app). Replace learner_username with the user's public username without @. Run either command:

```sql
select glossix_private.cosmetic_grant('learner_username', 'banner:gold');
select glossix_private.cosmetic_grant('learner_username', 'design:night');
```

This permanently unlocks the named choice for that account without adding points or changing levels. It does not force the user to equip it. They can refresh their profile and select it. Repeat safely; duplicate grants do nothing.

List all grantable reward IDs:

```sql
select item_id, minimum_level
from glossix_private.cosmetic_catalog
order by minimum_level, item_id;
```

Grant EVERY current banner and design to one user:

```sql
select glossix_private.cosmetic_grant('learner_username', item_id)
from glossix_private.cosmetic_catalog;
```

View a user's granted rewards:

```sql
select p.username, g.item_id, g.granted_at
from glossix_private.cosmetic_grants g
join glossix_private.profiles p using (user_id)
where p.username = 'learner_username'
order by g.granted_at;
```

These functions and tables are private. Ordinary app accounts cannot issue grants. No administrator secret is included in the downloadable app. Level-based unlocks still apply without a grant.

## Test and publish
Test test-build/win-unpacked/Glossix.exe with the whole folder together. For publication copy everything inside github-source into your repository, commit and push, run the Windows build in Actions, and publish v0.2.6 with its matching installer, blockmap and latest.yml. The Supabase migration is applied separately.

When you apply the revised catalogue, a selected reward below its new required level displays the default until the account qualifies. Owner grants remain valid and override the level requirement. Points and progress are retained.
