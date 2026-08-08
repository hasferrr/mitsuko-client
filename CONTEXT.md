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
A Context Extraction selected by a Translation and appended to its Context Document at run time. Multiple Translations may share the same live Auto Context.
_Avoid_: Owned context

**Linked Auto Context Extraction**:
A Context Extraction referenced as Auto Context by one or more Translations. Regenerating it updates the live result observed by every linked Translation.
_Avoid_: Owned Auto Context Extraction

**Context Chain**:
An ordered series of distinct Context Extractions in which each extraction receives context from the immediately preceding extraction. Repeated links reuse the same Extraction rather than creating another chain node.
_Avoid_: Latest context

**Starting Context**:
An optional existing Context Extraction that seeds the first extraction in a Context Chain. It cannot also be linked to a Translation in that batch.
_Avoid_: First context, initial prompt

**Batch Translation**:
An ordered collection of Translations processed as one user-initiated workflow.
_Avoid_: Bulk translation
