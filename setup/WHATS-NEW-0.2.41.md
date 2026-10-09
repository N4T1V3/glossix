# Glossix 0.2.41

Added an account wallet and empty shop. Coins accrue only on new server-verified points after running SUPABASE-WALLET-SHOP.sql in the Supabase SQL Editor. Each credited point award earns floor(points/10) coins; existing points are not backfilled. Existing daily activity limits prevent duplicate reward farming. Gems are reserved for later; no payments or purchases are enabled and no shop products are seeded. Private balances and an audit ledger are protected from client writes.

Run setup/SUPABASE-WALLET-SHOP.sql once after your existing learning/social updates. This migration is also rerunnable. The live database has not been changed by this source update.
