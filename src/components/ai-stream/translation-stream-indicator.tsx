import { motion, useReducedMotion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

export const TranslationStreamIndicator = () => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -2 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      className="mb-2 rounded-lg border bg-muted/30 p-3"
    >
      <span className="sr-only">Translation in progress</span>
      <div aria-hidden="true" className="flex flex-col gap-2">
        <Skeleton className="h-3 w-10 motion-reduce:animate-none" />
        <Skeleton className="h-3.5 w-4/5 motion-reduce:animate-none" />
        <Skeleton className="h-3.5 w-3/5 motion-reduce:animate-none" />
      </div>
    </motion.div>
  )
}
