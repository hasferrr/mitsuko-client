import { Check, X } from "lucide-react"

export default function PricingSection() {
  const pricingData = {
    free: {
      price: 0,
      credits: "0",
    },
    basic: {
      price: 5,
      credits: "5,000,000",
    },
    pro: {
      price: 20,
      credits: "22,000,000",
    },
  }

  const creditPacks = [
    {
      credits: "2,000,000",
      price: 2,
    },
    {
      credits: "10,000,000",
      price: 10,
    },
    {
      credits: "20,000,000",
      price: 19,
      discount: 1,
    },
    {
      credits: "50,000,000",
      price: 45,
      discount: 5,
    },
  ]

  return (
    <div id="pricing" className="bg-gray-50 dark:bg-black py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Simple, Transparent <span className="text-blue-400">Pricing</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Find the perfect plan for your needs. All plans include core features, with extra perks for paid tiers.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Tier */}
          <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Free</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">${pricingData.free.price}</span>
                <span className="text-gray-500 dark:text-gray-400 mb-1">/month</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Access to most features with some limitations. Purchase credits as needed.
              </p>
              <button className="w-full py-2 px-4 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-6">
                Get Started
              </button>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Subtitle Translation
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Limited Audio Transcription
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Extract Context Feature
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Custom Model Integration
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {pricingData.free.credits} Monthly Credits
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Tier */}
          <div className="rounded-xl bg-white dark:bg-gray-900/30 border-2 border-blue-400 dark:border-blue-500 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Basic</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">${pricingData.basic.price}</span>
                <span className="text-gray-500 dark:text-gray-400 mb-1">/month</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Fewer limitations and monthly credit grant. Email support included.
              </p>
              <button className="w-full py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-6">
                Subscribe Now
              </button>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>{pricingData.basic.credits}</strong> Monthly Credits
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Full Audio Transcription
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Email Support
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Custom Model Integration
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <X className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Save to Cloud
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Pro</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">${pricingData.pro.price}</span>
                <span className="text-gray-500 dark:text-gray-400 mb-1">/month</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Maximum features with priority support and cloud saving.
              </p>
              <button className="w-full py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-6">
                Go Pro
              </button>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>{pricingData.pro.credits}</strong> Monthly Credits
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Full Audio Transcription
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Priority Email Support
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Custom Model Integration
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Save to Cloud
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto">
          <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Feature Comparison
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/30">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Feature/Limit
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Free
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Basic (${pricingData.basic.price}/mo)
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pro (${pricingData.pro.price}/mo)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Included Credits (Per Month)
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    0
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    {pricingData.basic.credits}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    {pricingData.pro.credits}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Credits Expiration
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    Never Expire
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    Never Expire
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    Never Expire
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Subtitle Translation
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-5 h-5 mx-auto text-gray-500 dark:text-gray-400" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-5 h-5 mx-auto text-blue-500" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-5 h-5 mx-auto text-blue-500" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Extract Context Feature
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-5 h-5 mx-auto text-gray-500 dark:text-gray-400" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-5 h-5 mx-auto text-blue-500" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-5 h-5 mx-auto text-blue-500" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Audio Transcription
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    Limited
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-5 h-5 mx-auto text-blue-500" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-5 h-5 mx-auto text-blue-500" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Supported Languages
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    100+ Languages
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    100+ Languages
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    100+ Languages
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Custom Model Integration
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-5 h-5 mx-auto text-gray-500 dark:text-gray-400" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-5 h-5 mx-auto text-blue-500" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-5 h-5 mx-auto text-blue-500" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Save to Cloud
                  </td>
                  <td className="px-4 py-3 text-center">
                    <X className="w-5 h-5 mx-auto text-gray-400 dark:text-gray-500" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <X className="w-5 h-5 mx-auto text-gray-400 dark:text-gray-500" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Check className="w-5 h-5 mx-auto text-blue-500" />
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Support
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    Community
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    Email
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                    Priority Email
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Credit Pack Prices */}
        <div className="rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-6">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            Credit Pack Prices
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Need more credits? Purchase additional credit packs starting at just $2. Available to all tiers, these
            credit packs provide flexibility for your usage needs. <strong>Credits purchased do not expire.</strong>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {creditPacks.map((pack, index) => (
              <div key={index} className="flex flex-col gap-1 justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {pack.credits} credits
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold">${pack.price}</span>
                </div>
                {pack.discount && (
                  <div className="text-xs text-green-600 dark:text-green-400">Save ${pack.discount}</div>
                )}
                <button className="w-full mt-2 py-1.5 px-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm">
                  Purchase
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Usage Transparency Note */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
          <p>Credit usage transparency will be available soon.</p>
        </div>
      </div>
    </div>
  )
}

