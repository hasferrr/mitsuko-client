# Batch Auto Context

## Summary

Batch Auto Context is an opt-in, durable setting on a batch project. It follows each Translation's `autoContextExtractionId`, reuses or regenerates linked Extractions, creates missing Extractions, and connects distinct Extractions in current batch order. It defaults to Off and is independent of shared versus individual Translation settings.

Links are live and shared. Multiple Translations may reference the same Extraction; editing or regenerating it changes the result used by all of them. A repeated link in one batch is prepared once, reused by every Translation that selects it, and represents one node in the Context Chain.

Opening a Translation inside a batch uses the same editable Auto Context dialog as a Translation in a regular project. Starting or continuing from the batch view remains governed by the batch project's Batch Auto Context setting and Context Chain.

## Persistence

Each batch `Project` stores:

- `isBatchAutoContextEnabled`
- `batchAutoContextStartingExtractionId`

Each Translation stores its live Extraction reference in `autoContextExtractionId`. Extractions have no Translation ownership field and retain their own settings snapshot.

Disabling the project setting preserves all links. Re-enabling reuses usable linked Extractions, reruns failed or stopped Extractions in place, and creates only missing Extractions.

The batch Translation view can link existing project Extractions to Translations in bulk. The same Extraction may be linked to multiple Translations. Unlinking one Translation does not affect the Extraction or any other links.

## Starting Context

Starting Context is either None or one explicitly selected usable Context Extraction in the same project. There is no implicit Latest option.

An Extraction linked as Auto Context by a Translation in the current batch cannot also be Starting Context because that would make a chain node seed itself. An Extraction linked only outside the current batch remains eligible. A selected Starting Context that is missing, running, failed, stopped, empty, outside the project, or otherwise unusable blocks the run before work begins.

## Scheduling

Distinct linked Extractions run serially in batch order. A repeated Extraction link is not rerun again during the same batch operation. Each Translation is released as soon as its linked Extraction is usable, so translation can overlap preparation of later distinct Extractions. Released Translations share the existing Max Concurrent Translations limit.

The manual Context Document remains Translation-only and does not seed the Context Chain. Translation requests receive context in this order:

```text
manual Context Document

linked Auto Context extraction
```

## Continue, Restart, And Stop

Continue repairs the extraction chain through completed and unfinished files, but it does not retranslate completed Translations. Failed or stopped linked Extractions are rerun in place. A shared Extraction is rerun only on its first occurrence in that operation.

Restart retranslates every file. By default it reuses valid Extractions. Selecting Regenerate Auto Context reruns each distinct linked Extraction serially. Every Translation sharing an Extraction uses that same regenerated result.

Stop aborts the current Extraction and every active Translation, clears queued work, and preserves completed Extractions, partial Translations, and links. Continue reruns a stopped linked Extraction in place and resumes the chain.

## Failure And Repair Rules

An Extraction failure stops later dependent Extraction and Translation work. Translations already active are allowed to finish. A Translation failure is isolated and does not stop the Context Chain.

Reordering, inserting, removing, or moving files while idle changes predecessor relationships. The next run reruns a distinct linked Extraction when its recorded predecessor changed, it is unusable, an earlier chain item must be created, or Regenerate Auto Context is selected. Completion timestamps do not invalidate the chain.

Editing source subtitles or a Translation title does not invalidate a usable Extraction. Regenerate Auto Context explicitly refreshes linked Extractions. Because a link may be shared, regeneration updates the result seen by every linked Translation.

If a user manually repairs an Extraction result and marks it completed, the pipeline treats it as usable. If a linked Extraction was deleted, the next run creates and links a replacement for each Translation as needed.

## Settings And Lifecycle

A newly created Extraction copies the project's default extraction settings. Reruns preserve its saved settings; later project-default changes affect only newly created Extractions.

Auto-created Extractions are titled `Auto Context for {Translation title}`. The Translation UI shows the linked Extraction title, status, sharing information, and Open action. The Extraction UI shows the Translations currently linked to it.

Deleting a Translation does not delete an Extraction. Other Translations continue using any shared Extraction. Moving a Translation clears its Auto Context and previous-context links because the referenced Extractions remain in the source project.
