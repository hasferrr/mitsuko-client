# Batch Auto Context

## Summary

Batch Auto Context is an opt-in, durable setting on a batch project. It creates one owned Context Extraction per Translation and connects those extractions in the current batch order. It defaults to Off for existing and new projects and is independent of shared versus individual Translation settings.

The first extraction receives the explicitly selected Starting Context, or empty previous context when Starting Context is None. Every later extraction receives the usable result of the preceding owned extraction.

## Persistence

Each batch `Project` stores:

- `isBatchAutoContextEnabled`
- `batchAutoContextStartingExtractionId`

Each Translation continues to store its linked extraction and recorded predecessor through its existing Auto Context fields. Each owned extraction stores `ownerTranslationId` and its own settings snapshot.

Disabling the project setting preserves all links. Re-enabling reuses usable owned extractions, reruns failed or stopped extractions in place, and creates only missing extractions.

## Starting Context

Starting Context is either None or one explicitly selected usable Context Extraction in the same project. There is no implicit Latest option.

An extraction owned by any Translation in the current batch cannot be selected as Starting Context. A selected Starting Context that is missing, running, failed, stopped, empty, outside the project, or otherwise unusable blocks the run before any extraction or Translation begins. The pipeline never silently falls back to None.

## Scheduling

Owned extractions run serially in batch order. A Translation is released as soon as its own extraction is usable, so it can overlap the next extraction. Released Translations share the existing Max Concurrent Translations limit; the one extraction worker runs in addition to those slots.

The manual Context Document remains Translation-only and does not seed the Context Chain. Translation requests receive context in this order:

```text
manual Context Document

owned Auto Context extraction
```

## Continue, Restart, And Stop

Continue repairs the extraction chain through completed and unfinished files, but it does not retranslate completed Translations. This allows Auto Context to be enabled after part of a batch has already been translated.

Restart retranslates every file. By default it reuses valid Context Extractions. Selecting Regenerate Auto Context reruns the complete owned extraction chain before and during the restart pipeline.

Stop aborts the current extraction and every active Translation, clears queued work, and preserves completed extractions, partial Translations, and the stopped owned extraction link. Continue reruns that stopped extraction in place and then resumes the chain.

## Failure Rules

An extraction failure stops later dependent extraction and Translation work. Translations already active are allowed to finish. Continue reruns the failed owned extraction in place.

A Translation failure is isolated. It does not stop the extraction chain or later Translations.

## Chain Repair

Reordering, inserting, removing, or moving files while idle changes predecessor relationships. The next run reruns the suffix beginning at the first changed predecessor. Reordering and all batch Auto Context controls are locked while processing.

Editing source subtitles or a Translation title does not invalidate a usable extraction. Regenerate Auto Context is the explicit way to refresh the chain after such edits.

If a user manually repairs an extraction result and marks it completed, the pipeline treats it as usable. If an owned extraction was deleted, the next run creates and links a replacement.

## Settings And Ownership

A newly created owned extraction copies the project's default extraction settings. That extraction owns the snapshot afterward. Reruns preserve its saved settings; later project-default changes affect only new extractions.

Owned extractions are titled `Auto Context for {Translation title}`. The Translation UI shows the linked extraction title, status, and Open action. The extraction UI identifies its owning Translation and provides an Open Translation action.

Deleting a Translation deletes its owned extraction and that extraction's settings. Moving a Translation moves its owned extraction to the target project. A manually selected extraction or Starting Context is merely used by the Translation or batch and neither deletes nor moves with it.
