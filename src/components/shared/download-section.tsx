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
import { DownloadOption, CombinedFormat, SubtitleType } from "@/types/subtitles"
import { SUBTITLE_NAME_MAP } from "@/constants/subtitle-formats"
import { cn, createUtf8SubtitleBlob } from "@/lib/utils"

type GenerateContentResult = string | Blob | Promise<string | Blob | undefined> | undefined

interface DownloadSectionProps {
  generateContent: (option: DownloadOption, format: CombinedFormat) => GenerateContentResult
  fileName: string
  type: SubtitleType | "zip"
  downloadOption: DownloadOption
  setDownloadOption: (option: DownloadOption) => void
  combinedFormat: CombinedFormat
  setCombinedFormat: (format: CombinedFormat) => void
  toType: SubtitleType | "no-change"
  setToType: ((type: SubtitleType) => void) | ((type: SubtitleType | "no-change") => void)
  noChangeOption?: boolean
  showSelectors?: boolean
  hideTextOptionSelector?: boolean
  inlineLayout?: boolean
}

export function DownloadSection({
  generateContent,
  fileName,
  type,
  downloadOption,
  setDownloadOption,
  combinedFormat,
  setCombinedFormat,
  toType,
  setToType,
  noChangeOption,
  showSelectors = true,
  hideTextOptionSelector = false,
  inlineLayout = false,
}: DownloadSectionProps) {

  const handleDownload = async () => {
    const content = await generateContent(downloadOption, combinedFormat)
    if (!content) return

    let name = fileName
    const nameArr = name.split(".")
    if (nameArr.at(-1) !== type) {
      nameArr.push(type)
      name = nameArr.join(".")
    }

    const blob = content instanceof Blob
      ? content
      : type !== "zip"
        ? createUtf8SubtitleBlob(content, type)
        : new Blob([content], { type: "application/zip" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn(
      inlineLayout ? "flex gap-2 items-center" : "grid grid-cols-2 gap-4 mt-4 items-center"
    )}>
      {showSelectors && !hideTextOptionSelector && (
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
      )}

      {showSelectors && (
        <Select value={toType} onValueChange={(value: SubtitleType) => setToType(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Convert Subtitles" />
          </SelectTrigger>
          <SelectContent>
            {[
              ...(noChangeOption ? [["no-change", "No Change"]] : []),
              ...SUBTITLE_NAME_MAP.entries(),
            ].map(([key, value]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  {value}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showSelectors && !hideTextOptionSelector && downloadOption === "combined" && (
        <Dialog>
          <DialogTrigger className="w-full" asChild>
            <Button variant="outline">
              <AlignCenter className="size-4" />
              Select Format
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-118">
            <DialogHeader>
              <DialogTitle>Select Format</DialogTitle>
              <DialogDescription>
                Choose how the original and translated text should be combined:
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={combinedFormat === "(o)-t" ? "default" : "outline"}
                onClick={() => setCombinedFormat("(o)-t")}
                className="py-8 w-full"
              >
                (Original Text) Translated Text
              </Button>
              <Button
                variant={combinedFormat === "(t)-o" ? "default" : "outline"}
                onClick={() => setCombinedFormat("(t)-o")}
                className="py-8 w-full"
              >
                (Translated Text) Original Text
              </Button>
              <Button
                variant={combinedFormat === "o-n-t" ? "default" : "outline"}
                onClick={() => setCombinedFormat("o-n-t")}
                className="py-8 w-full"
              >
                Original Text<br />Translated Text
              </Button>
              <Button
                variant={combinedFormat === "t-n-o" ? "default" : "outline"}
                onClick={() => setCombinedFormat("t-n-o")}
                className="py-8 w-full"
              >
                Translated Text<br />Original Text
              </Button>
            </div>

            <div className="">
              <h3 className="text-sm font-medium mb-2">Comment Original</h3>
              <Button
                variant={combinedFormat === "{o}-t" ? "default" : "outline"}
                onClick={() => setCombinedFormat("{o}-t")}
                className="py-8 w-full"
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
        className={cn(
          "gap-2",
          !inlineLayout && (!showSelectors || downloadOption !== "combined" || hideTextOptionSelector) && "col-span-2"
        )}
        onClick={handleDownload}
      >
        <Download className="size-4" />
        Download {type === "zip" ? "ZIP" : SUBTITLE_NAME_MAP.get(type)}
      </Button>
    </div>
  )
}