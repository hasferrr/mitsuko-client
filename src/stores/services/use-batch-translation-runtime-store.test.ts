import { beforeEach, describe, expect, test } from "bun:test"
import { useBatchTranslationRuntimeStore } from "@/stores/services/use-batch-translation-runtime-store"

describe("useBatchTranslationRuntimeStore", () => {
  beforeEach(() => {
    useBatchTranslationRuntimeStore.setState({ queueSetMap: {}, stageMap: {} })
  })

  test("keeps waiting stages outside the batch page component lifecycle", () => {
    const store = useBatchTranslationRuntimeStore.getState()

    store.setQueueSet("project-1", new Set(["translation-1", "translation-2"]))
    store.setStageMap("project-1", {
      "translation-1": "waiting-context",
      "translation-2": "queued-translation",
    })

    expect(useBatchTranslationRuntimeStore.getState().queueSetMap["project-1"]).toEqual(
      new Set(["translation-1", "translation-2"]),
    )
    expect(useBatchTranslationRuntimeStore.getState().stageMap["project-1"]).toEqual({
      "translation-1": "waiting-context",
      "translation-2": "queued-translation",
    })
  })

  test("updates one phase without losing other phases", () => {
    const store = useBatchTranslationRuntimeStore.getState()
    store.setStageMap("project-1", {
      "translation-1": "waiting-context",
      "translation-2": "queued-translation",
    })

    store.setStageMap("project-1", previous => ({
      ...previous,
      "translation-1": "extracting-context",
    }))

    expect(useBatchTranslationRuntimeStore.getState().stageMap["project-1"]).toEqual({
      "translation-1": "extracting-context",
      "translation-2": "queued-translation",
    })
  })

  test("isolates simultaneous runtime state by project", () => {
    const store = useBatchTranslationRuntimeStore.getState()
    store.setQueueSet("project-1", new Set(["translation-1"]))
    store.setQueueSet("project-2", new Set(["translation-2"]))
    store.setStageMap("project-1", { "translation-1": "waiting-context" })
    store.setStageMap("project-2", { "translation-2": "queued-translation" })

    const state = useBatchTranslationRuntimeStore.getState()
    expect(state.queueSetMap["project-1"]).toEqual(new Set(["translation-1"]))
    expect(state.queueSetMap["project-2"]).toEqual(new Set(["translation-2"]))
    expect(state.stageMap["project-1"]).toEqual({ "translation-1": "waiting-context" })
    expect(state.stageMap["project-2"]).toEqual({ "translation-2": "queued-translation" })
  })
})
