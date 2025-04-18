import Link from "next/link"

export default function PricingDescription() {
  return (
    <div id="pricing" className="bg-gray-50 dark:bg-black py-16 pt-4">
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
              The cost in credits depends on the feature and how much processing is needed. See "Credit Usage" below for details.
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
        <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-8">
          <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
            Credit Usage
          </h3>
          <p className="mb-6">
            Credit costs vary based on the AI model used and the resources required.
            Costs depend on text length and AI model complexity.
            See estimates below. We're building a credit tracker for your account.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/30">
                  <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Feature</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Unit</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-700 dark:text-gray-300">Example Credit Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">Subtitle Translation</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Based on processed text length (input & output)</td>
                  <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">~1,000 credits</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">Audio Transcription</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Per Minute of Audio</td>
                  <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">~5,000 credits</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">Extract Context</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Per 1,000 Characters Analyzed</td>
                  <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">~500 credits</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">Custom Model Usage</td>
                  <td className="px-4 py-2 text-gray-600 dark:text-gray-400">Varies (Input/Output Tokens)</td>
                  <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">Model Specific</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            * These are estimated costs and are subject to change. Refer to the upcoming credit usage dashboard for precise figures.
          </p>
        </div>

      </div>
    </div>
  )
}

