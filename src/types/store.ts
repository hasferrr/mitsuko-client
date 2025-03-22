import { UseBoundStore, StoreApi } from "zustand"
import { TranslationDataStore } from "@/stores/use-translation-data-store"
import { ExtractionDataStore } from "@/stores/use-extraction-data-store"

export type Store = UseBoundStore<StoreApi<TranslationDataStore | ExtractionDataStore>>
