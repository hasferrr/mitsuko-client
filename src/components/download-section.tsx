import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlignCenter, Download } from "lucide-react"
import { DownloadOption, CombinedFormat } from "@/types/subtitles"
import { useState } from "react"

type GenerateContentResult = string | Blob | Promise<string | Blob | undefined> | undefined

interface DownloadSectionProps {
  generateContent: (option: DownloadOption, format: CombinedFormat) => GenerateContentResult
  fileName: string
  subName: string
}

export function DownloadSection({ generateContent, fileName, subName }: DownloadSectionProps) {
  const [downloadOption, setDownloadOption] = useState<DownloadOption>("translated")
  const [combinedFormat, setCombinedFormat] = useState<CombinedFormat>("o-n-t")

  const handleDownload = async () => {
    const content = await generateContent(downloadOption, combinedFormat)
    if (!content) return

    const blob = content instanceof Blob ? content : new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-4 mt-4 items-center">
      <Select
        value={downloadOption}
        onValueChange={(value: DownloadOption) => {
          setDownloadOption(value)
          if (value !== "combined") {
            setCombinedFormat("o-n-t")
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Download As" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="original">Original Text</SelectItem>
          <SelectItem value="translated">Translated Text</SelectItem>
          <SelectItem value="combined">Original + Translated</SelectItem>
        </SelectContent>
      </Select>

      {downloadOption === "combined" && (
        <Dialog>
          <DialogTrigger className="w-full" asChild>
            <Button variant="outline">
              <AlignCenter className="w-4 h-4" />
              Select Format
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Format</DialogTitle>
              <DialogDescription>
                Choose how the original and translated text should be combined:
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                variant={combinedFormat === "(o)-t" ? "default" : "outline"}
                onClick={() => setCombinedFormat("(o)-t")}
                className="py-8 flex justify-center w-56"
              >
                (Original Text) Translated Text
              </Button>
              <Button
                variant={combinedFormat === "(t)-o" ? "default" : "outline"}
                onClick={() => setCombinedFormat("(t)-o")}
                className="py-8 flex justify-center w-56"
              >
                (Translated Text) Original Text
              </Button>
              <Button
                variant={combinedFormat === "o-n-t" ? "default" : "outline"}
                onClick={() => setCombinedFormat("o-n-t")}
                className="py-8 flex justify-center w-56"
              >
                Original Text<br />Translated Text
              </Button>
              <Button
                variant={combinedFormat === "t-n-o" ? "default" : "outline"}
                onClick={() => setCombinedFormat("t-n-o")}
                className="py-8 flex justify-center w-56"
              >
                Translated Text<br />Original Text
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Comment Original</h3>
              <Button
                variant={combinedFormat === "{o}-t" ? "default" : "outline"}
                onClick={() => setCombinedFormat("{o}-t")}
                className="py-8 flex justify-center w-full"
              >
                {"{Commented Original}"}Translated Text
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Original text will be enclosed in curly braces, allowing it to be treated as a comment in many subtitle formats.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Button
        variant="outline"
        className="gap-2 w-full"
        onClick={handleDownload}
      >
        <Download className="h-4 w-4" />
        Download {subName}
      </Button>
    </div>
  )
}