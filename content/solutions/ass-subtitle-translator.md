---
title: ASS Subtitle Translator - Preserve Timing, Style, and Context | Mitsuko
description: Translate ASS subtitle dialogue while preserving timing, styles, and override tags for review-ready export.
keywords: [ASS subtitle translator, translate ASS subtitles, AI ASS subtitle translation, preserve ASS subtitle styling, subtitle style translation]
---

## The hidden cost of "just translate the text"

ASS files are not just dialogue. They also carry timing, style names, margins, effects, and tags for position, color, font size, and karaoke.

If you drop the whole file into a generic translator, one of two things usually happens:

- The tool flattens everything to plain text, and you rebuild the styling from scratch.
- The tool tries to translate the whole line including the override tags, corrupting `{\an8}` or `{\pos(317,51)}` into nonsense and breaking playback.

Both routes waste work that is already done.

Mitsuko takes the narrower path: translate *only the dialogue*, keep the ASS structure untouched, and send the file back to the editor ready for review.

## What stays, what changes: a real ASS line

Here is the same ASS dialogue event before and after translation. Watch the structure, not just the words.

```text
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:03:18.56,0:03:21.43,Signs,sign,0000,0000,0000,,{\c&H8A9B96&\b1\fs14\pos(317,51)\bord2\3c&HECF4F1&}98th Annual Graduation Ceremony
```

```text
Dialogue: 0,0:03:18.56,0:03:21.43,Signs,sign,0000,0000,0000,,{\c&H8A9B96&\b1\fs14\pos(317,51)\bord2\3c&HECF4F1&}Upacara Kelulusan Tahun ke-98
```

The start time, end time, style name (`Signs`), actor (`sign`), margins, and the full override block are byte-for-byte identical.

Only the visible text was translated: `98th Annual Graduation Ceremony` became `Upacara Kelulusan Tahun ke-98`. The sign keeps its position, color, bold, font size, and border because none of that was touched.

### Inline positioning, preserved

| Type | Line |
|---|---|
| ASS dialogue sample | `{\\an8}Don't move! That sign is the clue.` |
| Generic output | `Jangan bergerak! Tanda itu adalah petunjuk.` |
| Subtitle-localized output | `{\\an8}Jangan bergerak! Papan itu petunjuknya.` |

The `{\\an8}` top-alignment tag survives translation. A generic pass would either strip it, losing the on-screen position, or try to translate it, breaking the tag.

Mitsuko focuses on the dialogue text and leaves the override tags in place. That is how the subtitle still renders where it should.

## The translation isn't just "safe" - it's also better

Preserving structure is the floor, not the ceiling. Once the format is protected, the dialogue still has to read like a subtitle, not a machine gloss.

| Type | Line |
|---|---|
| English sample line | Let's keep this between us. |
| Literal Indonesian | Mari kita simpan ini di antara kita. |
| Natural Indonesian subtitle | Ini rahasia kita, ya. |

"Keep this between us" is an idiom, not an instruction to physically store something. The literal version is grammatically fine, but socially wrong. Nobody talks that way.

The natural subtitle adapts the phrase for how Indonesian viewers read that moment, instead of copying the English sentence structure word for word.

So the rule is: **structure preserved, dialogue localized.** Both have to be true or the file isn't review-ready.

## The ASS translation flow

1. **Upload the ASS file.** Mitsuko reads the events, styles, and header so the structure is understood, not discarded.
2. **Translate dialogue with context and instructions.** Add names, terms, tone, and honorific choices as custom instructions. The dialogue is translated; the override tags, timing, and style assignments are left intact.
3. **Export for timing, styling, and QC review.** The translated ASS goes straight back into your existing Aegisub or QC workflow - no re-timing, no re-typesetting of the parts that were already done.

## When this matters most

- Subtitle editors working in ASS who refuse to rebuild files they already styled.
- Anime and drama projects with signs, karaoke, or positioned text where every override tag is load-bearing.
- Translators who want an editable first draft - not a "magic" one-click file that silently breaks tags they can't see.

## A note on term rules

The same custom-instructions system that handles tone also handles your glossary.

If a character name or recurring term has a fixed translation, set it once. It stays consistent across the file and, in a [batch project](/solutions/batch-subtitle-translation), across every file in the batch.

## Related workflows

- [Anime subtitle translator](/solutions/anime-subtitle-translator) - context-aware character tone, idioms, and honorifics.
- [Batch subtitle translation](/solutions/batch-subtitle-translation) - translate multiple ASS/SRT/VTT files with shared settings.
- [YouTube subtitle translator](/solutions/youtube-subtitle-translator) - localize creator video subtitles.
- [Mitsuko workflow guide](/blog/mitsuko-mastery-guide) - how the pieces fit together end to end.

Upload an ASS file, set your term and tone rules, and export a translated draft with the structure intact.
