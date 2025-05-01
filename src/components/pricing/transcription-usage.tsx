import React from "react"

const TOKENS_PER_MINUTE = 1920
const TOKEN_THRESHOLD = 200000 - 8000
const MINUTE_THRESHOLD = Math.floor(TOKEN_THRESHOLD / TOKENS_PER_MINUTE)

const costsTier115 = {
  "creditPerInputToken": 1.4375,
  "creditPerOutputToken": 11.5
}
const costsTier215 = {
  "creditPerInputToken": 2.875,
  "creditPerOutputToken": 17.25
}

const INPUT_CREDITS_PER_MINUTE_LOW = costsTier115.creditPerInputToken * TOKENS_PER_MINUTE
const INPUT_CREDITS_PER_MINUTE_HIGH = costsTier215.creditPerInputToken * TOKENS_PER_MINUTE

export default async function TranscriptionUsage() {
  return (
    <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-8 shadow-sm">
      <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
        Transcription Usage
      </h3>
      <div className="flex flex-col gap-4">
        <p>
          Transcription tasks consume credits based on the duration of the audio processed.
          The credit cost differs when the audio is less than {MINUTE_THRESHOLD} minutes compared to when it is more than {MINUTE_THRESHOLD} minutes.
          Yes, you can split your audio first for better pricing.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/30">
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                  Model Type
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                  Credit per <br /> 1 minute audio
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                  Credit per <br /> Output Token
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">
                  Max File Size
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {/* Free Models Row */}
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                <td className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Free Limited</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">0</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">0</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">100 MB</td>
              </tr>
              {/* Premium Models Row */}
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                <td className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Premium ({"<="} {MINUTE_THRESHOLD} minutes)</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{INPUT_CREDITS_PER_MINUTE_LOW}</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{costsTier115?.creditPerOutputToken ?? 'N/A'}</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">1 GB</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                <td className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Premium ({">"} {MINUTE_THRESHOLD} minutes)</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{INPUT_CREDITS_PER_MINUTE_HIGH}</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{costsTier215?.creditPerOutputToken ?? 'N/A'}</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">1 GB</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            * The costs shown are not including system prompts and custom instructions input costs.
          </p>
        </div>
      </div>
    </div>
  )
}