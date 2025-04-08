import { Play } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"

export default function DemoSection() {
  return (
    <div className="bg-gray-100 dark:bg-black py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            See <span className="text-blue-400">Mitsuko</span> in Action
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Watch how Mitsuko translates subtitles with context-awareness and transcribes audio with perfect timestamps.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Video Section */}
          <div
            className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
          >
            <div className="w-full">
              <AspectRatio ratio={16 / 9} className="bg-gray-800">
                <div className="w-full h-full flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm">
                      <Play size={28} fill="white" stroke="none" className="ml-1" />
                    </div>
                  </div>
                </div>
              </AspectRatio>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md flex items-center gap-2 transition-colors">
            Try Mitsuko Now
            <Play size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}

