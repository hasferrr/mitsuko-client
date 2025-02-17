import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TranslationProcessProps {
  processLog: string
}

export function TranslationProcess({ processLog }: TranslationProcessProps) {
  return (
    <Card className="border border-border bg-card text-card-foreground">
      <CardContent className="p-4">
        <ScrollArea>
          <div className="space-y-2 min-h-[300px] max-h-[900px]">
            {processLog.split('\n').map((log, index) => (
              <div key={index} className="text-sm">
                {log}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

