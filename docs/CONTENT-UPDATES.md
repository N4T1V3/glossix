# Preserving learning progress

- Published lesson IDs, item IDs, answers and lesson positions are stable. Never recycle an ID for a different target.
- Add lessons and targets with new IDs. Keep existing server learning rows, completed lessons, points, awards and spaced-review history.
- Append stored lesson positions. A future presentation order may offer additions between earlier lessons, but must not renumber stored progress.
- Revised explanations may mark a completed lesson **Updated — review**. Review is optional and does not reset completion or award the completion bonus again.
- If a target changes meaning, add a new target and offer it as additional learning; retain the earlier target and its history.
- Database content updates must be additive and rerunnable. Never delete, truncate or recreate user progress to deploy lesson content.
- Before release, test a populated account state against the new curriculum and confirm existing IDs, target content, completion, points and review history remain intact.

Version 1.5.8 appends the Numbers & grammatical gender section. Earlier lesson explanations are expanded without changing their recall targets. The seven SQL sections insert only the new targets and Word Drift mappings.
