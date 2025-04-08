import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, Upload } from "lucide-react"
import { exportDatabase, importDatabase } from "@/lib/db/db-io"
import { useState } from "react"
import { toast } from "sonner"
import { useProjectStore } from "@/stores/data/use-project-store"

interface ExportImportDialogueProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function ExportImportDialogue({
  isOpen,
  setIsOpen,
}: ExportImportDialogueProps) {
  const [isLoading, setIsLoading] = useState(false)
  const loadProjects = useProjectStore(state => state.loadProjects)

  const handleExport = async () => {
    try {
      setIsLoading(true)
      const data = await exportDatabase()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mitsuko-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Database exported successfully")
    } catch (error) {
      console.error('Error exporting database:', error)
      toast.error("Failed to export database")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        setIsLoading(true)
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const content = e.target?.result as string
            await importDatabase(content, false)
            await loadProjects()
            toast.success("Database imported successfully")
            setIsOpen(false)
          } catch (error) {
            console.error('Error importing database:', error)
            toast.error("Failed to import database")
          } finally {
            setIsLoading(false)
          }
        }
        reader.readAsText(file)
      }
      input.click()
    } catch (error) {
      console.error('Error importing database:', error)
      toast.error("Failed to import database")
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export/Import Database</DialogTitle>
          <DialogDescription className="pt-1">
            Backup all your projects to a JSON file or restore from a previously exported backup.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isLoading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Export Database
          </Button>
          <Button
            variant="outline"
            onClick={handleImport}
            disabled={isLoading}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Import Database
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}