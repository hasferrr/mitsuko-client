import Link from "next/link"
import CreditUsage from "./credit-usage"

export default function PricingDescription() {
  return (
    <div id="pricing" className="bg-gray-50 dark:bg-black py-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold mb-4 text-gray-900 dark:text-white">
            How Credits Work
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover how credits work and how they provide flexible access to our powerful AI tools.
          </p>
        </div>

        {/* Description of Credits */}
        <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-8">
          <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
            What are Credits?
          </h3>
          <div className="flex flex-col gap-4">
            <p>
              Credits used for AI features like Subtitle Translation, Audio Transcription, and Context Extraction.
              Using these features will deduct credits from your balance based on the specific action. See "Credit Usage" below for details.
            </p>
            <p>
              You can receive credits monthly by <a href="#pricing-cards" className="text-blue-500 hover:text-blue-600">subscribing</a>{" "}
              to a plan or purchase <a href="#credit-packs" className="text-blue-500 hover:text-blue-600">credit packs</a>{" "}
              as needed.
            </p>
            <div className="flex flex-col gap-2">
              <span>Notes:</span>
              <ul className="list-disc pl-4">
                <li>The credits in your account never expire (even if the subscription ends).</li>
                <li>We currently do not offer refunds for purchased credits and plans. However, this might change in the future.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Track Your Credits Section */}
        <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-8">
          <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
            Where Can I See My Credits?
          </h3>
          <p>
            You can see your remaining credit balance and usage history in{" "}
            <Link href="/auth/login" className="text-blue-500 hover:text-blue-600">User Information</Link> page.
          </p>
        </div>

        {/* Credit Usage */}
        <CreditUsage />

        {/* Background Processing */}
        <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-8">
          <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
            Background Processing
          </h3>
          <p>
            Background processing allows certain tasks, like audio transcriptions, to run on our servers even if you close the browser tab.
            <br />
            This means you don't have to wait for the process to finish. This feature is available for Basic and Pro user.
          </p>
        </div>

      </div>
    </div>
  )
}

