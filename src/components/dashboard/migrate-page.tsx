"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExportImportDialogue } from "../ui-custom/export-import-dialogue"

export function MigratePage() {
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false)

  return (
    <div className="flex-1 p-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="mb-10">
          <h2 className="text-3xl font-medium mb-3 dark:text-white">We've Moved! 🎉</h2>
          <p className="text-muted-foreground mx-auto text-lg mb-8 dark:text-gray-300">
            Mitsuko has moved to a new home at <a href="https://mitsuko.app" className="text-blue-500 hover:underline font-medium dark:text-blue-400">mitsuko.app</a>
          </p>
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-medium mb-4 dark:text-white">How to Move Your Projects</h3>
            <div className="text-left max-w-xl mx-auto space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="font-medium dark:text-white">1</span>
                </div>
                <div>
                  <p className="text-base dark:text-gray-300">Export your projects from this site using the "Export Projects" button in the sidebar</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="font-medium dark:text-white">2</span>
                </div>
                <div>
                  <p className="text-base dark:text-gray-300">Visit <a href="https://mitsuko.app" className="text-blue-500 hover:underline font-medium dark:text-blue-400">mitsuko.app</a> and login with your existing account</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="font-medium dark:text-white">3</span>
                </div>
                <div>
                  <p className="text-base dark:text-gray-300">Import your projects using the "Import Projects" feature on the new site</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <ExportImportDialogue
              isOpen={isExportImportModalOpen}
              setIsOpen={setIsExportImportModalOpen}
            />
            <Button
              className="w-full max-w-md bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              onClick={() => setIsExportImportModalOpen(true)}
            >
              Click here to export projects
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <a
              href="https://mitsuko.app"
              className="block"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="w-full max-w-md dark:bg-transparent dark:text-white dark:border-white/20 dark:hover:bg-white/10"
                variant="outline"
              >
                Visit mitsuko.app
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}