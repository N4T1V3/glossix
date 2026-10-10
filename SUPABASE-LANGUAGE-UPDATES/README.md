# Supabase SQL Editor: smaller language updates

The combined new-language query was rejected as too large. Use these five smaller files instead. Each is under 260 KB and contains its own transaction.

Open Supabase → SQL Editor. Copy one whole file into a new query and run it. Wait for success before running the next file:

1. `01-SPANISH.sql`
2. `02-FRENCH.sql`
3. `03-GERMAN.sql`
4. `04-MANDARIN.sql`
5. `05-KOREAN.sql`

Run all five in order if you have not successfully applied the combined update. If only Korean is new and the previous four language updates already succeeded, run only 05-KOREAN.sql.

Keep the existing account/course and wallet setup in place. These files are rerunnable and preserve existing language progress. The last file installs the newest language allowlist. Do not run an earlier numbered file again after the later files without then rerunning the remaining files in order.

The too-large query should not have been submitted by the editor; these rerunnable files also tolerate an earlier successful or partially completed setup. Hosted deployment is not performed by creating these files.
