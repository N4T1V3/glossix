# Glossix language expansion — current local implementation

Updated 10 October 2026. Each new course must contain at least 272 meaningful lessons; additional script and consolidation practice can increase that total.

| Course | Lessons | Targets | Conversations | Scenes | Local status |
|---|---:|---:|---:|---:|---|
| Russian | 272 | 1,632 | 62 | 50 | Existing course |
| Italian | 272 | 1,632 | 62 | 50 | Existing course |
| Spanish | 272 | 1,632 | 62 | 50 | Integrated app preview |
| French | 272 | 1,632 | 62 | 50 | Integrated app preview |
| German | 297 | 1,782 | 62 | 50 | Integrated app preview |
| Mandarin Chinese | 280 | 1,680 | 62 | 50 | Integrated app preview |
| Korean | 288 | 1,728 | 62 | 50 | Integrated app preview |

All seven use internal difficulty levels 1–5. Matching an internal scale or lesson count does not certify equivalent proficiency outcomes or CEFR/HSK coverage.

## Server deployment required

Apply `app/setup/SUPABASE-NEW-LANGUAGES-UPDATE.sql` in the existing Supabase project's SQL Editor after the existing account/course and wallet setup. This combined, rerunnable update adds Spanish, French, German, Mandarin and Korean, preserves earlier course progress, and registers authoritative lesson targets and practice rewards. Do not rerun an older standalone language migration afterwards, because its validation list can remove newer language support.

The update has been tested locally with PostgreSQL-compatible PGlite: all seven first lessons award coins, assisted/wrong answers earn no coins, repeated credited answers add no duplicate coins, account/language isolation is preserved, and the migration can be rerun. It has NOT been applied to the hosted Supabase database. No administrator connection is available in this workspace. The Windows installer has not been rebuilt or published.

Friends and leaderboards no longer depend on successful optional language-flag synchronisation. They remain accessible when the server has an older language allowlist. Confirmed account level is retrieved separately when an unsupported course cannot load its progress.

## Integrated capabilities

- Explicit independent course, curriculum, dictionary, scenes and language settings for all seven courses.
- Shared lesson resume, shuffled retries, saved words/pagination, reviews, daily challenges, flashcards, spelling, listening, pronunciation, scenarios and visual scenes.
- German includes noun gender, accusative/dative, adjective endings, weak nouns, relative clauses, pluperfect, hypothetical requests and passive constructions.
- Mandarin uses Simplified Chinese, authored pinyin/tone support, 32 character-reading lessons covering 192 distinct characters, classifiers, aspect, comparisons, complements, relative modifiers and 把. Character reading is not handwriting stroke-order instruction. Character glosses are reading clues, not complete dictionary definitions.
- Chinese phrase-building uses segmented words/character groups and joins them without artificial spaces. Chinese punctuation is accepted consistently by client and server answer normalisation. Existing Enter handling protects IME composition.
- Offline eSpeak NG speech has been verified to produce valid WAV audio for Spanish, French, German and Mandarin. Browser playback requires a matching installed voice. Synthetic speech and approximate English guides do not replace native pronunciation instruction.
- Existing notes keyboard includes German and a Chinese character/pinyin palette. Full Chinese text entry uses a native device IME; an actual Windows IME composition session has not been tested in this browser-only environment.
- Existing dyslexia styling and custom profile/leaderboard designs are retained.

## Reference dictionaries

Spanish: 21,878; French: 124,234; German: 78,252; Mandarin: 9,625. Additional screened resources: Japanese 13,523 and general Portuguese 12,745. The Portuguese source is not yet separately localised for Brazilian and European courses. Mandarin reference data retains source spelling variants; course lessons use Simplified Chinese.

New imports omit entries flagged by target-language profanity, English meanings or offensive usage metadata. Counts are recorded in safety reports. Raw unscreened new-language dictionaries are not distributed. Automated checks are not a comprehensive native-speaker editorial review.

## Remaining requested courses

Brazilian Portuguese and European Portuguese are now integrated courses. Japanese, Hindi and the Arabic varieties were removed from the plan at the user’s request.

## Review pages

`app/language-stats.html`, `app/spanish-course-preview.html`, `app/french-course-preview.html`, `app/german-course-preview.html`, `app/chinese-course-preview.html`, `app/korean-course-preview.html`. Standalone previews do not save progress or issue rewards.

Teaching references consulted (independently authored lesson examples): RAE orthography https://www.rae.es/diccionario-estudiante/docs/ortografia.pdf ; Instituto Cervantes grammar inventory https://cvc.cervantes.es/Ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_a1-a2.htm ; Goethe-Institut grammar https://www.goethe.de/ins/de/de/prf/grm.html ; Duden noun declension https://www.duden.de/sprachwissen/sprachratgeber/Beugung-von-Tierbezeichnungen ; MIT OpenCourseWare Mandarin foundation materials https://ocw.mit.edu/courses/res-21g-003-learning-chinese-a-foundation-course-in-mandarin-spring-2011/ . No independent native-speaker editorial sign-off or language-level certification is claimed.

## Korean addition — 10 October 2026

Korean is an integrated app preview: 288 lessons, 1,728 targets, 40 Hangul letters (19 consonants and 21 vowels), 32 syllable-reading lessons, 50 visual scenes and 62 conversations. Difficulty labels span 1–5 and are internal practice levels, not a CEFR certification. The 56 authored foundation/grammar lessons cover polite speech, particles, counters, tense, requests, conditions, comparison, honorifics, noun modifiers and reported speech. The 200 scene lessons practise vocabulary, location questions, sentence building and contextual replies.

34,098 unique Hangul dictionary headwords come from English Wiktionary through Kaikki/Wiktextract, with attribution and CC BY-SA 4.0 notice in data/KOREAN-DICTIONARY-NOTICE.md. Flagged profanity/offensive meanings are omitted. Automated checks do not replace native editorial review. Korean course audio uses the bundled eSpeak NG voice; letter-based hints are approximate and do not model all connected-speech changes. An actual native IME session has not been verified; the on-screen Hangul composer is tested separately.

The new combined SUPABASE-NEW-LANGUAGES-UPDATE.sql includes Korean. It passed local seven-language reward and progress tests and rerun checks. Hosted Supabase deployment remains pending; apply this latest combined update after existing course/account and wallet setup. No installer has been rebuilt.

Dictionary collection menus now hide empty categories; word types reflect the selected collection without disappearing just because a search has no matches. Known entries lacking pronunciation are excluded from dictionary/practice results. One French and one German reference entry were removed. Missing IPA alone is not treated as missing speech, and temporary playback failures do not erase content.

Korean teaching references: National Institute of Korean Language https://korean.go.kr/front/onlineQna/onlineQnaView.do?mn_id=216&pageIndex=1&qna_seq=310153 ; Basic Korean Dictionary https://krdict.korean.go.kr/eng/mainAction?flag=PC ; English Wiktionary structured reference https://kaikki.org/dictionary/Korean/ . Examples were independently authored.

## Portuguese addition — 11 October 2026

Brazilian Portuguese and European Portuguese are separate selectable courses, without a preview suffix. Each now includes 272 lessons, 1,632 learning targets, 50 scenes and 62 conversations, matching the Russian/Italian lesson counts. Internal difficulty spans 1–5, including 24 grammar workshops covering object pronouns, past narration, future and conditional forms, subjunctive conditions, the personal infinitive, passive/result constructions and relative clauses. Each has separate local and server progress keys, regional vocabulary and an appropriate synthetic speech voice. A 12,745-entry screened general Portuguese reference dictionary is shared, not independently regionalised. Offline audio samples and reward/lesson tests passed. Full translation review remains pending.

Run SUPABASE-PORTUGUESE-UPDATE.sql after the existing course/account and wallet setup and after any older language migrations. It has been tested twice locally; hosted deployment has not been performed. Mandarin and Korean remain unavailable in the main app.

Teaching references: https://www.instituto-camoes.pt/activity/centro-virtual/referencial-camoes-ple-2 ; https://ciberduvidas.iscte-iul.pt/consultorio/perguntas/o-gerundio-e-a-perifrase-estar-a--infinitivo/34913 . These support the teaching approach and progressive construction; no claim of individual verification of every entry is made.

The full Portuguese expansion preserves all original 30 lesson IDs and answers. Pronunciation metadata was added using the appropriate eSpeak NG regional voice. Apply the smaller SUPABASE-BRAZILIAN-PORTUGUESE-UPDATE.sql then SUPABASE-EUROPEAN-PORTUGUESE-UPDATE.sql; each is under 220 KB and rerunnable. The combined SUPABASE-PORTUGUESE-UPDATE.sql is also updated. No hosted migration or installer build was performed.

Additional grammar references: https://cvc.instituto-camoes.pt/gramatica-dp10.html ; https://ciberduvidas-ql.iscte-iul.pt/consultorio/perguntas/diferencas-entre-o-portugues-europeu-e-o-portugues-do-brasil/13836 ; https://ciberduvidas-ql.iscte-iul.pt/consultorio/perguntas/futuro-do-conjuntivo-e-do-futuro-perfeito-do-conjuntivo/37305 .
