const credit = {
  "creditPerInputToken": 1.4375,
  "creditPerOutputToken": 12
}

const INPUT_CREDITS_PER_MINUTE = credit.creditPerInputToken * 1920

export default async function TranscriptionUsage() {
  return (
    <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-8 shadow-sm">
      <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
        Transcription (Experimental)
      </h3>
      <div className="flex flex-col gap-4">
        <p>
          Audio transcription tasks consume credits based on the duration of the audio and the number of output tokens generated.
          More models will be added in the future.
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
                <td className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Premium</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{INPUT_CREDITS_PER_MINUTE}</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">{credit?.creditPerOutputToken ?? 'N/A'}</td>
                <td className="px-4 py-2 text-left text-gray-600 dark:text-gray-400">Soon</td>
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