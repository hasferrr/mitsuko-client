import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Upload } from "lucide-react"
import { exportDatabase, importDatabase } from "@/lib/db/db-io"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useRouter } from "next/navigation"

interface ExportImportDialogueProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function ExportImportDialogue({
  isOpen,
  setIsOpen,
}: ExportImportDialogueProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [deleteExisting, setDeleteExisting] = useState(false)
  const loadProjects = useProjectStore(state => state.loadProjects)

  useEffect(() => {
    if (isOpen) {
      setDeleteExisting(false)
    }
  }, [isOpen])

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
        setSelectedFile(file)
        setShowImportConfirm(true)
      }
      input.click()
    } catch (error) {
      console.error('Error importing database:', error)
      toast.error("Failed to import database")
      setIsLoading(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!selectedFile) return

    try {
      setIsLoading(true)
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          if (deleteExisting) {
            router.push("/dashboard")
          }
          await importDatabase(content, deleteExisting)
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
      reader.readAsText(selectedFile)
    } catch (error) {
      console.error('Error importing database:', error)
      toast.error("Failed to import database")
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export/Import Database</DialogTitle>
            <DialogDescription className="pt-1">
              Backup all your projects and batches to a JSON file or restore from a previously exported backup.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
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
          <div className="flex items-center gap-2 justify-center">
            <Checkbox
              id="delete-existing"
              checked={deleteExisting}
              onCheckedChange={(checked) => setDeleteExisting(checked as boolean)}
            />
            <label
              htmlFor="delete-existing"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Delete all existing projects before importing
            </label>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteExisting
                ? "This action will delete all existing projects and replace them with the imported data. This action cannot be undone."
                : "This action will add the imported projects to your existing projects. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport} disabled={isLoading}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}