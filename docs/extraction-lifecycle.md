# Extraction Lifecycle Metadata

## Summary

Extractions use persisted lifecycle metadata to determine whether a result is usable. This replaces the legacy `<done>` marker as the source of truth for completion.

This applies to manual extraction, batch extraction, and auto-context extraction.

## Fields

Each `Extraction` stores:

- `status`: `"idle" | "running" | "completed" | "failed" | "stopped"`
- `ownerTranslationId`: translation that owns the extraction for Auto Context lifecycle management, or `null`
- `completedAt`: completion timestamp, or `null`

`ownerTranslationId` grants permission to automatically manage an Extraction. It is not simply a reverse link.

## Translation–Extraction Relationships

Use this rule:

- **Linked means read:** `Translation.autoContextExtractionId` identifies the Extraction whose result the Translation reads as context.
- **Owned means manage:** `Extraction.ownerTranslationId` identifies the Translation allowed to automatically update, rerun, or recover that Extraction.

For example, Translation A manually selects an existing Extraction X. A stores `autoContextExtractionId: X`, while X's `ownerTranslationId` remains unchanged. If X is unowned, it stays `null`; if another Translation owns X, that ownership remains. A can read X, but cannot automatically rerun or overwrite it. If A instead creates X through Auto Context, A stores `autoContextExtractionId: X` and X stores `ownerTranslationId: A`; A can then rerun X after a failure.

The relationships by workflow are:

- single Translation, auto-created Extraction: linked and owned
- single Translation, manually selected existing Extraction: linked, without assigning ownership to the selecting Translation
- batch Auto Context, auto-created Extraction: linked and owned
- batch Link Context assignment: linked and owned because the Extraction becomes a managed item in the one-to-one Context Chain
- batch Starting Context: read as the chain seed without assigning or changing ownership

Manual selection in a single Translation intentionally does not assign ownership. This permits reuse and prevents a Translation from automatically overwriting a manually managed dependency.

Ownership is used only to detach the relationship when a Translation is deleted or moved. There is no cascading deletion or movement of Extractions:

- deleting a Translation sets `ownerTranslationId` to `null` on its owned Extractions; the Extractions and their settings remain in the project
- moving a Translation sets `ownerTranslationId` to `null` on its owned Extractions; the Extractions and their settings remain in the source project and are not moved with the Translation
- manual selection and Starting Context selection do not assign ownership; deleting or moving the selecting Translation does not change those Extractions or any ownership they already have

## Status Rules

Runtime active extraction ids override persisted status as `running`.

Persisted `running` without a matching runtime active id is treated as `stopped`.

A usable extraction must have effective status `completed`, clean non-empty content, and no `<error>` tag.

## Run Transitions

When extraction starts or reruns:

- clear the previous result
- set `status` to `running`
- set `completedAt` to `null`

When extraction succeeds:

- validate that the result is clean, non-empty, and does not contain `<error>`
- set `status` to `completed`
- set `completedAt` to the current time

When extraction is aborted:

- set `status` to `stopped`
- set `completedAt` to `null`

When extraction fails:

- set `status` to `failed`
- set `completedAt` to `null`

## Manual Editing

When users click Done Editing for an extraction result, status is recomputed from the edited text:

- clean non-empty result without `<error>` becomes `completed`
- empty result becomes `idle`
- result containing `<error>` becomes `failed`

This allows users to manually repair a failed or stopped extraction and make it usable without rerunning.

## Batch Behavior

Batch extraction file status derives from extraction metadata:

- runtime active id: `processing`
- queued id: `queued`
- `completed`: `done`
- `failed` or `stopped`: `error`
- non-empty idle result: `partial`
- empty idle result: `pending`

Batch “mark done” changes metadata only. It marks clean non-empty non-error results as `completed`, and toggles completed results back to `idle`.

Sequential batch previous-context seeding uses only usable completed extraction results.

Batch Translation Auto Context uses the same lifecycle metadata. A stopped or failed owned extraction is rerun in place by Continue. A manually repaired extraction marked `completed` is usable without rerunning. Deleting an owned extraction leaves a recoverable stale Translation link; the next batch run creates and links a replacement.

## Legacy `<done>` Migration

Dexie version 27 migrates legacy extraction records:

- trailing `<done>` is stripped from `contextResult`
- records with `<done>` and clean non-empty content become `completed`
- legacy single non-empty, non-error records without `<done>` become `completed`
- legacy batch non-empty, non-error records without `<done>` become `stopped`
- records containing `<error>` become `failed`
- empty records become `idle`

Imports use the same normalization rules. New code must not write `<done>` markers.
