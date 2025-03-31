import { memo } from "react"
import { Parsed, SubtitleTranslated } from "@/types/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { timestampToString } from "@/lib/subtitles/timestamp"

interface HistoryItemDetailsProps {
  parsed: Parsed
  subtitles: SubtitleTranslated[]
}

export const HistoryItemDetails = memo(({ parsed, subtitles }: HistoryItemDetailsProps) => {
  if (!parsed || !subtitles) {
    return <div>No data to display</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-lg">Parsed Data</p>
        <p>Type: {parsed.type}</p>
        <p>Length: {subtitles.length}</p>
      </div>
      <div>
        <p className="text-lg">Subtitles</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Index</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Original</TableHead>
              <TableHead>Translated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subtitles.slice(0, 50).map((subtitle) => (
              <TableRow key={subtitle.index}>
                <TableCell>{subtitle.index}</TableCell>
                <TableCell>
                  {timestampToString(subtitle.timestamp.start)}
                  <br />
                  {timestampToString(subtitle.timestamp.end)}
                </TableCell>
                <TableCell>{subtitle.actor}</TableCell>
                <TableCell>{subtitle.content}</TableCell>
                <TableCell>{subtitle.translated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
})
