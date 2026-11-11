# Latin — Glossix 1.6.0

Latin has 328 lessons and 1,968 recall targets, matching the largest existing course by lesson count. It includes foundations, numbers 1–100 and selected larger numbers, masculine/feminine/neuter nouns, all five declensions, adjective agreement, pronouns, irregular verbs, active tenses, present passive, present subjunctive, questions, sentence construction and connected reading. Repeated forms in different grammatical contexts are intentional practice; target count is not a claim of 1,968 distinct lemmas.

The authored dictionary contains 1,827 entries including inflected forms and phrases, with grammatical types and genders where applicable. This is an original course dictionary, not an exhaustive Latin reference dictionary. Three scenarios, one visual scene, learned dialogue, flashcards, both spelling directions, Word Drift and three complete stories are included. Latin appears in profile learning/favourite lists with an LA badge rather than a national flag.

Guidance follows Classical pronunciation with modern u/v spelling. Written answers accept optional macrons. The packaged eSpeak NG Latin voice is synthetic; unmarked text does not encode every vowel length, so audio is an approximation rather than a native recording. Voice software and its existing licences remain included.

Install the six SQL sections from setup/latin-1.6.0 or the separate Latin SQL ZIP. Run 01–05 in order, then 06 to verify 328 lessons, 1,968 targets and 1,989 Word Drift mappings. Existing course, points/wallet, profile and Word Drift setup must already exist. The updates are additive and rerunnable; existing language records and rewards are not reset. No SQL was applied to a live project while preparing this release.

Validation: all eight language packs load; Latin switching, stable IDs, representative verb/noun/number paradigms, dictionary categories/genders, keyboards, scenarios, stories, English spelling and ten-pair matching passed DOM tests. A local PostgreSQL-compatible test executed every migration twice, preserved existing content/progress/points, accepted macrons, unlocked lessons and paid a Word Drift round once. Actual bundled Latin synthesis produced WAV output. An installed Windows release/update and live Supabase deployment have not been tested for this release.

Grammar references used to check patterns (examples and explanations are authored for Glossix):
- Dickinson College, Allen & Greenough: https://dcc.dickinson.edu/grammar/latin/stems
- Dickinson College conjugation charts: https://dcc.dickinson.edu/sites/default/files/1st_conj_synopsis_pres_system.pdf
- UK National Archives noun grammar: https://www.nationalarchives.gov.uk/latin/stage-1-latin/resources/stage-1-latin-grammar-resource/nouns/
- University of Illinois, Libellus: https://iopn.library.illinois.edu/pressbooks/libelluslatintextbook/chapter/chapter-1-present-indicative-imperative-active/
