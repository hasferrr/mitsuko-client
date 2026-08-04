# Batch Auto Context

## Summary

Batch Auto Context is an opt-in, durable setting on a batch project. It ensures one owned Context Extraction per Translation by reusing, assigning, recovering, or creating one, then connects those Extractions in the current batch order. It defaults to Off for existing and new projects and is independent of shared versus individual Translation settings.

Opening a Translation inside a batch uses the same editable Auto Context dialog as a Translation in a regular project. Those per-Translation controls apply when that Translation is started directly. Starting or continuing from the batch view remains governed by the batch project's Batch Auto Context setting and Context Chain.

The first extraction receives the explicitly selected Starting Context, or empty previous context when Starting Context is None. Every later extraction receives the usable result of the preceding owned extraction.

## Persistence

Each batch `Project` stores:

- `isBatchAutoContextEnabled`
- `batchAutoContextStartingExtractionId`

Each Translation stores the Extraction whose context it reads in `autoContextExtractionId`. Each managed Extraction stores the Translation allowed to update and rerun it in `ownerTranslationId`, plus its own settings snapshot.

For example, if batch Translation A is assigned Extraction X, A points to X and X is owned by A. The batch can therefore rerun X for A when X fails. By contrast, selecting a Starting Context only reads it as the chain seed; selection does not assign or change its ownership.

Disabling the project setting preserves all links. Re-enabling reuses usable owned extractions, reruns failed or stopped extractions in place, and creates only missing extractions.

The batch Translation view can also link existing project extractions to Translations in bulk. Unlike manual selection in a single Translation, this Link Context action explicitly assigns ownership because the Extraction becomes part of the batch-managed one-to-one Context Chain. Linking assigns each selected extraction to one Translation, records the current Context Chain predecessors, and detaches any replaced owned extraction without deleting it. The selected Starting Context cannot also be linked as an owned extraction.

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

Continue repairs the extraction chain through completed and unfinished files, but it does not retranslate completed Translations. A failed or stopped extraction is rerun in place without automatically rerunning the usable extractions below it. This allows Auto Context to be enabled after part of a batch has already been translated.

Restart retranslates every file. By default it reuses valid Context Extractions. Selecting Regenerate Auto Context reruns each owned Extraction serially as the restart pipeline proceeds. A Translation can start after its own Extraction finishes while later Extractions are still being regenerated.

Stop aborts the current extraction and every active Translation, clears queued work, and preserves completed extractions, partial Translations, and the stopped owned extraction link. Continue reruns that stopped extraction in place and then resumes the chain.

## Failure Rules

An extraction failure stops later dependent extraction and Translation work. Translations already active are allowed to finish. Continue reruns only the failed owned extraction in place, then reuses usable downstream extractions whose recorded predecessor identity is still correct.

A Translation failure is isolated. It does not stop the extraction chain or later Translations.

## Chain Repair

Reordering, inserting, removing, or moving files while idle changes predecessor relationships. The next run reruns the suffix beginning at the first changed predecessor. Reordering and all batch Auto Context controls are locked while processing.

Completion timestamps do not invalidate the chain. A usable linked extraction is reused even if its predecessor completed later or was rerun in place. It reruns only when its recorded predecessor changed, it is unusable, an earlier chain item must be created, or Regenerate Auto Context is selected.

Editing source subtitles or a Translation title does not invalidate a usable extraction. Regenerate Auto Context is the explicit way to refresh the chain after such edits.

If a user manually repairs an extraction result and marks it completed, the pipeline treats it as usable. If an owned extraction was deleted, the next run creates and links a replacement.

## Settings And Ownership

A newly created owned extraction copies the project's default extraction settings. That extraction owns the snapshot afterward. Reruns preserve its saved settings; later project-default changes affect only new extractions.

Auto-created owned extractions are titled `Auto Context for {Translation title}`. The Translation UI shows the linked extraction title, status, and Open action. The extraction UI identifies its owning Translation and provides an Open Translation action.

Deleting a Translation does not delete any Extraction. It sets `ownerTranslationId` to `null` on its owned Extraction and preserves that Extraction and its settings in the project. Moving a Translation does not move any Extraction; it clears ownership and leaves the Extraction and its settings in the source project. Manual selection outside the batch Link Context action and Starting Context selection do not assign ownership, so deleting or moving the selecting Translation does not change those Extractions or any ownership they already have.
