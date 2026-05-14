# Extraction Lifecycle Metadata

## Summary

Extractions use persisted lifecycle metadata to determine whether a result is usable. This replaces the legacy `<done>` marker as the source of truth for completion.

This applies to manual extraction, batch extraction, and auto-context extraction.

## Fields

Each `Extraction` stores:

- `status`: `"idle" | "running" | "completed" | "failed" | "stopped"`
- `origin`: `"manual" | "batch" | "auto-context"`
- `ownerTranslationId`: translation that auto-created the extraction, or `null`
- `completedAt`: completion timestamp, or `null`

`ownerTranslationId` is only meaningful for `origin: "auto-context"`. It lets the owning translation rerun its own invalid linked extraction without allowing other translations to rerun manually selected dependencies.

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

## Legacy `<done>` Migration

Dexie version 27 migrates legacy extraction records:

- trailing `<done>` is stripped from `contextResult`
- records with `<done>` and clean non-empty content become `completed`
- legacy single non-empty, non-error records without `<done>` become `completed`
- legacy batch non-empty, non-error records without `<done>` become `stopped`
- records containing `<error>` become `failed`
- empty records become `idle`

Imports use the same normalization rules. New code must not write `<done>` markers.
