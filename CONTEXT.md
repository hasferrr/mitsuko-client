# Subtitle Processing

Mitsuko organizes subtitle translation, transcription, and contextual analysis so related media can be processed consistently.

## Language

**Translation**:
A subtitle file and its evolving translated content within a project.
_Avoid_: Translation file, episode

**Context Extraction**:
A contextual analysis produced from one subtitle source, optionally informed by an earlier Context Extraction.
_Avoid_: Context Document

**Context Document**:
User-authored context supplied to a Translation. Auto Context is appended to it without replacing the saved document.
_Avoid_: Context Extraction, Auto Context

**Auto Context**:
A Context Extraction prepared for one Translation before that Translation begins. Each Translation in a batch has its own Auto Context.
_Avoid_: Shared batch extraction

**Owned Auto Context Extraction**:
A Context Extraction created specifically for one Translation as part of Auto Context. It is detached and retained in its existing project when that Translation is moved or deleted.
_Avoid_: Selected Context Extraction

**Context Chain**:
An ordered series of Context Extractions in which each extraction receives context from the immediately preceding extraction. A Batch Translation's Context Chain follows its current translation order.
_Avoid_: Latest context

**Starting Context**:
An optional existing Context Extraction that seeds the first extraction in a Context Chain. It is not owned by a Translation in that batch.
_Avoid_: First context, initial prompt

**Batch Translation**:
An ordered collection of Translations processed as one user-initiated workflow.
_Avoid_: Bulk translation
