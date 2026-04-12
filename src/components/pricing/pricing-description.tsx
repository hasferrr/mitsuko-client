import Link from "next/link"
import CreditUsage from "./credit-usage"
import TranscriptionUsage from "./transcription-usage"
import WhichModels from "./which-models"
import { Card, CardContent } from "@/components/ui/card"

export default function PricingDescription() {
  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold mb-4 tracking-tight">
            How Credits Work
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Discover how credits work and how they provide flexible access to our powerful AI tools.
          </p>
        </div>

        {/* Description of Credits */}
        <Card className="mt-8 shadow-xs">
          <CardContent className="space-y-4">
            <h3 className="text-xl font-medium">
              What are Credits?
            </h3>
          <div className="flex flex-col gap-4">
            <p>
              Credits used for features like Translation, Transcription, and Context Extraction.
              Using these features will deduct credits from your balance. See "Credit Usage" below for details.
            </p>
            <p>
              You can receive credits by purchasing <a href="#credit-packs" className="text-sidebar-primary hover:text-sidebar-primary/80">credit packs</a>{" "}
              as needed.
            </p>
            {/* <div className="flex flex-col gap-2">
              <span>Notes:</span>
              <ul className="list-disc pl-4">
                <li>The credits in your account never expire.</li>
                <li>We currently do not offer refunds for purchased credits and plans.</li>
              </ul>
            </div> */}
          </div>
          </CardContent>
        </Card>

        {/* Track Your Credits Section */}
        <Card className="mt-8 shadow-xs">
          <CardContent className="space-y-4">
            <h3 className="text-xl font-medium">
              Where Can I See My Credits?
            </h3>
          <p>
            You can see your remaining credit balance and usage history in{" "}
            <Link href="/auth/login" className="text-sidebar-primary hover:text-sidebar-primary/80">User Information</Link> page.
          </p>
          </CardContent>
        </Card>

        {/* Which Models Should I Use? */}
        <WhichModels />

        {/* Credit Usage */}
        <CreditUsage />

        {/* Transcription Usage */}
        <TranscriptionUsage />

        {/* Background Processing */}
        <Card className="mt-8 shadow-xs">
          <CardContent className="space-y-4">
            <h3 className="text-xl font-medium">
              Background Processing
            </h3>
            <p>
              Background processing allows audio transcriptions to run on our server even if you close the browser tab.
              This means you don&apos;t have to wait for the process to finish.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

