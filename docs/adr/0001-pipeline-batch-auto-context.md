---
status: superseded by ADR-0002
---

# Pipeline batch Auto Context

Batch Auto Context is a durable, opt-in batch-project mode that defaults to Off and is independent of whether translation settings are shared or individual, while each resulting Context Extraction remains owned by one Translation. Extractions run serially in batch order to form a deterministic Context Chain. Each Translation may begin as soon as its own extraction completes, subject to the existing translation concurrency limit, so translation overlaps later context preparation. If an extraction fails, active translations finish but later queued work is cleared; Continue schedules the unfinished work again, reruns the failed linked extraction, and resumes the chain after it succeeds. Stop aborts the current extraction and all active translations while preserving completed extractions, partial translations, and linked stopped extractions; Continue reuses completed work and reruns the stopped extraction in place.

Disabling Batch Auto Context does not unlink or delete its Context Extractions. Re-enabling it reuses usable owned Extractions, reruns failed or stopped owned Extractions in place, and creates an Extraction for each Translation that has no owned Extraction. A manual link alone is not treated as batch ownership.

If a batch-owned extraction is deleted, the next run creates a replacement and updates its Translation's link. This recovery does not apply to a deleted Starting Context because that extraction was selected explicitly rather than owned by the batch.

Deleting a Translation never cascades to an Extraction. It clears the ownership link while preserving its Owned Auto Context Extraction and that Extraction's settings. It also preserves a manually selected Extraction, an unowned Extraction, or a Starting Context. Moving a Translation likewise clears ownership but leaves the Extraction and its settings in the source project rather than moving them.

Batch order is locked during processing. When files are reordered, inserted, or removed while idle, the next run reruns owned extractions in place from the first changed predecessor onward. Restart retranslates against the repaired chain, while Continue repairs the chain required by unfinished work without changing completed Translations.

An extraction failure halts later dependent work, but a Translation failure does not: once a file's extraction is usable, the Context Chain continues and later Translations may start. Continue reruns only the failed or stopped extraction in place, reuses usable extractions below it when their recorded predecessor identity is unchanged, and retries incomplete Translations separately.

The first extraction may be seeded by a Starting Context selected explicitly from usable project extractions that are not owned by a Translation in the current batch. Selecting it does not assign or change ownership. The alternatives are a specific extraction or None; there is no implicit Latest option because its identity could change between Stop and Continue. A missing, running, or otherwise unusable selected Starting Context blocks the batch before any work begins rather than falling back to empty context.

New Auto Context extractions copy the project's default extraction settings and then own that snapshot. Reruns preserve the extraction's saved settings, while later changes to project defaults affect only newly created extractions.

Users may explicitly link existing project extractions to batch Translations. This makes the selected extraction owned by that Translation, records the mapped predecessor chain, and detaches any replaced owned extraction without deleting it. Selecting a Starting Context does not change its ownership, and an Extraction selected as Starting Context cannot also be assigned through this action.

Completion timestamps do not determine Context Chain validity. A usable linked extraction is reused even when its predecessor completed later or was rerun in place. It is rerun only when its recorded predecessor no longer matches the chain, it is unusable, an earlier chain item must be created, or the user explicitly selects Regenerate Auto Context.

Editing a Translation's source subtitles or title does not invalidate a usable extraction or its chain suffix. Users who want updated context after such edits opt into Regenerate Auto Context during Restart.
