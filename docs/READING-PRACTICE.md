# Reading and translation practice — 1.5.21

- Shared on-screen keyboards for foreign-language answer fields, including learned dialogue. Existing lesson and spelling keyboards are retained. Added keyboards support accents, Shift, punctuation, digits, cursor selection and Backspace.
- Flashcards and spelling now offer My learned words. A word qualifies after successful course recall, Got it on a flashcard, or correct spelling. Saved-only or failed-only words do not qualify. An empty learned deck stays empty and explains how to add words.
- Typing & spelling offers Translate into English as well as the selected language. English recall has its own retry queue; correct words stay completed. Feedback waits for Continue. Uses supplied meanings and common punctuation/contraction variants, not an online semantic grading service.
- Reading stories is in Learn. Twenty-one original stories (three per language) cover all seven current languages. Four-, five- and seven-sentence stages unlock at zero, eight and thirty completed lessons. Each sentence is translated into English and receives an example translation plus an explanation; feedback never auto-advances. Unfinished stories resume on the same device/account/language.
- New practice is local and does not add leaderboard points or coins. No SQL migration is required. Existing curriculum IDs, progress, points and completion records are untouched.

Validation: actual app scripts loaded into DOM tests; all seven keyboards, selection/Backspace, learned/empty decks, English correct/wrong retries, story milestones, feedback and resume passed. Browser visual preview was unavailable because the browser could not reach the local server; Windows installation was not tested.
