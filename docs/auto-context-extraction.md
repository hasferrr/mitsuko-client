# Auto Context Extraction For Single Translation

## Summary

Auto context extraction lets a single translation resolve an extraction result before translation starts and send that extracted context as the request context document.

When enabled, translation uses:

```text
currentContextDocumentTextarea + "\n\n" + cleanedExtractionResult
```

The saved Context Document textarea is not overwritten. Continue and Fill Missing Translations also resolve auto context before starting. Batch projects use the separate deterministic pipeline documented in [batch-auto-context.md](./batch-auto-context.md).

## Configurable Defaults

Project and global translation defaults are stored as hidden template translations. Their Auto dialog offers only Off and Extract & translate. A project template is used when project translation defaults are enabled; otherwise the global template is used. Batch translations always start with auto context disabled. Changing a default affects only translations created afterward.

Template translations are not included in project translation lists, counts, or processing queues. They store no operational extraction links. A template's `use-existing` or invalid mode is treated as disabled.

## Operational Translation Fields

Each `Translation` stores:

- `autoContextMode`: `"disabled" | "create-new" | "use-existing"`
- `autoContextExtractionId`: linked auto-created extraction or selected existing extraction
- `autoContextPreviousMode`: `"latest" | "selected" | "none"`
- `autoContextPreviousExtractionId`: selected previous extraction for `create-new`

`autoContextExtractionId` is intentionally kept after auto-created extraction failures so users can inspect, manually repair, or rerun the linked extraction.

`Translation.autoContextExtractionId` is the only relationship between a Translation and its Auto Context Extraction. It is a live, shared reference: multiple Translations may point to the same Extraction, and changes to that Extraction are visible to every linked Translation.

Changing `autoContextMode` keeps `autoContextExtractionId` and `autoContextPreviousExtractionId` so linked extraction history and previous selections can be restored. It resets `autoContextPreviousMode` to `latest`.

## Modes

### Disabled

Translation starts normally and uses only the current Context Document textarea.

### Create New

Before translation starts, the app resolves previous context, creates a new extraction in the same project, runs extraction, validates the completed result, then uses that result for translation.

As soon as the extraction is created, the app changes the translation mode to `use-existing` and writes the new extraction id to `autoContextExtractionId`. The created extraction remains linked while it is running and after success, failure, or stop.

The created extraction uses:

- project default extraction settings if project extraction defaults are enabled
- global extraction defaults if project extraction defaults are disabled
- current translation subtitles as `subtitleContent`
- `Auto Context for {translation title}` as title
- translation title as episode number

### Use Existing

Translation uses the selected extraction result when it is usable.

Selecting an existing extraction writes its id to `autoContextExtractionId`. The same Extraction may be selected by other Translations.

If the selected extraction is currently running, translation waits for it to finish, then reloads and validates the result.

If the selected extraction is not usable, translation reruns that same extraction entity in place. The rerun updates title, episode number, subtitle content, and result status while preserving its saved settings and previous context. Because links are live and shared, every other Translation linked to that Extraction observes the updated result.

## Previous Context For Create New

Create-new can seed the new extraction's `previous_context` in three ways:

- `latest`: use the latest usable completed extraction in the current project
- `selected`: use the selected previous extraction
- `none`: send empty previous context

`latest` skips running, empty, failed, stopped, idle, errored, and otherwise unusable extractions. It uses the current auto-owned linked extraction when that extraction is the latest usable completed extraction.

If `latest` finds no usable completed extraction in the project, create-new still runs with empty previous context.

If `selected` is used and the selected previous extraction is missing, outside the project, running, empty, failed, stopped, idle, contains `<error>`, or is otherwise unusable, the flow aborts and translation does not start.

## Usable Extraction

An extraction is usable for auto context when it:

- exists
- belongs to the same project
- has effective status `completed`
- does not contain `<error>`
- has non-empty cleaned content

Extraction lifecycle status is defined in [extraction-lifecycle.md](./extraction-lifecycle.md).

## Start Flow

1. User starts or restarts a single translation.
2. If auto context is disabled, translation starts normally.
3. If mode is `use-existing`, validate, wait for, or rerun the selected extraction depending on status.
4. If mode is `create-new`, resolve previous context, create a linked extraction, run extraction, then validate the result.
5. Combine the cleaned extraction result with the current Context Document textarea.
6. Start translation with the combined context document override.

## Stop Behavior

Stop always prevents translation from starting if translation has not started yet.

When waiting for an existing selected extraction, Stop cancels only the translation wait. It does not abort the existing extraction.

When running a newly auto-created extraction or rerunning a linked extraction, Stop aborts that extraction. It remains linked with stopped status and can be rerun in place on the next translation start.

## UI

The Context Document section has an Auto button. Every Translation uses the same editable Auto Context dialog, whether or not it belongs to a batch project.

The per-Translation dialog and the batch pipeline are separate controls. The dialog edits the Translation's own Auto Context mode and extraction selections. Starting or continuing work from the batch view still follows the batch project's Batch Auto Context setting and deterministic Context Chain.

The Auto dialog lets the user:

- enable or disable auto context
- choose create-new or use-existing mode
- select or deselect an existing extraction for use-existing
- choose latest previous context, selected previous context, or no previous context for create-new
- open selected extraction records in the full `ContextExtractorMain` dialog
- preview the combined context (manual Context Document followed by Auto Context extraction) that will be sent with the translation request

Use-existing hides previous-context controls because it directly reuses or reruns the selected Extraction.

## Error Handling

The whole flow stops with no translation if:

- no existing extraction is selected in `use-existing`
- a selected extraction is missing or outside the project
- a selected previous extraction for create-new is invalid
- auto-created or linked rerun extraction fails because of network/API/parsing/validation error
- the user presses Stop before translation starts

Failed and stopped extraction entities remain linked and visible so users can inspect them, manually repair them, or rerun them in place.
