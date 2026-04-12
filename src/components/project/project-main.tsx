"use client"

import { useState } from "react"
import { Globe, Headphones, LayoutDashboard, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Project } from "@/types/project"
import { SettingsDialogue } from "../settings/settings-dialogue"
import { TranscriptionSettingsDialogue } from "../settings/transcription-settings-dialogue"
import {
  GLOBAL_EXTRACTION_ADVANCED_SETTINGS_ID,
  GLOBAL_EXTRACTION_BASIC_SETTINGS_ID,
  GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID,
  GLOBAL_TRANSLATION_BASIC_SETTINGS_ID,
  GLOBAL_TRANSCRIPTION_SETTINGS_ID,
} from "@/constants/global-settings"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useProjectData } from "@/hooks/project/use-project-data"
import { ProjectHeader } from "./project-header"
import { ProjectTranslationList } from "./lists/project-translation-list"
import { ProjectTranscriptionList } from "./lists/project-transcription-list"
import { ProjectExtractionList } from "./lists/project-extraction-list"

interface ProjectMainProps {
  currentProject: Project
}

export const ProjectMain = ({ currentProject }: ProjectMainProps) => {
  const [isTranslationSettingsModalOpen, setIsTranslationSettingsModalOpen] = useState(false)
  const [isExtractionSettingsModalOpen, setIsExtractionSettingsModalOpen] = useState(false)
  const [isTranscriptionSettingsModalOpen, setIsTranscriptionSettingsModalOpen] = useState(false)
  const [isGlobalTranslationSettingsOpen, setIsGlobalTranslationSettingsOpen] = useState(false)
  const [isGlobalExtractionSettingsOpen, setIsGlobalExtractionSettingsOpen] = useState(false)
  const [isGlobalTranscriptionSettingsOpen, setIsGlobalTranscriptionSettingsOpen] = useState(false)

  const updateProjectStore = useProjectStore(state => state.updateProject)

  const {
    translations,
    setTranslations,
    transcriptions,
    setTranscriptions,
    extractions,
    setExtractions,
    isLoadingData,
    handleDragEnd,
  } = useProjectData(currentProject)

  return (
    <div translate="no" className="flex-1 p-6 max-w-5xl mx-auto">
      <ProjectHeader currentProject={currentProject} />

      <SettingsDialogue
        mode="project"
        isOpen={isTranslationSettingsModalOpen}
        onOpenChange={setIsTranslationSettingsModalOpen}
        projectName={currentProject.name}
        basicSettingsId={currentProject.defaultTranslationBasicSettingsId}
        advancedSettingsId={currentProject.defaultTranslationAdvancedSettingsId}
        resetFromBasicSettingsId={GLOBAL_TRANSLATION_BASIC_SETTINGS_ID}
        resetFromAdvancedSettingsId={GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID}
        settingsParentType="translation"
        isDefaultEnabled={currentProject.isDefaultTranslationEnabled}
        onDefaultEnabledChange={(enabled: boolean) => updateProjectStore(currentProject.id, { isDefaultTranslationEnabled: enabled })}
        onOpenGlobalSettings={() => {
          setIsTranslationSettingsModalOpen(false)
          setIsGlobalTranslationSettingsOpen(true)
        }}
      />

      <SettingsDialogue
        mode="project"
        isOpen={isExtractionSettingsModalOpen}
        onOpenChange={setIsExtractionSettingsModalOpen}
        projectName={currentProject.name}
        basicSettingsId={currentProject.defaultExtractionBasicSettingsId}
        advancedSettingsId={currentProject.defaultExtractionAdvancedSettingsId}
        resetFromBasicSettingsId={GLOBAL_EXTRACTION_BASIC_SETTINGS_ID}
        resetFromAdvancedSettingsId={GLOBAL_EXTRACTION_ADVANCED_SETTINGS_ID}
        settingsParentType="extraction"
        isDefaultEnabled={currentProject.isDefaultExtractionEnabled}
        onDefaultEnabledChange={(enabled: boolean) => updateProjectStore(currentProject.id, { isDefaultExtractionEnabled: enabled })}
        onOpenGlobalSettings={() => {
          setIsExtractionSettingsModalOpen(false)
          setIsGlobalExtractionSettingsOpen(true)
        }}
      />

      <TranscriptionSettingsDialogue
        mode="project"
        isOpen={isTranscriptionSettingsModalOpen}
        onOpenChange={setIsTranscriptionSettingsModalOpen}
        projectName={currentProject.name}
        defaultTranscriptionId={currentProject.defaultTranscriptionId}
        isDefaultEnabled={currentProject.isDefaultTranscriptionEnabled}
        onDefaultEnabledChange={(enabled: boolean) => updateProjectStore(currentProject.id, { isDefaultTranscriptionEnabled: enabled })}
        onOpenGlobalSettings={() => {
          setIsTranscriptionSettingsModalOpen(false)
          setIsGlobalTranscriptionSettingsOpen(true)
        }}
      />

      {/* Global Settings Dialogues */}
      <SettingsDialogue
        mode="global"
        isOpen={isGlobalTranslationSettingsOpen}
        onOpenChange={setIsGlobalTranslationSettingsOpen}
        basicSettingsId={GLOBAL_TRANSLATION_BASIC_SETTINGS_ID}
        advancedSettingsId={GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID}
        settingsParentType="translation"
      />

      <SettingsDialogue
        mode="global"
        isOpen={isGlobalExtractionSettingsOpen}
        onOpenChange={setIsGlobalExtractionSettingsOpen}
        basicSettingsId={GLOBAL_EXTRACTION_BASIC_SETTINGS_ID}
        advancedSettingsId={GLOBAL_EXTRACTION_ADVANCED_SETTINGS_ID}
        settingsParentType="extraction"
      />

      <TranscriptionSettingsDialogue
        mode="global"
        isOpen={isGlobalTranscriptionSettingsOpen}
        onOpenChange={setIsGlobalTranscriptionSettingsOpen}
        defaultTranscriptionId={GLOBAL_TRANSCRIPTION_SETTINGS_ID}
      />

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="bg-card border border-border h-fit flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-secondary rounded-md">
            <LayoutDashboard className="size-4" />
            Overview ({translations.length + transcriptions.length + extractions.length})
          </TabsTrigger>
          <TabsTrigger value="translations" className="data-[state=active]:bg-secondary rounded-md">
            <Globe className="size-4" />
            Translations ({translations.length})
          </TabsTrigger>
          <TabsTrigger value="transcriptions" className="data-[state=active]:bg-secondary rounded-md">
            <Headphones className="size-4" />
            Transcriptions ({transcriptions.length})
          </TabsTrigger>
          <TabsTrigger value="context-extractor" className="data-[state=active]:bg-secondary rounded-md">
            <FileText className="size-4" />
            Extractions ({extractions.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="space-y-6">
            <ProjectTranslationList
              title="Translations"
              currentProject={currentProject}
              translations={translations}
              setTranslations={setTranslations}
              isLoadingData={isLoadingData}
              onDragEnd={handleDragEnd}
              onOpenSettings={() => setIsTranslationSettingsModalOpen(true)}
            />
            <ProjectTranscriptionList
              title="Transcriptions"
              currentProject={currentProject}
              transcriptions={transcriptions}
              setTranscriptions={setTranscriptions}
              isLoadingData={isLoadingData}
              onDragEnd={handleDragEnd}
              onOpenSettings={() => setIsTranscriptionSettingsModalOpen(true)}
            />
            <ProjectExtractionList
              title="Extractions"
              currentProject={currentProject}
              extractions={extractions}
              setExtractions={setExtractions}
              isLoadingData={isLoadingData}
              onDragEnd={handleDragEnd}
              onOpenSettings={() => setIsExtractionSettingsModalOpen(true)}
            />
          </div>
        </TabsContent>

        {/* Translations Tab */}
        <TabsContent value="translations" className="mt-4">
          <ProjectTranslationList
            title="All Translations"
            currentProject={currentProject}
            translations={translations}
            setTranslations={setTranslations}
            isLoadingData={isLoadingData}
            onDragEnd={handleDragEnd}
            onOpenSettings={() => setIsTranslationSettingsModalOpen(true)}
          />
        </TabsContent>

        {/* Transcriptions Tab */}
        <TabsContent value="transcriptions" className="mt-4">
          <ProjectTranscriptionList
            title="All Transcriptions"
            currentProject={currentProject}
            transcriptions={transcriptions}
            setTranscriptions={setTranscriptions}
            isLoadingData={isLoadingData}
            onDragEnd={handleDragEnd}
            onOpenSettings={() => setIsTranscriptionSettingsModalOpen(true)}
          />
        </TabsContent>

        {/* Extractions Tab */}
        <TabsContent value="context-extractor" className="mt-4">
          <ProjectExtractionList
            title="All Extractions"
            currentProject={currentProject}
            extractions={extractions}
            setExtractions={setExtractions}
            isLoadingData={isLoadingData}
            onDragEnd={handleDragEnd}
            onOpenSettings={() => setIsExtractionSettingsModalOpen(true)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}