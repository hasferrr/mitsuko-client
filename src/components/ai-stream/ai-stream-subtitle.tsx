import { AnimatePresence, motion } from "framer-motion"
import { SubtitleNoTimeNoActorTranslated, SubtitleNoTimeTranslated } from "@/types/subtitles"
import { memo } from "react"

interface AiStreamSubtitleProps {
  initialSubtitles: SubtitleNoTimeTranslated[]
  translatedSubtitles: SubtitleNoTimeNoActorTranslated[]
}

export const AiStreamSubtitle = memo(({ initialSubtitles, translatedSubtitles }: AiStreamSubtitleProps) => {
  return (
    <AnimatePresence>
      {translatedSubtitles.map((subtitle) => (
        <Subtitle
          key={subtitle.index}
          subtitle={{
            index: subtitle.index,
            actor: initialSubtitles[subtitle.index - 1]?.actor || "",
            content: subtitle.content || initialSubtitles[subtitle.index - 1]?.content || "",
            translated: subtitle.translated,
          }}
        />
      ))}
    </AnimatePresence>
  )
})

const Subtitle = memo(({ subtitle }: { subtitle: SubtitleNoTimeTranslated }) => {
  return (
    <motion.div
      key={String(subtitle.index)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-muted/30 p-3 mb-2 rounded-lg border"
    >
      {!isNaN(subtitle.index) && (
        <div className="text-xs text-muted-foreground">
          #{subtitle.index}{subtitle.actor ? ` - ${subtitle.actor}` : ""}
        </div>
      )}
      {subtitle.content && (
        <div className="mt-1 text-sm break-words">{subtitle.content}</div>
      )}
      {subtitle.translated && (
        <div className="mt-1 text-sm break-words">{subtitle.translated}</div>
      )}
    </motion.div>
  )
})