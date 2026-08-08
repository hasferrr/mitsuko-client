---
status: accepted
---

# Use live shared Extraction references for Auto Context

Translations reference Auto Context solely through `autoContextExtractionId`; Extractions carry no reverse ownership. Multiple Translations may reference the same live Extraction, and editing or regenerating it updates the result observed by all linked Translations. We accept this shared-mutation behavior to keep single and batch Auto Context consistent and avoid ownership transfer, copying, and bidirectional-link synchronization; a batch prepares a repeated linked Extraction only once per operation.
