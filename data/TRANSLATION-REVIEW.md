# Translation update 0.2.33

Russian and Italian reference entries now store meanings per word and spoken language instead of passing dictionary strings through the global machine-translation pack. Direct English, French, Spanish, German and Portuguese bilingual meanings take priority. A missing spoken-language meaning falls back to an explicitly labelled English meaning. Other spoken languages remain planned.

Refreshed the official OpenRussian words/translations exports on 9 October 2026. Its legacy export omits newer meanings visible on the website. Checked 3,247 incomplete/mixed-language entries against its live API, recovering 1,232 meanings, and retried stale IDs using public word pages (3 further recoveries). Resolved 270 explicit grammatical cross-references through unambiguous English base-word meanings. Aaron, Abakan and the ah/oh/I-see interjection are repaired.

Russian: 89,576 English meanings; 1,489 entries remain unresolved and are separated into Entries needing review, excluded from practice. Saved IDs and saved-word references are retained. Some stale source records could not be fetched; no translations were invented for them.

Italian: all 27,029 existing reference entries have nonempty English meanings after correcting papalina from Wiktionary's Italian noun senses. Added direct bilingual meanings in all four additional supported spoken languages, retaining a labelled English fallback where the source has no equivalent.

Automated checks cover the complete bundled reference data and both courses across all five supported spoken languages. They verify nonempty values, preserved reference IDs, unchanged target-language answers/pronunciation, and explicit fallbacks. Corrected 884 generated “X means Y” explanations per language to preserve X, plus common Italian meaning corrections. These are structural checks and selected semantic corrections, not an exhaustive professional review: machine-translated course explanations and source dictionaries can still contain errors.

No new SQL migration. Build/publish a new Windows installer for installed users.

Sources and licensing
- OpenRussian: https://en.openrussian.org/dictionary-data and its public word pages (CC BY-SA 4.0). Audio files were not downloaded.
- WikDict bilingual exports: https://download.wikdict.com/dictionaries/stardict/ (CC BY-SA 4.0), based on Wiktionary/DBnary/FreeDict.
- Papalina correction: https://en.wiktionary.org/wiki/papalina#Italian (Wiktionary CC BY-SA).

Rebuild the dictionaries with Python from the repository root: run data/tools/download-dictionary-audit.py, refresh-openrussian-export.py, repair-dictionaries.py, resolve-source-crossreferences.py, then retry-live-word-pages.py, in that order. Intermediate downloads stay under work/dictionary-audit. Review the generated audit summary before publishing.
