import TranscriptionHistory from "@/components/cloud/transcription-history"
import UploadedFiles from "./uploaded-files"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, History } from "lucide-react"

export default function CloudWrapper() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Tabs defaultValue="storage" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="storage" className="flex items-center gap-2 w-48">
            <Upload className="h-4 w-4" />
            Uploaded Files
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 w-48">
            <History className="h-4 w-4" />
            Transcription History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="storage" className="space-y-0">
          <UploadedFiles />
        </TabsContent>

        <TabsContent value="history" className="space-y-0">
          <TranscriptionHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
