# Auto Context Extraction For Single Translation

## Summary

Auto context extraction lets a single translation resolve an extraction result before translation starts and send that extracted context as the request context document.

When enabled, translation uses:

```text
cleanedExtractionResult + "\n\n" + currentContextDocumentTextarea
```

The saved Context Document textarea is not overwritten. Batch translation is excluded.

## Persisted Fields

Each `Translation` stores:

- `autoContextMode`: `"disabled" | "create-new" | "use-existing"`
- `autoContextExtractionId`: latest linked extraction, or selected existing extraction
- `autoContextPreviousMode`: `"latest" | "selected" | "none"`
- `autoContextPreviousExtractionId`: selected previous extraction for `create-new`

`autoContextExtractionId` is intentionally kept even for `create-new` so imports/exports preserve the relationship and failed auto-created extractions remain inspectable.

Changing `autoContextMode` keeps `autoContextExtractionId` and `autoContextPreviousExtractionId` so linked extraction history and previous selections can be restored. It resets `autoContextPreviousMode` to `latest`.

## Modes

### Disabled

Translation starts normally and uses only the current Context Document textarea.

### Create New

Before translation starts, the app creates a new extraction in the same project, runs extraction, validates the result, then uses the new extraction result for translation.

As soon as the extraction is created, the app changes the translation's auto context mode to `use-existing` and writes the new extraction id to `autoContextExtractionId`. This keeps the newly created extraction selected and linked even while extraction is still running.

The created extraction uses:

- project default extraction settings if project extraction defaults are enabled
- global extraction defaults if project extraction defaults are disabled
- current translation subtitles as `subtitleContent`
- `[Auto Context] {translation title}` as title
- translation title without subtitle extension as episode number

`create-new` becomes `use-existing` as soon as the linked extraction is created.

### Use Existing

Translation uses the selected extraction result and does not rerun extraction.

If the selected extraction is currently running, translation waits for it to finish, then reloads and validates the result.

## Previous Context For Create New

Create-new can seed the new extraction's `previous_context` in three ways:

- `latest`: use the latest previous extraction in the current project
- `selected`: use the selected previous extraction
- `none`: send empty previous context

If `selected` is used and the selected previous extraction is missing, outside the project, running, empty, or contains `<error>`, the flow aborts and translation does not start.

If `latest` finds a running latest previous extraction, translation waits for it to finish, then reloads and validates the result.

If `latest` finds an empty latest previous extraction, one that contains `<error>`, or one that is otherwise invalid, the flow aborts and translation does not start. It does not silently fall back to an older extraction.

If `latest` finds no extraction in the project, create-new still runs with empty previous context.

## Validation

A usable extraction must:

- exist
- belong to the same project
- not be running unless it is the selected `use-existing` extraction being waited on
- not contain `<error>`
- have non-empty cleaned content after parser cleanup and done-tag removal

Invalid selected extractions abort the whole flow. Translation does not start.

## Start Flow

1. User starts or restarts a single translation.
2. If auto context is disabled, translation starts normally.
3. If mode is `use-existing`, validate or wait for the selected extraction.
4. If mode is `create-new`, resolve previous context, create a linked extraction, run extraction, then validate the new result.
5. Combine cleaned extraction result with the current Context Document textarea.
6. Start translation with the combined context document override.

Continue and Fill Missing Translations does not run auto context.

## Stop Behavior

Stop always prevents translation from starting if it has not started yet.

When waiting for an existing selected extraction, Stop cancels only the translation wait. It does not abort the existing extraction.

When running an auto-created extraction from `create-new`, Stop aborts only that owned auto-created extraction. The created extraction entity remains in the project.

## UI

The Context Document section has an Auto button for single translation only.

The Auto dialog lets the user:

- enable or disable auto context
- choose create-new or use-existing mode
- select or deselect an existing extraction for use-existing
- choose latest previous context, selected previous context, or no previous context for create-new
- open selected extraction records in the full `ContextExtractorMain` dialog

Use-existing hides previous-context controls because it directly reuses an existing extraction result.

## Error Handling

The whole flow stops with no translation if:

- no existing extraction is selected in `use-existing`
- a selected extraction is missing or outside the project
- a selected extraction result is empty or contains `<error>`
- a selected previous extraction for create-new is invalid
- the latest previous extraction for create-new is invalid after any required wait
- auto-created extraction fails because of network/API/parsing/validation error
- the user presses Stop before translation starts

Failed auto-created extraction entities remain linked and visible so users can inspect or rerun them.
